
'use client';

import { create } from 'zustand';
import { useState, useEffect } from 'react';
import type { CartItem, Product } from '@/lib/data';
import { toast } from '@/hooks/use-toast';
import { getCart, addToCart, removeCartItem, updateCartItemQuantity, clearCart as clearFirestoreCart, mergeLocalCart } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface CartStore {
  items: CartItem[];
  isInitialized: boolean;
  userId: string | null;
  setUserId: (userId: string | null) => void;
  setItems: (items: CartItem[]) => void;
  setInitialized: (isInitialized: boolean) => void;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const getLocalCart = (): CartItem[] => {
    if (typeof window === 'undefined') return [];
    try {
        const localData = localStorage.getItem('local-cart');
        return localData ? JSON.parse(localData) : [];
    } catch (e) {
        console.error("Failed to parse local cart:", e);
        return [];
    }
}

const setLocalCart = (items: CartItem[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('local-cart', JSON.stringify(items));
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isInitialized: false,
  userId: null,
  setUserId: (userId) => set({ userId }),
  setItems: (items) => set({ items }),
  setInitialized: (isInitialized) => set({ isInitialized }),

  addItem: (product) => {
    const { userId } = get();
    toast({
        title: "Added to cart",
        description: `${product.name} has been added.`,
    });

    if (userId) {
      // Logged-in user: Defer to Firestore. The local state will be updated by the onSnapshot listener.
      addToCart(userId, product).catch(error => {
        console.error("Failed to add item to cart:", error);
        toast({ title: "Update Failed", description: "Could not add item to cart.", variant: 'destructive'});
      });
    } else {
        // Guest user: Manage the cart in local state and localStorage.
        const { items } = get();
        const existingItem = items.find((item) => item.product.id === product.id);
        let newItems;
        if (existingItem) {
            newItems = items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
            );
        } else {
            newItems = [...items, { product, quantity: 1 }];
        }
        set({ items: newItems });
        setLocalCart(newItems);
    }
  },

  removeItem: (productId) => {
    const { userId } = get();
    toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
    });

    if (userId) {
        // Logged-in user: Defer to Firestore.
        removeCartItem(userId, productId).catch(error => {
            console.error("Failed to remove item:", error);
            toast({ title: "Update Failed", description: "Could not remove item from cart.", variant: 'destructive'});
        });
    } else {
        // Guest user:
        const { items } = get();
        const newItems = items.filter((item) => item.product.id !== productId);
        set({ items: newItems });
        setLocalCart(newItems);
    }
  },

  updateQuantity: (productId, quantity) => {
    const { userId } = get();
    
    if (userId) {
        // Logged-in user: Defer to Firestore.
        updateCartItemQuantity(userId, productId, quantity).catch(error => {
             console.error("Failed to update quantity:", error);
             toast({ title: "Update Failed", description: "Could not update item quantity.", variant: 'destructive'});
        });
    } else {
        // Guest user:
        const { items } = get();
        let newItems;
        if (quantity <= 0) {
            newItems = items.filter((item) => item.product.id !== productId);
             toast({
                title: "Item removed",
                description: "The item has been removed from your cart.",
            });
        } else {
            newItems = items.map((item) =>
                item.product.id === productId ? { ...item, quantity } : item
            );
        }
        set({ items: newItems });
        setLocalCart(newItems);
    }
  },

  clearCart: () => {
    const { userId } = get();
    toast({
        title: 'Cart Cleared',
        description: 'Your shopping cart has been emptied.',
    });
    
    if (userId) {
        // Logged-in user:
        clearFirestoreCart(userId);
    } else {
        // Guest user:
        set({ items: [] });
        setLocalCart([]);
    }
  },
}));

// This is the hook that components will use.
const useCart = () => {
  const store = useCartStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User logged in
        store.setUserId(user.uid);
        const localCart = getLocalCart();
        if (localCart.length > 0) {
          await mergeLocalCart(user.uid, localCart);
          setLocalCart([]);
        }
        const unsubFirestore = getCart(user.uid, (items) => {
          store.setItems(items);
          store.setInitialized(true);
        });
        return () => unsubFirestore();
      } else {
        // User logged out
        store.setUserId(null);
        store.setItems(getLocalCart());
        store.setInitialized(true);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!isClient || !store.isInitialized) {
    return {
      items: [],
      isInitialized: false,
      addItem: store.addItem,
      removeItem: store.removeItem,
      updateQuantity: store.updateQuantity,
      clearCart: store.clearCart,
    };
  }

  return store;
};

export default useCart;
