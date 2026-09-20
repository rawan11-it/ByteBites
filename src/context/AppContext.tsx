import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Language, Theme, Page, Recipe, TextSize, Gender, RecipeHistoryItem } from '../types';
import { initialRecipes } from '../data/recipes';
import { translations } from '../translations';
import { resolveRecipeImage } from '../utils/recipeImageEngine';
import {
  auth,
  signInWithGoogle,
  signInAsGuest,
  signOutUser,
  clearActiveSubscriptions,
  syncUserProfileToFirestore,
  saveFridgeIngredientToFirestore,
  removeFridgeIngredientFromFirestore,
  saveRecipeToFirestore,
  unsaveRecipeFromFirestore,
  subscribeToUserData,
} from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AppContextType {
  userId: string;
  userEmail?: string;
  language: Language;
  theme: Theme;
  textSize: TextSize;
  gender: Gender;
  currentPage: Page;
  userName: string;
  isGoogleLoggedIn: boolean;
  isFirebaseSyncing: boolean;
  savedRecipeIds: string[];
  activeRecipeId: string;
  activeRecipe: Recipe;
  recipes: Recipe[];
  fridgeIngredients: string[];
  isWheelIngredientMode: boolean;
  recipeHistory: RecipeHistoryItem[];
  t: typeof translations.ar;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  setTextSize: (size: TextSize) => void;
  setGender: (gender: Gender) => void;
  navigateTo: (page: Page, recipeId?: string, wheelWithIngredients?: boolean) => void;
  setIsWheelIngredientMode: (active: boolean) => void;
  setUserName: (name: string) => void;
  toggleSaveRecipe: (recipeId: string, recipeObj?: Recipe) => void;
  isRecipeSaved: (recipeId: string) => boolean;
  toggleGoogleLogin: () => void;
  loginAsGuest: (displayName?: string) => Promise<void>;
  loginWithGoogle: (fallbackName?: string) => Promise<void>;
  savedRecipesList: Recipe[];
  userKitchenRecipes: Recipe[];
  setFridgeIngredients: React.Dispatch<React.SetStateAction<string[]>>;
  addFridgeIngredient: (ingredient: string) => void;
  removeFridgeIngredient: (ingredient: string) => void;
  addRecipeToHistory: (item: RecipeHistoryItem) => void;
  registerRecipe: (recipe: Recipe) => void;
  persistSavedRecipe: (recipe: Recipe) => void;
  addUserRecipe: (newRecipeData: {
    title: string;
    ingredients: string[];
    instructions: string[];
    servings: string;
    time: string;
    isPublic?: boolean;
  }) => Promise<{ success: boolean; recipe?: Recipe; error?: string }>;
  deleteUserRecipePermanently: (recipeId: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'bytebites_app_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string>(() => {
    const saved = localStorage.getItem('bytebites_user_id');
    if (saved) return saved;
    const generated = 'usr_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('bytebites_user_id', generated);
    return generated;
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem(`${LOCAL_STORAGE_KEY}_user_email`) || '';
  });

  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState<boolean>(false);

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_lang`);
    return (saved === 'en' || saved === 'ar') ? saved : 'ar';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_theme`);
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_text_size`);
    return (saved === 'normal' || saved === 'large' || saved === 'xlarge') ? saved : 'normal';
  });

  const [gender, setGenderState] = useState<Gender>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_gender_${userId}`) || localStorage.getItem(`${LOCAL_STORAGE_KEY}_gender`);
    return (saved === 'male' || saved === 'female') ? (saved as Gender) : null;
  });

  const [userName, setUserNameState] = useState<string>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_user`);
    if (!saved || saved === 'روان' || saved === 'Rawan') {
      return '';
    }
    return saved;
  });

  const [currentPage, setCurrentPageState] = useState<Page>('welcome');

  const [isGoogleLoggedIn, setIsGoogleLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(`${LOCAL_STORAGE_KEY}_is_logged_in`) === 'true';
  });

  const prefsRef = useRef({ language, theme, textSize, userName, gender });
  useEffect(() => {
    prefsRef.current = { language, theme, textSize, userName, gender };
  }, [language, theme, textSize, userName, gender]);

  // Sync with Firebase Authentication & Firestore
  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isGoogle = !firebaseUser.isAnonymous;
        setIsGoogleLoggedIn(isGoogle);
        setUserId(firebaseUser.uid);
        localStorage.setItem('bytebites_user_id', firebaseUser.uid);
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_logged_in`, String(isGoogle));

        const savedUserGender = localStorage.getItem(`${LOCAL_STORAGE_KEY}_gender_${firebaseUser.uid}`) || localStorage.getItem(`${LOCAL_STORAGE_KEY}_gender`);
        if (savedUserGender === 'male' || savedUserGender === 'female') {
          setGenderState(savedUserGender as Gender);
        }

        if (firebaseUser.displayName) {
          setUserNameState(firebaseUser.displayName);
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_user`, firebaseUser.displayName);
        }
        if (firebaseUser.email) {
          setUserEmail(firebaseUser.email);
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_user_email`, firebaseUser.email);
        } else if (firebaseUser.isAnonymous) {
          setUserEmail('');
          localStorage.removeItem(`${LOCAL_STORAGE_KEY}_user_email`);
        }

        setIsFirebaseSyncing(true);
        try {
          // Sync profile to Firestore
          await syncUserProfileToFirestore(firebaseUser.uid, {
            name: firebaseUser.displayName || prefsRef.current.userName,
            email: firebaseUser.email || undefined,
            language: prefsRef.current.language,
            theme: prefsRef.current.theme,
            textSize: prefsRef.current.textSize,
            gender: (savedUserGender === 'male' || savedUserGender === 'female' ? savedUserGender as Gender : prefsRef.current.gender) || undefined,
          });

          // Unsubscribe previous snapshot if any
          if (unsubSnapshot) {
            unsubSnapshot();
            unsubSnapshot = null;
          }

          // Subscribe to real-time Firestore updates
          unsubSnapshot = subscribeToUserData(firebaseUser.uid, {
            onFridgeUpdate: (items) => {
              if (items && items.length > 0) {
                setFridgeIngredientsState(prev => Array.from(new Set([...prev, ...items])));
              }
            },
            onSavedRecipesUpdate: (recipeIds) => {
              if (recipeIds && recipeIds.length > 0) {
                setSavedRecipeIds(prev => Array.from(new Set([...prev, ...recipeIds])));
              }
            },
          });
        } catch (err) {
          console.error('Firebase Firestore sync failed:', err);
        } finally {
          setIsFirebaseSyncing(false);
        }
      } else {
        setIsGoogleLoggedIn(false);
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_logged_in`, 'false');
        if (unsubSnapshot) {
          unsubSnapshot();
          unsubSnapshot = null;
        }
        clearActiveSubscriptions();
      }
    });

    return () => {
      if (unsubSnapshot) {
        unsubSnapshot();
      }
      clearActiveSubscriptions();
      unsubscribeAuth();
    };
  }, []);

  const [allRecipes, setAllRecipes] = useState<Recipe[]>(initialRecipes);

  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_saved_recipes`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }
    return [];
  });

  const [fridgeIngredients, setFridgeIngredientsState] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_fridge_ingredients`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fallback
      }
    }
    return [];
  });

  const [isWheelIngredientMode, setIsWheelIngredientModeState] = useState<boolean>(() => {
    return sessionStorage.getItem(`${LOCAL_STORAGE_KEY}_wheel_ingredient_mode`) === 'true';
  });

  const setIsWheelIngredientMode = (active: boolean) => {
    setIsWheelIngredientModeState(active);
    sessionStorage.setItem(`${LOCAL_STORAGE_KEY}_wheel_ingredient_mode`, String(active));
  };

  const registerRecipe = (recipe: Recipe) => {
    if (!recipe || !recipe.id) return;
    setAllRecipes(prev => {
      if (prev.some(r => r.id === recipe.id)) return prev;
      return [recipe, ...prev];
    });
  };

  // Sync with SQLite backend on initial mount
  useEffect(() => {
    const syncFromDb = async () => {
      try {
        const res = await fetch(`/api/user/sync?userId=${userId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) {
          const fridge = data.fridgeIngredients || data.data?.fridgeIngredients;
          if (Array.isArray(fridge) && fridge.length > 0) {
            setFridgeIngredientsState(fridge);
          }
          if (data.preferences?.gender) {
            const g = data.preferences.gender;
            if (g === 'male' || g === 'female') {
              setGenderState(g);
              localStorage.setItem(`${LOCAL_STORAGE_KEY}_gender_${userId}`, g);
              localStorage.setItem(`${LOCAL_STORAGE_KEY}_gender`, g);
            }
          }
          const recipes = data.savedRecipes || data.data?.savedRecipes;
          if (Array.isArray(recipes)) {
            const recipeIds = recipes.map((r: any) => r.id || r.recipe_id);
            if (recipeIds.length > 0) {
              setSavedRecipeIds(recipeIds);
              // Register any stored recipes into allRecipes
              recipes.forEach((dbRecipe: any) => {
                const mapped: Recipe = {
                  id: dbRecipe.id || dbRecipe.recipe_id,
                  title: dbRecipe.title_ar || dbRecipe.title || '',
                  titleEn: dbRecipe.title_en || dbRecipe.titleEn || dbRecipe.title_ar || '',
                  category: dbRecipe.category || 'main',
                  categoryEn: dbRecipe.category_en || 'Main Dish',
                  rating: 5,
                  calories: String(dbRecipe.calories || '450'),
                  caloriesEn: `${dbRecipe.calories || '450'} kcal`,
                  time: dbRecipe.time || '30 دقيقة',
                  timeEn: dbRecipe.time_en || '30 mins',
                  difficulty: 'سهل',
                  difficultyEn: 'Easy',
                  servings: '4 أشخاص',
                  servingsEn: '4 Servings',
                  image: dbRecipe.image || dbRecipe.image_url || resolveRecipeImage({
                    title: dbRecipe.title_ar || dbRecipe.title || '',
                    titleEn: dbRecipe.title_en || dbRecipe.titleEn || '',
                    category: dbRecipe.category || '',
                    ingredients: Array.isArray(dbRecipe.ingredients) ? dbRecipe.ingredients : [],
                    instructions: Array.isArray(dbRecipe.instructions) ? dbRecipe.instructions : [],
                  }),
                  ingredients: Array.isArray(dbRecipe.ingredients) ? dbRecipe.ingredients : [],
                  ingredientsEn: Array.isArray(dbRecipe.ingredients_en) ? dbRecipe.ingredients_en : [],
                  instructions: Array.isArray(dbRecipe.instructions) ? dbRecipe.instructions : [],
                  instructionsEn: Array.isArray(dbRecipe.instructions_en) ? dbRecipe.instructions_en : [],
                  aiTip: dbRecipe.description || 'وصفة شهية ومبتكرة من بايت!',
                  aiTipEn: dbRecipe.description_en || 'A delicious, inventive recipe by Byte!',
                  source: dbRecipe.source || 'user',
                  isPublic: Boolean(dbRecipe.is_public ?? dbRecipe.isPublic ?? false),
                  userId: dbRecipe.userId || dbRecipe.user_id,
                  createdAt: dbRecipe.created_at,
                };
                registerRecipe(mapped);
              });
            }
          }
        }
      } catch (err) {
        console.warn('Backend sync failed, continuing with local state:', err);
      }
    };

    syncFromDb();
  }, [userId]);

  const [recipeHistory, setRecipeHistory] = useState<RecipeHistoryItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_recipe_history`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fallback
      }
    }
    return [];
  });

  const [activeRecipeId, setActiveRecipeId] = useState<string>('machboos-chicken');

  // Handle document direction and language attributes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_lang`, language);
  }, [language]);

  // Handle document theme classes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_theme`, theme);
  }, [theme]);

  // Handle document text size attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-text-size', textSize);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_text_size`, textSize);
  }, [textSize]);

  // Sync saved recipes
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_saved_recipes`, JSON.stringify(savedRecipeIds));
  }, [savedRecipeIds]);

  // Sync fridge ingredients
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_fridge_ingredients`, JSON.stringify(fridgeIngredients));
  }, [fridgeIngredients]);

  // Sync recipe history
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_recipe_history`, JSON.stringify(recipeHistory));
  }, [recipeHistory]);

  const setFridgeIngredients: React.Dispatch<React.SetStateAction<string[]>> = (valOrFn) => {
    setFridgeIngredientsState(prev => {
      const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
      // Persist to backend
      fetch('/api/fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ingredients: next }),
      }).catch(err => console.error('Error saving fridge ingredients to DB:', err));
      return next;
    });
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    fetch('/api/user/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, language: lang }),
    }).catch(err => console.error('Error saving language preference to DB:', err));

    if (auth.currentUser) {
      syncUserProfileToFirestore(auth.currentUser.uid, {
        name: userName,
        email: auth.currentUser.email || undefined,
        language: lang,
        theme,
        textSize,
      }).catch(console.error);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    fetch('/api/user/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, theme: newTheme }),
    }).catch(err => console.error('Error saving theme preference to DB:', err));

    if (auth.currentUser) {
      syncUserProfileToFirestore(auth.currentUser.uid, {
        name: userName,
        email: auth.currentUser.email || undefined,
        language,
        theme: newTheme,
        textSize,
      }).catch(console.error);
    }
  };

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
    fetch('/api/user/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, textSize: size }),
    }).catch(err => console.error('Error saving textSize preference to DB:', err));

    if (auth.currentUser) {
      syncUserProfileToFirestore(auth.currentUser.uid, {
        name: userName,
        email: auth.currentUser.email || undefined,
        language,
        theme,
        textSize: size,
      }).catch(console.error);
    }
  };

  const setGender = (newGender: Gender) => {
    setGenderState(newGender);
    if (newGender) {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_gender`, newGender);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_gender_${userId}`, newGender);
    } else {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_gender`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_gender_${userId}`);
    }

    fetch('/api/user/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, gender: newGender }),
    }).catch(err => console.error('Error saving gender preference to DB:', err));

    if (auth.currentUser) {
      syncUserProfileToFirestore(auth.currentUser.uid, {
        name: userName,
        email: auth.currentUser.email || undefined,
        language,
        theme,
        textSize,
        gender: newGender,
      }).catch(console.error);
    }
  };

  const addFridgeIngredient = (ingredient: string) => {
    const trimmed = ingredient.trim();
    if (!trimmed) return;
    setFridgeIngredients(prev => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    if (auth.currentUser) {
      saveFridgeIngredientToFirestore(auth.currentUser.uid, trimmed).catch(console.error);
    }
  };

  const removeFridgeIngredient = (ingredient: string) => {
    setFridgeIngredients(prev => prev.filter(i => i !== ingredient));
    if (auth.currentUser) {
      removeFridgeIngredientFromFirestore(auth.currentUser.uid, ingredient).catch(console.error);
    }
  };

  const addRecipeToHistory = (item: RecipeHistoryItem) => {
    setRecipeHistory(prev => [{ ...item, timestamp: Date.now() }, ...prev.slice(0, 19)]);
  };

  const setUserName = (name: string) => {
    const trimmed = name.trim();
    const finalName = trimmed;
    setUserNameState(finalName);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_user`, finalName);
    fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name: finalName, isGoogle: isGoogleLoggedIn, email: userEmail }),
    }).catch(err => console.error('Error saving username to DB:', err));

    if (auth.currentUser) {
      syncUserProfileToFirestore(auth.currentUser.uid, {
        name: finalName,
        email: auth.currentUser.email || undefined,
        language,
        theme,
        textSize,
      }).catch(console.error);
    }
  };

  const navigateTo = (page: Page, recipeId?: string, wheelWithIngredients?: boolean) => {
    if (recipeId) {
      setActiveRecipeId(recipeId);
    }
    if (page === 'wheel') {
      setIsWheelIngredientMode(wheelWithIngredients === true);
    }
    setCurrentPageState(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSaveRecipe = (recipeId: string, recipeObj?: Recipe) => {
    const isCurrentlySaved = savedRecipeIds.includes(recipeId);
    if (isCurrentlySaved) {
      setSavedRecipeIds(prev => prev.filter(id => id !== recipeId));
      if (auth.currentUser) {
        unsaveRecipeFromFirestore(auth.currentUser.uid, recipeId).catch(console.error);
      }
      fetch('/api/recipes/unsave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, recipeId }),
      }).catch(err => console.error('Error unsaving recipe from DB:', err));
    } else {
      setSavedRecipeIds(prev => [recipeId, ...prev]);
      const targetRecipe = recipeObj || allRecipes?.find(r => r.id === recipeId) || initialRecipes?.find(r => r.id === recipeId);
      if (targetRecipe) {
        registerRecipe(targetRecipe);
        if (auth.currentUser) {
          saveRecipeToFirestore(auth.currentUser.uid, targetRecipe).catch(console.error);
        }
        fetch('/api/recipes/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            recipeId: targetRecipe.id,
            recipe: {
              id: targetRecipe.id,
              title_ar: targetRecipe.title,
              title_en: targetRecipe.titleEn,
              category: targetRecipe.category,
              calories: parseInt(targetRecipe.calories) || 450,
              time: targetRecipe.time,
              time_en: targetRecipe.timeEn,
              image_url: targetRecipe.image,
              description: targetRecipe.aiTip || '',
              description_en: targetRecipe.aiTipEn || '',
              ingredients: targetRecipe.ingredients,
              ingredients_en: targetRecipe.ingredientsEn,
              instructions: targetRecipe.instructions,
              instructions_en: targetRecipe.instructionsEn,
            },
          }),
        }).catch(err => console.error('Error saving recipe to DB:', err));
      }
    }
  };

  const isRecipeSaved = (recipeId: string) => {
    return savedRecipeIds.includes(recipeId);
  };

  const loginAsGuest = async (displayName?: string) => {
    try {
      const user = await signInAsGuest();
      if (user) {
        setUserId(user.uid);
        localStorage.setItem('bytebites_user_id', user.uid);
        setIsGoogleLoggedIn(false);
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_logged_in`, 'false');
        if (displayName && displayName.trim()) {
          setUserNameState(displayName.trim());
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_user`, displayName.trim());
        }
        if (auth.currentUser) {
          await syncUserProfileToFirestore(user.uid, {
            name: displayName?.trim() || userName || 'ضيف بايت',
            language,
            theme,
            textSize,
            gender: prefsRef.current.gender || undefined,
          });
        }
        fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            name: displayName?.trim() || userName || 'ضيف بايت',
            isGoogle: false,
            email: '',
          }),
        }).catch(err => console.error('Error updating Guest profile in DB:', err));
      }
    } catch (err) {
      console.warn('Guest login error gracefully caught:', err);
    }
  };

  const loginWithGoogle = async (fallbackName?: string) => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        setIsGoogleLoggedIn(true);
        setUserId(user.uid);
        localStorage.setItem('bytebites_user_id', user.uid);
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_logged_in`, 'true');
        const resolvedName = user.displayName || fallbackName?.trim() || userName || '';
        if (resolvedName) {
          setUserNameState(resolvedName);
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_user`, resolvedName);
        }
        if (user.email) {
          setUserEmail(user.email);
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_user_email`, user.email);
        }
        await syncUserProfileToFirestore(user.uid, {
          name: resolvedName,
          email: user.email || undefined,
          language,
          theme,
          textSize,
          gender: prefsRef.current.gender || undefined,
        });
        fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            name: resolvedName,
            isGoogle: true,
            email: user.email || '',
          }),
        }).catch(err => console.error('Error updating Google login in DB:', err));
      }
    } catch (err) {
      console.error('Firebase Google sign-in failed:', err);
      throw err;
    }
  };

  const toggleGoogleLogin = async () => {
    if (isGoogleLoggedIn) {
      try {
        await signOutUser();
      } catch (err) {
        console.error('Firebase sign out failed:', err);
      }
      setIsGoogleLoggedIn(false);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_logged_in`, 'false');
      fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: userName, isGoogle: false, email: '' }),
      }).catch(err => console.error('Error updating Google login in DB:', err));
    } else {
      await loginWithGoogle();
    }
  };

  const addUserRecipe = async (newRecipeData: {
    title: string;
    ingredients: string[];
    instructions: string[];
    servings: string;
    time: string;
    isPublic?: boolean;
  }): Promise<{ success: boolean; recipe?: Recipe; error?: string }> => {
    const newId = 'user_rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const isPublic = Boolean(newRecipeData.isPublic);
    const recipeImage = resolveRecipeImage({
      title: newRecipeData.title,
      ingredients: newRecipeData.ingredients,
      instructions: newRecipeData.instructions,
      category: 'custom',
    });

    const createdRecipe: Recipe = {
      id: newId,
      userId,
      title: newRecipeData.title,
      titleEn: newRecipeData.title,
      category: 'custom',
      categoryEn: 'My Kitchen',
      rating: 5,
      calories: '',
      caloriesEn: '',
      time: newRecipeData.time,
      timeEn: newRecipeData.time,
      difficulty: 'سهل',
      difficultyEn: 'Easy',
      servings: newRecipeData.servings,
      servingsEn: newRecipeData.servings,
      image: recipeImage,
      ingredients: newRecipeData.ingredients,
      ingredientsEn: newRecipeData.ingredients,
      instructions: newRecipeData.instructions,
      instructionsEn: newRecipeData.instructions,
      aiTip: 'وصفتك الخاصة والمميزة من مطبخك!',
      aiTipEn: 'Your special private kitchen recipe!',
      source: 'user',
      isPublic,
      authorName: userName,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/recipes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          recipeId: newId,
          source: 'user',
          isPublic,
          recipe: {
            id: newId,
            user_id: userId,
            title: createdRecipe.title,
            title_ar: createdRecipe.title,
            title_en: createdRecipe.titleEn,
            category: createdRecipe.category,
            category_en: createdRecipe.categoryEn,
            calories: 0,
            time: createdRecipe.time,
            time_en: createdRecipe.timeEn,
            servings: createdRecipe.servings,
            servings_en: createdRecipe.servingsEn,
            difficulty: createdRecipe.difficulty,
            difficulty_en: createdRecipe.difficultyEn,
            image: createdRecipe.image,
            image_url: createdRecipe.image,
            description: createdRecipe.aiTip,
            description_en: createdRecipe.aiTipEn,
            ingredients: createdRecipe.ingredients,
            ingredients_en: createdRecipe.ingredientsEn,
            instructions: createdRecipe.instructions,
            instructions_en: createdRecipe.instructionsEn,
            source: 'user',
            is_saved: 1,
            is_public: isPublic ? 1 : 0,
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ error: 'Failed to save to database' }));
        return { success: false, error: errJson.error || 'Failed to save to database' };
      }

      const data = await res.json();
      if (data.success) {
        registerRecipe(createdRecipe);
        setSavedRecipeIds(prev => [newId, ...prev.filter(id => id !== newId)]);
        if (auth.currentUser) {
          saveRecipeToFirestore(auth.currentUser.uid, createdRecipe).catch(console.error);
        }
        return { success: true, recipe: createdRecipe };
      } else {
        return { success: false, error: data.error || 'Database save returned unsuccessful' };
      }
    } catch (err: any) {
      console.error('Error saving user recipe to database:', err);
      return { success: false, error: err?.message || 'Network error' };
    }
  };

  const persistSavedRecipe = (recipe: Recipe) => {
    registerRecipe(recipe);
    setSavedRecipeIds(prev => [recipe.id, ...prev.filter(id => id !== recipe.id)]);
    if (auth.currentUser) {
      saveRecipeToFirestore(auth.currentUser.uid, recipe).catch(console.error);
    }
  };

  const deleteUserRecipePermanently = async (recipeId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/recipes/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, recipeId }),
      });

      // Remove locally from state
      setSavedRecipeIds(prev => prev.filter(id => id !== recipeId));
      setAllRecipes(prev => prev.filter(r => r.id !== recipeId));

      if (auth.currentUser) {
        unsaveRecipeFromFirestore(auth.currentUser.uid, recipeId).catch(console.error);
      }
      return res.ok;
    } catch (err) {
      console.error('Error permanently deleting recipe:', err);
      setSavedRecipeIds(prev => prev.filter(id => id !== recipeId));
      return false;
    }
  };

  const activeRecipe = allRecipes?.find(r => r.id === activeRecipeId) || initialRecipes?.find(r => r.id === activeRecipeId) || initialRecipes?.[0] || null;
  const savedRecipesList = (allRecipes || []).filter(r => (savedRecipeIds || []).includes(r.id));
  const userKitchenRecipes = (allRecipes || []).filter(r => r.source === 'user');
  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        userId,
        userEmail,
        language,
        theme,
        textSize,
        gender,
        currentPage,
        userName,
        isGoogleLoggedIn,
        isFirebaseSyncing,
        savedRecipeIds,
        activeRecipeId,
        activeRecipe,
        recipes: allRecipes,
        fridgeIngredients,
        isWheelIngredientMode,
        recipeHistory,
        t,
        setLanguage,
        setTheme,
        setTextSize,
        setGender,
        navigateTo,
        setIsWheelIngredientMode,
        setUserName,
        toggleSaveRecipe,
        isRecipeSaved,
        toggleGoogleLogin,
        loginAsGuest,
        loginWithGoogle,
        savedRecipesList,
        userKitchenRecipes,
        setFridgeIngredients,
        addFridgeIngredient,
        removeFridgeIngredient,
        addRecipeToHistory,
        registerRecipe,
        persistSavedRecipe,
        addUserRecipe,
        deleteUserRecipePermanently,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
