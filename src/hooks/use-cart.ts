

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
    try {
        const localData = localStorage.getItem('local-cart');
        return localData ? JSON.parse(localData) : [];
    } catch (e) {
        return [];
    }
}

const setLocalCart = (items: CartItem[]) => {
    localStorage.setItem('local-cart', JSON.stringify(items));
}

let firestoreUnsubscribe: (() => void) | null = null;

const useCart = create<CartStore>((set, get) => ({
  items: [],
  isInitialized: false,
  userId: null,

  initializeCart: (user) => {
    if (get().isInitialized) return;

    if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = null;
    }
    
    if (user) {
        set({ userId: user.uid });
        const localCart = getLocalCart();
        
        if (localCart.length > 0) {
            mergeLocalCart(user.uid, localCart).then(() => {
                localStorage.removeItem('local-cart');
            });
        }
        
        firestoreUnsubscribe = getCart(user.uid, (items) => {
            set({ items, isInitialized: true });
        });
    } else {
        set({ userId: null, items: getLocalCart(), isInitialized: true });
    }
  },

  addItem: async (product) => {
    const { userId, items } = get();
    toast({
        title: "Added to cart",
        description: `${product.name} has been added.`,
    });
    if (userId) {
        await addToCart(userId, product);
    } else {
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
        if (quantity === 0) {
            const newItems = items.filter((item) => item.product.id !== productId);
            set({ items: newItems });
            setLocalCart(newItems);
        } else {
            const newItems = items.map((item) =>
                item.product.id === productId ? { ...item, quantity } : item
            );
            set({ items: newItems });
            setLocalCart(newItems);
        }
    }
  },

  clearCart: async () => {
    const { userId } = get();
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
