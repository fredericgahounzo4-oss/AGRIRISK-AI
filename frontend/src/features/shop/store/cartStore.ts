import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CatalogProduct } from '../types';

interface CartState {
  items: CartItem[];
  add: (product: CatalogProduct, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clearSupplier: (supplierId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      add: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.product_id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product_id === product.id
                  ? { ...i, stock: product.stock, price: product.price,
                      quantity: Math.min(i.quantity + quantity, product.stock) }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                product_id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: Math.min(quantity, product.stock),
                stock: product.stock,
                supplier_id: product.supplier_id,
                supplier_name: product.supplier_name,
              },
            ],
          };
        }),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.product_id === productId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
              : i
          ),
        })),

      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.product_id !== productId) })),

      clearSupplier: (supplierId) =>
        set((state) => ({ items: state.items.filter((i) => i.supplier_id !== supplierId) })),

      clear: () => set({ items: [] }),
    }),
    { name: 'agririsk_cart' }
  )
);

export const selectCartCount = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);
