export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'Disponible' | 'Rupture' | 'Bientôt disponible';
  image: string | null;
  supplier_id: string;
  sku: string;
}

export interface ProductRequest {
  id: string;
  farmer_name: string;
  product: string;
  quantity: number;
  date: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  phone?: string;
  region?: string;
}
