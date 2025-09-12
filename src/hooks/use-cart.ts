
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
  initializeCart: (user: User | null) => Promise<void>;
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

let firestoreUnsubscribe: (() => void) | null = null;

const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isInitialized: false,
  userId: null,

  initializeCart: async (user) => {
    const currentUserId = get().userId;
    const isAlreadyInitializedForUser = get().isInitialized && currentUserId === user?.uid;

    if (isAlreadyInitializedForUser) {
        return;
    }

    if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = null;
    }
    
    if (user) {
        set({ userId: user.uid, isInitialized: false });
        
        const localCart = getLocalCart();
        
        if (localCart.length > 0) {
            await mergeLocalCart(user.uid, localCart);
            setLocalCart([]); // Clear local cart immediately after merging
        }
        
        firestoreUnsubscribe = getCart(user.uid, (items) => {
            set({ items, isInitialized: true });
        });
    } else {
        set({ userId: null, items: getLocalCart(), isInitialized: true });
    }
  },

  addItem: (product) => {
    const { userId } = get();
    toast({
        title: "Added to cart",
        description: `${product.name} has been added.`,
    });

    if (userId) {
      // For logged-in users, Firestore is the source of truth.
      // The local state will be updated by the onSnapshot listener.
      addToCart(userId, product).catch(error => {
        console.error("Failed to add item to cart:", error);
        toast({ title: "Update Failed", description: "Could not add item to cart.", variant: 'destructive'});
      });
    } else {
        // For guests, manage the cart in local state and localStorage.
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

  removeItem: async (productId) => {
    const { userId } = get();
    toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
    });

    if (userId) {
        await removeCartItem(userId, productId).catch(error => {
            console.error("Failed to remove item:", error);
            toast({ title: "Update Failed", description: "Could not remove item from cart.", variant: 'destructive'});
        });
    } else {
        const { items } = get();
        const newItems = items.filter((item) => item.product.id !== productId);
        set({ items: newItems });
        setLocalCart(newItems);
    }
  },

  updateQuantity: async (productId, quantity) => {
    const { userId } = get();
    
    if (userId) {
        await updateCartItemQuantity(userId, productId, quantity).catch(error => {
             console.error("Failed to update quantity:", error);
             toast({ title: "Update Failed", description: "Could not update item quantity.", variant: 'destructive'});
        });
    } else {
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

// This listener will handle auth changes and initialize the cart accordingly.
onAuthStateChanged(auth, (user) => {
    useCartStore.getState().initializeCart(user);
});

const useCart = () => {
  const store = useCartStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // This effect ensures we attempt initialization on mount if it hasn't happened.
    // The onAuthStateChanged listener above is the primary mechanism.
    if (!store.isInitialized) {
        useCartStore.getState().initializeCart(auth.currentUser);
    }
  }, []); // Intentionally empty to run once on mount

  // While not initialized on the client, return a safe empty state
  if (!isClient || !store.isInitialized) {
    return {
        ...store,
        items: [],
        isInitialized: false,
    };
  }
  
  return store;
}

export default useCart;
