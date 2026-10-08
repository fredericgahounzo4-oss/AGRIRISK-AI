export interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'Disponible' | 'Rupture' | 'Bientôt disponible';
  image: string | null;
  supplier_id: string;
  sku: string;
  supplier_name: string;
  supplier_region: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
  supplier_id: string;
  supplier_name: string;
}

export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
export type DeliveryMethod = 'pickup' | 'delivery';

export interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: string;
  reference: string;
  status: OrderStatus;
  buyer_name: string;
  supplier_id: string;
  supplier_name: string;
  subtotal: number;
  commission_amount: number;
  supplier_amount: number;
  delivery_method: DeliveryMethod;
  delivery_address: string;
  phone: string;
  note: string;
  payout_status: 'none' | 'available' | 'paid';
  refund_status: 'none' | 'needed' | 'done';
  payment_status: 'pending' | 'approved' | 'declined' | 'canceled' | 'expired' | null;
  created_at: string;
  paid_at: string | null;
  delivered_at: string | null;
  items: OrderItem[];
}

export interface CheckoutPayload {
  items: { product_id: string; quantity: number }[];
  delivery_method: DeliveryMethod;
  delivery_address?: string;
  phone?: string;
  note?: string;
}

export interface CheckoutResult {
  order: Order;
  payment_url: string;
}

export interface PayoutAccount {
  operator: 'tmoney' | 'flooz' | 'mtn' | 'moov' | 'orange' | 'wave' | 'other';
  phone: string;
  account_name: string;
}

export interface Earnings {
  commission_percent: number;
  pending_amount: number;
  available_amount: number;
  paid_out_amount: number;
  total_sales: number;
  total_commission: number;
  orders_count: number;
  payout_account: PayoutAccount | null;
}
