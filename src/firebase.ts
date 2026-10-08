import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signInAnonymously,
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
import { Language, Theme, TextSize, Gender, Recipe } from './types';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
});

// Configure browser persistence gracefully for mobile browsers and private windows
if (typeof window !== 'undefined') {
  try {
    setPersistence(auth, browserLocalPersistence).catch(() => {
      setPersistence(auth, browserSessionPersistence).catch(() => {});
    });
  } catch {}
}

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

// Detect mobile environment (iPhone Safari, iPad, Android, etc.) where popups are blocked or fail
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = (navigator.userAgent || navigator.vendor || (window as any).opera || '').toLowerCase();
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|silk/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSmallTouch = ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth <= 820;
  return isMobileUA || isIOS || isSmallTouch;
}

let redirectResultPromise: Promise<FirebaseUser | null> | null = null;

// Catch and process redirect result once when app loads
export async function checkRedirectResult(): Promise<FirebaseUser | null> {
  if (typeof window === 'undefined') return null;
  if (redirectResultPromise) return redirectResultPromise;

  redirectResultPromise = (async () => {
    try {
      const result = await getRedirectResult(auth);
      sessionStorage.removeItem('bytebites_auth_redirect');
      if (result && result.user) {
        return result.user;
      }
      return null;
    } catch (error: any) {
      sessionStorage.removeItem('bytebites_auth_redirect');
      console.error('Firebase redirect auth error:', error);
      throw error;
    }
  })();

  return redirectResultPromise;
}

// Auth helper: Google Sign-in with native mobile redirect & desktop popup fallback
export async function signInWithGoogle(): Promise<{ user: FirebaseUser | null; isRedirecting: boolean }> {
  try {
    if (
      auth.currentUser &&
      !auth.currentUser.isAnonymous &&
      auth.currentUser.providerData.some(p => p.providerId === 'google.com' || p.providerId.includes('google'))
    ) {
      return { user: auth.currentUser, isRedirecting: false };
    }

    const useRedirect = isMobileDevice();

    if (useRedirect) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('bytebites_auth_redirect', 'pending');
      }
      await signInWithRedirect(auth, googleAuthProvider);
      return { user: null, isRedirecting: true };
    }

    // On desktop, try popup first
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      return { user: result.user, isRedirecting: false };
    } catch (popupError: any) {
      // If popup was blocked or unsupported on desktop, smoothly fallback to redirect
      if (
        popupError?.code === 'auth/popup-blocked' ||
        popupError?.code === 'auth/operation-not-supported-in-this-environment' ||
        popupError?.code === 'auth/cancelled-popup-request'
      ) {
        console.warn('Popup blocked or unsupported, falling back to redirect:', popupError?.code);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('bytebites_auth_redirect', 'pending');
        }
        await signInWithRedirect(auth, googleAuthProvider);
        return { user: null, isRedirecting: true };
      }
      throw popupError;
    }
  } catch (error) {
    console.error('Firebase Google sign-in failed:', error);
    throw error;
  }
}

// Auth helper: Guest (Anonymous) sign-in
// If an authenticated user already exists in the current session, reuse it
// Tries Firebase Anonymous sign-in; if Anonymous auth is restricted or disabled in the Firebase project console
// (auth/admin-restricted-operation or auth/operation-not-allowed), smoothly provides a unique guest UID
export async function signInAsGuest(): Promise<{ uid: string; displayName?: string | null; isAnonymous: boolean } | null> {
  try {
    if (auth.currentUser) {
      return auth.currentUser;
    }
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error: any) {
    if (
      error?.code === 'auth/admin-restricted-operation' ||
      error?.code === 'auth/operation-not-allowed'
    ) {
      // Anonymous authentication is not enabled on this Firebase project console.
      // Gracefully generate or retrieve a persistent unique guest UID.
      let guestUid = localStorage.getItem('bytebites_guest_uid');
      if (!guestUid) {
        guestUid = 'guest_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        localStorage.setItem('bytebites_guest_uid', guestUid);
      }
      return {
        uid: guestUid,
        displayName: 'ضيف بايت',
        isAnonymous: true,
      };
    }
    console.warn('Firebase Anonymous sign-in unavailable, fallback to local guest session:', error?.code || error);
    let guestUid = localStorage.getItem('bytebites_guest_uid');
    if (!guestUid) {
      guestUid = 'guest_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem('bytebites_guest_uid', guestUid);
    }
    return {
      uid: guestUid,
      displayName: 'ضيف بايت',
      isAnonymous: true,
    };
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
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('bytebites_auth_redirect');
  }
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
    name?: string;
    email?: string;
    language?: Language;
    theme?: Theme;
    textSize?: TextSize;
    gender?: Gender;
  }
) {
  if (!auth.currentUser || auth.currentUser.uid !== userId) return;
  const path = `users/${userId}`;
  try {
    const updatePayload: Record<string, any> = {
      userId,
      name: (profile.name && profile.name.trim()) ? profile.name.trim().slice(0, 100) : (auth.currentUser.displayName || 'User').slice(0, 100),
      language: profile.language || 'ar',
      theme: profile.theme || 'dark',
      textSize: profile.textSize || 'normal',
      updatedAt: new Date().toISOString(),
    };
    if (profile.email || auth.currentUser.email) {
      updatePayload.email = (profile.email || auth.currentUser.email || '').slice(0, 150);
    }
    if (profile.gender !== undefined && profile.gender !== null) {
      updatePayload.gender = profile.gender;
    }

    await setDoc(doc(db, 'users', userId), updatePayload, { merge: true });
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

