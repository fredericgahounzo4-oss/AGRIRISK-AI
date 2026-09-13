# AGRIRISK-AI — Backend Django

Backend complet pour le frontend AGRIRISK-AI (React + Vite) : authentification,
profil utilisateur, **Diagnostic IA** (analyse d'image via l'API Google Gemini) et
**Assistant IA** (chat agricole via l'API Google Gemini).

## Routes disponibles

### Authentification (`accounts`)
| Méthode | Route                        | Description                       |
|---------|------------------------------|-------------------------------------|
| POST    | `/api/auth/login`            | Connexion                          |
| POST    | `/api/auth/register/farmer`  | Inscription agriculteur            |
| POST    | `/api/auth/register/supplier`| Inscription fournisseur            |
| GET     | `/api/auth/me`                | Utilisateur connecté                |
| PATCH   | `/api/auth/profile`          | Modifier le profil                 |
| POST    | `/api/auth/profile/avatar`   | Changer la photo de profil         |
| POST    | `/api/auth/change-password`  | Changer le mot de passe            |
| POST    | `/api/auth/logout`           | Déconnexion                        |
| POST    | `/api/auth/forgot-password`  | Demande de réinitialisation        |
| POST    | `/api/auth/reset-password`   | Réinitialisation du mot de passe   |

### Diagnostic IA (`diagnostics`) — **nécessite GEMINI_API_KEY**
| Méthode | Route                              | Description                    |
|---------|-------------------------------------|---------------------------------|
| POST    | `/api/diagnostics`                 | Envoie une image, l'IA l'analyse et renvoie un diagnostic |
| GET     | `/api/diagnostics`                 | Historique des diagnostics      |
| GET     | `/api/diagnostics/<id>`            | Détail d'un diagnostic          |
| GET     | `/api/diagnostics/<id>/report`     | Rapport PDF téléchargeable      |

### Assistant IA (`chat`) — **nécessite GEMINI_API_KEY**
| Méthode | Route                                 | Description                  |
|---------|-----------------------------------------|--------------------------------|
| GET     | `/api/conversations`                   | Liste des conversations        |
| POST    | `/api/conversations`                   | Crée une conversation vide     |
| GET     | `/api/conversations/<id>/messages`     | Messages d'une conversation    |
| POST    | `/api/conversations/messages`          | Envoie un message, reçoit la réponse IA |

### Marketplace (`marketplace`) — produits & demandes fournisseur
| Méthode | Route                                        | Description                    |
|---------|------------------------------------------------|----------------------------------|
| GET     | `/api/marketplace/products`                   | Produits du fournisseur connecté |
| POST    | `/api/marketplace/products`                   | Crée un produit                  |
| PATCH   | `/api/marketplace/products/<id>`              | Modifie un produit               |
| DELETE  | `/api/marketplace/products/<id>`              | Supprime un produit              |
| GET     | `/api/marketplace/requests`                   | Demandes reçues par le fournisseur |
| POST    | `/api/marketplace/requests/create`            | Crée une demande (côté agriculteur) |
| POST    | `/api/marketplace/requests/<id>/accept`       | Accepte une demande              |
| POST    | `/api/marketplace/requests/<id>/reject`       | Refuse une demande               |

### Notifications (`notifications`)
| Méthode | Route                                | Description                       |
|---------|----------------------------------------|--------------------------------------|
| GET     | `/api/notifications`                  | Liste + nombre de notifications non lues |
| POST    | `/api/notifications/<id>/read`        | Marque une notification comme lue    |
| POST    | `/api/notifications/read-all`         | Marque tout comme lu                 |

Des notifications sont générées automatiquement lors de :
- une nouvelle demande reçue par un fournisseur,
- une demande acceptée / refusée (côté agriculteur),
- un diagnostic IA terminé (côté agriculteur).

### Notifications (`notifications`)
| Méthode | Route                                | Description                       |
|---------|----------------------------------------|--------------------------------------|
| GET     | `/api/notifications`                  | 30 dernières notifications + compteur non-lues |
| POST    | `/api/notifications/<id>/read`        | Marque une notification comme lue |
| POST    | `/api/notifications/read-all`         | Marque tout comme lu              |

Des notifications sont créées automatiquement lors de :
- une nouvelle demande reçue par un fournisseur,
- l'acceptation ou le refus d'une demande (notifie l'agriculteur),
- la fin d'un diagnostic IA.

## 1. Installation

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows : venv\Scripts\activate

pip install -r requirements.txt
```

## 2. Configuration

```bash
cp .env.example .env
```

Puis éditez `backend/.env` et renseignez votre clé API Google Gemini :
```
GEMINI_API_KEY=AIzaSy...
```
→ Créez une clé (gratuite) sur **https://aistudio.google.com/apikey**. Une clé
API stable ressemble à `AIzaSy...` ; un jeton OAuth temporaire (qui expire
après ~1h) ne convient pas ici.
Sans cette clé, le Diagnostic IA et l'Assistant IA renvoient une erreur claire
(503) mais tout le reste de l'application (auth, profil, historique) fonctionne
normalement.

## 3. Base de données

```bash
python manage.py migrate
python manage.py createsuperuser   # optionnel, pour accéder à /admin/
```

## 4. Lancer le serveur

```bash
python manage.py runserver 8000
```

- API : `http://127.0.0.1:8000/api/`
- Admin Django : `http://127.0.0.1:8000/admin/`

## 5. Brancher le frontend

Dans le projet frontend, `.env` :
```
VITE_API_URL=http://localhost:8000/api
VITE_MOCK_MODE=false
```

## Détails techniques

- **Authentification** : token Bearer (`rest_framework.authtoken`), compatible
  avec l'intercepteur Axios du frontend.
- **Diagnostic IA** : l'image est envoyée à l'API Google Gemini (vision) avec
  un prompt spécialisé (phytopathologie pour les cultures, vétérinaire pour
  les animaux). La réponse JSON structurée du modèle est validée puis stockée
  en base (modèle `Diagnostic`).
- **Assistant IA** : chaque message envoie l'historique complet de la
  conversation à Gemini, avec un prompt système "assistant agricole Afrique de
  l'Ouest". Réponses en français.
- **Rapport PDF** : généré à la volée avec `reportlab` (pas de fichier stocké).
- **CORS** activé pour `http://localhost:5173`.
- Le fichier `.env` est chargé via `python-dotenv` (ajouté dans `settings.py`).

## Tester rapidement avec curl

```bash
# Inscription
curl -X POST http://127.0.0.1:8000/api/auth/register/farmer \
  -H "Content-Type: application/json" \
  -d '{"name":"Kofi Mensah","email":"kofi@example.com","phone":"90112233","region":"Maritime","culture":"Maïs","password":"motdepasse123","password_confirmation":"motdepasse123"}'

# Diagnostic (remplacez TOKEN et le chemin de l'image)
curl -X POST http://127.0.0.1:8000/api/diagnostics \
  -H "Authorization: Bearer TOKEN" \
  -F "type=culture" -F "image=@/chemin/vers/photo.jpg"
```

## Aller plus loin

Ce backend couvre l'authentification, le profil, le diagnostic IA et
l'assistant IA. Les sections encore en mode mock côté frontend (produits,
fournisseurs) peuvent être migrées de la même façon si besoin.
