# AgriRisk AI — Frontend React

Application web de diagnostic agricole intelligent basée sur l'IA.

## Stack technique

| Outil | Version | Rôle |
|---|---|---|
| React | 19 | UI |
| TypeScript | 6 | Typage statique |
| Vite | 8 | Build & Dev server |
| Tailwind CSS | v4 | Styles utilitaires |
| React Router DOM | 7 | Navigation SPA |
| TanStack Query | 5 | Data fetching / cache |
| Zustand | 5 | État global (auth) |
| React Hook Form + Zod | — | Formulaires & validation |
| Axios | — | HTTP client |
| React Leaflet | — | Carte interactive |
| Lucide React | — | Icônes |
| React Hot Toast | — | Notifications |

## Structure

```
src/
├── app/           # Router, providers, queryClient
├── assets/        # Styles globaux, images, icônes
├── components/    # UI génériques (Button, Card, Input…) + Layout
├── features/      # Modules métier (auth, diagnostic, assistant, suppliers)
│   └── [feature]/
│       ├── api/       # Appels Axios
│       ├── components/# Composants propres à la feature
│       ├── hooks/     # React Query + logique
│       ├── pages/     # Pages React Router
│       ├── store/     # Zustand (auth uniquement)
│       └── types/     # Interfaces TypeScript
├── hooks/         # Hooks partagés (useDebounce, useLocalStorage)
├── services/      # Instance Axios + intercepteurs
├── types/         # Types globaux
└── utils/         # cn(), formatDate(), etc.
```

## Démarrage rapide

```bash
# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env.local

# Lancer le serveur de développement
npm run dev
```

## Variables d'environnement

```env
VITE_API_URL=http://localhost:8000/api
```

## Pages disponibles

| Route | Page |
|---|---|
| `/connexion` | Login |
| `/inscription` | Register |
| `/tableau-de-bord` | Dashboard |
| `/diagnostic` | Diagnostic IA (Culture + Animal) |
| `/diagnostic/resultat/:id` | Résultat du diagnostic |
| `/assistant` | Assistant IA chat |
| `/fournisseurs` | Carte des fournisseurs |

## Backend attendu (Laravel)

| Endpoint | Méthode | Description |
|---|---|---|
| `/api/auth/login` | POST | Connexion JWT |
| `/api/auth/register` | POST | Inscription |
| `/api/auth/logout` | POST | Déconnexion |
| `/api/auth/me` | GET | Utilisateur connecté |
| `/api/diagnostics` | POST | Lancer un diagnostic |
| `/api/diagnostics` | GET | Historique |
| `/api/diagnostics/:id` | GET | Résultat |
| `/api/diagnostics/:id/report` | GET | Rapport PDF |
| `/api/conversations` | GET/POST | Conversations IA |
| `/api/conversations/:id/messages` | GET | Messages |
| `/api/conversations/messages` | POST | Envoyer un message |
| `/api/suppliers` | GET | Liste fournisseurs |
