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

### 2. Clé API Google Gemini — OBLIGATOIRE pour le Diagnostic IA et l'Assistant IA

Le **Diagnostic IA** (analyse de photo) et l'**Assistant IA** (chat) utilisent
la vraie API Google Gemini. Sans clé configurée, ces deux fonctionnalités
renverront une erreur claire ("GEMINI_API_KEY n'est pas configurée") mais
resteront fonctionnelles pour le reste (profil, historique vide, etc.).

1. Allez sur https://aistudio.google.com/apikey (connexion avec un compte Google)
2. Cliquez sur "Create API key" — la clé générée ressemble à `AIzaSy...`
3. Ouvrez `backend/.env` et complétez :
   ```
   GEMINI_API_KEY=AIzaSy-votre-clé-ici
   ```
4. Redémarrez le serveur Django (`Ctrl+C` puis `python manage.py runserver 8000`)

⚠️ Utilisez bien une **clé API** (`AIzaSy...`), pas un jeton OAuth temporaire
(souvent de la forme `ya29....` ou `AQ....`) : ce dernier expire après une
heure environ et cessera de fonctionner. Gemini propose un [niveau gratuit](https://ai.google.dev/pricing)
avec des limites de requêtes ; au-delà, la consommation est facturée.

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
- ✅ Diagnostic IA : upload d'image → vraie analyse par Gemini → résultat structuré
- ✅ Rapport PDF téléchargeable pour chaque diagnostic
- ✅ Historique des diagnostics (vraies données, plus de données factices)
- ✅ Assistant IA : conversation en temps réel avec Gemini, historique de conversations
- ✅ **Fournisseur** — Profil entreprise : modification et sauvegarde réelles
- ✅ **Fournisseur** — Produits : ajout, modification, suppression (catalogue réel)
- ✅ **Fournisseur** — Demandes : accepter / refuser / voir détails (données réelles)
- ✅ **Fournisseur** — Changement de mot de passe
- ✅ Notifications réelles (cloche) : nouvelle demande, demande acceptée/refusée, diagnostic terminé — marquage lu/tout lu

## Pas encore connecté

- ⏳ "Gérer l'abonnement" (facturation) — laissé de côté, nécessiterait un vrai
  système de paiement (Stripe ou équivalent) non présent dans ce projet.
- ⏳ Toggles de préférences de notifications (visuels, pas encore sauvegardés).

## Si une erreur persiste

1. **Le backend n'est pas lancé** → relance `python manage.py runserver 8000`
   dans le dossier `backend`.
2. **"GEMINI_API_KEY n'est pas configurée"** → voir section 2 ci-dessus.
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
