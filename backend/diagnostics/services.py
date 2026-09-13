from ai_client.gemini_client import call_gemini, image_to_inline_data
from ai_client.utils import extract_json

VALID_RISK_LEVELS = {"Faible", "Moyen", "Élevé", "Critique"}

CULTURE_SYSTEM_PROMPT = """Tu es un expert en phytopathologie (maladies des plantes) et en \
agronomie, spécialisé dans l'agriculture d'Afrique de l'Ouest (Togo, Côte d'Ivoire, \
Ghana, Bénin...). On te montre une photo d'une plante, d'une feuille ou d'un fruit. \
Ton rôle est d'identifier un éventuel problème (maladie, carence, ravageur) visible \
sur l'image et de répondre en français, UNIQUEMENT avec un objet JSON valide, sans \
aucun texte avant ou après, au format exact suivant :

{
  "disease_name": "Nom courant de la maladie ou du problème (en français)",
  "scientific_name": "Nom scientifique de l'agent pathogène si identifiable, sinon chaîne vide",
  "confidence": 0-100 (ton niveau de confiance dans ce diagnostic),
  "risk_level": "Faible" | "Moyen" | "Élevé" | "Critique",
  "causes": ["cause 1", "cause 2", "..."],
  "recommendations": ["recommandation actionnable 1", "recommandation 2", "..."],
  "treatment": "Description concise du traitement recommandé (produits, pratiques culturales)"
}

Si l'image ne montre pas de problème visible ou semble saine, indique-le clairement \
dans "disease_name" (ex: "Aucun problème détecté") avec un risk_level "Faible". \
Si l'image ne permet pas du tout d'analyser une plante (photo non pertinente), \
indique "disease_name": "Image non exploitable" et risk_level "Faible"."""

ANIMAL_SYSTEM_PROMPT = """Tu es un vétérinaire expert en santé animale, spécialisé dans \
le bétail et la volaille d'Afrique de l'Ouest. On te montre une photo d'un animal \
(bovin, caprin, volaille...) présentant potentiellement des symptômes. Ton rôle est \
d'identifier un éventuel problème de santé visible sur l'image et de répondre en \
français, UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après, \
au format exact suivant :

{
  "disease_name": "Nom courant de la maladie ou du problème (en français)",
  "scientific_name": "Nom scientifique de l'agent pathogène si identifiable, sinon chaîne vide",
  "confidence": 0-100 (ton niveau de confiance dans ce diagnostic),
  "risk_level": "Faible" | "Moyen" | "Élevé" | "Critique",
  "causes": ["cause 1", "cause 2", "..."],
  "recommendations": ["recommandation actionnable 1", "recommandation 2", "..."],
  "treatment": "Description concise du traitement recommandé (soins, produits vétérinaires)"
}

Si l'animal semble en bonne santé, indique-le clairement dans "disease_name" \
(ex: "Aucun problème détecté") avec un risk_level "Faible". Si l'image ne permet \
pas du tout d'analyser un animal (photo non pertinente), indique \
"disease_name": "Image non exploitable" et risk_level "Faible". Précise toujours \
qu'un vétérinaire doit être consulté pour confirmer un diagnostic critique."""


def analyze_image(diagnostic_type: str, image_file) -> dict:
    """
    Envoie l'image à l'API Gemini et renvoie un dict structuré + le texte brut.
    Lève ai_client.gemini_client.AIConfigError / AIRequestError / ValueError en cas d'échec.
    """
    system_prompt = CULTURE_SYSTEM_PROMPT if diagnostic_type == "culture" else ANIMAL_SYSTEM_PROMPT

    image_part = image_to_inline_data(image_file)
    messages = [
        {
            "role": "user",
            "content": [
                image_part,
                {"text": "Analyse cette image et réponds uniquement avec le JSON demandé."},
            ],
        }
    ]

    raw_text = call_gemini(messages, system=system_prompt, max_tokens=1000)
    parsed = extract_json(raw_text)

    # Normalisation défensive du résultat renvoyé par le modèle.
    parsed["disease_name"] = str(parsed.get("disease_name") or "Résultat indisponible")
    parsed["scientific_name"] = str(parsed.get("scientific_name") or "")
    try:
        parsed["confidence"] = max(0, min(100, int(parsed.get("confidence", 0))))
    except (TypeError, ValueError):
        parsed["confidence"] = 0
    if parsed.get("risk_level") not in VALID_RISK_LEVELS:
        parsed["risk_level"] = "Moyen"
    if not isinstance(parsed.get("causes"), list):
        parsed["causes"] = []
    if not isinstance(parsed.get("recommendations"), list):
        parsed["recommendations"] = []
    parsed["treatment"] = str(parsed.get("treatment") or "")

    return {"parsed": parsed, "raw_text": raw_text}
