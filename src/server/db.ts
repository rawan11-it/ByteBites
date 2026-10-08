import fs from 'fs';
import path from 'path';
// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import { resolveRecipeImage } from '../utils/recipeImageEngine';

// Ensure data folder exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'bytebites.db');

let dbInstance: any = null;

export function getDatabase(): any {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    initializeTables(dbInstance);
  }
  return dbInstance;
}

function initializeTables(db: any) {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      is_google INTEGER DEFAULT 0,
      email TEXT,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  // User preferences table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id TEXT PRIMARY KEY,
      language TEXT DEFAULT 'ar',
      theme TEXT DEFAULT 'dark',
      text_size TEXT DEFAULT 'normal',
      gender TEXT DEFAULT NULL,
      updated_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Migration for user_preferences gender column
  try {
    const prefCols = db.prepare(`PRAGMA table_info(user_preferences)`).all();
    const hasGender = prefCols.some((col: any) => col.name === 'gender');
    if (!hasGender) {
      db.exec(`ALTER TABLE user_preferences ADD COLUMN gender TEXT DEFAULT NULL;`);
    }
  } catch (err) {
    console.warn('Migration warning checking gender on user_preferences:', err);
  }

  // Saved refrigerator ingredients table
  db.exec(`
    CREATE TABLE IF NOT EXISTS fridge_ingredients (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT,
      quantity TEXT,
      created_at TEXT,
      updated_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_fridge_user ON fridge_ingredients(user_id);
  `);

  // Wheel sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS wheel_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      category TEXT,
      is_ingredient_mode INTEGER DEFAULT 0,
      ingredients_used TEXT,
      created_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_wheel_user ON wheel_sessions(user_id);
  `);

  // Recipes table (both generated and saved)
  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT,
      title_en TEXT,
      image TEXT,
      time TEXT,
      time_en TEXT,
      calories TEXT,
      calories_en TEXT,
      difficulty TEXT,
      difficulty_en TEXT,
      servings TEXT,
      servings_en TEXT,
      category TEXT,
      category_en TEXT,
      protein TEXT,
      carbs TEXT,
      fat TEXT,
      ingredients TEXT,
      ingredients_en TEXT,
      instructions TEXT,
      instructions_en TEXT,
      ai_tip TEXT,
      ai_tip_en TEXT,
      source TEXT,
      wheel_category TEXT,
      is_saved INTEGER DEFAULT 0,
      is_public INTEGER DEFAULT 0,
      created_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_recipes_user ON recipes(user_id);
  `);

  // Migration for existing database files: ensure is_public column exists before creating its index
  try {
    const tableInfo = db.prepare(`PRAGMA table_info(recipes)`).all();
    const hasIsPublic = tableInfo.some((col: any) => col.name === 'is_public');
    if (!hasIsPublic) {
      db.exec(`ALTER TABLE recipes ADD COLUMN is_public INTEGER DEFAULT 0;`);
    }
    db.exec(`CREATE INDEX IF NOT EXISTS idx_recipes_public ON recipes(is_public);`);
  } catch (err) {
    console.warn('Migration error checking is_public on recipes:', err);
  }

  // Interactive chat messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      role TEXT,
      content TEXT,
      context TEXT,
      created_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages(user_id);
  `);

  // Smart diet nutrition calculations log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS diet_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      meal_name TEXT,
      portion_weight REAL,
      calories TEXT,
      protein TEXT,
      carbs TEXT,
      fat TEXT,
      sugar TEXT,
      sodium TEXT,
      created_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_diet_user ON diet_logs(user_id);
  `);

  repairExistingRecipeImages(db);
}

function repairExistingRecipeImages(db: any) {
  try {
    const rows = db.prepare('SELECT id, title, title_en, category, ingredients, instructions, image FROM recipes').all();
    const updateStmt = db.prepare('UPDATE recipes SET image = ? WHERE id = ?');
    for (const row of rows) {
      if (!row.title || !row.title.trim()) continue;
      let ing = [];
      try { ing = JSON.parse(row.ingredients || '[]'); } catch { ing = []; }
      let inst = [];
      try { inst = JSON.parse(row.instructions || '[]'); } catch { inst = []; }

      // Check if image is missing, the stock kitchen photo, or the soup image wrongly applied to non-soup recipes
      const shouldRepair = !row.image ||
        row.image.includes('1556910103-1c02745aae4d') ||
        (row.image.includes('AB6AXuAJor7UZs4LeFf9a0v2oUGQNcngvH4XOrIBhI_D8H_ZA1pLsOrconFZAVp5bOFtIvd7bX72HJ7kdIhuIRMtLgx0fMKWp3gSEXK_A4Ou6M3sSWV1wd8BcHGGXPEsluZJzh4V0QQQI1n8QlYgJAU9Pfi_gVpY4J-ncddfRybulHv5kHL-o5satw2LDgPz7NiW2cfUzeUmrnllfKSygtRMn-lJZR3iA4_fuNLsXuJvqiuGwmY63Q1rbbDT') &&
         !row.title.includes('شوربة') && !row.title.includes('soup'));

      if (shouldRepair) {
        const correctImage = resolveRecipeImage({
          title: row.title,
          titleEn: row.title_en,
          category: row.category,
          ingredients: ing,
          instructions: inst
        });
        updateStmt.run(correctImage, row.id);
      }
    }
  } catch (err) {
    console.error('Error repairing recipe images:', err);
  }
}

// User Profile & Preferences
export function getOrCreateUser(userId: string, name = 'ضيف بايت', isGoogle = false, email = '') {
  const db = getDatabase();
  const now = new Date().toISOString();
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!existing) {
    db.prepare(`
      INSERT INTO users (id, name, is_google, email, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, name, isGoogle ? 1 : 0, email, now, now);

    db.prepare(`
      INSERT OR IGNORE INTO user_preferences (user_id, language, theme, text_size, updated_at)
      VALUES (?, 'ar', 'dark', 'normal', ?)
    `).run(userId, now);
  } else if (name || isGoogle !== undefined) {
    db.prepare(`
      UPDATE users SET name = COALESCE(?, name), is_google = ?, email = COALESCE(?, email), updated_at = ?
      WHERE id = ?
    `).run(name, isGoogle ? 1 : 0, email, now, userId);
  }
  return db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
}

export function getUserPreferences(userId: string) {
  const db = getDatabase();
  const pref = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(userId);
  if (!pref) {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT OR IGNORE INTO user_preferences (user_id, language, theme, text_size, gender, updated_at)
      VALUES (?, 'ar', 'dark', 'normal', NULL, ?)
    `).run(userId, now);
    return { language: 'ar', theme: 'dark', text_size: 'normal', gender: null };
  }
  return pref;
}

export function saveUserPreferences(userId: string, prefs: { language?: string; theme?: string; textSize?: string; gender?: string | null }) {
  const db = getDatabase();
  const now = new Date().toISOString();
  getOrCreateUser(userId);
  db.prepare(`
    INSERT INTO user_preferences (user_id, language, theme, text_size, gender, updated_at)
    VALUES (?, COALESCE(?, 'ar'), COALESCE(?, 'dark'), COALESCE(?, 'normal'), ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      language = COALESCE(?, language),
      theme = COALESCE(?, theme),
      text_size = COALESCE(?, text_size),
      gender = COALESCE(?, gender),
      updated_at = ?
  `).run(
    userId,
    prefs.language || null,
    prefs.theme || null,
    prefs.textSize || null,
    prefs.gender !== undefined ? prefs.gender : null,
    now,
    prefs.language || null,
    prefs.theme || null,
    prefs.textSize || null,
    prefs.gender !== undefined ? prefs.gender : null,
    now
  );
}

// Refrigerator Ingredients (Saver)
export function getUserFridgeIngredients(userId: string): string[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT name FROM fridge_ingredients WHERE user_id = ? ORDER BY created_at ASC').all(userId);
  return rows.map((r: any) => r.name);
}

export function saveUserFridgeIngredients(userId: string, ingredients: string[]) {
  const db = getDatabase();
  const now = new Date().toISOString();
  getOrCreateUser(userId);

  // Replace user's ingredients in a transaction-like sequence
  db.prepare('DELETE FROM fridge_ingredients WHERE user_id = ?').run(userId);
  const insertStmt = db.prepare(`
    INSERT INTO fridge_ingredients (id, user_id, name, quantity, created_at, updated_at)
    VALUES (?, ?, ?, '', ?, ?)
  `);

  for (const item of ingredients) {
    if (typeof item === 'string' && item.trim()) {
      const id = `ing_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      insertStmt.run(id, userId, item.trim(), now, now);
    }
  }
}

// Wheel Sessions
export function recordWheelSession(
  userId: string,
  category: string,
  isIngredientMode: boolean,
  ingredientsUsed: string[]
) {
  const db = getDatabase();
  const now = new Date().toISOString();
  const id = `wheel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  getOrCreateUser(userId);
  db.prepare(`
    INSERT INTO wheel_sessions (id, user_id, category, is_ingredient_mode, ingredients_used, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, userId, category, isIngredientMode ? 1 : 0, JSON.stringify(ingredientsUsed || []), now);
  return id;
}

// Recipes (Persisted & Favorites)
export function saveOrUpdateRecipe(
  recipe: any,
  userId: string,
  source = 'saver',
  wheelCategory = '',
  isSaved = false,
  isPublic = false
) {
  const db = getDatabase();
  const now = new Date().toISOString();
  getOrCreateUser(userId);

  const existing = db.prepare('SELECT is_saved, is_public FROM recipes WHERE id = ?').get(recipe.id);
  const finalIsSaved = existing ? (isSaved !== undefined ? (isSaved ? 1 : 0) : existing.is_saved) : (isSaved ? 1 : 0);
  const finalIsPublic = isPublic !== undefined ? (isPublic ? 1 : 0) : (existing ? (existing.is_public ?? 0) : 0);

  const titleVal = recipe.title || recipe.title_ar || '';
  const titleEnVal = recipe.titleEn || recipe.title_en || titleVal;
  const imageVal = recipe.image || recipe.image_url || '';
  const timeVal = recipe.time || '';
  const timeEnVal = recipe.timeEn || recipe.time_en || timeVal;
  const caloriesVal = recipe.calories !== undefined ? String(recipe.calories) : '';
  const caloriesEnVal = recipe.caloriesEn || recipe.calories_en || caloriesVal;
  const difficultyVal = recipe.difficulty || '';
  const difficultyEnVal = recipe.difficultyEn || recipe.difficulty_en || difficultyVal;
  const servingsVal = recipe.servings || recipe.servings_en || '';
  const servingsEnVal = recipe.servingsEn || recipe.servings_en || servingsVal;
  const categoryVal = recipe.category || '';
  const categoryEnVal = recipe.categoryEn || recipe.category_en || categoryVal;
  const aiTipVal = recipe.aiTip || recipe.ai_tip || recipe.description || '';
  const aiTipEnVal = recipe.aiTipEn || recipe.ai_tip_en || recipe.description_en || aiTipVal;

  db.prepare(`
    INSERT INTO recipes (
      id, user_id, title, title_en, image, time, time_en, calories, calories_en,
      difficulty, difficulty_en, servings, servings_en, category, category_en,
      protein, carbs, fat, ingredients, ingredients_en, instructions, instructions_en,
      ai_tip, ai_tip_en, source, wheel_category, is_saved, is_public, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = CASE WHEN excluded.title != '' THEN excluded.title ELSE recipes.title END,
      title_en = CASE WHEN excluded.title_en != '' THEN excluded.title_en ELSE recipes.title_en END,
      image = CASE WHEN excluded.image != '' THEN excluded.image ELSE recipes.image END,
      time = CASE WHEN excluded.time != '' THEN excluded.time ELSE recipes.time END,
      servings = CASE WHEN excluded.servings != '' THEN excluded.servings ELSE recipes.servings END,
      ingredients = CASE WHEN excluded.ingredients != '[]' THEN excluded.ingredients ELSE recipes.ingredients END,
      instructions = CASE WHEN excluded.instructions != '[]' THEN excluded.instructions ELSE recipes.instructions END,
      is_saved = excluded.is_saved,
      is_public = excluded.is_public,
      user_id = COALESCE(excluded.user_id, recipes.user_id)
  `).run(
    recipe.id,
    userId,
    titleVal,
    titleEnVal,
    imageVal,
    timeVal,
    timeEnVal,
    caloriesVal,
    caloriesEnVal,
    difficultyVal,
    difficultyEnVal,
    servingsVal,
    servingsEnVal,
    categoryVal,
    categoryEnVal,
    recipe.protein || '',
    recipe.carbs || '',
    recipe.fat || '',
    JSON.stringify(recipe.ingredients || []),
    JSON.stringify(recipe.ingredientsEn || recipe.ingredients_en || recipe.ingredients || []),
    JSON.stringify(recipe.instructions || []),
    JSON.stringify(recipe.instructionsEn || recipe.instructions_en || recipe.instructions || []),
    aiTipVal,
    aiTipEnVal,
    source,
    wheelCategory,
    finalIsSaved,
    finalIsPublic,
    now
  );
}

export function toggleRecipeSavedInDb(recipeId: string, userId: string, isSaved: boolean) {
  const db = getDatabase();
  getOrCreateUser(userId);
  db.prepare('UPDATE recipes SET is_saved = ?, user_id = ? WHERE id = ?').run(isSaved ? 1 : 0, userId, recipeId);
}

export function deleteRecipePermanently(recipeId: string, userId: string) {
  const db = getDatabase();
  getOrCreateUser(userId);
  db.prepare('DELETE FROM recipes WHERE id = ? AND (user_id = ? OR user_id IS NULL OR user_id = \'guest_default\')').run(recipeId, userId);
}

export function getUserRecipes(userId: string) {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM recipes WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  return rows.map((r: any) => formatRecipeRow(r));
}

export function getPublicRecipes() {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM recipes WHERE is_public = 1 ORDER BY created_at DESC').all();
  return rows.map((r: any) => formatRecipeRow(r));
}

export function getSavedRecipesFromDb(userId: string) {
  const db = getDatabase();
  const rows = db.prepare("SELECT * FROM recipes WHERE user_id = ? AND (is_saved = 1 OR source = 'user') ORDER BY created_at DESC").all(userId);
  return rows.map((r: any) => formatRecipeRow(r));
}

function formatRecipeRow(r: any) {
  let ingredients = [];
  let ingredientsEn = [];
  let instructions = [];
  let instructionsEn = [];
  try {
    ingredients = JSON.parse(r.ingredients || '[]');
  } catch {
    ingredients = [];
  }
  try {
    ingredientsEn = JSON.parse(r.ingredients_en || '[]');
  } catch {
    ingredientsEn = ingredients;
  }
  try {
    instructions = JSON.parse(r.instructions || '[]');
  } catch {
    instructions = [];
  }
  try {
    instructionsEn = JSON.parse(r.instructions_en || '[]');
  } catch {
    instructionsEn = instructions;
  }

  return {
    id: r.id,
    title: r.title,
    titleEn: r.title_en || r.title,
    image: r.image,
    rating: 4.9,
    time: r.time,
    timeEn: r.time_en || r.time,
    calories: r.calories,
    caloriesEn: r.calories_en || r.calories,
    difficulty: r.difficulty,
    difficultyEn: r.difficulty_en || r.difficulty,
    servings: r.servings,
    servingsEn: r.servings_en || r.servings,
    category: r.category,
    categoryEn: r.category_en || r.category,
    protein: r.protein,
    carbs: r.carbs,
    fat: r.fat,
    ingredients,
    ingredientsEn,
    instructions,
    instructionsEn,
    aiTip: r.ai_tip,
    aiTipEn: r.ai_tip_en || r.ai_tip,
    source: r.source,
    wheelCategory: r.wheel_category,
    isSaved: Boolean(r.is_saved),
    is_saved: r.is_saved,
    isPublic: Boolean(r.is_public),
    is_public: r.is_public,
    userId: r.user_id,
    createdAt: r.created_at,
  };
}

// Chat Persistence
export function saveChatMessageInDb(userId: string, role: string, content: string, context = '') {
  const db = getDatabase();
  const now = new Date().toISOString();
  const id = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  getOrCreateUser(userId);
  db.prepare(`
    INSERT INTO chat_messages (id, user_id, role, content, context, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, userId, role, content, context, now);
  return id;
}

export function getChatHistoryFromDb(userId: string, limit = 50) {
  const db = getDatabase();
  const rows = db.prepare('SELECT role, content, created_at FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT ?').all(userId, limit);
  return rows;
}

// Diet Logs
export function saveDietLogInDb(userId: string, data: any) {
  const db = getDatabase();
  const now = new Date().toISOString();
  const id = `diet_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  getOrCreateUser(userId);
  db.prepare(`
    INSERT INTO diet_logs (id, user_id, meal_name, portion_weight, calories, protein, carbs, fat, sugar, sodium, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    userId,
    data.mealName || '',
    Number(data.portionWeight) || 0,
    data.calories || '0',
    data.protein || '0',
    data.carbs || '0',
    data.fat || '0',
    data.sugar || '0',
    data.sodium || '0',
    now
  );
}

// Full Initial Sync
export function getUserFullSync(userId: string) {
  const user = getOrCreateUser(userId);
  const prefs = getUserPreferences(userId);
  const fridgeIngredients = getUserFridgeIngredients(userId);
  const savedRecipes = getSavedRecipesFromDb(userId);
  return {
    user,
    preferences: {
      language: prefs.language || 'ar',
      theme: prefs.theme || 'dark',
      textSize: prefs.text_size || 'normal',
      gender: prefs.gender || null,
    },
    fridgeIngredients,
    savedRecipes,
  };
}
