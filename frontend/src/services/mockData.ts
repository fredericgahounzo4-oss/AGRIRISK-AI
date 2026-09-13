/**
 * Données de démonstration centralisées.
 * Utilisées quand VITE_MOCK_MODE=true.
 * À retirer (ou ignorer) une fois le backend connecté.
 */
import type { User } from '@/features/auth/types';

// ─── Comptes de démo ───────────────────────────────────────────────────────
export const MOCK_USERS: Record<string, User> = {
  'agriculteur@demo.com': {
    id: '1',
    name: 'Jean Paul Koné',
    email: 'agriculteur@demo.com',
    role: 'farmer',
    phone: '+225 07 12 34 56',
    region: 'Abidjan',
    culture: 'Maïs, Tomate',
    avatar: null,
    created_at: '2024-01-15T10:00:00Z',
  },
  'fournisseur@demo.com': {
    id: '2',
    name: 'Agro Services Plus',
    email: 'fournisseur@demo.com',
    role: 'supplier',
    phone: '+225 05 98 76 54',
    region: 'Abidjan',
    company: 'Agro Services Plus SAS',
    category: 'Semences, Engrais',
    avatar: null,
    created_at: '2024-02-10T09:00:00Z',
  },
  'admin@demo.com': {
    id: '3',
    name: 'Admin Système',
    email: 'admin@demo.com',
    role: 'admin',
    phone: '+225 01 23 45 67',
    region: 'Abidjan',
    avatar: null,
    created_at: '2024-01-01T00:00:00Z',
  },
};

// ─── Diagnostics ─────────────────────────────────────────────────────────────
export const MOCK_DIAGNOSTICS = [
  {
    id: '1', type: 'culture', disease_name: 'Rouille du maïs', scientific_name: 'Puccinia sorghi',
    confidence: 92, risk_level: 'Élevé',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Puccinia_sorghi_on_maize.jpg/640px-Puccinia_sorghi_on_maize.jpg',
    created_at: '2024-05-18T10:30:00Z',
    causes: [{ label: 'Champignon Puccinia sorghi' }, { label: 'Conditions humides et chaudes' }, { label: 'Mauvaise circulation d\'air' }],
    recommendations: [{ label: 'Éliminer les feuilles infectées' }, { label: 'Appliquer un fongicide' }, { label: 'Assurer bonne ventilation' }],
    treatment: 'Fongicide à base de triazoles ou strobilurines. Appliquer dès les premiers symptômes.',
  },
  {
    id: '2', type: 'animal', disease_name: 'Dermatite bovine', scientific_name: 'Dermatophilosis',
    confidence: 85, risk_level: 'Moyen',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Cow_female_black_white.jpg/640px-Cow_female_black_white.jpg',
    created_at: '2024-05-15T09:00:00Z',
    causes: [{ label: 'Bactérie Dermatophilus congolensis' }, { label: 'Humidité excessive' }, { label: 'Blessures cutanées' }],
    recommendations: [{ label: 'Isoler l\'animal' }, { label: 'Traitement antibiotique' }, { label: 'Améliorer conditions d\'hygiène' }],
    treatment: 'Pénicilline ou tétracycline en injection intramusculaire pendant 5 jours.',
  },
  {
    id: '3', type: 'culture', disease_name: 'Mildiou de la tomate', scientific_name: 'Phytophthora infestans',
    confidence: 88, risk_level: 'Faible',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Phytophthora_infestans_on_tomato_leaf.jpg/640px-Phytophthora_infestans_on_tomato_leaf.jpg',
    created_at: '2024-05-12T14:00:00Z',
    causes: [{ label: 'Champignon Phytophthora' }, { label: 'Températures fraîches' }, { label: 'Excès d\'humidité foliaire' }],
    recommendations: [{ label: 'Retirer les feuilles atteintes' }, { label: 'Fongicide cuivrique' }, { label: 'Éviter arrosage foliaire' }],
    treatment: 'Bouillie bordelaise ou fongicides à base de mandipropamide.',
  },
  {
    id: '4', type: 'culture', disease_name: 'Anthracnose du cacao', scientific_name: 'Colletotrichum gloeosporioides',
    confidence: 79, risk_level: 'Élevé',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Cacao_theobroma.jpg/640px-Cacao_theobroma.jpg',
    created_at: '2024-05-10T11:00:00Z',
    causes: [{ label: 'Champignon Colletotrichum' }, { label: 'Fortes pluies' }, { label: 'Densité excessive' }],
    recommendations: [{ label: 'Tailler les branches atteintes' }, { label: 'Fongicide systémique' }],
    treatment: 'Application de carbendazime ou thiophanate-méthyle.',
  },
  {
    id: '5', type: 'animal', disease_name: 'Fièvre de la volaille', scientific_name: 'Newcastle Disease',
    confidence: 94, risk_level: 'Critique',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Chickens_and_leaves.jpg/640px-Chickens_and_leaves.jpg',
    created_at: '2024-05-08T08:00:00Z',
    causes: [{ label: 'Virus paramyxovirus' }, { label: 'Contact avec oiseaux infectés' }],
    recommendations: [{ label: 'Quarantaine immédiate' }, { label: 'Contacter vétérinaire' }, { label: 'Vaccination préventive' }],
    treatment: 'Pas de traitement curatif. Mesures de biosécurité strictes et vaccination.',
  },
  {
    id: '6', type: 'culture', disease_name: 'Pourriture des racines', scientific_name: 'Fusarium oxysporum',
    confidence: 81, risk_level: 'Moyen',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Manioc.jpg/640px-Manioc.jpg',
    created_at: '2024-05-05T16:00:00Z',
    causes: [{ label: 'Champignon Fusarium' }, { label: 'Sol mal drainé' }],
    recommendations: [{ label: 'Améliorer le drainage' }, { label: 'Rotation des cultures' }],
    treatment: 'Traitement des semences avec fungicide. Éviter les excès d\'irrigation.',
  },
];

// ─── Fournisseurs ─────────────────────────────────────────────────────────────
export const MOCK_SUPPLIERS = [
  { id: '1', name: 'AgriFourniture CI',  category: 'Semences, Engrais',      distance: 2.5, rating: 4.5, reviews_count: 28, address: 'Plateau, Abidjan', lat: 5.3545, lng: -4.0086, phone: '+225 07 12 34 56', verified: true, products_count: 45 },
  { id: '2', name: 'Green Agro',         category: 'Équipements agricoles',   distance: 3.8, rating: 4.2, reviews_count: 15, address: 'Cocody, Abidjan',  lat: 5.3637, lng: -3.9789, phone: '+225 05 98 76 54', verified: true, products_count: 23 },
  { id: '3', name: 'VetCare CI',         category: 'Produits vétérinaires',   distance: 5.2, rating: 4.7, reviews_count: 42, address: 'Marcory, Abidjan', lat: 5.3073, lng: -4.0050, phone: '+225 01 23 45 67', verified: true, products_count: 67 },
  { id: '4', name: 'BioSolutions',       category: 'Bio-pesticides, Engrais', distance: 6.1, rating: 4.3, reviews_count: 19, address: 'Yopougon',         lat: 5.3478, lng: -4.0739, phone: '+225 07 65 43 21', verified: false, products_count: 31 },
  { id: '5', name: 'Semence Plus',       category: 'Semences certifiées',     distance: 7.3, rating: 4.8, reviews_count: 56, address: 'Abobo',            lat: 5.4195, lng: -4.0344, phone: '+225 05 44 55 66', verified: true, products_count: 18 },
  { id: '6', name: 'AquaFarm',          category: 'Irrigation, Équipements', distance: 9.0, rating: 4.1, reviews_count: 12, address: 'Port-Bouët',       lat: 5.2649, lng: -3.9432, phone: '+225 07 77 88 99', verified: false, products_count: 15 },
];

// ─── Produits Fournisseur ─────────────────────────────────────────────────────
export const MOCK_PRODUCTS = [
  { id: '1', name: 'Fungicide Cure',       category: 'Pesticides',  price: 15000, stock: 120, status: 'Disponible', image: null, supplier_id: '2', sku: 'FUNG-001' },
  { id: '2', name: 'Bouille Bordelaise',    category: 'Pesticides',  price: 8500,  stock: 85,  status: 'Disponible', image: null, supplier_id: '2', sku: 'BOUB-002' },
  { id: '3', name: 'Abate Plant',          category: 'Engrais',     price: 22000, stock: 0,   status: 'Rupture',    image: null, supplier_id: '2', sku: 'ABPL-003' },
  { id: '4', name: 'Semence Maïs DK-9108', category: 'Semences',    price: 35000, stock: 200, status: 'Disponible', image: null, supplier_id: '2', sku: 'SEMM-004' },
  { id: '5', name: 'Engrais NPK 15-15-15', category: 'Engrais',     price: 18500, stock: 340, status: 'Disponible', image: null, supplier_id: '2', sku: 'ENGN-005' },
  { id: '6', name: 'Herbicide Total',      category: 'Pesticides',  price: 12000, stock: 55,  status: 'Disponible', image: null, supplier_id: '2', sku: 'HERB-006' },
];

// ─── Demandes Fournisseur ─────────────────────────────────────────────────────
export const MOCK_REQUESTS = [
  { id: '1', farmer_name: 'Kouakou Amed',   product: 'Fungicide Cure',       quantity: 5, date: '2024-05-20T10:00:00Z', status: 'pending',  phone: '+225 07 11 22 33', region: 'Abidjan' },
  { id: '2', farmer_name: 'Traoré Fatima',  product: 'Semence Maïs DK-9108', quantity: 10, date: '2024-05-19T14:00:00Z', status: 'accepted', phone: '+225 05 44 55 66', region: 'Bouaké' },
  { id: '3', farmer_name: 'Bamba Issouf',   product: 'Engrais NPK 15-15-15', quantity: 3, date: '2024-05-18T09:00:00Z', status: 'rejected', phone: '+225 01 99 88 77', region: 'Daloa' },
  { id: '4', farmer_name: 'N\'Guessan Paul', product: 'Bouille Bordelaise',   quantity: 8, date: '2024-05-17T11:00:00Z', status: 'pending',  phone: '+225 07 33 44 55', region: 'Yamoussoukro' },
  { id: '5', farmer_name: 'Diallo Mariam',  product: 'Herbicide Total',       quantity: 2, date: '2024-05-16T16:00:00Z', status: 'accepted', phone: '+225 05 66 77 88', region: 'San-Pédro' },
];

// ─── Conversations ────────────────────────────────────────────────────────────
export const MOCK_CONVERSATIONS = [
  { id: '1', title: 'Maladie du maïs',       last_message: 'Quelles sont les causes des taches…', created_at: '2024-05-18T10:30:00Z', updated_at: '2024-05-18T10:30:00Z' },
  { id: '2', title: 'Traitement naturel',     last_message: 'Comment traiter naturellement…',    created_at: '2024-05-17T09:00:00Z', updated_at: '2024-05-17T09:00:00Z' },
  { id: '3', title: 'Fertilisation du riz',  last_message: 'Meilleure période pour fertiliser…', created_at: '2024-05-12T14:00:00Z', updated_at: '2024-05-12T14:00:00Z' },
  { id: '4', title: 'Irrigation tomate',     last_message: 'Fréquence d\'arrosage optimal…',    created_at: '2024-05-10T08:00:00Z', updated_at: '2024-05-10T08:00:00Z' },
];

export const MOCK_MESSAGES = [
  { id: '1', role: 'user',      content: 'Quelles sont les causes des taches brunes sur les feuilles de maïs ?', created_at: '2024-05-18T10:30:00Z' },
  { id: '2', role: 'assistant', content: 'Les taches brunes sur les feuilles de maïs peuvent être causées par plusieurs facteurs :\n\n1. **Maladies fongiques** (ex: rouille, helminthosporiose)\n2. **Carence en nutriments** (potassium, azote)\n3. **Stress hydrique**\n4. **Exposition excessive au soleil**\n\nPour un diagnostic précis, je vous recommande d\'envoyer une image de la plante via la section Diagnostic IA.', created_at: '2024-05-18T10:31:00Z' },
];

// ─── Utilisateurs Admin ───────────────────────────────────────────────────────
export const MOCK_ADMIN_USERS = [
  { id: '1', name: 'Jean Paul Koné',    email: 'jeanpaul@demo.com',  role: 'farmer',   region: 'Abidjan',       status: 'active',    created_at: '2024-01-15T10:00:00Z', diagnostics: 24 },
  { id: '2', name: 'Kouakou Amed',      email: 'kouakou@demo.com',   role: 'farmer',   region: 'Bouaké',        status: 'active',    created_at: '2024-02-20T09:00:00Z', diagnostics: 12 },
  { id: '3', name: 'Traoré Fatima',     email: 'traore@demo.com',    role: 'farmer',   region: 'Daloa',         status: 'suspended', created_at: '2024-03-05T14:00:00Z', diagnostics: 7  },
  { id: '4', name: 'Agro Services Plus',email: 'agro@demo.com',      role: 'supplier', region: 'Abidjan',       status: 'active',    created_at: '2024-01-20T11:00:00Z', diagnostics: 0  },
  { id: '5', name: 'VetCare CI',        email: 'vetcare@demo.com',   role: 'supplier', region: 'Abidjan',       status: 'active',    created_at: '2024-02-15T08:00:00Z', diagnostics: 0  },
  { id: '6', name: 'Bamba Issouf',      email: 'bamba@demo.com',     role: 'farmer',   region: 'Yamoussoukro',  status: 'active',    created_at: '2024-03-12T16:00:00Z', diagnostics: 18 },
  { id: '7', name: 'N\'Guessan Paul',   email: 'nguessan@demo.com',  role: 'farmer',   region: 'San-Pédro',     status: 'active',    created_at: '2024-04-01T10:00:00Z', diagnostics: 5  },
  { id: '8', name: 'BioSolutions',      email: 'bio@demo.com',       role: 'supplier', region: 'Yopougon',      status: 'pending',   created_at: '2024-05-01T09:00:00Z', diagnostics: 0  },
];

// ─── Logs système ─────────────────────────────────────────────────────────────
export const MOCK_LOGS = [
  { id: '1', action: 'Connexion réussie',         user: 'Jean Paul Koné',    type: 'auth',       severity: 'info',    created_at: '2024-05-20T10:05:00Z' },
  { id: '2', action: 'Diagnostic soumis',          user: 'Kouakou Amed',      type: 'diagnostic', severity: 'info',    created_at: '2024-05-20T09:55:00Z' },
  { id: '3', action: 'Compte suspendu',            user: 'Traoré Fatima',     type: 'admin',      severity: 'warning', created_at: '2024-05-19T16:30:00Z' },
  { id: '4', action: 'Tentative de connexion',     user: 'Inconnu',           type: 'auth',       severity: 'danger',  created_at: '2024-05-19T14:00:00Z' },
  { id: '5', action: 'Nouveau fournisseur inscrit',user: 'BioSolutions',      type: 'register',   severity: 'info',    created_at: '2024-05-19T11:00:00Z' },
  { id: '6', action: 'Produit ajouté',             user: 'Agro Services Plus',type: 'product',    severity: 'info',    created_at: '2024-05-19T10:00:00Z' },
  { id: '7', action: 'Message IA envoyé',          user: 'Jean Paul Koné',    type: 'assistant',  severity: 'info',    created_at: '2024-05-18T10:32:00Z' },
  { id: '8', action: 'Rapport PDF téléchargé',     user: 'Bamba Issouf',      type: 'diagnostic', severity: 'info',    created_at: '2024-05-18T08:00:00Z' },
];

// ─── Statistiques Dashboard ───────────────────────────────────────────────────
export const MOCK_MONTHLY_STATS = [
  { month: 'Jan', diagnostics: 45, ai_messages: 120, new_users: 23 },
  { month: 'Fév', diagnostics: 62, ai_messages: 145, new_users: 31 },
  { month: 'Mar', diagnostics: 78, ai_messages: 190, new_users: 42 },
  { month: 'Avr', diagnostics: 91, ai_messages: 210, new_users: 38 },
  { month: 'Mai', diagnostics: 115, ai_messages: 280, new_users: 55 },
  { month: 'Jun', diagnostics: 98, ai_messages: 240, new_users: 47 },
];

export const MOCK_SUPPLIER_REVENUE = [
  { month: 'Jan', revenue: 285000, orders: 18 },
  { month: 'Fév', revenue: 320000, orders: 22 },
  { month: 'Mar', revenue: 410000, orders: 28 },
  { month: 'Avr', revenue: 375000, orders: 25 },
  { month: 'Mai', revenue: 490000, orders: 32 },
  { month: 'Jun', revenue: 445000, orders: 30 },
];

export const MOCK_DIAGNOSTIC_TYPES = [
  { name: 'Culture', value: 68, color: '#22c55e' },
  { name: 'Animal',  value: 32, color: '#f59e0b' },
];

export const MOCK_RISK_DISTRIBUTION = [
  { name: 'Faible',   value: 35, color: '#22c55e' },
  { name: 'Moyen',    value: 40, color: '#f59e0b' },
  { name: 'Élevé',    value: 20, color: '#ef4444' },
  { name: 'Critique', value: 5,  color: '#991b1b' },
];
