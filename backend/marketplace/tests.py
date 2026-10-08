import hashlib
import hmac
import json
import time
from unittest import mock

from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from accounts.models import User
from . import fedapay
from .models import Order, Payment, Product


def make_user(email, role, **kw):
    return User.objects.create_user(
        username=email, email=email, password="pass12345", role=role, name=kw.pop("name", email), **kw
    )


@override_settings(FEDAPAY_SECRET_KEY="sk_sandbox_test", FEDAPAY_ENV="sandbox",
                   FEDAPAY_WEBHOOK_SECRET="whsec", FRONTEND_URL="http://front.test",
                   MARKETPLACE_COMMISSION_PERCENT=5, PAYMENT_SIMULATION=False,
                   PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class MarketplaceFlowTests(TestCase):
    def setUp(self):
        self.farmer = make_user("f@x.com", "farmer", name="Kofi Agri", phone="90112233")
        self.supplier = make_user("s@x.com", "supplier", name="Sup", company="AgroTogo")
        self.other_supplier = make_user("s2@x.com", "supplier", company="Autre")
        self.p1 = Product.objects.create(supplier=self.supplier, name="Engrais NPK", price=10000, stock=10, sku="NPK")
        self.p2 = Product.objects.create(supplier=self.supplier, name="Semences maïs", price=2500, stock=4, sku="MAIS")
        self.p_other = Product.objects.create(supplier=self.other_supplier, name="Houe", price=3000, stock=5, sku="H")
        self.c = APIClient()
        self.c.force_authenticate(self.farmer)

    def _fake_tx(self, tx_id="555", url="https://process.fedapay.com/abc"):
        return {"id": tx_id, "token": "tok", "url": url, "raw": {"id": int(tx_id)}}

    def _create_order(self, items=None, **extra):
        items = items or [{"product_id": str(self.p1.id), "quantity": 2}, {"product_id": str(self.p2.id), "quantity": 1}]
        with mock.patch.object(fedapay, "create_transaction", return_value=self._fake_tx()):
            return self.c.post("/api/marketplace/orders", {"items": items, "delivery_method": "pickup", **extra}, format="json")

    # ---- création ----
    def test_create_order_reserves_stock_and_computes_commission(self):
        r = self._create_order()
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(r.json()["payment_url"], "https://process.fedapay.com/abc")
        o = Order.objects.get()
        self.assertEqual(o.subtotal, 22500)
        self.assertEqual(o.commission_amount, 1125)          # 5 %
        self.assertEqual(o.supplier_amount, 21375)
        self.assertEqual(o.status, Order.Status.PENDING)
        self.p1.refresh_from_db(); self.p2.refresh_from_db()
        self.assertEqual((self.p1.stock, self.p2.stock), (8, 3))

    def test_cannot_mix_suppliers(self):
        r = self._create_order([{"product_id": str(self.p1.id), "quantity": 1}, {"product_id": str(self.p_other.id), "quantity": 1}])
        self.assertEqual(r.status_code, 422)
        self.assertEqual(Order.objects.count(), 0)

    def test_insufficient_stock_rejected(self):
        r = self._create_order([{"product_id": str(self.p2.id), "quantity": 99}])
        self.assertEqual(r.status_code, 422)
        self.p2.refresh_from_db(); self.assertEqual(self.p2.stock, 4)

    def test_last_unit_sets_rupture_and_cancel_restores(self):
        r = self._create_order([{"product_id": str(self.p2.id), "quantity": 4}])
        self.p2.refresh_from_db(); self.assertEqual(self.p2.status, Product.Status.RUPTURE)
        oid = r.json()["order"]["id"]
        with mock.patch.object(fedapay, "retrieve_transaction", return_value={"id": 555, "status": "pending"}):
            self.assertEqual(self.c.post(f"/api/marketplace/orders/{oid}/cancel").status_code, 200)
        self.p2.refresh_from_db()
        self.assertEqual((self.p2.stock, self.p2.status), (4, Product.Status.DISPONIBLE))

    def test_fedapay_failure_cancels_order_and_releases_stock(self):
        with mock.patch.object(fedapay, "create_transaction", side_effect=fedapay.FedaPayError("boom")):
            r = self.c.post("/api/marketplace/orders", {"items": [{"product_id": str(self.p1.id), "quantity": 3}]}, format="json")
        self.assertEqual(r.status_code, 502)
        self.p1.refresh_from_db(); self.assertEqual(self.p1.stock, 10)
        self.assertEqual(Order.objects.get().status, Order.Status.CANCELLED)

    def test_supplier_cannot_order(self):
        c = APIClient(); c.force_authenticate(self.supplier)
        r = c.post("/api/marketplace/orders", {"items": [{"product_id": str(self.p_other.id), "quantity": 1}]}, format="json")
        self.assertEqual(r.status_code, 403)

    def test_delivery_requires_address(self):
        r = self._create_order(delivery_method="delivery")
        self.assertEqual(r.status_code, 422)

    # ---- paiement ----
    def test_verify_payment_approved_marks_paid_and_is_idempotent(self):
        oid = self._create_order().json()["order"]["id"]
        with mock.patch.object(fedapay, "retrieve_transaction", return_value={"id": 555, "status": "approved"}):
            r1 = self.c.post(f"/api/marketplace/orders/{oid}/verify-payment")
            r2 = self.c.post(f"/api/marketplace/orders/{oid}/verify-payment")
        self.assertEqual(r1.json()["status"], "paid")
        self.assertEqual(r2.json()["status"], "paid")
        self.assertEqual(Order.objects.get().payments.count(), 1)
        # Une seule notification "nouvelle commande payée" côté fournisseur.
        self.assertEqual(self.supplier.notifications.filter(title="Nouvelle commande payée").count(), 1)

    def test_declined_keeps_order_pending_and_allows_retry(self):
        oid = self._create_order().json()["order"]["id"]
        with mock.patch.object(fedapay, "retrieve_transaction", return_value={"id": 555, "status": "declined"}):
            r = self.c.post(f"/api/marketplace/orders/{oid}/verify-payment")
        self.assertEqual(r.json()["status"], "pending")
        self.assertEqual(r.json()["payment_status"], "declined")
        with mock.patch.object(fedapay, "create_transaction", return_value=self._fake_tx("556", "https://process.fedapay.com/new")):
            r = self.c.post(f"/api/marketplace/orders/{oid}/pay")
        self.assertEqual(r.json()["payment_url"], "https://process.fedapay.com/new")

    def test_pending_provider_status_changes_nothing(self):
        oid = self._create_order().json()["order"]["id"]
        with mock.patch.object(fedapay, "retrieve_transaction", return_value={"id": 555, "status": "pending"}):
            r = self.c.post(f"/api/marketplace/orders/{oid}/verify-payment")
        self.assertEqual(r.json()["status"], "pending")

    def test_other_user_cannot_access_order(self):
        oid = self._create_order().json()["order"]["id"]
        intruder = make_user("i@x.com", "farmer"); c = APIClient(); c.force_authenticate(intruder)
        self.assertEqual(c.get(f"/api/marketplace/orders/{oid}").status_code, 404)
        self.assertEqual(c.post(f"/api/marketplace/orders/{oid}/verify-payment").status_code, 404)

    # ---- webhook ----
    def _signed(self, body: dict, secret="whsec", ts=None):
        raw = json.dumps(body).encode()
        ts = str(ts or int(time.time()))
        sig = hmac.new(secret.encode(), f"{ts}.".encode() + raw, hashlib.sha256).hexdigest()
        return raw, f"t={ts},s={sig}"

    def test_webhook_valid_signature_confirms_payment(self):
        oid = self._create_order().json()["order"]["id"]
        raw, sig = self._signed({"name": "transaction.approved", "entity": {"id": 555, "status": "approved"}})
        with mock.patch.object(fedapay, "retrieve_transaction", return_value={"id": 555, "status": "approved"}):
            r = self.client.post("/api/marketplace/webhooks/fedapay", raw, content_type="application/json", HTTP_X_FEDAPAY_SIGNATURE=sig)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(Order.objects.get(pk=oid).status, Order.Status.PAID)

    def test_webhook_bad_signature_rejected(self):
        self._create_order()
        raw, _ = self._signed({"entity": {"id": 555}})
        r = self.client.post("/api/marketplace/webhooks/fedapay", raw, content_type="application/json", HTTP_X_FEDAPAY_SIGNATURE="t=1,s=bad")
        self.assertEqual(r.status_code, 400)
        self.assertEqual(Order.objects.get().status, Order.Status.PENDING)

    def test_webhook_cannot_force_payment_provider_says_pending(self):
        """Un faux webhook (même bien signé) ne valide rien : on relit chez FedaPay."""
        self._create_order()
        raw, sig = self._signed({"name": "transaction.approved", "entity": {"id": 555, "status": "approved"}})
        with mock.patch.object(fedapay, "retrieve_transaction", return_value={"id": 555, "status": "pending"}):
            self.client.post("/api/marketplace/webhooks/fedapay", raw, content_type="application/json", HTTP_X_FEDAPAY_SIGNATURE=sig)
        self.assertEqual(Order.objects.get().status, Order.Status.PENDING)

    def test_signature_replay_outside_tolerance_rejected(self):
        raw, sig = self._signed({"entity": {"id": 1}}, ts=int(time.time()) - 10_000)
        self.assertFalse(fedapay.verify_webhook_signature(raw, sig, "whsec"))

    # ---- cycle de vie complet ----
    def test_full_lifecycle_to_payout(self):
        oid = self._create_order().json()["order"]["id"]
        with mock.patch.object(fedapay, "retrieve_transaction", return_value={"id": 555, "status": "approved"}):
            self.c.post(f"/api/marketplace/orders/{oid}/verify-payment")

        s = APIClient(); s.force_authenticate(self.supplier)
        self.assertEqual(len(s.get("/api/marketplace/orders").json()), 1)
        # transition interdite : expédier avant de préparer
        self.assertEqual(s.post(f"/api/marketplace/orders/{oid}/status", {"status": "shipped"}, format="json").status_code, 409)
        self.assertEqual(s.post(f"/api/marketplace/orders/{oid}/status", {"status": "preparing"}, format="json").json()["status"], "preparing")
        self.assertEqual(s.post(f"/api/marketplace/orders/{oid}/status", {"status": "shipped"}, format="json").json()["status"], "shipped")
        # le fournisseur ne peut pas se déclarer livré lui-même
        self.assertEqual(s.post(f"/api/marketplace/orders/{oid}/status", {"status": "delivered"}, format="json").status_code, 422)

        e = s.get("/api/marketplace/earnings").json()
        self.assertEqual((e["pending_amount"], e["available_amount"]), (21375, 0))

        done = self.c.post(f"/api/marketplace/orders/{oid}/confirm-delivery").json()
        self.assertEqual((done["status"], done["payout_status"]), ("delivered", "available"))
        e = s.get("/api/marketplace/earnings").json()
        self.assertEqual((e["pending_amount"], e["available_amount"], e["total_commission"]), (0, 21375, 1125))

    def test_supplier_cancel_paid_order_flags_refund_and_restores_stock(self):
        oid = self._create_order().json()["order"]["id"]
        with mock.patch.object(fedapay, "retrieve_transaction", return_value={"id": 555, "status": "approved"}):
            self.c.post(f"/api/marketplace/orders/{oid}/verify-payment")
        s = APIClient(); s.force_authenticate(self.supplier)
        r = s.post(f"/api/marketplace/orders/{oid}/status", {"status": "cancelled"}, format="json").json()
        self.assertEqual((r["status"], r["refund_status"]), ("cancelled", "needed"))
        self.p1.refresh_from_db(); self.assertEqual(self.p1.stock, 10)

    def test_payment_after_cancellation_flags_refund(self):
        oid = self._create_order().json()["order"]["id"]
        with mock.patch.object(fedapay, "retrieve_transaction", return_value={"id": 555, "status": "pending"}):
            self.c.post(f"/api/marketplace/orders/{oid}/cancel")
        # Le client paie quand même (onglet FedaPay resté ouvert) : on détecte et on signale.
        with mock.patch.object(fedapay, "retrieve_transaction", return_value={"id": 555, "status": "approved"}):
            from . import services
            services.sync_payment_from_provider(Payment.objects.get())
        o = Order.objects.get()
        self.assertEqual((o.status, o.refund_status), ("cancelled", "needed"))

    # ---- expiration ----
    def test_stale_orders_expire_and_release_stock(self):
        from datetime import timedelta
        from django.utils import timezone
        from . import services
        self._create_order()
        Order.objects.update(created_at=timezone.now() - timedelta(minutes=45))
        with mock.patch.object(fedapay, "retrieve_transaction", return_value={"id": 555, "status": "pending"}):
            self.assertEqual(services.expire_stale_orders(), 1)
        self.assertEqual(Order.objects.get().status, Order.Status.CANCELLED)
        self.p1.refresh_from_db(); self.assertEqual(self.p1.stock, 10)

    def test_stale_order_paid_meanwhile_is_not_cancelled(self):
        from datetime import timedelta
        from django.utils import timezone
        from . import services
        self._create_order()
        Order.objects.update(created_at=timezone.now() - timedelta(minutes=45))
        with mock.patch.object(fedapay, "retrieve_transaction", return_value={"id": 555, "status": "approved"}):
            self.assertEqual(services.expire_stale_orders(), 0)
        self.assertEqual(Order.objects.get().status, Order.Status.PAID)

    # ---- catalogue & revenus ----
    def test_catalog_hides_out_of_stock_and_includes_supplier(self):
        Product.objects.create(supplier=self.supplier, name="Vide", price=100, stock=0, sku="V")
        data = self.c.get("/api/marketplace/catalog").json()
        names = {p["name"] for p in data}
        self.assertEqual(names, {"Engrais NPK", "Semences maïs", "Houe"})
        self.assertEqual(next(p for p in data if p["name"] == "Houe")["supplier_name"], "Autre")

    def test_payout_account_roundtrip(self):
        s = APIClient(); s.force_authenticate(self.supplier)
        r = s.put("/api/marketplace/payout-account", {"operator": "tmoney", "phone": "90 11 22 33", "account_name": "Sup"}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(s.get("/api/marketplace/earnings").json()["payout_account"]["operator"], "tmoney")
        self.assertEqual(self.c.get("/api/marketplace/earnings").status_code, 403)


@override_settings(FEDAPAY_SECRET_KEY="", PAYMENT_SIMULATION=True, FRONTEND_URL="http://front.test",
                   PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class SimulationTests(TestCase):
    def test_simulated_flow_without_fedapay_keys(self):
        farmer = make_user("f@x.com", "farmer"); sup = make_user("s@x.com", "supplier", company="A")
        p = Product.objects.create(supplier=sup, name="X", price=5000, stock=3, sku="X")
        c = APIClient(); c.force_authenticate(farmer)
        r = c.post("/api/marketplace/orders", {"items": [{"product_id": str(p.id), "quantity": 1}]}, format="json")
        self.assertEqual(r.status_code, 201)
        self.assertIn("/app/paiement/simulation?order=", r.json()["payment_url"])
        oid = r.json()["order"]["id"]
        done = c.post(f"/api/marketplace/orders/{oid}/simulate-payment", {"outcome": "approved"}, format="json").json()
        self.assertEqual(done["status"], "paid")

    @override_settings(PAYMENT_SIMULATION=False,
                   PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
    def test_no_keys_and_no_simulation_gives_clear_error(self):
        farmer = make_user("f@x.com", "farmer"); sup = make_user("s@x.com", "supplier", company="A")
        p = Product.objects.create(supplier=sup, name="X", price=5000, stock=3, sku="X")
        c = APIClient(); c.force_authenticate(farmer)
        r = c.post("/api/marketplace/orders", {"items": [{"product_id": str(p.id), "quantity": 1}]}, format="json")
        self.assertEqual(r.status_code, 503)
        p.refresh_from_db(); self.assertEqual(p.stock, 3)
