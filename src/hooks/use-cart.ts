
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Product } from '@/lib/data';
import { toast } from '@/hooks/use-toast';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const useCart = create(
  persist<CartStore>((set, get) => ({
    items: [],
    addItem: (product) => {
      const currentItems = get().items;
      const existingItem = currentItems.find((item) => item.product.id === product.id);

      if (existingItem) {
        set({
          items: currentItems.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        });
        toast({
            title: "Added to cart",
            description: `${product.name} quantity updated.`,
        });
      } else {
        set({ items: [...currentItems, { product, quantity: 1 }] });
        toast({
            title: "Added to cart",
            description: `${product.name} has been added to your cart.`,
        });
      }
    },
    removeItem: (productId) => {
      set({ items: [...get().items.filter((item) => item.product.id !== productId)] });
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
      });
    },
    updateQuantity: (productId, quantity) => {
      if (quantity === 0) {
        get().removeItem(productId);
      } else {
        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });
      }
    },
    clearCart: () => set({ items: [] }),
  }), {
    name: 'cart-storage',
    storage: createJSONStorage(() => localStorage),
  })
);

export default useCart;
