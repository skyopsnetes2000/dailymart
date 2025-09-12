

'use client';

import { create } from 'zustand';
import type { CartItem, Product } from '@/lib/data';
import { toast } from '@/hooks/use-toast';
import { getCart, addToCart, removeCartItem, updateCartItemQuantity, clearCart as clearFirestoreCart, mergeLocalCart } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface CartStore {
  items: CartItem[];
  isInitialized: boolean;
  userId: string | null;
  initializeCart: (user: User | null) => void;
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
        return [];
    }
}

const setLocalCart = (items: CartItem[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('local-cart', JSON.stringify(items));
}

let firestoreUnsubscribe: (() => void) | null = null;

const useCart = create<CartStore>((set, get) => ({
  items: [],
  isInitialized: false,
  userId: null,

  initializeCart: async (user) => {
    if (get().isInitialized && get().userId === user?.uid) return;

    if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = null;
    }
    
    if (user) {
        set({ userId: user.uid, isInitialized: false });
        const localCart = getLocalCart();
        
        if (localCart.length > 0) {
            await mergeLocalCart(user.uid, localCart);
            localStorage.removeItem('local-cart');
        }
        
        firestoreUnsubscribe = getCart(user.uid, (items) => {
            set({ items, isInitialized: true });
        });
    } else {
        set({ userId: null, items: getLocalCart(), isInitialized: true });
    }
  },

  addItem: (product) => {
    const { userId, items } = get();
    toast({
        title: "Added to cart",
        description: `${product.name} has been added.`,
    });

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

    if (userId) {
      // Optimistic update for logged-in users
      set({ items: newItems }); 
      addToCart(userId, product).catch(error => {
        // On error, revert to the state from Firestore by forcing a re-fetch/re-sync
        console.error("Failed to add item to cart:", error);
        toast({ title: "Update Failed", description: "Could not add item to cart.", variant: 'destructive'});
        // The onSnapshot listener will eventually correct the state, or we could force it here.
      });
    } else {
        // Update local state and localStorage for logged-out users
        set({ items: newItems });
        setLocalCart(newItems);
    }
  },

  removeItem: async (productId) => {
    const { userId, items } = get();
    toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
    });
    if (userId) {
        await removeCartItem(userId, productId);
    } else {
        const newItems = items.filter((item) => item.product.id !== productId);
        set({ items: newItems });
        setLocalCart(newItems);
    }
  },

  updateQuantity: async (productId, quantity) => {
    const { userId, items } = get();
    if (userId) {
        await updateCartItemQuantity(userId, productId, quantity);
    } else {
        let newItems;
        if (quantity <= 0) {
            newItems = items.filter((item) => item.product.id !== productId);
        } else {
            newItems = items.map((item) =>
                item.product.id === productId ? { ...item, quantity } : item
            );
        }
        set({ items: newItems });
        setLocalCart(newItems);
    }
  },

  clearCart: async () => {
    const { userId } = get();
    toast({
        title: 'Cart Cleared',
        description: 'Your shopping cart has been emptied.',
    });
    if (userId) {
        await clearFirestoreCart(userId);
    } else {
        set({ items: [] });
        setLocalCart([]);
    }
  },
}));


onAuthStateChanged(auth, (user) => {
    useCart.getState().initializeCart(user);
});

export default useCart;
