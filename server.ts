import express from "express";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { calculateNutritionDeterministically } from "./src/utils/nutritionEngine";
import { resolveRecipeImage, determineCulinaryArchetype } from "./src/utils/recipeImageEngine";
import {
  getOrCreateUser,
  getUserPreferences,
  saveUserPreferences,
  getUserFridgeIngredients,
  saveUserFridgeIngredients,
  recordWheelSession,
  saveOrUpdateRecipe,
  toggleRecipeSavedInDb,
  getSavedRecipesFromDb,
  getUserRecipes,
  getPublicRecipes,
  deleteRecipePermanently,
  saveChatMessageInDb,
  getChatHistoryFromDb,
  saveDietLogInDb,
  getUserFullSync,
} from "./src/server/db";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini client safely
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Resilient fallback models priority list
const GEMINI_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.6-flash",
];

async function generateWithFallback(ai: GoogleGenAI, request: any) {
  let lastError: any = null;
  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...request,
          model,
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const status = err?.status;
        // On transient 503 (temporary backend load), wait briefly and retry once
        if (status === 503 && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          continue;
        }
        // Move to the next model in the priority list
        break;
      }
    }
  }
  console.error("[Byte AI] All fallback models failed:", lastError?.status || lastError?.message || lastError);
  throw lastError || new Error("All AI models are currently unavailable.");
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Resolve verified, relevant culinary image for any recipe
app.post("/api/recipes/resolve-image", (req, res) => {
  try {
    const { title, titleEn, category, ingredients, instructions } = req.body || {};
    const image = resolveRecipeImage({ title, titleEn, category, ingredients, instructions });
    const archetype = determineCulinaryArchetype({ title, titleEn, category, ingredients, instructions });
    res.json({ success: true, image, archetype });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function selectImageForRecipe(category: string, title: string, ingredients: string[]): string {
  return resolveRecipeImage({ category, title, ingredients });
}

// ==========================================
// REAL DATABASE REST APIS
// ==========================================

// Initial / periodic full synchronization for user state
app.get("/api/user/sync", (req, res) => {
  try {
    const userId = (req.query.userId as string) || "guest_default";
    const syncData = getUserFullSync(userId);
    res.json({
      success: true,
      data: syncData,
      fridgeIngredients: syncData.fridgeIngredients,
      savedRecipes: syncData.savedRecipes,
      preferences: syncData.preferences,
      user: syncData.user,
    });
  } catch (err: any) {
    console.error("Error in /api/user/sync:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update profile name / Google auth status
app.post("/api/user/profile", (req, res) => {
  try {
    const { userId, name, isGoogle, email } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: "userId is required" });
    const user = getOrCreateUser(userId, name, isGoogle, email);
    res.json({ success: true, user });
  } catch (err: any) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update user preferences (language, theme, text size, gender)
app.post("/api/user/preferences", (req, res) => {
  try {
    const { userId, language, theme, textSize, gender } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: "userId is required" });
    saveUserPreferences(userId, { language, theme, textSize, gender });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error saving preferences:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get user's saved refrigerator ingredients
app.get("/api/fridge", (req, res) => {
  try {
    const userId = (req.query.userId as string) || "guest_default";
    const ingredients = getUserFridgeIngredients(userId);
    res.json({ success: true, ingredients });
  } catch (err: any) {
    console.error("Error fetching fridge ingredients:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Persist user's refrigerator ingredients
app.post("/api/fridge", (req, res) => {
  try {
    const { userId, ingredients } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: "userId is required" });
    saveUserFridgeIngredients(userId, Array.isArray(ingredients) ? ingredients : []);
    res.json({ success: true, count: Array.isArray(ingredients) ? ingredients.length : 0 });
  } catch (err: any) {
    console.error("Error saving fridge ingredients:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Record wheel spin session
app.post("/api/wheel/session", (req, res) => {
  try {
    const { userId, category, isIngredientMode, ingredientsUsed } = req.body;
    if (!userId || !category) return res.status(400).json({ success: false, error: "userId and category required" });
    const sessionId = recordWheelSession(
      userId,
      category,
      Boolean(isIngredientMode),
      Array.isArray(ingredientsUsed) ? ingredientsUsed : []
    );
    res.json({ success: true, sessionId });
  } catch (err: any) {
    console.error("Error recording wheel session:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Retrieve user's saved recipes from database
app.get("/api/recipes/saved", (req, res) => {
  try {
    const userId = (req.query.userId as string) || "guest_default";
    const recipes = getSavedRecipesFromDb(userId);
    res.json({ success: true, recipes });
  } catch (err: any) {
    console.error("Error getting saved recipes:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save recipe to favorites in database
app.post("/api/recipes/save", (req, res) => {
  try {
    const { userId, recipe } = req.body;
    if (!userId || !recipe || !recipe.id) {
      return res.status(400).json({ success: false, error: "userId and valid recipe are required" });
    }

    // Ensure image is accurate and not an unassigned placeholder or stale generic woman-in-kitchen photo
    const currentImg = recipe.image || recipe.image_url || "";
    if (!currentImg.trim() || currentImg.includes("1556910103-1c02745aae4d")) {
      const resolved = resolveRecipeImage({
        title: recipe.title,
        titleEn: recipe.titleEn || recipe.title_en,
        category: recipe.category,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
      });
      recipe.image = resolved;
      recipe.image_url = resolved;
    }

    const isPublic = Boolean(req.body.isPublic ?? recipe.is_public ?? recipe.isPublic ?? false);
    saveOrUpdateRecipe(recipe, userId, recipe.source || "saved", recipe.wheelCategory || "", true, isPublic);
    res.json({ success: true, image: recipe.image });
  } catch (err: any) {
    console.error("Error saving recipe:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Retrieve public recipes shared with the community
app.get("/api/recipes/public", (req, res) => {
  try {
    const recipes = getPublicRecipes();
    res.json({ success: true, recipes });
  } catch (err: any) {
    console.error("Error getting public recipes:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Remove recipe from favorites in database
app.post("/api/recipes/unsave", (req, res) => {
  try {
    const { userId, recipeId } = req.body;
    if (!userId || !recipeId) {
      return res.status(400).json({ success: false, error: "userId and recipeId are required" });
    }
    toggleRecipeSavedInDb(recipeId, userId, false);
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error unsaving recipe:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Permanently delete a recipe from database
app.post(["/api/recipes/delete", "/api/recipes/delete-permanently"], (req, res) => {
  try {
    const { userId, recipeId } = req.body;
    if (!userId || !recipeId) {
      return res.status(400).json({ success: false, error: "userId and recipeId are required" });
    }
    deleteRecipePermanently(recipeId, userId);
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting recipe:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get user recipes (created and saved)
app.get("/api/recipes/user", (req, res) => {
  try {
    const userId = (req.query.userId as string) || "guest_default";
    const recipes = getUserRecipes(userId);
    res.json({ success: true, recipes });
  } catch (err: any) {
    console.error("Error getting user recipes:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Chat conversation history from database
app.get("/api/chat/history", (req, res) => {
  try {
    const userId = (req.query.userId as string) || "guest_default";
    const history = getChatHistoryFromDb(userId);
    res.json({ success: true, history });
  } catch (err: any) {
    console.error("Error getting chat history:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1. POST /api/ai/recipe - Byte Recipe Generation for Wheel & Saver
app.post("/api/ai/recipe", async (req, res) => {
  try {
    const { promptType, category, ingredients, language = "ar", userId, useSavedIngredients, gender } = req.body;
    const ai = getGenAI();

    // Resolve ingredients: if not explicitly passed but user asked to use saved ingredients, fetch from database
    let activeIngredients = Array.isArray(ingredients) ? ingredients : [];
    const effectiveUserId = userId || "guest_default";

    let userGender = gender;
    if (!userGender) {
      try {
        const prefs = getUserPreferences(effectiveUserId);
        userGender = prefs?.gender || null;
      } catch (err) {
        // ignore
      }
    }

    if (activeIngredients.length === 0 && (useSavedIngredients || promptType === "wheel")) {
      const dbIngredients = getUserFridgeIngredients(effectiveUserId);
      if (dbIngredients.length > 0 && useSavedIngredients) {
        activeIngredients = dbIngredients;
      }
    }

    let userPrompt = "";
    if (promptType === "wheel") {
      const itemsList = activeIngredients.length > 0 ? activeIngredients.join(", ") : "";
      if (itemsList) {
        userPrompt = `The user spun the Wheel and the selected category is: "${category}".
The user came from Saver mode with these saved refrigerator ingredients: [${itemsList}].

CRITICAL RECIPE LOGIC:
1. The generated recipe MUST actually use the user's saved ingredients appropriate for the selected Wheel category "${category}".
2. Intelligently decide which saved ingredients from [${itemsList}] are appropriate for this dish:
   - You do NOT need to use every saved ingredient. Use some or most of them when appropriate.
   - Do NOT force unrelated ingredients into the recipe just because they are available.
3. If additional ingredients, spices, or pantry staples are needed, clearly distinguish between what is already in the refrigerator vs what needs to be bought:
   - For an ingredient that comes from the user's saved refrigerator ingredients, prefix the item with: "(موجود عندك)" in Arabic, or "(In your fridge)" in English.
   - For any additional ingredients, spices, or essentials needed, prefix the item with: "(تحتاج تشتريه)" in Arabic, or "(Need to buy)" in English.
   Example:
   - "(موجود عندك) 2 صدور دجاج مقطعة مكعبات"
   - "(موجود عندك) 1 بصلة مفرومة"
   - "(تحتاج تشتريه) 1 ملعقة صغيرة بهار كاري"
4. The goal is: Wheel result ("${category}") + user's saved ingredients → intelligent, mouthwatering, cohesive recipe. Repeated spins must explore fresh, distinct culinary variations (different cooking styles, aromatics, or presentations). Seed: ${Date.now()}`;
      } else {
        userPrompt = `User made a spin on the Wheel and picked the category: "${category}".
Generate an inventive, mouthwatering, and practical culinary recipe fitting this category.
Variety Directive: Repeated spins should produce different delicious ideas (varying main ingredients, spices, or cooking methods) instead of unnecessarily repeating the same recipe. Seed: ${Date.now()}`;
      }
    } else if (promptType === "saver") {
      const itemsList = Array.isArray(ingredients) && ingredients.length > 0 ? ingredients.join(", ") : "مكونات أساسية";
      userPrompt = `User opened their refrigerator in Fridge Saver mode and has these available ingredients: [${itemsList}].
Analyze these exact available ingredients and craft a delicious, harmonious recipe utilizing as many of these ingredients as reasonably possible (plus standard basic pantry essentials like salt, oil, water, basic spices). Do not ignore the provided ingredients. Avoid repetition and be creative! Seed: ${Date.now()}`;
    } else {
      userPrompt = `Create a creative, delightful recipe for: ${category || "وجبة لذيذة وصحية"}.`;
    }

    // Recipe Intelligence: inject user's own saved recipes into the prompt
    try {
      const allUserRecipes = getUserRecipes(effectiveUserId);
      const userKitchenRecipes = allUserRecipes.filter((r: any) => r.source === "user" || r.isSaved);
      if (userKitchenRecipes.length > 0) {
        const userSummary = userKitchenRecipes
          .slice(0, 5)
          .map((r) => `- "${r.title}" (مكوناتها: ${Array.isArray(r.ingredients) ? r.ingredients.join(", ") : ""})`)
          .join("\n");
        userPrompt += `\n\nUSER'S OWN SAVED RECIPES IN THEIR PRIVATE KITCHEN:
${userSummary}
CRITICAL RECIPE INTELLIGENCE:
- Byte must be aware of the user's own saved recipes.
- If the user provides ingredients, check if the user's own recipes can be made with those ingredients before inventing a new one!
- If the request or ingredients match or are similar to one of their saved recipes, prioritize or adapt the user's version.
- Byte must NEVER contradict the user's saved recipes.`;
      }
    } catch (err) {
      console.error("Error adding user recipes to recipe prompt:", err);
    }

    let genderInstruction = "";
    if (userGender === "male") {
      genderInstruction = `
- USER GENDER PREFERENCE: MALE (ذكر). When speaking Arabic (especially in 'aiTip'), address the user using masculine Arabic wording (e.g. 'أهلاً بك', 'ضيفنا', 'تفضل', 'عوافي عليك', 'وصفتك'). Never use feminine verb endings or pronouns.`;
    } else if (userGender === "female") {
      genderInstruction = `
- USER GENDER PREFERENCE: FEMALE (أنثى). When speaking Arabic (especially in 'aiTip'), address the user using feminine Arabic wording (e.g. 'أهلاً بكِ', 'ضيفتنا', 'تفضلي', 'عوافي عليكِ', 'وصفتكِ'). Never use masculine verb endings or pronouns.`;
    } else {
      genderInstruction = `
- USER GENDER PREFERENCE: NOT SPECIFIED (غير محدد). Avoid assuming masculine or feminine wording; keep phrasing welcoming and neutral.`;
    }

    const systemInstruction = `You are 'Byte' (بايت), the friendly, culinary genius AI assistant for ByteBites.
Byte's personality in Arabic: Warm, inviting, natural Saudi culinary phrasing (e.g. 'حي الله', 'عوافي', 'خلّ النار هادية', 'ولا أسهل').
Your task is to generate complete, highly appealing, structured recipe details.
Language rules:
- If language is 'ar': All values (title, time, calories, difficulty, servings, category, ingredients, instructions, aiTip) must be fully and naturally written in Arabic (like '30 دقيقة', '400 سعرة', 'سهل', '4 أشخاص', 'غداء رئيسي').
- If language is 'en': All values should be in English (e.g. '30 mins', '400 kcal', 'Easy', '4 servings', 'Main Course').
- In 'ingredients', include clear practical quantities for each ingredient (e.g., '2 صدور دجاج مقطعة مكعبات', '1 بصلة مفرومة', '2 ملعقة كبيرة زيت زيتون').
- In 'instructions', provide 3 to 5 clear sequential steps.
- In 'aiTip', provide Byte's signature expert chef cooking tip/hack ('نصيحة من بايت') tailored specifically to this exact dish.
- Provide realistic estimates for protein, carbs, fat, calories, and time.
- Output strictly in valid JSON matching the schema.${genderInstruction}`;

    const response = await generateWithFallback(ai, {
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.85,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Recipe title in Arabic" },
            titleEn: { type: Type.STRING, description: "Recipe title in English" },
            time: { type: Type.STRING, description: "Cooking time (e.g. 35 دقيقة)" },
            timeEn: { type: Type.STRING, description: "Cooking time in English (e.g. 35 mins)" },
            calories: { type: Type.STRING, description: "Calories (e.g. 380 سعرة)" },
            caloriesEn: { type: Type.STRING, description: "Calories in English (e.g. 380 kcal)" },
            difficulty: { type: Type.STRING, description: "Difficulty level in Arabic (e.g. سهل)" },
            difficultyEn: { type: Type.STRING, description: "Difficulty level in English (e.g. Easy)" },
            servings: { type: Type.STRING, description: "Servings in Arabic (e.g. 3 أشخاص)" },
            servingsEn: { type: Type.STRING, description: "Servings in English (e.g. 3 servings)" },
            category: { type: Type.STRING, description: "Category in Arabic" },
            categoryEn: { type: Type.STRING, description: "Category in English" },
            protein: { type: Type.STRING, description: "Protein content e.g. 35g" },
            carbs: { type: Type.STRING, description: "Carbs content e.g. 20g" },
            fat: { type: Type.STRING, description: "Fat content e.g. 12g" },
            ingredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of ingredients with quantities in Arabic",
            },
            ingredientsEn: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of ingredients with quantities in English",
            },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Preparation steps in Arabic",
            },
            instructionsEn: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Preparation steps in English",
            },
            aiTip: { type: Type.STRING, description: "Byte's special cooking tip in Arabic" },
            aiTipEn: { type: Type.STRING, description: "Byte's special cooking tip in English" },
          },
          required: [
            "title",
            "titleEn",
            "time",
            "calories",
            "difficulty",
            "servings",
            "category",
            "ingredients",
            "instructions",
            "aiTip",
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    const recipeId = `byte-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const image = selectImageForRecipe(
      parsedData.category || category || "",
      parsedData.title || "",
      parsedData.ingredients || []
    );

    const recipe = {
      id: recipeId,
      title: parsedData.title || (language === "ar" ? "وصفة مبتكرة من بايت" : "Byte Custom Recipe"),
      titleEn: parsedData.titleEn || parsedData.title || "Byte Custom Recipe",
      image,
      rating: 4.9,
      time: parsedData.time || (language === "ar" ? "30 دقيقة" : "30 mins"),
      timeEn: parsedData.timeEn || parsedData.time || "30 mins",
      calories: (promptType === "saver" || promptType === "wheel") ? "" : (parsedData.calories || ""),
      caloriesEn: (promptType === "saver" || promptType === "wheel") ? "" : (parsedData.caloriesEn || ""),
      difficulty: parsedData.difficulty || (language === "ar" ? "سهل" : "Easy"),
      difficultyEn: parsedData.difficultyEn || parsedData.difficulty || "Easy",
      servings: parsedData.servings || (language === "ar" ? "4 أشخاص" : "4 servings"),
      servingsEn: parsedData.servingsEn || parsedData.servings || "4 servings",
      category: parsedData.category || category || (language === "ar" ? "ابتكار بايت" : "Byte Creation"),
      categoryEn: parsedData.categoryEn || parsedData.category || "Byte Creation",
      protein: (promptType === "saver" || promptType === "wheel") ? "" : (parsedData.protein || ""),
      carbs: (promptType === "saver" || promptType === "wheel") ? "" : (parsedData.carbs || ""),
      fat: (promptType === "saver" || promptType === "wheel") ? "" : (parsedData.fat || ""),
      ingredients: Array.isArray(parsedData.ingredients) && parsedData.ingredients.length > 0
        ? parsedData.ingredients
        : [language === "ar" ? "مكونات طازجة حسب المتوفر" : "Fresh ingredients as available"],
      ingredientsEn: Array.isArray(parsedData.ingredientsEn) && parsedData.ingredientsEn.length > 0
        ? parsedData.ingredientsEn
        : parsedData.ingredients,
      instructions: Array.isArray(parsedData.instructions) && parsedData.instructions.length > 0
        ? parsedData.instructions
        : [language === "ar" ? "تحضير المكونات وطهيها على نار هادئة حتى النضج." : "Prep ingredients and cook on gentle heat until done."],
      instructionsEn: Array.isArray(parsedData.instructionsEn) && parsedData.instructionsEn.length > 0
        ? parsedData.instructionsEn
        : parsedData.instructions,
      aiTip: parsedData.aiTip || (language === "ar" ? "اضبط النار بهدوء لتتجانس النكهات وتكتسب الوصفة طعماً رائعاً!" : "Simmer gently to blend all aromas beautifully!"),
      aiTipEn: parsedData.aiTipEn || parsedData.aiTip || "Simmer gently to blend all aromas beautifully!",
      source: promptType || "ai",
    };

    // Save recipe to real database
    try {
      saveOrUpdateRecipe(recipe, effectiveUserId, promptType, category || "", false);
      if (promptType === "wheel") {
        recordWheelSession(
          effectiveUserId,
          category || "وجبة متنوعة",
          activeIngredients.length > 0,
          activeIngredients
        );
      }
    } catch (dbErr) {
      console.error("Database save warning during recipe generation:", dbErr);
    }

    res.json({ success: true, recipe });
  } catch (error: any) {
    console.error("Error generating recipe with Byte AI, activating intelligent culinary fallback:", error);
    try {
      const { promptType, category, ingredients, language = "ar", userId } = req.body || {};
      const effectiveUserId = userId || "guest_default";
      const isAr = language !== "en";
      const cat = category || (isAr ? "وجبة مميزة" : "Featured Dish");
      const activeIngs = Array.isArray(ingredients) && ingredients.length > 0
        ? ingredients
        : (isAr ? ["دجاج طازج", "أرز بسمتي", "بصل وثوم", "بهارات مشكلة", "زيت زيتون"] : ["Fresh chicken", "Basmati rice", "Onion and garlic", "Mixed spices", "Olive oil"]);

      const titleAr = `طبق بايت الشهي (${cat})`;
      const titleEn = `Byte's Special ${cat}`;
      const image = selectImageForRecipe(cat, titleAr, activeIngs);

      const fallbackRecipe = {
        id: `byte-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: isAr ? titleAr : titleEn,
        titleEn,
        image,
        rating: 4.9,
        time: isAr ? "30 دقيقة" : "30 mins",
        timeEn: "30 mins",
        calories: "",
        caloriesEn: "",
        difficulty: isAr ? "سهل" : "Easy",
        difficultyEn: "Easy",
        servings: isAr ? "4 أشخاص" : "4 servings",
        servingsEn: "4 servings",
        category: cat,
        categoryEn: cat,
        protein: "",
        carbs: "",
        fat: "",
        ingredients: activeIngs.map((ing: string) => (isAr ? `${ing} (حسب الرغبة)` : `${ing} (to taste)`)),
        ingredientsEn: activeIngs.map((ing: string) => `${ing} (to taste)`),
        instructions: isAr
          ? [
              "تجهيز وتقطيع المكونات وتتبيلها بالبهارات وزيت الزيتون.",
              "تشويح البصل والثوم في قدر على نار متوسطة حتى تظهر الرائحة الزكية.",
              "إضافة باقي المكونات والتقليب بلطف حتى تتجانس النكهات.",
              "ترك الطبخة على نار هادئة حتى تمام النضج، ثم تقديمها ساخنة وبالعافية!",
            ]
          : [
              "Prep and season the ingredients with spices and olive oil.",
              "Sauté aromatics in a pan over medium heat until fragrant.",
              "Add the remaining ingredients and simmer gently until fully cooked.",
              "Garnish and serve hot. Enjoy your meal!",
            ],
        instructionsEn: [
          "Prep and season the ingredients with spices and olive oil.",
          "Sauté aromatics in a pan over medium heat until fragrant.",
          "Add the remaining ingredients and simmer gently until fully cooked.",
          "Garnish and serve hot. Enjoy your meal!",
        ],
        aiTip: isAr
          ? "نصيحة بايت: اترك الطبق يرتاح لمدة 5 دقائق بعد الطهي لتتشرب كل النكهات بشكل رائع!"
          : "Byte's tip: Let the dish rest for 5 minutes after cooking so all flavors meld beautifully!",
        aiTipEn: "Byte's tip: Let the dish rest for 5 minutes after cooking so all flavors meld beautifully!",
        source: promptType || "ai",
      };

      try {
        saveOrUpdateRecipe(fallbackRecipe, effectiveUserId, promptType, category || "", false);
      } catch (dbErr) {
        console.error("Database save warning for fallback recipe:", dbErr);
      }

      res.json({ success: true, recipe: fallbackRecipe, isFallback: true });
    } catch (fallbackErr: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate recipe. Please try again.",
      });
    }
  }
});

// 2. POST /api/ai/chat - Multi-turn Interactive Chat with Byte
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages, language = "ar", userId, gender } = req.body;
    const ai = getGenAI();

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: "Messages array is required." });
    }

    const effectiveUserId = userId || "guest_default";
    let userGender = gender;
    if (!userGender) {
      try {
        const prefs = getUserPreferences(effectiveUserId);
        userGender = prefs?.gender || null;
      } catch (err) {
        // ignore
      }
    }
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.role === "user") {
      try {
        saveChatMessageInDb(effectiveUserId, "user", lastUserMessage.content);
      } catch (err) {
        console.error("DB chat save error:", err);
      }
    }

    // Recipe Intelligence: fetch user's saved kitchen recipes
    let userKitchenRecipes: any[] = [];
    let publicCommunityRecipes: any[] = [];
    try {
      const allUserRecipes = getUserRecipes(effectiveUserId);
      userKitchenRecipes = allUserRecipes.filter((r: any) => r.source === "user" || r.isSaved);
      publicCommunityRecipes = getPublicRecipes().filter((r: any) => r.userId && r.userId !== effectiveUserId);
    } catch (e) {
      console.error("Error fetching user or public recipes for chat context:", e);
    }

    const kitchenSummary = userKitchenRecipes.length > 0
      ? userKitchenRecipes.slice(0, 8).map((r) => `- "${r.title}" (${r.isPublic ? "عامة/مشاركة" : "خاصة"}) (المكونات: ${Array.isArray(r.ingredients) ? r.ingredients.join(", ") : ""})`).join("\n")
      : (language === "ar" ? "لا توجد وصفات مسبقة في المطبخ الخاص بعد." : "No saved recipes in private kitchen yet.");

    const publicSummary = publicCommunityRecipes.length > 0
      ? publicCommunityRecipes.slice(0, 5).map((r) => `- "${r.title}" (المكونات: ${Array.isArray(r.ingredients) ? r.ingredients.join(", ") : ""})`).join("\n")
      : (language === "ar" ? "لا توجد وصفات عامة أخرى في المجتمع حالياً." : "No public community recipes available yet.");

    const systemInstruction = `You are 'Byte' (بايت), the warm, enthusiastic, and expert culinary and nutrition AI assistant inside ByteBites.
Key instructions:
1. Your identity is 'Byte' (بايت). Never refer to yourself as anything else.
2. You have profound expertise in world cuisines, Gulf/Arabic cooking, meal prep, healthy substitutions, diet advice, and creative pantry combinations.
3. BYTE RECIPE INTELLIGENCE — RESPECT USER-CREATED RECIPES:
   - You are aware of the user's saved recipes in their Private Kitchen ("مطبخك الخاص"):
${kitchenSummary}
   - PUBLIC COMMUNITY RECIPES (Shared by ByteBites community members):
${publicSummary}
   - If the user asks for a recipe that matches or is similar to one of their own saved recipes, prioritize or adapt the user's version.
   - You must NEVER contradict the user's saved recipes.
   - If the user provides ingredients in chat, check if the user's own recipes can be made with those ingredients before inventing a new one.
   - You may suggest public community recipes to inspire the user when relevant, accurately crediting them. Never expose other users' private recipes.
4. CHAT INTEGRATION — ADD RECIPE VIA CONVERSATION WITH BYTE:
   - Byte must understand when a user is describing or sharing a recipe in the chat and offer to save it as their own recipe.
   - If the user shares recipe details in chat:
     * Intelligently extract:
       1) Recipe name (اسم الوصفة)
       2) Ingredients (المكونات بالكميات)
       3) Preparation method (طريقة التحضير)
       4) Servings (عدد الأشخاص)
       5) Time (وقت الطهي/التحضير)
     * If any of these required details is missing, ask for it naturally and politely in the conversation.
     * Once complete with all required information, confirm with the user before saving:
       "هل ترغب في حفظ هذه الوصفة في مطبخك الخاص؟"
       (or in English: "Would you like to save this recipe in your Private Kitchen?")
     * If the user agrees (e.g., says "نعم", "احفظها", "أكيد", "حفظ", "تم", "yes", "save it"):
       Acknowledge and include the exact confirmation:
       "تم حفظ الوصفة"
       and celebrate saving it to their private kitchen!
5. CRITICAL NUTRITIONAL CALCULATION RULES:
   - Base all nutritional estimates on authoritative USDA reference composition per 100g and calculate portions with exact math: (Nutrient per 100g * portion in grams) / 100.
   - Plain meats, poultry, and fish contain 0g carbohydrates (e.g., plain chicken breast has 0g carbs; cooked chicken breast per 100g has ~31g protein, so 30g cooked chicken breast has 9.3g protein).
   - Distinguish raw vs cooked states accurately. If the user does not specify whether a meat/grain portion is raw or cooked and it materially changes the calculation, ask them politely (e.g., "هل وزن الدجاج 30 جرام قبل الطبخ أو بعد الطبخ؟" in Arabic or "Is the 30g chicken weight raw or cooked?" in English).
   - For complete recipes, calculate ingredient by ingredient and sum them mathematically.
6. Understand and reply fluently in Arabic (including colloquial Saudi and Gulf phrasing) and English.
7. If user speaks in Arabic or current language is 'ar', reply in natural, friendly Arabic with cheerful culinary emoji (🍳, 🥦, 👨‍🍳, ✨).
8. If user speaks in English or current language is 'en', reply in English.
9. Crucially maintain full conversational context. When users say follow-ups, update or modify the recipe/guidance based on the prior turns.
10. Keep responses helpful, structured, concise, and inspiring.
11. GENDER PREFERENCE & DIRECT-ADDRESS DIRECTIVE:${
      userGender === "male"
        ? "\n    - The user has chosen MALE (ذكر). In Arabic, you MUST strictly address the user using masculine Arabic wording and grammar (e.g. 'أهلاً بك', 'ضيفنا', 'تفضل', 'ترغب', 'تقدر', 'عوافي عليك', 'وصفتك'). Never use feminine verb endings or pronouns for the user."
        : userGender === "female"
        ? "\n    - The user has chosen FEMALE (أنثى). In Arabic, you MUST strictly address the user using feminine Arabic wording and grammar (e.g. 'أهلاً بكِ', 'ضيفتنا', 'تفضلي', 'ترغبين', 'تقدرين', 'عوافي عليكِ', 'وصفتكِ'). Never use masculine verb endings or pronouns for the user."
        : "\n    - Gender preference is NOT SPECIFIED (غير محدد). Avoid assuming masculine or feminine wording whenever possible; keep phrasing welcoming, courteous, and neutral (e.g. 'أهلاً بك', 'ضيفنا العزيز', 'يسعدنا مساعدتك')."
    }`;

    // Map messages to Gemini contents format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content || "" }],
    }));

    // Check if user is requesting to save or confirming a save
    const userText = lastUserMessage?.content || "";
    const prevModelMessage = messages.length >= 2 ? messages[messages.length - 2]?.content || "" : "";
    const isSaveIntent =
      /احفظ|حفظ|سجل|خزن|save|store|keep/i.test(userText) ||
      ((prevModelMessage.includes("مطبخك الخاص") || prevModelMessage.includes("حفظ") || prevModelMessage.includes("Private Kitchen") || prevModelMessage.includes("save")) &&
       /نعم|أكيد|أجل|بالتأكيد|تم|تمام|اوكي|أوكي|yes|sure|please|ok/i.test(userText));

    let replyText = "";
    let savedRecipe: any = null;

    if (isSaveIntent) {
      try {
        const fullConvText = messages.map((m: any) => `${m.role}: ${m.content}`).join("\n");
        const extractResp = await generateWithFallback(ai, {
          contents: `You are an accurate culinary assistant. Analyze this conversation history between user and AI:
${fullConvText}

The user wants to save a recipe to their personal "Private Kitchen".
Check if all 5 required pieces of information are present in the conversation:
1. title: Recipe name
2. ingredients: List of ingredients with quantities (array of strings, minimum 1 item)
3. instructions: Cooking / preparation steps (array of strings, minimum 1 step)
4. servings: Number of servings / persons (e.g. "4 أشخاص" or "4 servings")
5. time: Cooking / preparation time (e.g. "30 دقيقة" or "30 mins")

If any of the 5 fields are missing or not provided, list them in "missingFields" (valid values: "title", "ingredients", "instructions", "servings", "time").
If all 5 are present and clear, "missingFields" MUST be empty [].
Output JSON only.`,
          config: {
            systemInstruction: "You extract recipe data from a conversation. Identify present fields and missing fields strictly. Output valid JSON only.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                titleEn: { type: Type.STRING },
                time: { type: Type.STRING },
                servings: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingFields: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
          },
        });

        const parsed = JSON.parse(extractResp.text || "{}");
        const title = (parsed.title || "").trim();
        const ingredients = Array.isArray(parsed.ingredients) ? parsed.ingredients.filter(Boolean) : [];
        const instructions = Array.isArray(parsed.instructions) ? parsed.instructions.filter(Boolean) : [];
        const servings = (parsed.servings || "").trim();
        const time = (parsed.time || "").trim();

        // Calculate missing fields
        const missing: string[] = [];
        if (!title) missing.push("title");
        if (ingredients.length === 0) missing.push("ingredients");
        if (instructions.length === 0) missing.push("instructions");
        if (!servings) missing.push("servings");
        if (!time) missing.push("time");

        if (missing.length > 0) {
          // Required details missing: Ask user for them politely and DO NOT claim saved!
          const missingLabelsAr = missing.map((f) => {
            if (f === "title") return "اسم الوصفة";
            if (f === "ingredients") return "المكونات بالتفصيل";
            if (f === "instructions") return "طريقة التحضير والخطوات";
            if (f === "servings") return "عدد الحصص أو الأشخاص (مثلاً: 4 أشخاص)";
            if (f === "time") return "وقت الطهي أو التحضير (مثلاً: 30 دقيقة)";
            return f;
          });
          const missingLabelsEn = missing.map((f) => {
            if (f === "title") return "Recipe title";
            if (f === "ingredients") return "Detailed ingredients";
            if (f === "instructions") return "Preparation steps";
            if (f === "servings") return "Number of servings";
            if (f === "time") return "Cooking time";
            return f;
          });

          replyText = language === "ar"
            ? `يسعدني حفظ الوصفة في مطبخك الخاص! 🍳\n\nلكي نحفظها بشكل متكامل، هل يمكنك تزويدي بالتفاصيل التالية:\n${missingLabelsAr.map((m) => `• ${m}`).join("\n")}\n\nوبمجرد تزويدي بها، سأقوم فوراً بحفظها في مطبخك الخاص! ✨`
            : `I would be happy to save this recipe in your Private Kitchen! 🍳\n\nTo ensure it is complete, could you please provide:\n${missingLabelsEn.map((m) => `• ${m}`).join("\n")}\n\nOnce provided, I will immediately save it to your kitchen! ✨`;
          savedRecipe = null;
        } else {
          // All 5 fields present: create recipe and save to database
          const recipeId = `user_rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const image = selectImageForRecipe("طبخ منزلي", title, ingredients);
          const recipeToSave = {
            id: recipeId,
            userId: effectiveUserId,
            title,
            titleEn: parsed.titleEn || title,
            image,
            rating: 5.0,
            time,
            timeEn: parsed.time || time,
            calories: "450",
            caloriesEn: "450 kcal",
            difficulty: language === "ar" ? "سهل" : "Easy",
            difficultyEn: "Easy",
            servings,
            servingsEn: parsed.servings || servings,
            category: language === "ar" ? "مطبخك الخاص" : "Private Kitchen",
            categoryEn: "Private Kitchen",
            protein: "",
            carbs: "",
            fat: "",
            ingredients,
            ingredientsEn: parsed.ingredientsEn || ingredients,
            instructions,
            instructionsEn: parsed.instructionsEn || instructions,
            aiTip: language === "ar" ? "وصفتك الخاصة والمميزة من إبداعك ومطبخك الخاص!" : "Your special private kitchen recipe!",
            aiTipEn: "Your special private kitchen recipe!",
            source: "user",
            isPublic: false,
            authorName: "المستخدم",
            createdAt: new Date().toISOString(),
          };

          try {
            saveOrUpdateRecipe(recipeToSave, effectiveUserId, "user", "", true, false);
            savedRecipe = recipeToSave;
            replyText = language === "ar"
              ? `تم حفظ الوصفة في مطبخك الخاص بنجاح! 🍳✨\n\n📌 **${recipeToSave.title}**\n⏱️ وقت الطهي: ${recipeToSave.time}\n👥 الحصص: ${recipeToSave.servings}\n\nالوصفة مسجلة ومحفوظة الآن في "مطبخك الخاص" وستجدها دائماً حتى بعد تسجيل الخروج أو إعادة فتح التطبيق!`
              : `The recipe has been successfully saved to your Private Kitchen! 🍳✨\n\n📌 **${recipeToSave.title}**\n⏱️ Time: ${recipeToSave.time}\n👥 Servings: ${recipeToSave.servings}\n\nIt is now saved in "My Kitchen" and ready for you anytime!`;
          } catch (dbErr: any) {
            console.error("Database save failed in chat:", dbErr);
            savedRecipe = null;
            replyText = language === "ar"
              ? "عذراً، حدث خطأ أثناء حفظ الوصفة في قاعدة البيانات ولم يتم حفظها. يرجى المحاولة مرة أخرى."
              : "Sorry, an error occurred while saving the recipe to the database and it was not saved. Please try again.";
          }
        }
      } catch (extractErr) {
        console.error("Error evaluating recipe save intent:", extractErr);
      }
    }

    // If not a save intent or save intent didn't produce a reply, generate normal conversational response
    if (!replyText) {
      const response = await generateWithFallback(ai, {
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      replyText = response.text || (language === "ar" ? "أهلاً بك! أنا بايت، كيف أقدر أساعدك اليوم في مطبخك؟" : "Hello! I am Byte, how can I assist you in your kitchen today?");
    }

    try {
      saveChatMessageInDb(effectiveUserId, "model", replyText);
    } catch (err) {
      console.error("DB chat save model error:", err);
    }

    res.json({
      success: true,
      reply: replyText,
      savedRecipe,
    });
  } catch (error: any) {
    console.error("Error in Byte AI Chat:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process chat message. Please try again.",
    });
  }
});

// 3. POST /api/ai/diet - Smart Nutritional Breakdown
app.post("/api/ai/diet", async (req, res) => {
  try {
    const { mealName, portionWeight, dietType = "balanced", language = "ar", userId } = req.body;
    
    // Step 1: Check authoritative deterministic database calculation first
    const directResult = calculateNutritionDeterministically(
      mealName || "",
      portionWeight || 100,
      language as "ar" | "en"
    );

    if (directResult) {
      if (userId) {
        try {
          saveDietLogInDb(userId, {
            mealName,
            portionWeight,
            calories: directResult.calories,
            protein: directResult.protein,
            carbs: directResult.carbs,
            fat: directResult.fat,
            sugar: directResult.sugar,
            sodium: directResult.sodium,
          });
        } catch (dbErr) {
          console.error("Error logging diet calc:", dbErr);
        }
      }
      return res.json({
        success: true,
        metrics: {
          calories: directResult.calories,
          protein: directResult.protein,
          carbs: directResult.carbs,
          fat: directResult.fat,
          sugar: directResult.sugar,
          sodium: directResult.sodium,
        },
        analysis: {
          calories: directResult.calories,
          protein: directResult.protein,
          carbs: directResult.carbs,
          fat: directResult.fat,
          sugar: directResult.sugar,
          sodium: directResult.sodium,
          matchedFood: directResult.matchedFood,
          note: directResult.note || directResult.clarificationPrompt,
        },
      });
    }

    // Step 2: If custom/unlisted dish, query AI with strict mathematical and biochemical rules
    const ai = getGenAI();

    const systemInstruction = `You are Byte's Authoritative Nutritional Analyst.
CRITICAL NUTRITIONAL RULES:
1. Pure unbreaded meats, poultry (chicken, turkey), and fish (salmon, tuna, white fish) naturally contain approximately 0.0g of carbohydrates and 0.0g sugar. NEVER hallucinate carbohydrates for plain chicken, meat, or fish.
2. Calculate mathematically based on USDA standard reference values per 100g multiplied by (portion in grams / 100).
   Formula: Nutrient for portion = (Nutrient per 100g) * (portion in grams) / 100.
3. Distinguish raw vs cooked states accurately. Cooking concentrates protein and calories due to water loss.
4. If the food is plain chicken breast:
   - Cooked chicken breast per 100g has ~31g protein, 0g carbs, 3.6g fat, 165 kcal.
   - For 30g cooked chicken breast, protein MUST BE approximately 9.3g (31 * 30 / 100) and carbs MUST BE 0.0g.
5. Return strictly valid JSON with numerical values formatted as strings with 1 decimal place.`;

    const prompt = `Calculate exact portion nutrition for:
Food item: "${mealName}"
Portion Weight: ${portionWeight} grams
Language: ${language}

Apply the exact formula: Nutrient = (Nutrient_per_100g * ${portionWeight}) / 100.
Ensure 0.0g carbs for plain meat/poultry/fish. Return 1 decimal place.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.STRING },
            protein: { type: Type.STRING },
            carbs: { type: Type.STRING },
            fat: { type: Type.STRING },
            sugar: { type: Type.STRING },
            sodium: { type: Type.STRING },
          },
          required: ["calories", "protein", "carbs", "fat", "sugar", "sodium"],
        },
      },
    });

    const rawMetrics = JSON.parse(response.text || "{}");
    
    // Step 3: Mathematical Post-Validation & Sanitization
    let validatedCarbs = parseFloat(rawMetrics.carbs || "0");
    let validatedSugar = parseFloat(rawMetrics.sugar || "0");
    const lowerName = (mealName || "").toLowerCase();

    // Enforce 0.0g carbs for plain meat/chicken/fish
    const isPureMeat = /دجاج|صدر|لحم|ستيك|سلمون|تونة|سمك|chicken|beef|steak|salmon|tuna|turkey/i.test(lowerName) &&
      !/بروستد|مقلي|بقسماط|ناجتس|خبز|أرز|رز|fried|breaded|nugget|pasta|rice|sauce|sweet/i.test(lowerName);

    if (isPureMeat) {
      validatedCarbs = 0.0;
      validatedSugar = 0.0;
    }

    const sanitizedMetrics = {
      calories: (parseFloat(rawMetrics.calories || "0") || 0).toFixed(1),
      protein: (parseFloat(rawMetrics.protein || "0") || 0).toFixed(1),
      carbs: validatedCarbs.toFixed(1),
      fat: (parseFloat(rawMetrics.fat || "0") || 0).toFixed(1),
      sugar: validatedSugar.toFixed(1),
      sodium: (parseFloat(rawMetrics.sodium || "0") || 0).toFixed(1),
    };

    if (userId) {
      try {
        saveDietLogInDb(userId, {
          mealName,
          portionWeight,
          ...sanitizedMetrics,
        });
      } catch (dbErr) {
        console.error("Error logging AI diet calculation:", dbErr);
      }
    }

    res.json({
      success: true,
      metrics: sanitizedMetrics,
      analysis: sanitizedMetrics,
    });
  } catch (error: any) {
    console.error("Error calculating diet metrics:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. POST /api/ai/tip - Dynamic context-aware culinary tip from Byte
app.post("/api/ai/tip", async (req, res) => {
  try {
    const { recipeTitle, ingredients, language = "ar" } = req.body;
    const ai = getGenAI();

    const prompt = `You are 'Byte' (بايت), the AI culinary genius of ByteBites.
Give a fresh, clever, highly actionable, expert chef cooking or nutritional tip for this meal: "${recipeTitle}".
Ingredients: ${Array.isArray(ingredients) ? ingredients.join(", ") : recipeTitle}.
Language: ${language}.
Keep it warm, encouraging, concise (1 to 2 sentences max).
If Arabic, use natural, authentic Saudi culinary phrasing (e.g. 'حي الله', 'عوافي', 'نصيحة بايت لك').
Return just the raw tip text without surrounding quotes.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
    });

    const tip = response.text?.trim().replace(/^["']|["']$/g, "") || (language === "ar" ? "خلّ النار هادية حتى تتجانس النكهات وتستمتع بألذ طعم!" : "Simmer gently so the flavors meld together beautifully!");
    res.json({ success: true, tip });
  } catch (error: any) {
    console.error("Error generating dynamic tip from Byte:", error);
    res.json({
      success: true,
      tip: req.body.language === "en" ? "Cook with passion and let the natural aromas develop!" : "اضبط بهاراتك بحب وخلّ الطبخ على مهله وعوافي مقدماً!"
    });
  }
});

// Explicit JSON 404 boundary for all API routes (prevents fallthrough to SPA HTML)
app.all("/api/*", (req, res) => {
  res.status(404).json({ success: false, error: `API route not found: ${req.method} ${req.path}` });
});

// Explicit error handler for /api/* routes to always guarantee JSON
app.use("/api/*", (err: any, req: any, res: any, next: any) => {
  console.error(`Unhandled error on ${req.method} ${req.path}:`, err);
  if (res.headersSent) return next(err);
  res.status(500).json({ success: false, error: err?.message || "Internal server error" });
});

// Vite middleware & Static serving setup
async function setupApp() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`ByteBites Server running on http://0.0.0.0:${PORT}`);
  });
}

setupApp();
