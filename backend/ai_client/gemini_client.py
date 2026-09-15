"""
Client minimal pour l'API Google Gemini (generativelanguage.googleapis.com),
sans dépendre du SDK officiel (juste `requests`).

Nécessite la variable d'environnement GEMINI_API_KEY (voir backend/.env.example).

Créez une clé API sur https://aistudio.google.com/apikey — les clés valides
ressemblent à "AIzaSy...". Un jeton OAuth temporaire (qui ressemble plutôt à
"ya29...." ou "AQ...." et expire en général après ~1h) n'est PAS une clé API
et ne doit pas être utilisé ici pour un usage durable.
"""

import base64
import os
import random
import time

import requests

GEMINI_API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

# Modèle utilisé pour toutes les fonctionnalités IA de l'app.
# "gemini-2.5-flash" a été retiré par Google pour les nouvelles clés API
# (message d'erreur 404 recommandant gemini-3.6-flash) — voir GEMINI_MODEL
# dans les variables d'environnement pour changer sans toucher au code.
MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")

# Codes renvoyés par Gemini quand le service est temporairement saturé —
# ça vaut le coup de réessayer avant d'abandonner, avec un délai qui
# augmente à chaque tentative (backoff exponentiel + petit aléa pour
# éviter que plusieurs requêtes ne retentent toutes exactement en même
# temps). Le total (jusqu'à ~30s d'attente cumulée) reste largement sous
# le timeout de 120s configuré côté Gunicorn.
_RETRYABLE_STATUS_CODES = {429, 500, 503}
_MAX_RETRIES = 4
_BASE_RETRY_DELAY_SECONDS = 2


class AIConfigError(Exception):
    """Levée quand la clé API n'est pas configurée."""


class AIRequestError(Exception):
    """Levée quand l'appel à l'API Gemini échoue."""


def _get_api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise AIConfigError(
            "GEMINI_API_KEY n'est pas configurée sur le serveur. "
            "Ajoutez-la dans backend/.env (voir .env.example)."
        )
    return key


def _friendly_error_message(response: requests.Response) -> str:
    """Traduit une erreur HTTP Gemini en message compréhensible, sans JSON brut."""
    if response.status_code in (429, 503):
        return (
            "Le service d'intelligence artificielle est momentanément surchargé "
            "ou limité en débit. Réessayez dans quelques instants."
        )
    if response.status_code == 404:
        return (
            "Le modèle IA configuré n'est plus disponible. "
            "Vérifiez la variable GEMINI_MODEL côté serveur."
        )
    if response.status_code in (401, 403):
        return "La clé API Gemini est invalide ou n'a pas les droits nécessaires."

    # Erreur moins courante : on garde un extrait technique pour le debug,
    # mais toujours sans exposer le JSON complet à l'utilisateur.
    try:
        detail = response.json().get("error", {}).get("message", "")
    except (ValueError, AttributeError):
        detail = response.text[:200]
    return f"Erreur du service IA ({response.status_code}). {detail}".strip()


def _next_retry_delay(attempt: int, response: "requests.Response | None") -> float:
    """
    Calcule le délai avant la prochaine tentative. Respecte l'en-tête
    Retry-After renvoyé par Google si présent (cas des 429), sinon
    backoff exponentiel (2s, 4s, 8s, 16s...) avec un petit aléa.
    """
    if response is not None:
        retry_after = response.headers.get("Retry-After")
        if retry_after:
            try:
                return min(float(retry_after), 20)
            except ValueError:
                pass
    delay = _BASE_RETRY_DELAY_SECONDS * (2 ** attempt)
    jitter = random.uniform(0, 1)
    return min(delay + jitter, 20)


def call_gemini(messages: list[dict], system: str | None = None, max_tokens: int = 1500) -> str:
    """
    Appelle l'API Gemini (generateContent) et renvoie le texte de la réponse.

    `messages` suit un format simplifié compatible avec le code existant :
        [{"role": "user" | "assistant", "content": "texte"}, ...]
    ou, pour inclure une image :
        [{"role": "user", "content": [image_part, {"text": "..."}]}]
    (le rôle "assistant" est automatiquement traduit en "model", requis par Gemini).
    """
    contents = []
    for message in messages:
        role = "model" if message["role"] == "assistant" else "user"
        content = message["content"]
        parts = [{"text": content}] if isinstance(content, str) else content
        contents.append({"role": role, "parts": parts})

    payload = {
        "contents": contents,
        "generationConfig": {"maxOutputTokens": max_tokens},
    }
    if system:
        payload["systemInstruction"] = {"parts": [{"text": system}]}

    url = GEMINI_API_URL_TEMPLATE.format(model=MODEL)
    api_key = _get_api_key()

    response = None
    last_exc = None
    for attempt in range(_MAX_RETRIES + 1):
        try:
            response = requests.post(url, params={"key": api_key}, json=payload, timeout=60)
        except requests.RequestException as exc:
            last_exc = exc
            response = None
        else:
            last_exc = None
            if response.status_code not in _RETRYABLE_STATUS_CODES:
                break

        if attempt < _MAX_RETRIES:
            time.sleep(_next_retry_delay(attempt, response))

    if response is None:
        raise AIRequestError(f"Impossible de contacter l'API Gemini : {last_exc}") from last_exc

    if response.status_code != 200:
        friendly = _friendly_error_message(response)
        raise AIRequestError(friendly)

    data = response.json()
    try:
        candidate = data["candidates"][0]
        parts = candidate.get("content", {}).get("parts", [])
        text = "".join(part.get("text", "") for part in parts).strip()
    except (KeyError, IndexError) as exc:
        raise AIRequestError(f"Réponse Gemini inattendue : {data}") from exc

    if not text:
        finish_reason = data.get("candidates", [{}])[0].get("finishReason", "inconnue")
        raise AIRequestError(
            f"Gemini n'a renvoyé aucun texte (raison : {finish_reason}). "
            "L'image ou le message a peut-être été bloqué par les filtres de sécurité."
        )

    return text


def image_to_inline_data(file) -> dict:
    """
    Convertit un fichier image Django en "part" au format attendu par l'API
    Gemini (inline_data en base64).
    """
    content_type = getattr(file, "content_type", None) or "image/jpeg"
    file.seek(0)
    raw = file.read()
    encoded = base64.standard_b64encode(raw).decode("utf-8")
    return {"inline_data": {"mime_type": content_type, "data": encoded}}
