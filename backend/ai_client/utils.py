"""Utilitaires indépendants du fournisseur d'IA (Anthropic, Gemini, ...)."""

import json
import re


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

    match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
    if match:
        return json.loads(match.group(0))

    raise ValueError(f"Réponse IA non exploitable (JSON introuvable) : {text[:300]}")
