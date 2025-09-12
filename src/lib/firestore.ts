

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, where, writeBatch, orderBy, getDoc, setDoc, onSnapshot, runTransaction } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Product, Category, Offer, Order, OrderStatus, Address, CartItem } from './data';
import { firebaseConfig } from './firebase';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const storage = getStorage(app);

function generateOrderId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  let charPart = '';
  for (let i = 0; i < 5; i++) {
    charPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  let numPart = '';
  for (let i = 0; i < 3; i++) {
    numPart += nums.charAt(Math.floor(Math.random() * nums.length));
  }
  return `${charPart}${numPart}`;
}

// --- Category Functions ---

export async function getCategories(): Promise<Category[]> {
  const categoriesCol = collection(db, 'categories');
  const categorySnapshot = await getDocs(categoriesCol);
  return categorySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category));
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<string> {
  const categoriesCol = collection(db, 'categories');
  const docRef = await addDoc(categoriesCol, category);
  return docRef.id;
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<void> {
  const categoryDoc = doc(db, 'categories', id);
  await updateDoc(categoryDoc, category);
}

export async function deleteCategory(id: string): Promise<void> {
  const categoryDoc = doc(db, 'categories', id);
  await deleteDoc(categoryDoc);
}


// --- Product Functions ---
export async function getProduct(id: string): Promise<Product | undefined> {
    const productDoc = await getDoc(doc(db, 'products', id));
    if (productDoc.exists()) {
        return { ...productDoc.data(), id: productDoc.id } as Product;
    }
    return undefined;
}


export async function getProducts(categorySlug?: string): Promise<Product[]> {
  let productsQuery = query(collection(db, 'products'));
  if (categorySlug) {
    productsQuery = query(collection(db, 'products'), where('categorySlug', '==', categorySlug));
  }
  const productSnapshot = await getDocs(productsQuery);
  return productSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
}

export async function getSpecialOfferProducts(): Promise<Product[]> {
    const productsQuery = query(collection(db, 'products'), where('offer.value', '>', 0));
    const productSnapshot = await getDocs(productsQuery);
    return productSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<string> {
  const productsCol = collection(db, 'products');
  const docRef = await addDoc(productsCol, product);
  return docRef.id;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<void> {
  const productDoc = doc(db, 'products', id);
  await updateDoc(productDoc, product);
}

export async function updateProductOffer(id: string, offer: Offer | null): Promise<void> {
  const productDoc = doc(db, 'products', id);
  await updateDoc(productDoc, { offer });
}

export async function updateMultipleProductOffers(productIds: string[], offer: Offer | null): Promise<void> {
    const batch = writeBatch(db);
    productIds.forEach(id => {
        const productRef = doc(db, 'products', id);
        batch.update(productRef, { offer });
    });
    await batch.commit();
}


export async function deleteProduct(id: string): Promise<void> {
  const productDoc = doc(db, 'products', id);
  await deleteDoc(productDoc);
}


// --- Order Functions (Authenticated) ---

export async function addOrder(order: Omit<Order, 'id'>): Promise<string> {
    const newOrderId = generateOrderId();
    const newOrderRef = doc(db, "orders", newOrderId);
    const newOrder = { ...order, id: newOrderId };
    await setDoc(newOrderRef, newOrder);
    return newOrderRef.id;
}

export async function getOrders(userId?: string): Promise<Order[]> {
    let ordersQuery;
    if (userId) {
        ordersQuery = query(collection(db, 'orders'), where('userId', '==', userId));
    } else {
        ordersQuery = query(collection(db, 'orders'), orderBy('date', 'desc'));
    }
    
    const orderSnapshot = await getDocs(ordersQuery);
    const allOrders = orderSnapshot.docs.map(doc => ({ ...doc.data() as Order, id: doc.id }));
    
    if (userId) {
        allOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    return allOrders;
}

export async function updateOrderStatus(orderId: string, status: Order['status'], trackingHistory: Order['trackingHistory']): Promise<void> {
    const orderDoc = doc(db, 'orders', orderId);
    await updateDoc(orderDoc, { status, trackingHistory });
}

export async function submitReturnRequest(orderId: string, request: Order['returnRequest']): Promise<void> {
  const orderDoc = doc(db, 'orders', orderId);
  const newStatus: OrderStatus = 'Return Requested';
  
  const orderSnap = await getDoc(orderDoc);
  if (!orderSnap.exists()) {
      throw new Error("Order not found");
  }
  const currentHistory = orderSnap.data().trackingHistory || [];

  const newTrackingHistoryEntry = { status: newStatus, date: new Date().toISOString() };
  await updateDoc(orderDoc, {
    status: newStatus,
    returnRequest: request,
    trackingHistory: [...currentHistory, newTrackingHistoryEntry]
  });
}

// --- Address Functions (Authenticated) ---

export async function getAddresses(userId: string): Promise<Address[]> {
    const addressesCol = collection(db, 'users', userId, 'addresses');
    const addressSnapshot = await getDocs(addressesCol);
    return addressSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Address));
}

export async function addAddress(userId: string, address: Omit<Address, 'id'>): Promise<string> {
    const addressesCol = collection(db, 'users', userId, 'addresses');
    const docRef = await addDoc(addressesCol, address);
    
    if (address.isDefault) {
        const batch = writeBatch(db);
        const q = query(addressesCol, where('__name__', '!=', docRef.id));
        const snapshot = await getDocs(q);
        snapshot.forEach(d => {
            batch.update(d.ref, { isDefault: false });
        });
        await batch.commit();
    }
    return docRef.id;
}

export async function updateAddress(userId: string, addressId: string, address: Partial<Omit<Address, 'id'>>): Promise<void> {
    const addressDoc = doc(db, 'users', userId, 'addresses', addressId);
    await updateDoc(addressDoc, address);

    if (address.isDefault) {
        const addressesCol = collection(db, 'users', userId, 'addresses');
        const batch = writeBatch(db);
        const q = query(addressesCol, where('__name__', '!=', addressId));
        const snapshot = await getDocs(q);
        snapshot.forEach(d => {
            batch.update(d.ref, { isDefault: false });
        });
        await batch.commit();
    }
}

export async function deleteAddress(userId: string, addressId: string): Promise<void> {
    const addressDoc = doc(db, 'users', userId, 'addresses', addressId);
    await deleteDoc(addressDoc);
}


// --- Appearance Settings ---
const APPEARANCE_DOC_ID = 'homepage';

export async function getAppearanceSettings(): Promise<AppearanceSettings | null> {
    const docRef = doc(db, 'appearance', APPEARANCE_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as AppearanceSettings;
    }
    return null;
}

export async function saveAppearanceSettings(settings: Partial<AppearanceSettings>): Promise<void> {
    const docRef = doc(db, 'appearance', APPEARANCE_DOC_ID);
    await setDoc(docRef, settings, { merge: true });
}


// --- Image Upload ---

export async function uploadImage(file: File, path: string): Promise<{ url: string }> {
  const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return { url: downloadURL }; 
}

// --- Cart Functions ---

export function getCart(userId: string, onUpdate: (items: CartItem[]) => void): () => void {
    const cartRef = doc(db, 'carts', userId);
    return onSnapshot(cartRef, (doc) => {
        const data = doc.data();
        onUpdate(data?.items || []);
    }, (error) => {
        console.error("Cart snapshot error: ", error);
    });
}

export async function addToCart(userId: string, product: Product) {
    const cartRef = doc(db, 'carts', userId);
    await runTransaction(db, async (transaction) => {
        const cartDoc = await transaction.get(cartRef);
        if (!cartDoc.exists()) {
            transaction.set(cartRef, { items: [{ product, quantity: 1 }] });
            return;
        }
        const items = cartDoc.data().items as CartItem[];
        const existingItemIndex = items.findIndex((item) => item.product.id === product.id);
        if (existingItemIndex > -1) {
            items[existingItemIndex].quantity += 1;
        } else {
            items.push({ product, quantity: 1 });
        }
        transaction.update(cartRef, { items });
    });
}

export async function updateCartItemQuantity(userId: string, productId: string, quantity: number) {
    const cartRef = doc(db, 'carts', userId);
    if (quantity <= 0) {
        await removeCartItem(userId, productId);
        return;
    }
    await runTransaction(db, async (transaction) => {
        const cartDoc = await transaction.get(cartRef);
        if (!cartDoc.exists()) return;
        
        const items = cartDoc.data().items as CartItem[];
        const itemIndex = items.findIndex((item) => item.product.id === productId);

        if (itemIndex > -1) {
            items[itemIndex].quantity = quantity;
            transaction.update(cartRef, { items });
        }
    });
}

export async function removeCartItem(userId: string, productId: string) {
    const cartRef = doc(db, 'carts', userId);
    await runTransaction(db, async (transaction) => {
        const cartDoc = await transaction.get(cartRef);
        if (!cartDoc.exists()) return;
        
        const items = cartDoc.data().items as CartItem[];
        const updatedItems = items.filter((item) => item.product.id !== productId);
        transaction.update(cartRef, { items: updatedItems });
    });
}

export async function clearCart(userId: string) {
    const cartRef = doc(db, 'carts', userId);
    await setDoc(cartRef, { items: [] });
}

export async function mergeLocalCart(userId: string, localItems: CartItem[]) {
    if (!localItems || localItems.length === 0) return;
    const cartRef = doc(db, 'carts', userId);

    await runTransaction(db, async (transaction) => {
        const cartDoc = await transaction.get(cartRef);
        let serverItems: CartItem[] = [];

        if (cartDoc.exists()) {
            serverItems = cartDoc.data().items as CartItem[];
        }

        localItems.forEach(localItem => {
            const serverItemIndex = serverItems.findIndex(serverItem => serverItem.product.id === localItem.product.id);
            if (serverItemIndex > -1) {
                serverItems[serverItemIndex].quantity += localItem.quantity;
            } else {
                serverItems.push(localItem);
            }
        });

        transaction.set(cartRef, { items: serverItems });
    });
}
