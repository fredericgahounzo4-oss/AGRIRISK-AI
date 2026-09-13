from rest_framework.authentication import TokenAuthentication


class BearerTokenAuthentication(TokenAuthentication):
    """
    Le frontend (src/services/api.ts) envoie :
        Authorization: Bearer <token>
    alors que DRF attend par défaut "Token <token>".
    On adapte simplement le mot-clé attendu.
    """

    keyword = "Bearer"
