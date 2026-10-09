from django.test import TestCase
from rest_framework.test import APIClient
from accounts.models import User
from marketplace.models import Product

class MsgTests(TestCase):
    def setUp(self):
        self.f = User.objects.create_user(username="f", email="f@x.com", password="p", name="Farmer", role="farmer", region="Lome")
        self.s = User.objects.create_user(username="s", email="s@x.com", password="p", name="Sup", company="AgroLome", role="supplier", region="Kara", category="Engrais", lat=9.55, lng=1.18)
        self.s2 = User.objects.create_user(username="s2", email="s2@x.com", password="p", name="Other", role="supplier")
        self.prod = Product.objects.create(supplier=self.s, name="NPK", price=1000, stock=5, sku="A1")
    def c(self, u):
        c = APIClient(); c.force_authenticate(u); return c
    def test_flow(self):
        r = self.c(self.f).post("/api/messages/threads", {"supplier_id": str(self.s.id), "product_id": str(self.prod.id), "content": "Bonjour NPK ?"}, format="json")
        self.assertEqual(r.status_code, 201, r.content)
        tid = r.json()["thread"]["id"]
        # supplier sees thread with unread 1
        r = self.c(self.s).get("/api/messages/threads"); self.assertEqual(r.json()[0]["unread_count"], 1); self.assertEqual(r.json()[0]["other_name"], "Farmer")
        self.assertEqual(self.c(self.s).get("/api/messages/unread").json()["count"], 1)
        # other supplier can't read
        self.assertEqual(self.c(self.s2).get(f"/api/messages/threads/{tid}").status_code, 404)
        # supplier reads + replies
        r = self.c(self.s).get(f"/api/messages/threads/{tid}"); self.assertEqual(len(r.json()["messages"]), 1); self.assertEqual(r.json()["messages"][0]["product_name"], "NPK")
        self.assertEqual(self.c(self.s).get("/api/messages/unread").json()["count"], 0)
        r = self.c(self.s).post(f"/api/messages/threads/{tid}", {"content": "Oui dispo"}, format="json"); self.assertEqual(r.status_code, 201)
        self.assertEqual(self.c(self.f).get("/api/messages/threads").json()[0]["unread_count"], 1)
        # same pair reuses thread
        r = self.c(self.f).post("/api/messages/threads", {"supplier_id": str(self.s.id), "content": "Merci"}, format="json")
        self.assertEqual(r.json()["thread"]["id"], tid)
        # supplier can't initiate; empty content rejected
        self.assertEqual(self.c(self.s).post("/api/messages/threads", {"supplier_id": str(self.s2.id), "content": "x"}, format="json").status_code, 403)
        self.assertEqual(self.c(self.f).post("/api/messages/threads", {"supplier_id": str(self.s.id), "content": ""}, format="json").status_code, 422)
        # notifications created
        self.assertTrue(self.s.notifications.filter(link__startswith="/fournisseur/messages").exists())
    def test_suppliers_dynamic(self):
        r = self.c(self.f).get("/api/suppliers", {"lat": 6.13, "lng": 1.22})
        d = {x["name"]: x for x in r.json()}
        self.assertTrue(d["AgroLome"]["location_precise"]); self.assertEqual(d["AgroLome"]["products_count"], 1)
        self.assertGreater(d["AgroLome"]["distance"], 300)
        self.assertFalse(d["AgroLome"]["distance"] == 0)
        r = APIClient().get("/api/suppliers"); self.assertFalse(r.json()[0]["has_distance"])
        self.assertEqual(APIClient().get("/api/suppliers", {"lat": "abc", "lng": "1"}).status_code, 200)
