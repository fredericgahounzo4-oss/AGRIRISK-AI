# AGRIRISK-AI — Projet complet (Frontend + Backend)

Ce zip contient les **deux parties** de l'application :

```
AGRIRISK-AI/   → Frontend React + Vite (déjà configuré pour parler au backend)
backend/       → Backend Django (auth, profil, diagnostic IA, assistant IA)
```

Le fichier `AGRIRISK-AI/.env` est déjà réglé pour utiliser le backend Django
(`VITE_MOCK_MODE=false`, `VITE_API_URL=http://localhost:8000/api`). Il n'y a
rien à modifier côté frontend.

## Ordre de démarrage : TOUJOURS le backend en premier

### 1. Backend Django (terminal n°1)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows : venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver 8000
```

### 2. Clé API Groq — OBLIGATOIRE pour le Diagnostic IA et l'Assistant IA

Le **Diagnostic IA** (analyse de photo) et l'**Assistant IA** (chat) utilisent
la vraie API Groq. Sans clé configurée, ces deux fonctionnalités
renverront une erreur claire ("GROQ_API_KEY n'est pas configurée") mais
resteront fonctionnelles pour le reste (profil, historique vide, etc.).

1. Allez sur https://console.groq.com/keys (créez un compte gratuit si besoin)
2. Cliquez sur "Create API Key" — la clé générée ressemble à `gsk_...`
3. Ouvrez `backend/.env` et complétez :
   ```
   GROQ_API_KEY=gsk_votre-clé-ici
   ```
4. Redémarrez le serveur Django (`Ctrl+C` puis `python manage.py runserver 8000`)

Groq propose un [niveau gratuit](https://console.groq.com/docs/rate-limits) avec des limites de requêtes par minute/jour.

### 3. Frontend React (terminal n°2, nouveau terminal)

```bash
cd AGRIRISK-AI
npm install
npm run dev
```

→ Ouvre l'URL affichée (en général `http://localhost:5173`).

## Fonctionnalités connectées dans cette version

- ✅ Inscription / Connexion (agriculteur, fournisseur)
- ✅ Profil : modification des infos, photo de profil, changement de mot de passe
- ✅ Langue / Pays (sauvegardés sur le compte)
- ✅ Diagnostic IA : upload d'image → vraie analyse par Groq → résultat structuré
- ✅ Rapport PDF téléchargeable pour chaque diagnostic
- ✅ Historique des diagnostics (vraies données, plus de données factices)
- ✅ Assistant IA : conversation en temps réel avec Groq, historique de conversations
- ✅ **Fournisseur** — Profil entreprise : modification et sauvegarde réelles
- ✅ **Fournisseur** — Produits : ajout, modification, suppression (catalogue réel)
- ✅ **Fournisseur** — Demandes : accepter / refuser / voir détails (données réelles)
- ✅ **Fournisseur** — Changement de mot de passe
- ✅ Notifications réelles (cloche) : nouvelle demande, demande acceptée/refusée, diagnostic terminé — marquage lu/tout lu

## Pas encore connecté

- ⏳ "Gérer l'abonnement" (facturation) — laissé de côté, nécessiterait un vrai
  système de paiement (Stripe ou équivalent) non présent dans ce projet.
- ⏳ Toggles de préférences de notifications (visuels, pas encore sauvegardés).

## Marketplace & paiement Mobile Money (FedaPay)

Le côté fournisseur n'est plus seulement de la mise en relation : c'est une
vraie **marketplace**.

**Parcours agriculteur** : Boutique → Panier → Paiement FedaPay (T-Money, Flooz,
MTN, Moov ou carte) → Suivi dans « Mes commandes » → « J'ai bien reçu ma commande ».

**Parcours fournisseur** : une commande n'apparaît dans « Commandes » qu'une fois
**payée** → Préparer → Expédier / Prête pour retrait → après la confirmation du
client, la somme (prix − commission) devient « À recevoir » dans « Revenus ».

**Règles importantes**
- Une commande = un fournisseur (le panier se règle fournisseur par fournisseur).
- Le stock est **réservé** à la commande et **remis en vente** si le paiement échoue,
  si l'acheteur annule, ou après 30 min sans paiement (`ORDER_EXPIRY_MINUTES`).
- Le statut d'un paiement n'est **jamais cru** sur parole : le backend relit toujours
  la transaction chez FedaPay (page de retour **et** webhook).
- Commission AgriRisk : `MARKETPLACE_COMMISSION_PERCENT` (5 % par défaut), déduite du
  fournisseur — l'agriculteur paie exactement le prix affiché.
- Le fournisseur est payé **après** la confirmation de réception (système de séquestre).
  Le reversement est **manuel** : dans l'admin Django → *Orders*, filtrez
  `payout_status = À reverser`, envoyez l'argent au numéro Mobile Money du fournisseur
  (visible dans *Payout accounts*), puis appliquez l'action
  « Marquer le reversement comme effectué ».
- Annulation par le fournisseur d'une commande déjà payée (ou paiement reçu après
  annulation) → `refund_status = Remboursement à faire`. Remboursez depuis le tableau
  de bord FedaPay puis appliquez l'action « Marquer le remboursement comme effectué ».

### Tester en local SANS compte FedaPay
Laissez `FEDAPAY_SECRET_KEY` vide dans `backend/.env` avec `DJANGO_DEBUG=true` :
le paiement est **simulé** (une page vous laisse choisir « réussi » ou « refusé »).
Ce mode est désactivé automatiquement en production.

### Brancher le vrai FedaPay
1. Créez un compte sur https://fedapay.com (mode **Sandbox** d'abord).
2. *Paramètres → Clés API* : copiez la clé secrète dans `FEDAPAY_SECRET_KEY`
   (`sk_sandbox_...`), gardez `FEDAPAY_ENV=sandbox`.
3. Mettez `FRONTEND_URL` à l'adresse publique du frontend (FedaPay y renvoie l'acheteur).
4. *Webhooks → Créer* : URL `https://VOTRE-BACKEND/api/marketplace/webhooks/fedapay`
   (HTTPS obligatoire, événements `transaction.*`), puis copiez la clé du webhook
   dans `FEDAPAY_WEBHOOK_SECRET`. (Même sans webhook, la page de retour confirme le
   paiement ; le webhook sert de filet de sécurité si l'acheteur ferme son navigateur.)
5. Testez avec les numéros de test de la documentation FedaPay, puis passez
   `FEDAPAY_ENV=live` avec votre clé `sk_live_...` une fois le compte validé.

> ⚠️ Après mise à jour : `python manage.py migrate` (nouvelle migration `marketplace/0002`).
> Ne mettez jamais la clé secrète FedaPay dans le frontend ni dans Git.

Lancer les tests du paiement : `cd backend && python manage.py test marketplace`

## Si une erreur persiste

1. **Le backend n'est pas lancé** → relance `python manage.py runserver 8000`
   dans le dossier `backend`.
2. **"GROQ_API_KEY n'est pas configurée"** → voir section 2 ci-dessus.
3. **Le port 8000 est déjà utilisé** → change le port
   (`python manage.py runserver 8001`) et mets à jour
   `VITE_API_URL=http://localhost:8001/api` dans `AGRIRISK-AI/.env`.
4. **`npm install` n'a pas été fait** dans `AGRIRISK-AI` avant `npm run dev`.

Pour vérifier que le backend répond :
```bash
curl http://127.0.0.1:8000/api/auth/me
```
→ un message JSON "non authentifié" est normal sans être connecté ; une
erreur de connexion refusée signifie que le serveur n'est pas lancé.

## Détails techniques du backend

Voir `backend/README.md` pour la liste complète des routes et le détail du
modèle de données.
