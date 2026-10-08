"""
Client FedaPay minimal (API REST) — https://docs.fedapay.com

Flux utilisé (checkout hébergé, qui propose Mobile Money et carte) :
  1. POST /transactions            → crée la transaction (montant, client, callback_url)
  2. POST /transactions/{id}/token → renvoie {token, url} : on redirige l'acheteur vers `url`
  3. FedaPay prévient notre webhook (transaction.approved / declined / canceled)
     ET redirige l'acheteur vers callback_url avec ?id=<transaction_id>&status=...
  4. On ne fait JAMAIS confiance au statut reçu : on relit la transaction via
     GET /transactions/{id} avant de valider une commande.
"""

import hashlib
import hmac
import logging
import time

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

SANDBOX_URL = "https://sandbox-api.fedapay.com/v1"
LIVE_URL = "https://api.fedapay.com/v1"

# Pays UEMOA / région → code ISO attendu par FedaPay pour le numéro de téléphone.
COUNTRY_CODES = {
    "togo": "tg", "bénin": "bj", "benin": "bj", "côte d'ivoire": "ci", "cote d'ivoire": "ci",
    "sénégal": "sn", "senegal": "sn", "mali": "ml", "burkina faso": "bf", "niger": "ne",
    "guinée-bissau": "gw", "guinee-bissau": "gw",
}


class FedaPayError(Exception):
    """Erreur lors d'un appel à FedaPay (message affichable à l'utilisateur)."""


def is_configured() -> bool:
    return bool(getattr(settings, "FEDAPAY_SECRET_KEY", ""))


def _base_url() -> str:
    return LIVE_URL if getattr(settings, "FEDAPAY_ENV", "sandbox") == "live" else SANDBOX_URL


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {settings.FEDAPAY_SECRET_KEY}",
        "Content-Type": "application/json",
    }


def _unwrap(data: dict, name: str) -> dict:
    """FedaPay enveloppe souvent l'objet : {"v1/transaction": {...}}."""
    if not isinstance(data, dict):
        return {}
    for key in (f"v1/{name}", name):
        if isinstance(data.get(key), dict):
            return data[key]
    return data


def _request(method: str, path: str, **kwargs) -> dict:
    if not is_configured():
        raise FedaPayError("FedaPay n'est pas configuré (FEDAPAY_SECRET_KEY manquante).")
    try:
        resp = requests.request(
            method, f"{_base_url()}{path}", headers=_headers(), timeout=20, **kwargs
        )
    except requests.RequestException as exc:
        logger.exception("FedaPay injoignable")
        raise FedaPayError("Le service de paiement est momentanément injoignable.") from exc

    if resp.status_code >= 400:
        logger.error("FedaPay %s %s → %s %s", method, path, resp.status_code, resp.text[:500])
        try:
            detail = resp.json().get("message")
        except ValueError:
            detail = None
        raise FedaPayError(detail or "Le service de paiement a refusé la requête.")
    try:
        return resp.json()
    except ValueError as exc:
        raise FedaPayError("Réponse invalide du service de paiement.") from exc


def _split_name(full_name: str):
    parts = (full_name or "Client").strip().split(" ", 1)
    return parts[0], (parts[1] if len(parts) > 1 else parts[0])


def _normalize_phone(phone: str) -> str:
    return "".join(ch for ch in (phone or "") if ch.isdigit())


def create_transaction(*, order, buyer, callback_url: str) -> dict:
    """Crée la transaction et renvoie {"id": str, "token": str, "url": str, "raw": dict}."""
    firstname, lastname = _split_name(buyer.name)
    customer = {"firstname": firstname, "lastname": lastname, "email": buyer.email}

    phone = _normalize_phone(order.phone or buyer.phone)
    if phone:
        country = COUNTRY_CODES.get((buyer.country or "").strip().lower(), "tg")
        customer["phone_number"] = {"number": phone, "country": country}

    payload = {
        "description": f"Commande {order.reference} — {order.supplier_name}",
        "amount": int(order.subtotal),
        "currency": {"iso": "XOF"},
        "callback_url": callback_url,
        "customer": customer,
        "custom_metadata": {"order_id": str(order.id), "reference": order.reference},
    }
    tx = _unwrap(_request("POST", "/transactions", json=payload), "transaction")
    tx_id = tx.get("id")
    if not tx_id:
        raise FedaPayError("FedaPay n'a pas renvoyé d'identifiant de transaction.")

    token_data = _request("POST", f"/transactions/{tx_id}/token")
    url, token = token_data.get("url"), token_data.get("token")
    if not url:
        raise FedaPayError("FedaPay n'a pas renvoyé de lien de paiement.")
    return {"id": str(tx_id), "token": token, "url": url, "raw": tx}


def retrieve_transaction(transaction_id: str) -> dict:
    return _unwrap(_request("GET", f"/transactions/{transaction_id}"), "transaction")


def verify_webhook_signature(payload: bytes, header: str, secret: str, tolerance: int = 600) -> bool:
    """
    Vérifie l'en-tête X-FEDAPAY-SIGNATURE, de la forme "t=<timestamp>,s=<signature>"
    où signature = HMAC-SHA256(secret, f"{timestamp}.{corps_brut}").
    """
    if not header or not secret:
        return False
    try:
        parts = dict(item.split("=", 1) for item in header.split(","))
        timestamp, signature = parts["t"], parts["s"]
    except (ValueError, KeyError):
        return False
    try:
        if abs(time.time() - int(timestamp)) > tolerance:
            return False
    except ValueError:
        return False
    signed = f"{timestamp}.".encode() + payload
    expected = hmac.new(secret.encode(), signed, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
