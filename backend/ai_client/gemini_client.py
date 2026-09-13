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

import requests

GEMINI_API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

# Modèle utilisé pour toutes les fonctionnalités IA de l'app.
MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")


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
    try:
        response = requests.post(
            url, params={"key": _get_api_key()}, json=payload, timeout=60
        )
    except requests.RequestException as exc:
        raise AIRequestError(f"Impossible de contacter l'API Gemini : {exc}") from exc

    if response.status_code != 200:
        raise AIRequestError(
            f"Erreur API Gemini ({response.status_code}) : {response.text[:500]}"
        )

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
