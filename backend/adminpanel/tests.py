from django.test import TestCase, override_settings
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from accounts.models import User
from marketplace.models import Product
from notifications.models import Notification
from .models import ActivityLog, PlatformSettings

FAST_HASH = override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])


def make_user(email, role, **kw):
    return User.objects.create_user(
        username=email, email=email, password="pass12345", role=role, name=email, **kw
    )


@FAST_HASH
class AdminSettingsApiTests(TestCase):
    def setUp(self):
        self.admin = make_user("a@x.com", "admin")
        self.farmer = make_user("f@x.com", "farmer")
        self.c = APIClient()

    def test_only_admin_can_read_or_write(self):
        self.c.force_authenticate(self.farmer)
        self.assertEqual(self.c.get("/api/admin/settings").status_code, 403)
        self.assertEqual(self.c.patch("/api/admin/settings", {"maintenance_mode": True}, format="json").status_code, 403)

    def test_defaults_and_persistence(self):
        self.c.force_authenticate(self.admin)
        data = self.c.get("/api/admin/settings").json()
        self.assertEqual(data["confidence_threshold"], 75)
        self.assertFalse(data["auto_validate_suppliers"])
        self.assertFalse(data["maintenance_mode"])
        self.assertIn("active_model", data)

        r = self.c.patch("/api/admin/settings",
                         {"confidence_threshold": 60, "auto_validate_suppliers": True}, format="json")
        self.assertEqual(r.status_code, 200)
        ps = PlatformSettings.load()
        self.assertEqual(ps.confidence_threshold, 60)
        self.assertTrue(ps.auto_validate_suppliers)
        self.assertTrue(ActivityLog.objects.filter(action__startswith="Paramètres système modifiés").exists())

    def test_threshold_validation(self):
        self.c.force_authenticate(self.admin)
        for bad in (-1, 101, "abc"):
            r = self.c.patch("/api/admin/settings", {"confidence_threshold": bad}, format="json")
            self.assertEqual(r.status_code, 422, bad)
        self.assertEqual(PlatformSettings.load().confidence_threshold, 75)


@FAST_HASH
class AutoValidateSuppliersTests(TestCase):
    payload = {
        "company": "AgroX", "name": "Ama", "email": "ama@x.com", "phone": "90000000",
        "region": "Maritime", "category": "Semences",
        "password": "Str0ngPass!234", "password_confirmation": "Str0ngPass!234",
    }

    def test_pending_by_default(self):
        r = APIClient().post("/api/auth/register/supplier", self.payload, format="json")
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(User.objects.get(email="ama@x.com").status, User.Status.PENDING)

    def test_active_when_auto_validate_on(self):
        ps = PlatformSettings.load()
        ps.auto_validate_suppliers = True
        ps.save()
        r = APIClient().post("/api/auth/register/supplier", self.payload, format="json")
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(User.objects.get(email="ama@x.com").status, User.Status.ACTIVE)


@FAST_HASH
class MaintenanceModeTests(TestCase):
    def setUp(self):
        self.admin = make_user("a@x.com", "admin")
        self.farmer = make_user("f@x.com", "farmer")
        self.admin_tok = Token.objects.create(user=self.admin).key
        self.farmer_tok = Token.objects.create(user=self.farmer).key
        ps = PlatformSettings.load()
        ps.maintenance_mode = True
        ps.save()

    def _get(self, path, tok=None):
        c = APIClient()
        if tok:
            c.credentials(HTTP_AUTHORIZATION=f"Bearer {tok}")
        return c.get(path)

    def test_non_admin_gets_503(self):
        r = self._get("/api/diagnostics", self.farmer_tok)
        self.assertEqual(r.status_code, 503)
        self.assertTrue(r.json()["maintenance"])

    def test_anonymous_gets_503(self):
        self.assertEqual(self._get("/api/suppliers").status_code, 503)

    def test_admin_still_works(self):
        self.assertEqual(self._get("/api/admin/settings", self.admin_tok).status_code, 200)

    def test_status_endpoint_is_public(self):
        r = self._get("/api/platform/status")
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.json()["maintenance"])

    def test_login_admin_ok_farmer_blocked(self):
        c = APIClient()
        ok = c.post("/api/auth/login", {"email": "a@x.com", "password": "pass12345"}, format="json")
        self.assertEqual(ok.status_code, 200)
        ko = c.post("/api/auth/login", {"email": "f@x.com", "password": "pass12345"}, format="json")
        self.assertEqual(ko.status_code, 503)
        self.assertTrue(ko.json()["maintenance"])

    def test_back_to_normal(self):
        ps = PlatformSettings.load()
        ps.maintenance_mode = False
        ps.save()
        self.assertEqual(self._get("/api/diagnostics", self.farmer_tok).status_code, 200)


@FAST_HASH
class PreferencesTests(TestCase):
    def setUp(self):
        self.farmer = make_user("f@x.com", "farmer", phone="90112233")
        self.supplier = make_user("s@x.com", "supplier", company="AgroTogo", status="active")
        self.product = Product.objects.create(
            supplier=self.supplier, name="Engrais", price=10000, stock=12, sku="E1")
        self.c = APIClient()

    def test_profile_patch_saves_prefs_and_returns_them(self):
        self.c.force_authenticate(self.supplier)
        r = self.c.patch("/api/auth/profile",
                         {"notify_new_orders": False, "notify_stock_alerts": False, "shop_visible": False},
                         format="json")
        self.assertEqual(r.status_code, 200)
        body = r.json()
        self.assertFalse(body["notify_new_orders"])
        self.assertFalse(body["shop_visible"])
        self.supplier.refresh_from_db()
        self.assertFalse(self.supplier.notify_stock_alerts)

    def _request(self):
        self.c.force_authenticate(self.farmer)
        return self.c.post("/api/marketplace/requests/create",
                           {"product_id": str(self.product.id), "quantity": 2}, format="json")

    def test_new_request_notifies_supplier_by_default(self):
        self.assertEqual(self._request().status_code, 201)
        self.assertEqual(self.supplier.notifications.filter(title="Nouvelle demande").count(), 1)

    def test_new_request_silent_when_pref_off(self):
        self.supplier.notify_new_orders = False
        self.supplier.save()
        self.assertEqual(self._request().status_code, 201)
        self.assertEqual(Notification.objects.filter(user=self.supplier).count(), 0)

    def test_hidden_shop(self):
        self.supplier.shop_visible = False
        self.supplier.save()
        # annuaire public
        self.assertEqual(len(APIClient().get("/api/suppliers").json()), 0)
        self.assertEqual(APIClient().get(f"/api/suppliers/{self.supplier.id}").status_code, 404)
        # catalogue + demande
        self.c.force_authenticate(self.farmer)
        catalog = self.c.get("/api/marketplace/catalog").json()
        self.assertEqual(len(catalog), 0)
        self.assertEqual(self._request().status_code, 409)

    def test_shop_visible_by_default(self):
        self.assertEqual(len(APIClient().get("/api/suppliers").json()), 1)


@FAST_HASH
class StockAlertTests(TestCase):
    def setUp(self):
        self.farmer = make_user("f@x.com", "farmer", phone="90112233")
        self.supplier = make_user("s@x.com", "supplier", company="AgroTogo", status="active")
        self.product = Product.objects.create(
            supplier=self.supplier, name="Engrais", price=10000, stock=12, sku="E1")

    def _order(self, qty):
        from marketplace.services import create_order
        return create_order(
            buyer=self.farmer, items=[{"product_id": self.product.id, "quantity": qty}],
            delivery_method="pickup", delivery_address="", phone="", note="",
        )

    def test_low_stock_then_out_of_stock(self):
        self._order(3)   # 12 -> 9 : passe sous le seuil
        self.assertEqual(self.supplier.notifications.filter(title="Stock faible").count(), 1)
        self._order(9)   # 9 -> 0 : rupture
        self.assertEqual(self.supplier.notifications.filter(title="Rupture de stock").count(), 1)

    def test_no_alert_when_pref_off(self):
        self.supplier.notify_stock_alerts = False
        self.supplier.save()
        self._order(12)
        self.assertEqual(self.supplier.notifications.filter(title__in=["Stock faible", "Rupture de stock"]).count(), 0)

    def test_hidden_shop_refuses_orders(self):
        from marketplace.services import OrderError
        self.supplier.shop_visible = False
        self.supplier.save()
        with self.assertRaises(OrderError):
            self._order(1)


@FAST_HASH
class ConfidenceThresholdTests(TestCase):
    def setUp(self):
        self.farmer = make_user("f@x.com", "farmer")
        self.c = APIClient()
        self.c.force_authenticate(self.farmer)

    def _post(self, confidence):
        from io import BytesIO
        from unittest import mock
        from django.core.files.uploadedfile import SimpleUploadedFile
        from PIL import Image

        buf = BytesIO()
        Image.new("RGB", (8, 8), "green").save(buf, "PNG")
        parsed = {
            "disease_name": "Mildiou", "scientific_name": "", "confidence": confidence,
            "risk_level": "Moyen", "causes": [], "recommendations": ["Traiter"], "treatment": "x",
        }
        with mock.patch("diagnostics.views.analyze_image", return_value={"parsed": parsed, "raw_text": "{}"}):
            return self.c.post(
                "/api/diagnostics",
                {"type": "culture", "image": SimpleUploadedFile("a.png", buf.getvalue(), "image/png")},
                format="multipart",
            )

    def test_low_confidence_adds_warning(self):
        r = self._post(40)
        self.assertEqual(r.status_code, 201, r.content)
        recos = [x["label"] for x in r.json()["recommendations"]]
        self.assertIn("Confiance de l'IA faible", recos[0])
        self.assertEqual(recos[1], "Traiter")

    def test_high_confidence_untouched(self):
        r = self._post(90)
        self.assertEqual([x["label"] for x in r.json()["recommendations"]], ["Traiter"])

    def test_threshold_is_configurable(self):
        ps = PlatformSettings.load()
        ps.confidence_threshold = 30
        ps.save()
        self.assertEqual([x["label"] for x in self._post(40).json()["recommendations"]], ["Traiter"])

    def test_notification_pref_off(self):
        self.farmer.notify_diagnostics = False
        self.farmer.save()
        self._post(90)
        self.assertEqual(self.farmer.notifications.count(), 0)
