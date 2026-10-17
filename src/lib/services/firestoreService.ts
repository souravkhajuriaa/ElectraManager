import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, bootstrapFirebaseAuth } from '@/src/lib/firebase';
import { Product, Category, Sale, Notification, ActivityLog, Business } from '@/src/types';

const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';
const SALES_COLLECTION = 'sales';
const BUSINESS_COLLECTION = 'businesses';
const NOTIFICATIONS_COLLECTION = 'notifications';
const ACTIVITY_LOGS_COLLECTION = 'activityLogs';

/**
 * Fetch all products from Firestore
 */
export async function getFirestoreProducts(): Promise<Product[]> {
  await bootstrapFirebaseAuth();
  try {
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const items: Product[] = [];
    snap.forEach((d) => {
      const data = d.data() as Product;
      items.push({ ...data, id: d.id });
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, PRODUCTS_COLLECTION);
  }
}

/**
 * Save / Update a single product in Firestore (Title, Image, Price, Stock, etc.)
 */
export async function saveProductToFirestore(product: Product): Promise<void> {
  await bootstrapFirebaseAuth();
  const path = `${PRODUCTS_COLLECTION}/${product.id}`;
  try {
    await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), {
      ...product,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a product from Firestore
 */
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  await bootstrapFirebaseAuth();
  const path = `${PRODUCTS_COLLECTION}/${productId}`;
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Seed master products in batch to Firestore if collection is empty
 */
export async function seedProductsIfEmpty(initialProducts: Product[]): Promise<Product[]> {
  await bootstrapFirebaseAuth();
  try {
    const existing = await getFirestoreProducts();
    if (existing.length > 0) {
      return existing;
    }

    // Collection is empty, write initial batch
    const batch = writeBatch(db);
    for (const p of initialProducts) {
      const ref = doc(db, PRODUCTS_COLLECTION, p.id);
      batch.set(ref, p);
    }
    await batch.commit();
    return initialProducts;
  } catch (error) {
    console.warn('[Firestore] Seed products warning:', error);
    return initialProducts;
  }
}

/**
 * Real-time listener for products
 */
export function subscribeToProducts(
  onData: (products: Product[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as Product), id: d.id });
      });
      onData(items);
    },
    (error) => {
      console.warn('[Firestore] Product listener error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Save Sale transaction to Firestore
 */
export async function saveSaleToFirestore(sale: Sale): Promise<void> {
  await bootstrapFirebaseAuth();
  const path = `${SALES_COLLECTION}/${sale.id}`;
  try {
    await setDoc(doc(db, SALES_COLLECTION, sale.id), sale);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save Category to Firestore
 */
export async function saveCategoryToFirestore(category: Category): Promise<void> {
  await bootstrapFirebaseAuth();
  const path = `${CATEGORIES_COLLECTION}/${category.id}`;
  try {
    await setDoc(doc(db, CATEGORIES_COLLECTION, category.id), category);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete Category from Firestore
 */
export async function deleteCategoryFromFirestore(categoryId: string): Promise<void> {
  await bootstrapFirebaseAuth();
  const path = `${CATEGORIES_COLLECTION}/${categoryId}`;
  try {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save Business Profile to Firestore
 */
export async function saveBusinessToFirestore(business: Business): Promise<void> {
  await bootstrapFirebaseAuth();
  const path = `${BUSINESS_COLLECTION}/${business.id}`;
  try {
    await setDoc(doc(db, BUSINESS_COLLECTION, business.id), business, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save Activity Log to Firestore
 */
export async function saveActivityLogToFirestore(log: ActivityLog): Promise<void> {
  await bootstrapFirebaseAuth();
  const path = `${ACTIVITY_LOGS_COLLECTION}/${log.id}`;
  try {
    await setDoc(doc(db, ACTIVITY_LOGS_COLLECTION, log.id), log);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
