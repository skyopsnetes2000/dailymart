
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
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Product, Category, Offer, products as initialProducts, categories as initialCategories } from './data';

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

// --- Image Upload ---

export async function uploadImage(file: File, path: string): Promise<{ url: string, id: string }> {
  const storage = getStorage();
  const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return { url: downloadURL, id: downloadURL }; // Use URL as ID for simplicity
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
      const docRef = doc(categoriesCol);
      batch.set(docRef, category);
    });
    seeded = true;
  }
  
  if (productsSnapshot.empty) {
    console.log("Seeding products...");
    initialProducts.forEach(product => {
      const docRef = doc(productsCol);
      batch.set(docRef, product);
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
