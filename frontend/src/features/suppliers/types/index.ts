export type SupplierCategory = 'Tous' | 'Semences' | 'Engrais' | 'Équipements' | 'Produits vétérinaires';

export interface Supplier {
  id: string;
  name: string;
  category: string;
  distance: number;         // km
  rating: number;           // sur 5
  reviews_count: number;
  address: string;
  phone?: string;
  lat: number;
  lng: number;
}
