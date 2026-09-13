from ai_client.gemini_client import call_gemini

SYSTEM_PROMPT = """Tu es l'Assistant IA d'AgriRisk AI, une application destinée aux \
agriculteurs et éleveurs d'Afrique de l'Ouest (Togo et pays voisins). Tu réponds en \
français, de façon claire, concrète et actionnable, sur : les cultures (maïs, cacao, \
manioc, coton, riz...), l'élevage, les maladies des plantes et des animaux, les \
engrais et intrants, les techniques agricoles adaptées au climat tropical/sahélien, \
et la gestion des risques agricoles (météo, marché, ravageurs).

Réponds de manière concise (quelques paragraphes maximum), avec des listes à puces \
quand c'est utile. Si la question sort du domaine agricole, réoriente poliment la \
conversation vers l'agriculture. Précise, quand c'est pertinent, qu'un agronome ou \
vétérinaire local doit être consulté pour les décisions importantes."""


def generate_reply(conversation, new_user_content: str) -> str:
    """
    Construit l'historique de la conversation au format API et appelle Gemini.
    Le message utilisateur `new_user_content` est déjà enregistré en base par
    la vue avant l'appel à cette fonction : on ne fait donc que relire
    l'historique complet depuis la base, sans le rajouter une seconde fois.
    """
    history = list(conversation.messages.order_by("created_at"))

    messages = [
        {"role": m.role, "content": m.content}
        for m in history
        if m.role in ("user", "assistant")
    ]

    return call_gemini(messages, system=SYSTEM_PROMPT, max_tokens=1200)


def generate_title(first_message: str) -> str:
    """Titre court généré à partir du premier message (simple troncature, pas d'appel IA)."""
    title = first_message.strip().split("\n")[0]
    return (title[:47] + "...") if len(title) > 50 else title or "Nouvelle conversation"
