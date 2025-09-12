

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

const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isInitialized: false,
  userId: null,

  initializeCart: async (user) => {
    // Prevent re-initialization for the same user
    if (get().isInitialized && get().userId === user?.uid) return;

    // Disconnect from previous listener if it exists
    if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = null;
    }
    
    if (user) {
        // User is logged in
        set({ userId: user.uid, isInitialized: false });
        const localCart = getLocalCart();
        
        // If there's a local cart, merge it with the server cart
        if (localCart.length > 0) {
            await mergeLocalCart(user.uid, localCart);
            // Clear the local cart after merging
            localStorage.removeItem('local-cart');
        }
        
        // Listen for real-time updates from Firestore
        firestoreUnsubscribe = getCart(user.uid, (items) => {
            set({ items, isInitialized: true });
        });
    } else {
        // User is logged out
        // Load cart from local storage and mark as initialized
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
        console.error("Failed to add item to cart:", error);
        toast({ title: "Update Failed", description: "Could not add item to cart.", variant: 'destructive'});
        // The onSnapshot listener will eventually correct the state
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
    const newItems = items.filter((item) => item.product.id !== productId);
    set({ items: newItems }); // Optimistic update

    if (userId) {
        await removeCartItem(userId, productId).catch(error => {
            console.error("Failed to remove item:", error);
            set({items}); // Revert on error
        });
    } else {
        setLocalCart(newItems);
    }
  },

  updateQuantity: async (productId, quantity) => {
    const { userId, items } = get();
    
    let newItems;
    if (quantity <= 0) {
        newItems = items.filter((item) => item.product.id !== productId);
    } else {
        newItems = items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
        );
    }
    set({ items: newItems }); // Optimistic update

    if (userId) {
        await updateCartItemQuantity(userId, productId, quantity).catch(error => {
             console.error("Failed to update quantity:", error);
             set({items}); // Revert on error
        });
    } else {
        setLocalCart(newItems);
    }
  },

  clearCart: async () => {
    const { userId } = get();
    toast({
        title: 'Cart Cleared',
        description: 'Your shopping cart has been emptied.',
    });
    set({ items: [] }); // Optimistic update

    if (userId) {
        await clearFirestoreCart(userId);
    } else {
        setLocalCart([]);
    }
  },
}));


onAuthStateChanged(auth, (user) => {
    // This ensures the cart is initialized or updated on auth state changes
    useCartStore.getState().initializeCart(user);
});

// A wrapper hook to safely use the store on the client side
const useCart = () => {
    const store = useCartStore();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient ? store : {
        ...store,
        items: [],
        isInitialized: false,
    };
}

export default useCart;
