/**
 * Culinary Recipe Image Engine
 * Resolves verified, relevant, high-definition dish photography
 * based strictly on recipe title, ingredients, and culinary characteristics.
 */

export const CUISINE_IMAGE_CATALOG = {
  // Saudi & Gulf Traditional Dishes
  kabsa: "https://lh3.googleusercontent.com/aida-public/AB6AXuACRoDmmoEwjED53UZ7REO0AkEMBFtPJKj5TNShv6uXNTw_eTgqP1h1cqfcCdxD9ibIH68dAebNU4ft45JIAm1eTH0BKO9eGelKrUAqHncx-W008QyQBD_DRDEkr9iCj0Y09giCjL0qCfaJSR0sxUwo_qOu1A5XOb_tYEXQjWTZMwde8YePgQRXFK5NWdVAuOx-JxZZy3O6cnhoBuEYlU_JVUqqzDPprr0CMdtdlhwTEGuwG7nMdIEE",
  mandi_rice: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
  
  // Pasta & Italian
  pasta_tomato: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
  pasta_creamy: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=800&q=80",
  pasta_italian: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80",
  
  // Salads & Fresh Bowls
  salad_greek: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
  salad_mediterranean: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5J8RqXdUUhTcthM_hLm3HjLnsbJ7zSH5DvRJufOshi-LkMXHRqoFkNLxZU6jVIv80dt472sqlhwoDxyn5fCc3FoaurP4gty7TlrJXZa6JK3Oa2KZuOrgz0WiPPmZo-qjHc3Je1yNJrXAwrLBK2jjzkYIVtJInlR-jl5UXxFPymy9sa_GWIldfdv7ez94U2rwMiIuEPYyIdIjnGlSYZYxSKh4gkN56j8IQVKNEiSi-8Qykkk8WYAVn",
  salad_green: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
  
  // Breakfast & Skillets
  shakshuka: "https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=800&q=80",
  halloumi_breakfast: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
  
  // Poultry
  chicken_grilled: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80",
  chicken_roast: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrciS23qwazvd_x0kNZi86ZMZ7TyVOPkt8Fpz2XhtDYu3ubI9lnDDJDF4CdVNajqDt8ma1WwhqjNssZJYoQ4wjEaeNYpCM_iYB6OUL2XgJXmtQrhh4eqY6HQysy7GgrFY8MMrO6mrgwz-vc1_5NhXWXhtFW1Mm5MQIvUln1Iy3VQpNcdOFrAP5Pj3eAY3HohhpRDUSNrn3NSh62RTas-YxF0Q05mMmJ9x5XAF8a6mx_-RDAsedxgdy",
  
  // Meat & Steak
  beef_steak: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80",
  meat_grill: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  
  // Stews & Curries
  stew_curry: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
  
  // Soups
  soup: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
  soup_tomato: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJor7UZs4LeFf9a0v2oUGQNcngvH4XOrIBhI_D8H_ZA1pLsOrconFZAVp5bOFtIvd7bX72HJ7kdIhuIRMtLgx0fMKWp3gSEXK_A4Ou6M3sSWV1wd8BcHGGXPEsluZJzh4V0QQQI1n8QlYgJAU9Pfi_gVpY4J-ncddfRybulHv5kHL-o5satw2LDgPz7NiW2cfUzeUmrnllfKSygtRMn-lJZR3iA4_fuNLsXuJvqiuGwmY63Q1rbbDT",
  
  // Sandwiches & Fast Gourmet
  sandwich: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  wrap_shawarma: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
  
  // Pizza
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  
  // Seafood
  salmon: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80",
  seafood: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
};

export type DishArchetype = keyof typeof CUISINE_IMAGE_CATALOG;

export interface RecipeDataForImage {
  title?: string;
  titleEn?: string;
  category?: string;
  ingredients?: string[];
  instructions?: string[];
}

/**
 * Resolves the exact culinary archetype based on recipe title and ingredients.
 * Uses high-precision matching rules that eliminate false positives (e.g., tomato in pasta !== soup).
 */
export function determineCulinaryArchetype(recipe: RecipeDataForImage): DishArchetype {
  const title = `${recipe.title || ""} ${recipe.titleEn || ""}`.toLowerCase().trim();
  const category = (recipe.category || "").toLowerCase().trim();
  const ingList = Array.isArray(recipe.ingredients) ? recipe.ingredients.map(i => (typeof i === 'string' ? i.toLowerCase() : '')).join(" ") : "";
  const combined = `${title} ${category} ${ingList}`;

  // 1. KABSA & SAUDI / GULF RICE DISHES (Highest precedence for rice dishes)
  if (
    title.includes("كبسة") || title.includes("مكبوس") || title.includes("مندي") ||
    title.includes("بخاري") || title.includes("برياني") || title.includes("مضغوط") ||
    title.includes("حنيذ") || title.includes("زربيان") || title.includes("سليق") ||
    title.includes("kabsa") || title.includes("machboos") || title.includes("mandi") ||
    title.includes("bukhari") || title.includes("biryani") ||
    ((title.includes("أرز") || title.includes("رز") || title.includes("rice")) && (combined.includes("دجاج") || combined.includes("لحم") || combined.includes("chicken") || combined.includes("meat") || combined.includes("lamb")))
  ) {
    if (title.includes("مندي") || title.includes("بخاري") || title.includes("برياني") || title.includes("biryani")) {
      return "mandi_rice";
    }
    return "kabsa";
  }

  // 2. PASTA & NOODLES & LASAGNA
  if (
    title.includes("باستا") || title.includes("مكرونة") || title.includes("معكرونة") ||
    title.includes("سباغيتي") || title.includes("فيتوتشيني") || title.includes("لازانيا") ||
    title.includes("بيني") || title.includes("بشاميل") ||
    title.includes("pasta") || title.includes("spaghetti") || title.includes("fettuccine") ||
    title.includes("lasagna") || title.includes("penne") || title.includes("alfredo") ||
    title.includes("macaroni") || title.includes("noodles")
  ) {
    if (combined.includes("كريمة") || combined.includes("فيتوتشيني") || combined.includes("الفريدو") || combined.includes("alfredo") || combined.includes("cream") || combined.includes("وايت صوص")) {
      return "pasta_creamy";
    }
    if (combined.includes("بيستو") || combined.includes("pesto") || combined.includes("ريحان")) {
      return "pasta_italian";
    }
    return "pasta_tomato";
  }

  // 3. SALADS & COLD BOWLS
  if (
    title.includes("سلطة") || title.includes("salad") || title.includes("فتوش") ||
    title.includes("تبولة") || title.includes("fattoush") || title.includes("tabbouleh") ||
    category.includes("سلطة") || category.includes("salad")
  ) {
    if (combined.includes("يونانية") || combined.includes("فيتا") || combined.includes("greek") || combined.includes("feta") || combined.includes("زيتون")) {
      return "salad_greek";
    }
    if (combined.includes("رمان") || combined.includes("كينوا") || combined.includes("quinoa") || combined.includes("فتوش") || combined.includes("تبولة")) {
      return "salad_mediterranean";
    }
    return "salad_green";
  }

  // 4. SHAKSHUKA & BREAKFAST SKILLETS
  if (
    title.includes("شكشوكة") || title.includes("shakshuka") ||
    ((title.includes("بيض") || title.includes("egg")) && (combined.includes("طماطم") || combined.includes("بصل") || combined.includes("صلصة")))
  ) {
    return "shakshuka";
  }

  // 5. HALLOUMI & CHEESE BREAKFAST
  if (
    title.includes("حلوم") || title.includes("halloumi") || title.includes("أومليت") ||
    title.includes("omelette") || title.includes("بان كيك") || title.includes("فول") ||
    category.includes("إفطار") || category.includes("breakfast")
  ) {
    return "halloumi_breakfast";
  }

  // 6. PIZZA & FLATBREAD
  if (title.includes("بيتزا") || title.includes("pizza") || title.includes("مناقيش") || title.includes("flatbread")) {
    return "pizza";
  }

  // 7. BURGERS, SANDWICHES & WRAPS
  if (title.includes("برجر") || title.includes("burger")) {
    return "burger";
  }
  if (title.includes("شاورما") || title.includes("shawarma") || title.includes("راب") || title.includes("wrap") || title.includes("تاكو") || title.includes("taco")) {
    return "wrap_shawarma";
  }
  if (title.includes("ساندويتش") || title.includes("ساندوتش") || title.includes("sandwich") || title.includes("توست") || title.includes("toast")) {
    return "sandwich";
  }

  // 8. SEAFOOD & SALMON
  if (
    title.includes("سلمون") || title.includes("salmon") ||
    ((title.includes("سمك") || title.includes("fish")) && !title.includes("شوربة"))
  ) {
    return "salmon";
  }
  if (
    title.includes("روبيان") || title.includes("جمبري") || title.includes("shrimp") ||
    title.includes("seafood") || title.includes("سي فود") || title.includes("بحري")
  ) {
    return "seafood";
  }

  // 9. STEWS & CURRIES (Edam / Curry / Tagine / Salona)
  if (
    title.includes("إدام") || title.includes("كاري") || title.includes("صالونة") ||
    title.includes("طاجن") || title.includes("يخنة") || title.includes("curry") ||
    title.includes("stew") || title.includes("tagine") || title.includes("بامية")
  ) {
    return "stew_curry";
  }

  // 10. SOUPS (Strict title or category check - NOT merely containing tomato)
  if (
    title.includes("شوربة") || title.includes("حساء") || title.includes("soup") ||
    category.includes("شوربة") || category.includes("soup")
  ) {
    if (combined.includes("طماطم") || combined.includes("tomato")) {
      return "soup_tomato";
    }
    return "soup";
  }

  // 11. MEAT & STEAK & KEBAB
  if (
    title.includes("ستيك") || title.includes("steak") || title.includes("ريش") ||
    title.includes("كباب") || title.includes("كفتة") || title.includes("kebab") ||
    title.includes("لحم مشوي") || title.includes("لحمة مشوية") || title.includes("بريسكت")
  ) {
    return "beef_steak";
  }
  if (title.includes("لحم") || title.includes("meat") || title.includes("beef") || title.includes("lamb")) {
    return "meat_grill";
  }

  // 12. POULTRY & CHICKEN
  if (
    title.includes("دجاج مشوي") || title.includes("شيش طاووق") || title.includes("صدور دجاج") ||
    title.includes("grilled chicken") || title.includes("tawook")
  ) {
    return "chicken_grilled";
  }
  if (title.includes("دجاج") || title.includes("chicken") || title.includes("فراخ")) {
    return "chicken_roast";
  }

  // 13. INGREDIENT INFERENCE (When title is generic like "وجبة صحية" or "طبخة سريعة")
  if (combined.includes("باستا") || combined.includes("مكرونة") || combined.includes("pasta")) {
    return "pasta_italian";
  }
  if (combined.includes("أرز") || combined.includes("رز") || combined.includes("rice")) {
    return "kabsa";
  }
  if (combined.includes("خس") && (combined.includes("خيار") || combined.includes("طماطم"))) {
    return "salad_green";
  }
  if (combined.includes("دجاج") || combined.includes("chicken")) {
    return "chicken_grilled";
  }
  if (combined.includes("لحم") || combined.includes("beef")) {
    return "meat_grill";
  }

  // Safe default: colorful fresh Mediterranean salad bowl (never a generic unappetizing stock photo)
  return "salad_mediterranean";
}

/**
 * Returns the exact verified image URL corresponding to the recipe's culinary reality.
 */
export function resolveRecipeImage(recipe: RecipeDataForImage): string {
  const archetype = determineCulinaryArchetype(recipe);
  return CUISINE_IMAGE_CATALOG[archetype];
}
