

import { db } from './firebase';
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  orderBy,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Product, Category, Offer, Order, products as initialProducts, categories as initialCategories, AppearanceSettings } from './data';
import { PlaceHolderImages } from './placeholder-images';

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

export async function deleteProduct(id: string): Promise<void> {
  const productDoc = doc(db, 'products', id);
  await deleteDoc(productDoc);
}


// --- Order Functions ---

export async function addOrder(order: Omit<Order, 'id'>): Promise<string> {
    const newOrderId = generateOrderId();
    const newOrderRef = doc(db, "orders", newOrderId);
    const newOrder = { ...order, id: newOrderId };
    await setDoc(newOrderRef, newOrder);
    return newOrderRef.id;
}

export async function getOrders(userId?: string): Promise<Order[]> {
    // This query previously tried to filter by userId and sort by date,
    // which requires a composite index in Firestore. To avoid the error
    // when that index is missing, we fetch all orders sorted by date and
    // then filter by userId on the client-side if a userId is provided.
    const ordersQuery = query(collection(db, 'orders'), orderBy('date', 'desc'));
    
    const orderSnapshot = await getDocs(ordersQuery);
    const allOrders = orderSnapshot.docs.map(doc => ({ ...doc.data() as Order, id: doc.id }));
    
    if (userId) {
        return allOrders.filter(order => order.userId === userId);
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
  const newTrackingHistory = { status: newStatus, date: new Date().toISOString() };
  await updateDoc(orderDoc, {
    status: newStatus,
    returnRequest: request,
    trackingHistory: [...((await getDoc(orderDoc)).data()?.trackingHistory || []), newTrackingHistory]
  });
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
  const storage = getStorage();
  const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return { url: downloadURL }; 
}

// --- Data Seeding ---
export async function seedInitialData() {
  const productsCol = collection(db, 'products');
  const categoriesCol = collection(db, 'categories');
  
  const productsSnapshot = await getDocs(productsCol);
  const categoriesSnapshot = await getDocs(categoriesCol);
  
  const batch = writeBatch(db);

  let seeded = false;

  if (categoriesSnapshot.empty) {
    console.log("Seeding categories...");
    initialCategories.forEach(category => {
      const docRef = doc(categoriesCol); // Auto-generate ID
      const placeholder = PlaceHolderImages.find(p => p.id === category.imageId);
      // We set the imageId to the actual placeholder URL now
      batch.set(docRef, { ...category, id: docRef.id, imageId: placeholder?.imageUrl || '' });
    });
    seeded = true;
  }
  
  if (productsSnapshot.empty) {
    console.log("Seeding products...");
    initialProducts.forEach(product => {
        const docRef = doc(productsCol); // Auto-generate ID for products
        const placeholder = PlaceHolderImages.find(p => p.id === product.imageUrls[0]);
        // We set the imageId to the actual placeholder URL now
        batch.set(docRef, { ...product, id: docRef.id, imageUrls: [placeholder?.imageUrl || ''] });
    });
    seeded = true;
  }
  
  if (seeded) {
    await batch.commit();
    console.log("Seeding complete.");
    return { success: true, message: "Database has been seeded." };
  } else {
    console.log("Database already contains data. Seeding skipped.");
    return { success: false, message: "Database already contains data." };
  }
}
