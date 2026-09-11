import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  deleteDoc,
  getDocs,
  getDocFromServer,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Language, Theme, TextSize, Recipe } from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection check to Firestore as required by Firebase skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firestore connection verified');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testConnection();

// Auth helper: Google popup login
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    return result.user;
  } catch (error) {
    console.error('Firebase Google sign-in failed:', error);
    throw error;
  }
}

let activeSubscriptions: (() => void)[] = [];

export function clearActiveSubscriptions() {
  const subs = [...activeSubscriptions];
  activeSubscriptions = [];
  subs.forEach(unsub => {
    try {
      unsub();
    } catch {}
  });
}

// Auth helper: Sign out
export async function signOutUser(): Promise<void> {
  clearActiveSubscriptions();
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Firebase sign-out failed:', error);
    throw error;
  }
}

// Helper to sanitize IDs for Firestore path validation
export function sanitizeDocId(input: string): string {
  if (!input) return 'item_' + Math.random().toString(36).substring(2, 8);
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  const latinPart = input.toLowerCase().replace(/[^a-z0-9_-]/g, '').substring(0, 40);
  const hashStr = Math.abs(hash).toString(36);
  const result = latinPart ? `${latinPart}_${hashStr}` : `doc_${hashStr}`;
  return result.substring(0, 120);
}

// Firestore User Profile Sync
export async function syncUserProfileToFirestore(
  userId: string,
  profile: {
    name: string;
    email?: string;
    language: Language;
    theme: Theme;
    textSize: TextSize;
  }
) {
  if (!auth.currentUser || auth.currentUser.uid !== userId) return;
  const path = `users/${userId}`;
  try {
    await setDoc(
      doc(db, 'users', userId),
      {
        userId,
        name: (profile.name || 'User').slice(0, 100),
        email: profile.email ? profile.email.slice(0, 150) : '',
        language: profile.language || 'ar',
        theme: profile.theme || 'dark',
        textSize: profile.textSize || 'normal',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Firestore Fridge Sync: Save an ingredient
export async function saveFridgeIngredientToFirestore(userId: string, ingredientName: string) {
  if (!auth.currentUser || auth.currentUser.uid !== userId) return;
  const ingredientId = sanitizeDocId(ingredientName);
  const path = `users/${userId}/fridge/${ingredientId}`;
  try {
    await setDoc(doc(db, 'users', userId, 'fridge', ingredientId), {
      id: ingredientId,
      userId,
      name: ingredientName.slice(0, 100),
      addedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Firestore Fridge Sync: Delete an ingredient
export async function removeFridgeIngredientFromFirestore(userId: string, ingredientName: string) {
  if (!auth.currentUser || auth.currentUser.uid !== userId) return;
  const ingredientId = sanitizeDocId(ingredientName);
  const path = `users/${userId}/fridge/${ingredientId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'fridge', ingredientId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Firestore Saved Recipe Sync: Save a recipe
export async function saveRecipeToFirestore(userId: string, recipe: Recipe) {
  if (!auth.currentUser || auth.currentUser.uid !== userId) return;
  const recipeId = sanitizeDocId(recipe.id);
  const path = `users/${userId}/savedRecipes/${recipeId}`;
  try {
    await setDoc(doc(db, 'users', userId, 'savedRecipes', recipeId), {
      id: recipeId,
      userId,
      title: recipe.title.slice(0, 150),
      titleEn: (recipe.titleEn || recipe.title).slice(0, 150),
      category: (recipe.category || 'main').slice(0, 50),
      calories: String(recipe.calories || '450').slice(0, 20),
      time: (recipe.time || '30 دقيقة').slice(0, 50),
      timeEn: (recipe.timeEn || '30 mins').slice(0, 50),
      image: (recipe.image || '').slice(0, 2048),
      aiTip: (recipe.aiTip || '').slice(0, 1000),
      aiTipEn: (recipe.aiTipEn || '').slice(0, 1000),
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Firestore Saved Recipe Sync: Unsave a recipe
export async function unsaveRecipeFromFirestore(userId: string, recipeId: string) {
  if (!auth.currentUser || auth.currentUser.uid !== userId) return;
  const sanitizedId = sanitizeDocId(recipeId);
  const path = `users/${userId}/savedRecipes/${sanitizedId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'savedRecipes', sanitizedId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Subscribe to real-time user data in Firestore
export function subscribeToUserData(
  userId: string,
  callbacks: {
    onFridgeUpdate?: (ingredients: string[]) => void;
    onSavedRecipesUpdate?: (recipeIds: string[]) => void;
  }
) {
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return () => {};
  }

  // Clear existing active subscriptions to prevent duplicates
  clearActiveSubscriptions();

  let unsubFridge = () => {};
  let unsubRecipes = () => {};

  // Fridge snapshot listener
  const fridgeCol = collection(db, 'users', userId, 'fridge');
  unsubFridge = onSnapshot(
    fridgeCol,
    snapshot => {
      if (callbacks.onFridgeUpdate) {
        const ingredients = snapshot.docs.map(d => d.data().name as string).filter(Boolean);
        callbacks.onFridgeUpdate(ingredients);
      }
    },
    error => {
      if (auth.currentUser && auth.currentUser.uid === userId) {
        handleFirestoreError(error, OperationType.LIST, `users/${userId}/fridge`);
      }
    }
  );

  // Saved recipes listener
  const recipesCol = collection(db, 'users', userId, 'savedRecipes');
  unsubRecipes = onSnapshot(
    recipesCol,
    snapshot => {
      if (callbacks.onSavedRecipesUpdate) {
        const recipeIds = snapshot.docs.map(d => d.id).filter(Boolean);
        callbacks.onSavedRecipesUpdate(recipeIds);
      }
    },
    error => {
      if (auth.currentUser && auth.currentUser.uid === userId) {
        handleFirestoreError(error, OperationType.LIST, `users/${userId}/savedRecipes`);
      }
    }
  );

  const cleanup = () => {
    try { unsubFridge(); } catch {}
    try { unsubRecipes(); } catch {}
    activeSubscriptions = activeSubscriptions.filter(fn => fn !== cleanup);
  };

  activeSubscriptions.push(cleanup);
  return cleanup;
}

