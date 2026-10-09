export type SupplierCategory = string;

export interface Supplier {
  id: string;
  name: string;
  category: string;
  description: string;
  distance: number;          // km (0 si has_distance est faux)
  has_distance: boolean;     // false tant qu'aucune position n'est connue
  rating: number;            // sur 5 (0 = pas encore d'avis)
  reviews_count: number;
  address: string;
  region: string;
  phone?: string | null;
  lat: number;
  lng: number;
  location_precise: boolean; // false = position estimée à partir de la région
  products_count: number;    // produits actuellement en vente
  orders_done: number;       // commandes livrées
  member_since: string;
}

export interface SupplierQuery {
  category?: string;
  lat?: number;
  lng?: number;
}
