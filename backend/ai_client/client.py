"""
Client minimal pour l'API Anthropic (Claude), sans dépendre du SDK officiel
(juste `requests`, déjà présent dans la plupart des environnements Python).

Nécessite la variable d'environnement ANTHROPIC_API_KEY (voir backend/.env.example).
Obtenez une clé sur https://console.anthropic.com/
"""

import base64
import json
import os
import re

import requests

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"

# Modèle utilisé pour toutes les fonctionnalités IA de l'app.
MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-5")


class AIConfigError(Exception):
    """Levée quand la clé API n'est pas configurée."""


class AIRequestError(Exception):
    """Levée quand l'appel à l'API Anthropic échoue."""


def _get_api_key() -> str:
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        raise AIConfigError(
            "ANTHROPIC_API_KEY n'est pas configurée sur le serveur. "
            "Ajoutez-la dans backend/.env (voir .env.example)."
        )
    return key


def _headers() -> dict:
    return {
        "x-api-key": _get_api_key(),
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
    }


def call_claude(messages: list[dict], system: str | None = None, max_tokens: int = 1500) -> str:
    """
    Appelle l'API Messages d'Anthropic et renvoie le texte de la réponse.
    `messages` suit le format standard : [{"role": "user", "content": [...]}, ...]
    """
    payload = {
        "model": MODEL,
        "max_tokens": max_tokens,
        "messages": messages,
    }
    if system:
        payload["system"] = system

    try:
        response = requests.post(
            ANTHROPIC_API_URL, headers=_headers(), data=json.dumps(payload), timeout=60
        )
    except requests.RequestException as exc:
        raise AIRequestError(f"Impossible de contacter l'API Anthropic : {exc}") from exc

    if response.status_code != 200:
        raise AIRequestError(
            f"Erreur API Anthropic ({response.status_code}) : {response.text[:500]}"
        )

    data = response.json()
    text_blocks = [block["text"] for block in data.get("content", []) if block.get("type") == "text"]
    return "\n".join(text_blocks).strip()


def image_to_base64_block(file) -> dict:
    """
    Convertit un fichier image Django (InMemoryUploadedFile / TemporaryUploadedFile)
    en bloc "image" au format attendu par l'API Anthropic.
    """
    content_type = getattr(file, "content_type", None) or "image/jpeg"
    file.seek(0)
    raw = file.read()
    encoded = base64.standard_b64encode(raw).decode("utf-8")
    return {
        "type": "image",
        "source": {
            "type": "base64",
            "media_type": content_type,
            "data": encoded,
        },
    }


def extract_json(text: str) -> dict:
    """
    Extrait un objet JSON de la réponse du modèle, même s'il est entouré de
    texte ou de balises ```json ... ```.
    """
    cleaned = text.strip()
    cleaned = re.sub(r"^```json\s*|^```\s*|```$", "", cleaned, flags=re.MULTILINE).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Dernier recours : chercher le premier bloc { ... } équilibré.
    match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
    if match:
        return json.loads(match.group(0))

    raise ValueError(f"Réponse IA non exploitable (JSON introuvable) : {text[:300]}")
