"""
Client minimal pour l'API Groq (https://api.groq.com), sans dépendre du SDK
officiel (juste `requests`). L'API de Groq est compatible avec le format
OpenAI "chat/completions".

Nécessite la variable d'environnement GROQ_API_KEY (voir backend/.env.example).
Créez une clé gratuite sur https://console.groq.com/keys — elle ressemble à
"gsk_...".
"""

import base64
import io
import os
import random
import re
import time

import requests

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# Deux modèles, car tous ne gèrent pas les images :
#  - MODEL        : chat texte (Assistant IA)
#  - VISION_MODEL : analyse d'image (Diagnostic IA)
# La liste des modèles Groq évolue vite : si vous obtenez une erreur 404
# "modèle introuvable", changez ces variables d'environnement (sans toucher au
# code) en vous aidant de https://console.groq.com/docs/models
MODEL = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")
VISION_MODEL = os.environ.get("GROQ_VISION_MODEL", "qwen/qwen3.8-27b")

# Codes pour lesquels ça vaut le coup de réessayer (surcharge / limite de débit),
# avec un délai croissant (backoff exponentiel + petit aléa). Le total reste
# largement sous le timeout de 120s configuré côté Gunicorn.
_RETRYABLE_STATUS_CODES = {429, 500, 502, 503}
_MAX_RETRIES = 3
_BASE_RETRY_DELAY_SECONDS = 2

# Les images sont réduites avant envoi : moins de latence, et on reste sous
# la limite de taille des requêtes Groq.
_MAX_IMAGE_SIDE_PX = 1280


class AIConfigError(Exception):
    """Levée quand la clé API n'est pas configurée."""


class AIRequestError(Exception):
    """Levée quand l'appel à l'API Groq échoue."""


def _get_api_key() -> str:
    key = os.environ.get("GROQ_API_KEY")
    if not key:
        raise AIConfigError(
            "GROQ_API_KEY n'est pas configurée sur le serveur. "
            "Ajoutez-la dans backend/.env (voir .env.example)."
        )
    return key


def _error_detail(response: requests.Response) -> str:
    try:
        return response.json().get("error", {}).get("message", "") or ""
    except (ValueError, AttributeError):
        return response.text[:200]


def _model_from_request(response: requests.Response) -> str:
    try:
        import json as _json
        return _json.loads(response.request.body).get("model", "?")
    except Exception:
        return "?"


def _friendly_error_message(response: requests.Response) -> str:
    """Traduit une erreur HTTP Groq en message compréhensible, sans JSON brut."""
    if response.status_code == 429:
        return (
            "Le service d'intelligence artificielle est momentanément limité en "
            "débit. Réessayez dans quelques instants."
        )
    if response.status_code in (500, 502, 503):
        return "Le service d'intelligence artificielle est momentanément indisponible. Réessayez."
    if response.status_code == 404:
        return (
            f"Le modèle IA « {_model_from_request(response)} » est introuvable ou "
            "non accessible avec votre clé Groq. Vérifiez les variables "
            "GROQ_MODEL / GROQ_VISION_MODEL côté serveur."
        )
    if response.status_code in (401, 403):
        return "La clé API Groq est invalide ou n'a pas les droits nécessaires."

    detail = _error_detail(response)
    return f"Erreur du service IA ({response.status_code}). {detail}".strip()


def _next_retry_delay(attempt: int, response: "requests.Response | None") -> float:
    """Respecte l'en-tête Retry-After de Groq si présent, sinon backoff exponentiel."""
    if response is not None:
        retry_after = response.headers.get("Retry-After")
        if retry_after:
            try:
                return min(float(retry_after), 20)
            except ValueError:
                pass
    delay = _BASE_RETRY_DELAY_SECONDS * (2 ** attempt)
    return min(delay + random.uniform(0, 1), 20)


def _has_image(messages: list[dict]) -> bool:
    return any(
        isinstance(m["content"], list)
        and any(part.get("type") == "image_url" for part in m["content"])
        for m in messages
    )


def _strip_reasoning(text: str) -> str:
    """Retire les blocs <think>...</think> que certains modèles de raisonnement ajoutent."""
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()


def _post_with_retries(payload: dict, api_key: str) -> requests.Response:
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    response = None
    last_exc = None
    for attempt in range(_MAX_RETRIES + 1):
        try:
            response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=60)
        except requests.RequestException as exc:
            last_exc = exc
            response = None
        else:
            last_exc = None
            if response.status_code not in _RETRYABLE_STATUS_CODES:
                return response

        if attempt < _MAX_RETRIES:
            time.sleep(_next_retry_delay(attempt, response))

    if response is None:
        raise AIRequestError(f"Impossible de contacter l'API Groq : {last_exc}") from last_exc
    return response


def call_groq(
    messages: list[dict],
    system: str | None = None,
    max_tokens: int = 1500,
    json_mode: bool = False,
) -> str:
    """
    Appelle l'API Groq (chat/completions) et renvoie le texte de la réponse.

    `messages` : [{"role": "user" | "assistant", "content": "texte"}, ...]
    ou, pour inclure une image :
        [{"role": "user", "content": [image_part, {"type": "text", "text": "..."}]}]
    (voir `image_to_image_part`). Le modèle de vision est choisi automatiquement
    dès qu'une image est présente.

    `json_mode=True` demande à Groq de ne renvoyer qu'un objet JSON valide.
    """
    api_key = _get_api_key()

    full_messages = []
    if system:
        full_messages.append({"role": "system", "content": system})
    full_messages.extend({"role": m["role"], "content": m["content"]} for m in messages)

    payload = {
        "model": VISION_MODEL if _has_image(messages) else MODEL,
        "messages": full_messages,
        # Marge pour les modèles qui "réfléchissent" avant de répondre.
        "max_completion_tokens": max_tokens,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}
    if payload["model"].startswith("openai/gpt-oss"):
        # Modèle de raisonnement : un effort faible suffit ici et répond plus vite.
        payload["reasoning_effort"] = "low"

    response = _post_with_retries(payload, api_key)

    # Si le modèle refuse le mode JSON, on réessaie sans (extract_json
    # sait de toute façon retrouver le JSON dans le texte).
    if response.status_code == 400 and json_mode and "response_format" in _error_detail(response):
        payload.pop("response_format")
        response = _post_with_retries(payload, api_key)

    if response.status_code != 200:
        raise AIRequestError(_friendly_error_message(response))

    data = response.json()
    try:
        choice = data["choices"][0]
        text = _strip_reasoning(choice["message"].get("content") or "")
    except (KeyError, IndexError, AttributeError) as exc:
        raise AIRequestError(f"Réponse Groq inattendue : {data}") from exc

    if not text:
        finish_reason = choice.get("finish_reason", "inconnue")
        raise AIRequestError(
            f"Groq n'a renvoyé aucun texte (raison : {finish_reason}). "
            "Le message ou l'image a peut-être été bloqué ou la réponse tronquée."
        )

    return text


def image_to_image_part(file) -> dict:
    """
    Convertit un fichier image Django en "part" au format attendu par Groq
    (image_url avec data URL en base64). L'image est réduite et recompressée
    en JPEG pour limiter la taille de la requête.
    """
    file.seek(0)
    raw = file.read()
    mime = getattr(file, "content_type", None) or "image/jpeg"

    try:
        from PIL import Image  # Pillow est déjà dans requirements.txt

        img = Image.open(io.BytesIO(raw))
        img.thumbnail((_MAX_IMAGE_SIDE_PX, _MAX_IMAGE_SIDE_PX))
        if img.mode != "RGB":
            img = img.convert("RGB")
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=85)
        raw, mime = buffer.getvalue(), "image/jpeg"
    except Exception:
        # Si Pillow n'arrive pas à lire l'image, on envoie le fichier tel quel.
        pass

    encoded = base64.standard_b64encode(raw).decode("utf-8")
    return {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{encoded}"}}
