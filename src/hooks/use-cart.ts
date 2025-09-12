
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
    const { isInitialized, userId: currentUserId } = get();

    if (isInitialized && currentUserId === user?.uid) {
        // Already initialized for the same user state, do nothing.
        return;
    }
    
    // Disconnect any existing listener
    if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = null;
    }
    
    set({ isInitialized: false });

    if (user) {
        // --- User is logged in ---
        set({ userId: user.uid });
        
        // Merge local cart into Firestore cart
        const localCart = getLocalCart();
        if (localCart.length > 0) {
            await mergeLocalCart(user.uid, localCart);
            setLocalCart([]); // Clear local cart after merging
        }
        
        // Listen for real-time cart updates from Firestore
        firestoreUnsubscribe = getCart(user.uid, (items) => {
            set({ items, isInitialized: true });
        });

    } else {
        // --- User is a guest ---
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

// This listener will handle auth changes and initialize the cart accordingly.
onAuthStateChanged(auth, (user) => {
    useCartStore.getState().initializeCart(user);
});

// The public hook that components will use.
const useCart = () => {
  const store = useCartStore();
  
  // This state helps prevent hydration errors by ensuring that
  // the component only renders the cart state on the client.
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // On the server, or before the client has mounted and initialized,
  // return a safe, empty, uninitialized state.
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
