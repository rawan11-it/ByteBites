export interface FoodNutrientPer100g {
  calories: number; // kcal
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  sugar: number; // grams
  sodium: number; // mg
  fiber?: number; // grams
}

export interface FoodEntry {
  id: string;
  nameAr: string;
  nameEn: string;
  aliasesAr: string[];
  aliasesEn: string[];
  isPureMeatOrFish: boolean;
  state: 'cooked' | 'raw' | 'generic';
  per100g: FoodNutrientPer100g;
  category: 'poultry' | 'meat' | 'fish' | 'egg' | 'dairy' | 'grain' | 'vegetable' | 'fruit' | 'legume' | 'fat_oil' | 'nut_seed' | 'bakery' | 'processed';
}

export interface NutritionResult {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  sugar: string;
  sodium: string;
  matchedFood?: string;
  foodState?: string;
  calculatedPortionGrams?: number;
  breakdown?: Array<{
    foodName: string;
    portionGrams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  clarificationPrompt?: string;
  note?: string;
}

// Authoritative USDA / FoodData Central composition database per 100 grams
export const NUTRITION_DATABASE: FoodEntry[] = [
  // POULTRY
  {
    id: 'chicken-breast-cooked',
    nameAr: 'صدر دجاج مطبوخ (مشوي / مسلوق)',
    nameEn: 'Cooked Chicken Breast (Grilled/Boiled)',
    aliasesAr: [
      'صدر دجاج', 'صدور دجاج', 'دجاج صدر', 'صدر دجاج مطبوخ', 'صدر دجاج مشوي', 'صدر دجاج مسلوق', 
      'صدور دجاج مشوية', 'صدور دجاج مسلوقة', 'صدر دجاج بالفرن', 'ستيك دجاج', 'فيليه دجاج مشوي',
      'فيليه دجاج مطبوخ', 'شاورما دجاج صافي'
    ],
    aliasesEn: [
      'chicken breast', 'cooked chicken breast', 'grilled chicken breast', 'boiled chicken breast',
      'baked chicken breast', 'chicken breast fillet', 'cooked chicken', 'grilled chicken', 'chicken fillet'
    ],
    isPureMeatOrFish: true,
    state: 'cooked',
    per100g: {
      calories: 165.0,
      protein: 31.0,
      carbs: 0.0,
      fat: 3.6,
      sugar: 0.0,
      sodium: 74.0,
      fiber: 0.0,
    },
    category: 'poultry',
  },
  {
    id: 'chicken-breast-raw',
    nameAr: 'صدر دجاج نيء',
    nameEn: 'Raw Chicken Breast',
    aliasesAr: [
      'صدر دجاج نيء', 'صدور دجاج نية', 'صدر دجاج ني', 'دجاج نيء', 'دجاج ني', 'صدور دجاج غير مطبوخة',
      'صدر دجاج قبل الطبخ', 'دجاج قبل الطبخ'
    ],
    aliasesEn: [
      'raw chicken breast', 'uncooked chicken breast', 'raw chicken', 'uncooked chicken', 'fresh chicken breast'
    ],
    isPureMeatOrFish: true,
    state: 'raw',
    per100g: {
      calories: 120.0,
      protein: 22.5,
      carbs: 0.0,
      fat: 2.6,
      sugar: 0.0,
      sodium: 65.0,
      fiber: 0.0,
    },
    category: 'poultry',
  },
  {
    id: 'chicken-thigh-cooked',
    nameAr: 'فخذ دجاج مطبوخ (بدون جلد)',
    nameEn: 'Cooked Chicken Thigh (Skinless)',
    aliasesAr: ['فخذ دجاج', 'افخاذ دجاج', 'فخذ دجاج مطبوخ', 'فخذ دجاج مشوي', 'ورك دجاج'],
    aliasesEn: ['chicken thigh', 'cooked chicken thigh', 'grilled chicken thigh', 'chicken thighs'],
    isPureMeatOrFish: true,
    state: 'cooked',
    per100g: {
      calories: 179.0,
      protein: 24.8,
      carbs: 0.0,
      fat: 8.2,
      sugar: 0.0,
      sodium: 86.0,
    },
    category: 'poultry',
  },
  {
    id: 'chicken-thigh-raw',
    nameAr: 'فخذ دجاج نيء',
    nameEn: 'Raw Chicken Thigh',
    aliasesAr: ['فخذ دجاج نيء', 'افخاذ دجاج نية', 'فخذ دجاج ني'],
    aliasesEn: ['raw chicken thigh', 'uncooked chicken thigh'],
    isPureMeatOrFish: true,
    state: 'raw',
    per100g: {
      calories: 121.0,
      protein: 19.7,
      carbs: 0.0,
      fat: 4.7,
      sugar: 0.0,
      sodium: 84.0,
    },
    category: 'poultry',
  },
  {
    id: 'turkey-breast-cooked',
    nameAr: 'صدر حبش / ديك رومي مطبوخ',
    nameEn: 'Cooked Turkey Breast',
    aliasesAr: ['صدر حبش', 'ديك رومي', 'تركي', 'صدر تركي مطبوخ', 'حبش مشوي'],
    aliasesEn: ['turkey breast', 'cooked turkey breast', 'roasted turkey'],
    isPureMeatOrFish: true,
    state: 'cooked',
    per100g: {
      calories: 135.0,
      protein: 30.0,
      carbs: 0.0,
      fat: 1.0,
      sugar: 0.0,
      sodium: 68.0,
    },
    category: 'poultry',
  },
  {
    id: 'fried-breaded-chicken',
    nameAr: 'دجاج مقلي / بروستد / ناجتس (مغطى بالبقسماط)',
    nameEn: 'Fried / Breaded Chicken / Nuggets',
    aliasesAr: ['دجاج مقلي', 'بروستد', 'ناجتس', 'دجاج بروستد', 'ستربس دجاج مقلي', 'بانيه دجاج'],
    aliasesEn: ['fried chicken', 'breaded chicken', 'nuggets', 'chicken tenders', 'crispy chicken'],
    isPureMeatOrFish: false,
    state: 'cooked',
    per100g: {
      calories: 260.0,
      protein: 18.5,
      carbs: 14.5,
      fat: 14.2,
      sugar: 0.5,
      sodium: 580.0,
    },
    category: 'processed',
  },

  // RED MEAT
  {
    id: 'beef-steak-cooked',
    nameAr: 'لحم بقري مطبوخ / ستيك مشوي',
    nameEn: 'Cooked Beef Steak (Lean)',
    aliasesAr: ['لحم بقري', 'ستيك لحم', 'لحم مشوي', 'لحم بقر مطبوخ', 'لحمة هبرة', 'لحم هبرة', 'شقف لحم'],
    aliasesEn: ['beef steak', 'cooked beef', 'grilled steak', 'lean beef', 'beef', 'steak'],
    isPureMeatOrFish: true,
    state: 'cooked',
    per100g: {
      calories: 250.0,
      protein: 26.1,
      carbs: 0.0,
      fat: 15.0,
      sugar: 0.0,
      sodium: 65.0,
    },
    category: 'meat',
  },
  {
    id: 'beef-raw',
    nameAr: 'لحم بقري نيء',
    nameEn: 'Raw Beef (Lean)',
    aliasesAr: ['لحم بقري نيء', 'لحم نيء', 'ستيك نيء', 'لحم ني'],
    aliasesEn: ['raw beef', 'uncooked beef', 'raw steak'],
    isPureMeatOrFish: true,
    state: 'raw',
    per100g: {
      calories: 200.0,
      protein: 20.5,
      carbs: 0.0,
      fat: 13.0,
      sugar: 0.0,
      sodium: 60.0,
    },
    category: 'meat',
  },
  {
    id: 'ground-beef-cooked',
    nameAr: 'لحم مفروم مطبوخ (قليل الدهن)',
    nameEn: 'Cooked Ground Beef (Lean)',
    aliasesAr: ['لحم مفروم', 'لحمة مفرومة', 'كفتة مشوية', 'لحم مفروم مطبوخ', 'لحمة ناعمة'],
    aliasesEn: ['ground beef', 'cooked ground beef', 'minced meat', 'minced beef'],
    isPureMeatOrFish: true,
    state: 'cooked',
    per100g: {
      calories: 260.0,
      protein: 25.0,
      carbs: 0.0,
      fat: 17.0,
      sugar: 0.0,
      sodium: 75.0,
    },
    category: 'meat',
  },
  {
    id: 'lamb-cooked',
    nameAr: 'لحم خروف / ضأن مطبوخ',
    nameEn: 'Cooked Lamb',
    aliasesAr: ['لحم خروف', 'لحم غنم', 'لحم ضأن', 'ريش غنم', 'لحم خروف مطبوخ', 'لحم خروف مشوي'],
    aliasesEn: ['lamb', 'cooked lamb', 'lamb chops', 'mutton'],
    isPureMeatOrFish: true,
    state: 'cooked',
    per100g: {
      calories: 294.0,
      protein: 25.6,
      carbs: 0.0,
      fat: 20.9,
      sugar: 0.0,
      sodium: 72.0,
    },
    category: 'meat',
  },

  // FISH & SEAFOOD
  {
    id: 'salmon-cooked',
    nameAr: 'سلمون مطبوخ / مشوي',
    nameEn: 'Cooked Salmon (Baked/Grilled)',
    aliasesAr: ['سلمون', 'سمك سلمون', 'سلمون مشوي', 'سلمون مطبوخ', 'فيليه سلمون'],
    aliasesEn: ['salmon', 'cooked salmon', 'grilled salmon', 'baked salmon', 'salmon fillet'],
    isPureMeatOrFish: true,
    state: 'cooked',
    per100g: {
      calories: 206.0,
      protein: 22.1,
      carbs: 0.0,
      fat: 12.3,
      sugar: 0.0,
      sodium: 60.0,
    },
    category: 'fish',
  },
  {
    id: 'salmon-raw',
    nameAr: 'سلمون نيء',
    nameEn: 'Raw Salmon',
    aliasesAr: ['سلمون نيء', 'سلمون ني', 'ساشيمي سلمون'],
    aliasesEn: ['raw salmon', 'salmon sashimi'],
    isPureMeatOrFish: true,
    state: 'raw',
    per100g: {
      calories: 180.0,
      protein: 20.0,
      carbs: 0.0,
      fat: 10.5,
      sugar: 0.0,
      sodium: 59.0,
    },
    category: 'fish',
  },
  {
    id: 'tuna-canned-water',
    nameAr: 'تونة معلبة بالماء',
    nameEn: 'Canned Tuna in Water',
    aliasesAr: ['تونة', 'تونة بالماء', 'تونة معلبة', 'سمك تونة', 'تونه'],
    aliasesEn: ['tuna', 'canned tuna', 'tuna in water', 'canned tuna in water'],
    isPureMeatOrFish: true,
    state: 'cooked',
    per100g: {
      calories: 116.0,
      protein: 25.5,
      carbs: 0.0,
      fat: 0.8,
      sugar: 0.0,
      sodium: 338.0,
    },
    category: 'fish',
  },
  {
    id: 'white-fish-cooked',
    nameAr: 'سمك أبيض فيليه مطبوخ (هامور / سي bass / بلطي)',
    nameEn: 'Cooked White Fish Fillet (Tilapia/Sea Bass/Cod)',
    aliasesAr: ['سمك مشوي', 'سمك فيليه', 'فيليه سمك', 'هامور', 'بلطي', 'سمك مسلوق', 'سمك أبيض', 'سمك مطبوخ'],
    aliasesEn: ['white fish', 'cooked fish', 'grilled fish', 'tilapia', 'cod', 'fish fillet'],
    isPureMeatOrFish: true,
    state: 'cooked',
    per100g: {
      calories: 105.0,
      protein: 22.8,
      carbs: 0.0,
      fat: 1.2,
      sugar: 0.0,
      sodium: 78.0,
    },
    category: 'fish',
  },
  {
    id: 'shrimp-cooked',
    nameAr: 'روبيان / جمبري مطبوخ',
    nameEn: 'Cooked Shrimp / Prawns',
    aliasesAr: ['روبيان', 'جمبري', 'قريدس', 'روبيان مسلوق', 'جمبري مشوي', 'روبيان مطبوخ'],
    aliasesEn: ['shrimp', 'cooked shrimp', 'prawns', 'grilled shrimp', 'boiled shrimp'],
    isPureMeatOrFish: true,
    state: 'cooked',
    per100g: {
      calories: 99.0,
      protein: 24.0,
      carbs: 0.2,
      fat: 0.3,
      sugar: 0.0,
      sodium: 111.0,
    },
    category: 'fish',
  },

  // EGGS & DAIRY
  {
    id: 'egg-whole-boiled',
    nameAr: 'بيض مسلوق / كامل مطبوخ',
    nameEn: 'Boiled Whole Egg',
    aliasesAr: ['بيض', 'بيض مسلوق', 'بيضة مسلوقة', 'بيضة', 'بيض مطبوخ', 'بيض مقلي بدون زيت'],
    aliasesEn: ['egg', 'boiled egg', 'hard boiled egg', 'whole egg', 'eggs'],
    isPureMeatOrFish: false,
    state: 'cooked',
    per100g: {
      calories: 155.0,
      protein: 12.6,
      carbs: 1.1,
      fat: 10.6,
      sugar: 1.1,
      sodium: 124.0,
    },
    category: 'egg',
  },
  {
    id: 'egg-white-cooked',
    nameAr: 'بياض بيض مسلوق / مطبوخ',
    nameEn: 'Cooked Egg White',
    aliasesAr: ['بياض بيض', 'بياض البيض', 'زلال البيض'],
    aliasesEn: ['egg white', 'cooked egg white', 'egg whites'],
    isPureMeatOrFish: false,
    state: 'cooked',
    per100g: {
      calories: 52.0,
      protein: 10.9,
      carbs: 0.7,
      fat: 0.2,
      sugar: 0.7,
      sodium: 166.0,
    },
    category: 'egg',
  },
  {
    id: 'greek-yogurt-plain',
    nameAr: 'زبادي يوناني قليل / خالي الدسم',
    nameEn: 'Plain Greek Yogurt (Low Fat)',
    aliasesAr: ['زبادي يوناني', 'روب يوناني', 'لبن يوناني', 'زبادي يوناني سادة'],
    aliasesEn: ['greek yogurt', 'plain greek yogurt', 'greek yoghurt'],
    isPureMeatOrFish: false,
    state: 'generic',
    per100g: {
      calories: 73.0,
      protein: 10.0,
      carbs: 3.6,
      fat: 1.9,
      sugar: 3.6,
      sodium: 45.0,
    },
    category: 'dairy',
  },
  {
    id: 'milk-whole',
    nameAr: 'حليب كامل الدسم',
    nameEn: 'Whole Milk',
    aliasesAr: ['حليب', 'حليب كامل الدسم', 'لبن حليب', 'حليب طازج'],
    aliasesEn: ['milk', 'whole milk', 'fresh milk'],
    isPureMeatOrFish: false,
    state: 'generic',
    per100g: {
      calories: 61.0,
      protein: 3.2,
      carbs: 4.8,
      fat: 3.3,
      sugar: 5.1,
      sodium: 43.0,
    },
    category: 'dairy',
  },
  {
    id: 'cheddar-cheese',
    nameAr: 'جبن شيدر',
    nameEn: 'Cheddar Cheese',
    aliasesAr: ['جبن شيدر', 'جبنة شيدر', 'شيدر'],
    aliasesEn: ['cheddar cheese', 'cheddar'],
    isPureMeatOrFish: false,
    state: 'generic',
    per100g: {
      calories: 403.0,
      protein: 24.9,
      carbs: 1.3,
      fat: 33.1,
      sugar: 0.5,
      sodium: 621.0,
    },
    category: 'dairy',
  },
  {
    id: 'cottage-cheese',
    nameAr: 'جبن قريش',
    nameEn: 'Cottage Cheese',
    aliasesAr: ['جبن قريش', 'جبنة قريش', 'قريش'],
    aliasesEn: ['cottage cheese'],
    isPureMeatOrFish: false,
    state: 'generic',
    per100g: {
      calories: 98.0,
      protein: 11.1,
      carbs: 3.4,
      fat: 4.3,
      sugar: 2.7,
      sodium: 364.0,
    },
    category: 'dairy',
  },
  {
    id: 'halloumi-cheese',
    nameAr: 'جبن حلوم',
    nameEn: 'Halloumi Cheese',
    aliasesAr: ['جبن حلوم', 'جبنة حلوم', 'حلوم مشوي'],
    aliasesEn: ['halloumi', 'halloumi cheese'],
    isPureMeatOrFish: false,
    state: 'generic',
    per100g: {
      calories: 321.0,
      protein: 21.4,
      carbs: 2.0,
      fat: 25.0,
      sugar: 1.5,
      sodium: 1140.0,
    },
    category: 'dairy',
  },
  {
    id: 'labneh',
    nameAr: 'لبنة',
    nameEn: 'Labneh',
    aliasesAr: ['لبنة', 'لبنه', 'لبنة تركية'],
    aliasesEn: ['labneh', 'labna'],
    isPureMeatOrFish: false,
    state: 'generic',
    per100g: {
      calories: 150.0,
      protein: 8.0,
      carbs: 4.0,
      fat: 11.5,
      sugar: 3.5,
      sodium: 380.0,
    },
    category: 'dairy',
  },

  // GRAINS & STARCHES
  {
    id: 'rice-white-cooked',
    nameAr: 'أرز أبيض مطبوخ',
    nameEn: 'Cooked White Rice',
    aliasesAr: [
      'أرز', 'رز', 'أرز أبيض', 'رز أبيض', 'رز مطبوخ', 'أرز مطبوخ', 'رز مسلوق', 'أرز مسلوق', 
      'رز أبيض مسلوق', 'أرز مصري مطبوخ', 'أرز بسمتي مطبوخ', 'رز بسمتي'
    ],
    aliasesEn: [
      'rice', 'white rice', 'cooked rice', 'cooked white rice', 'steamed rice', 'boiled rice', 'basmati rice'
    ],
    isPureMeatOrFish: false,
    state: 'cooked',
    per100g: {
      calories: 130.0,
      protein: 2.7,
      carbs: 28.2,
      fat: 0.3,
      sugar: 0.1,
      sodium: 1.0,
      fiber: 0.4,
    },
    category: 'grain',
  },
  {
    id: 'rice-white-raw',
    nameAr: 'أرز أبيض نيء / جاف',
    nameEn: 'Raw / Dry White Rice',
    aliasesAr: ['أرز نيء', 'رز نيء', 'رز ني', 'أرز جاف', 'أرز قبل الطبخ', 'رز قبل الطبخ'],
    aliasesEn: ['raw rice', 'uncooked rice', 'dry rice', 'raw white rice'],
    isPureMeatOrFish: false,
    state: 'raw',
    per100g: {
      calories: 365.0,
      protein: 7.1,
      carbs: 80.0,
      fat: 0.7,
      sugar: 0.1,
      sodium: 5.0,
      fiber: 1.3,
    },
    category: 'grain',
  },
  {
    id: 'rice-brown-cooked',
    nameAr: 'أرز بني مطبوخ',
    nameEn: 'Cooked Brown Rice',
    aliasesAr: ['أرز بني', 'رز بني', 'أرز أسمر', 'رز أسمر', 'رز بني مطبوخ'],
    aliasesEn: ['brown rice', 'cooked brown rice'],
    isPureMeatOrFish: false,
    state: 'cooked',
    per100g: {
      calories: 111.0,
      protein: 2.6,
      carbs: 23.0,
      fat: 0.9,
      sugar: 0.4,
      sodium: 5.0,
      fiber: 1.8,
    },
    category: 'grain',
  },
  {
    id: 'pasta-cooked',
    nameAr: 'مكرونة / باستا مطبوخة',
    nameEn: 'Cooked Pasta',
    aliasesAr: ['مكرونة', 'معكرونة', 'باستا', 'سباغيتي', 'مكرونة مسلوقة', 'باستا مسلوقة'],
    aliasesEn: ['pasta', 'cooked pasta', 'boiled pasta', 'spaghetti', 'macaroni'],
    isPureMeatOrFish: false,
    state: 'cooked',
    per100g: {
      calories: 158.0,
      protein: 5.8,
      carbs: 30.9,
      fat: 0.9,
      sugar: 0.6,
      sodium: 1.0,
      fiber: 1.8,
    },
    category: 'grain',
  },
  {
    id: 'pasta-raw',
    nameAr: 'مكرونة / باستا نيئة / جافة',
    nameEn: 'Raw / Dry Pasta',
    aliasesAr: ['مكرونة نيئة', 'باستا جافة', 'مكرونة جافة', 'مكرونة قبل الطبخ'],
    aliasesEn: ['raw pasta', 'dry pasta', 'uncooked pasta'],
    isPureMeatOrFish: false,
    state: 'raw',
    per100g: {
      calories: 371.0,
      protein: 13.0,
      carbs: 74.7,
      fat: 1.5,
      sugar: 2.7,
      sodium: 6.0,
    },
    category: 'grain',
  },
  {
    id: 'oats-raw',
    nameAr: 'شوفان جاف / نيء',
    nameEn: 'Raw / Dry Rolled Oats',
    aliasesAr: ['شوفان', 'شوفان جاف', 'حبوب الشوفان', 'كويكر'],
    aliasesEn: ['oats', 'rolled oats', 'raw oats', 'oatmeal dry'],
    isPureMeatOrFish: false,
    state: 'raw',
    per100g: {
      calories: 389.0,
      protein: 16.9,
      carbs: 66.3,
      fat: 6.9,
      sugar: 0.0,
      sodium: 2.0,
      fiber: 10.6,
    },
    category: 'grain',
  },
  {
    id: 'potato-boiled',
    nameAr: 'بطاطس مسلوقة / مطبوخة',
    nameEn: 'Boiled / Cooked Potato',
    aliasesAr: ['بطاطس', 'بطاطا', 'بطاطس مسلوقة', 'بطاطا مسلوقة', 'بطاطس مشوية'],
    aliasesEn: ['potato', 'boiled potato', 'cooked potato', 'baked potato', 'potatoes'],
    isPureMeatOrFish: false,
    state: 'cooked',
    per100g: {
      calories: 87.0,
      protein: 1.9,
      carbs: 20.1,
      fat: 0.1,
      sugar: 0.9,
      sodium: 6.0,
      fiber: 1.8,
    },
    category: 'vegetable',
  },
  {
    id: 'sweet-potato-cooked',
    nameAr: 'بطاطا حلوة مطبوخة / مشوية',
    nameEn: 'Cooked Sweet Potato',
    aliasesAr: ['بطاطا حلوة', 'بطاطس حلوة', 'بطاطا حلوة مشوية'],
    aliasesEn: ['sweet potato', 'cooked sweet potato', 'baked sweet potato'],
    isPureMeatOrFish: false,
    state: 'cooked',
    per100g: {
      calories: 90.0,
      protein: 2.0,
      carbs: 20.7,
      fat: 0.2,
      sugar: 6.5,
      sodium: 36.0,
      fiber: 3.3,
    },
    category: 'vegetable',
  },
  {
    id: 'bread-white',
    nameAr: 'خبز أبيض (صامولي / شامي / توست)',
    nameEn: 'White Bread / Toast',
    aliasesAr: ['خبز', 'خبز أبيض', 'توست أبيض', 'صامولي', 'عيش أبيض', 'خبز لبناني'],
    aliasesEn: ['white bread', 'bread', 'white toast', 'pita bread'],
    isPureMeatOrFish: false,
    state: 'generic',
    per100g: {
      calories: 265.0,
      protein: 9.0,
      carbs: 49.0,
      fat: 3.2,
      sugar: 5.0,
      sodium: 491.0,
      fiber: 2.7,
    },
    category: 'bakery',
  },
  {
    id: 'bread-whole-wheat',
    nameAr: 'خبز بر / أسمر / حب كامل',
    nameEn: 'Whole Wheat Bread / Brown Toast',
    aliasesAr: ['خبز بر', 'خبز أسمر', 'توست أسمر', 'خبز حب', 'توست بر', 'عيش سن'],
    aliasesEn: ['whole wheat bread', 'brown bread', 'whole grain bread', 'brown toast'],
    isPureMeatOrFish: false,
    state: 'generic',
    per100g: {
      calories: 247.0,
      protein: 13.0,
      carbs: 41.0,
      fat: 3.4,
      sugar: 4.3,
      sodium: 450.0,
      fiber: 7.0,
    },
    category: 'bakery',
  },
  {
    id: 'quinoa-cooked',
    nameAr: 'كينوا مطبوخة',
    nameEn: 'Cooked Quinoa',
    aliasesAr: ['كينوا', 'كينوا مطبوخة', 'سلطة كينوا'],
    aliasesEn: ['quinoa', 'cooked quinoa'],
    isPureMeatOrFish: false,
    state: 'cooked',
    per100g: {
      calories: 120.0,
      protein: 4.4,
      carbs: 21.3,
      fat: 1.9,
      sugar: 0.9,
      sodium: 7.0,
      fiber: 2.8,
    },
    category: 'grain',
  },

  // FATS & OILS
  {
    id: 'olive-oil',
    nameAr: 'زيت زيتون',
    nameEn: 'Olive Oil',
    aliasesAr: ['زيت زيتون', 'زيت الزيتون', 'زيت', 'ملعقة زيت زيتون'],
    aliasesEn: ['olive oil', 'extra virgin olive oil'],
    isPureMeatOrFish: false,
    state: 'generic',
    per100g: {
      calories: 884.0,
      protein: 0.0,
      carbs: 0.0,
      fat: 100.0,
      sugar: 0.0,
      sodium: 2.0,
    },
    category: 'fat_oil',
  },
  {
    id: 'butter',
    nameAr: 'زبدة',
    nameEn: 'Butter',
    aliasesAr: ['زبدة', 'زبده', 'زبدة طبيعية', 'سمنة'],
    aliasesEn: ['butter', 'ghee'],
    isPureMeatOrFish: false,
    state: 'generic',
    per100g: {
      calories: 717.0,
      protein: 0.9,
      carbs: 0.1,
      fat: 81.1,
      sugar: 0.1,
      sodium: 580.0,
    },
    category: 'fat_oil',
  },
  {
    id: 'tahini',
    nameAr: 'طحينة سمسم',
    nameEn: 'Tahini',
    aliasesAr: ['طحينة', 'طحينه', 'رهش', 'عصارة سمسم'],
    aliasesEn: ['tahini', 'sesame paste'],
    isPureMeatOrFish: false,
    state: 'generic',
    per100g: {
      calories: 595.0,
      protein: 17.0,
      carbs: 21.2,
      fat: 53.8,
      sugar: 0.5,
      sodium: 115.0,
    },
    category: 'fat_oil',
  },

  // VEGETABLES & FRUITS
  {
    id: 'cucumber',
    nameAr: 'خيار طازج',
    nameEn: 'Fresh Cucumber',
    aliasesAr: ['خيار', 'خيارة', 'خيار طازج'],
    aliasesEn: ['cucumber', 'fresh cucumber'],
    isPureMeatOrFish: false,
    state: 'generic',
    per100g: {
      calories: 15.0,
      protein: 0.7,
      carbs: 3.6,
      fat: 0.1,
      sugar: 1.7,
      sodium: 2.0,
    },
    category: 'vegetable',
  },
  {
    id: 'tomato',
    nameAr: 'طماطم طازجة',
    nameEn: 'Fresh Tomato',
    aliasesAr: ['طماطم', 'بندورة', 'طماطم طازجة'],
    aliasesEn: ['tomato', 'tomatoes', 'fresh tomato'],
    isPureMeatOrFish: false,
    state: 'generic',
    per100g: {
      calories: 18.0,
      protein: 0.9,
      carbs: 3.9,
      fat: 0.2,
      sugar: 2.6,
      sodium: 5.0,
    },
    category: 'vegetable',
  },
  {
    id: 'broccoli-cooked',
    nameAr: 'بروكلي مطبوخ / على البخار',
    nameEn: 'Cooked / Steamed Broccoli',
    aliasesAr: ['بروكلي', 'بروكولي', 'بروكلي مسلوق', 'بروكلي مطبوخ'],
    aliasesEn: ['broccoli', 'cooked broccoli', 'steamed broccoli'],
    isPureMeatOrFish: false,
    state: 'cooked',
    per100g: {
      calories: 35.0,
      protein: 2.4,
      carbs: 7.2,
      fat: 0.4,
      sugar: 1.4,
      sodium: 41.0,
    },
    category: 'vegetable',
  },
  {
    id: 'banana',
    nameAr: 'موز طازج',
    nameEn: 'Fresh Banana',
    aliasesAr: ['موز', 'موزة', 'موز طازج'],
    aliasesEn: ['banana', 'bananas'],
    isPureMeatOrFish: false,
    state: 'generic',
    per100g: {
      calories: 89.0,
      protein: 1.1,
      carbs: 22.8,
      fat: 0.3,
      sugar: 12.2,
      sodium: 1.0,
    },
    category: 'fruit',
  },
  {
    id: 'apple',
    nameAr: 'تفاح طازج',
    nameEn: 'Fresh Apple',
    aliasesAr: ['تفاح', 'تفاحة', 'تفاح أخضر', 'تفاح أحمر'],
    aliasesEn: ['apple', 'apples', 'green apple', 'red apple'],
    isPureMeatOrFish: false,
    state: 'generic',
    per100g: {
      calories: 52.0,
      protein: 0.3,
      carbs: 13.8,
      fat: 0.2,
      sugar: 10.4,
      sodium: 1.0,
    },
    category: 'fruit',
  },
  {
    id: 'dates',
    nameAr: 'تمر (خلاص / سكري / مجدول)',
    nameEn: 'Dates',
    aliasesAr: ['تمر', 'رطب', 'تمر خلاص', 'تمر سكري', 'عجوة', 'بلح'],
    aliasesEn: ['dates', 'date fruit', 'medjool dates'],
    isPureMeatOrFish: false,
    state: 'generic',
    per100g: {
      calories: 277.0,
      protein: 1.8,
      carbs: 75.0,
      fat: 0.2,
      sugar: 66.5,
      sodium: 1.0,
    },
    category: 'fruit',
  },
  {
    id: 'avocado',
    nameAr: 'أفوكادو طازج',
    nameEn: 'Fresh Avocado',
    aliasesAr: ['أفوكادو', 'افوكادو', 'أفوكادو طازج'],
    aliasesEn: ['avocado', 'fresh avocado'],
    isPureMeatOrFish: false,
    state: 'generic',
    per100g: {
      calories: 160.0,
      protein: 2.0,
      carbs: 8.5,
      fat: 14.7,
      sugar: 0.7,
      sodium: 7.0,
    },
    category: 'fruit',
  },
  {
    id: 'peanut-butter',
    nameAr: 'زبدة فول سوداني',
    nameEn: 'Peanut Butter',
    aliasesAr: ['زبدة فول سوداني', 'زبدة فستق', 'بينت بتر'],
    aliasesEn: ['peanut butter', 'pb'],
    isPureMeatOrFish: false,
    state: 'generic',
    per100g: {
      calories: 588.0,
      protein: 25.1,
      carbs: 20.0,
      fat: 50.4,
      sugar: 9.2,
      sodium: 429.0,
    },
    category: 'nut_seed',
  },
  {
    id: 'almonds',
    nameAr: 'لوز نيء / محمص',
    nameEn: 'Almonds',
    aliasesAr: ['لوز', 'لوز نيء', 'لوز محمص'],
    aliasesEn: ['almonds', 'raw almonds'],
    isPureMeatOrFish: false,
    state: 'generic',
    per100g: {
      calories: 579.0,
      protein: 21.2,
      carbs: 21.6,
      fat: 49.9,
      sugar: 4.4,
      sodium: 1.0,
    },
    category: 'nut_seed',
  },
  {
    id: 'lentils-cooked',
    nameAr: 'عدس مطبوخ',
    nameEn: 'Cooked Lentils',
    aliasesAr: ['عدس', 'عدس مطبوخ', 'شوربة عدس سادة'],
    aliasesEn: ['lentils', 'cooked lentils', 'brown lentils'],
    isPureMeatOrFish: false,
    state: 'cooked',
    per100g: {
      calories: 116.0,
      protein: 9.0,
      carbs: 20.1,
      fat: 0.4,
      sugar: 1.8,
      sodium: 2.0,
    },
    category: 'legume',
  },
  {
    id: 'chickpeas-cooked',
    nameAr: 'حمص حب مطبوخ / مسلوق',
    nameEn: 'Cooked Chickpeas',
    aliasesAr: ['حمص', 'حمص حب', 'حمص مسلوق', 'بليلة'],
    aliasesEn: ['chickpeas', 'cooked chickpeas', 'garbanzo beans'],
    isPureMeatOrFish: false,
    state: 'cooked',
    per100g: {
      calories: 164.0,
      protein: 8.9,
      carbs: 27.4,
      fat: 2.6,
      sugar: 4.8,
      sodium: 7.0,
    },
    category: 'legume',
  },
  {
    id: 'honey',
    nameAr: 'عسل طبيعي',
    nameEn: 'Pure Honey',
    aliasesAr: ['عسل', 'عسل نحل', 'عسل طبيعي'],
    aliasesEn: ['honey', 'pure honey'],
    isPureMeatOrFish: false,
    state: 'generic',
    per100g: {
      calories: 304.0,
      protein: 0.3,
      carbs: 82.4,
      fat: 0.0,
      sugar: 82.1,
      sodium: 4.0,
    },
    category: 'processed',
  },
];

/**
 * Normalizes Arabic and English text for robust fuzzy & keyword matching
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    // Remove Arabic diacritics (harakat)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize Alefs
    .replace(/[أإآ]/g, 'ا')
    // Normalize Taa Marbouta to Haa
    .replace(/ة/g, 'ه')
    // Normalize Yaa
    .replace(/ى/g, 'ي')
    // Remove extra punctuation
    .replace(/[،,;:!?()[\]]/g, ' ')
    // Normalize spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parses user input to extract quantity in grams if embedded in string
 */
export function extractEmbeddedGrams(input: string): { cleanedFoodName: string; extractedGrams?: number } {
  let cleaned = input;
  let grams: number | undefined = undefined;

  // Patterns like "30 جرام", "30 غرام", "30 غ", "30g", "30 g", "30 grams"
  const gramRegex = /(\d+(?:\.\d+)?)\s*(?:جرام|غرام|جم|غ|grams|gram|g)\b/i;
  const match = input.match(gramRegex);
  if (match) {
    grams = parseFloat(match[1]);
    cleaned = input.replace(match[0], ' ').trim();
  }

  return { cleanedFoodName: cleaned, extractedGrams: grams };
}

/**
 * Determines whether text explicitly specifies raw vs cooked state
 */
export function detectFoodState(text: string): 'raw' | 'cooked' | 'unknown' {
  const norm = normalizeText(text);
  const rawKeywords = ['نيء', 'ني', 'غير مطبوخ', 'طازج', 'قبل الطبخ', 'جاف', 'raw', 'uncooked', 'fresh', 'dry'];
  const cookedKeywords = ['مطبوخ', 'مشوي', 'مسلوق', 'مقلي', 'بالفرن', 'مستوي', 'بعد الطبخ', 'cooked', 'grilled', 'boiled', 'baked', 'roasted', 'fried', 'steamed'];

  if (rawKeywords.some((k) => norm.includes(k))) return 'raw';
  if (cookedKeywords.some((k) => norm.includes(k))) return 'cooked';
  return 'unknown';
}

/**
 * Matches food from the verified database with exact and alias scoring
 */
export function findBestFoodMatch(foodName: string, stateHint?: 'raw' | 'cooked' | 'unknown'): FoodEntry | null {
  const norm = normalizeText(foodName);
  if (!norm) return null;

  const detectedState = stateHint && stateHint !== 'unknown' ? stateHint : detectFoodState(foodName);

  let bestEntry: FoodEntry | null = null;
  let bestScore = -1;

  for (const entry of NUTRITION_DATABASE) {
    let score = 0;

    // Direct check against name
    const normNameAr = normalizeText(entry.nameAr);
    const normNameEn = normalizeText(entry.nameEn);

    if (norm === normNameAr || norm === normNameEn) {
      score += 100;
    } else if (normNameAr.includes(norm) || normNameEn.includes(norm) || norm.includes(normNameAr) || norm.includes(normNameEn)) {
      score += 60;
    }

    // Check aliases
    for (const alias of entry.aliasesAr) {
      const normAlias = normalizeText(alias);
      if (norm === normAlias) {
        score = Math.max(score, 95);
      } else if (norm.includes(normAlias) || normAlias.includes(norm)) {
        score = Math.max(score, 70 + (normAlias.length / 5));
      }
    }

    for (const alias of entry.aliasesEn) {
      const normAlias = normalizeText(alias);
      if (norm === normAlias) {
        score = Math.max(score, 95);
      } else if (norm.includes(normAlias) || normAlias.includes(norm)) {
        score = Math.max(score, 70 + (normAlias.length / 5));
      }
    }

    // State matching modifier
    if (detectedState === 'raw') {
      if (entry.state === 'raw') score += 25;
      else if (entry.state === 'cooked') score -= 25;
    } else if (detectedState === 'cooked') {
      if (entry.state === 'cooked') score += 25;
      else if (entry.state === 'raw') score -= 25;
    } else {
      // If state is not specified, prefer cooked for meats/grains as they are eaten cooked
      if (entry.state === 'cooked') score += 5;
    }

    if (score > bestScore && score >= 40) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  return bestEntry;
}

/**
 * Calculates accurate portion nutrition mathematically from FoodEntry
 * Formula: Nutrient = (NutrientPer100g * portionGrams) / 100
 */
export function calculatePortionFromEntry(entry: FoodEntry, portionGrams: number): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  sodium: number;
} {
  const factor = portionGrams / 100.0;
  
  // Strict rule: pure meat/poultry/fish is strictly 0.0g carbs & 0.0g sugar
  const rawCarbs = entry.isPureMeatOrFish ? 0.0 : entry.per100g.carbs * factor;
  const rawSugar = entry.isPureMeatOrFish ? 0.0 : entry.per100g.sugar * factor;

  return {
    calories: entry.per100g.calories * factor,
    protein: entry.per100g.protein * factor,
    carbs: rawCarbs,
    fat: entry.per100g.fat * factor,
    sugar: rawSugar,
    sodium: entry.per100g.sodium * factor,
  };
}

/**
 * Splits composite/multi-ingredient input (e.g. "100g chicken breast + 50g rice + 10g olive oil")
 */
export function parseMultiIngredients(text: string): Array<{ rawText: string; foodName: string; grams: number }> {
  // Delimiters: +, with, و, مع, comma, newline
  const parts = text.split(/[\+\n,]|(?:\s+و\s+)|\band\b|(?:\s+مع\s+)/i).map((p) => p.trim()).filter(Boolean);
  const result: Array<{ rawText: string; foodName: string; grams: number }> = [];

  for (const part of parts) {
    const { cleanedFoodName, extractedGrams } = extractEmbeddedGrams(part);
    if (cleanedFoodName) {
      result.push({
        rawText: part,
        foodName: cleanedFoodName,
        grams: extractedGrams || 100,
      });
    }
  }

  return result;
}

/**
 * Main Deterministic Calculation Function
 * Computes exact nutritional metrics with mathematical accuracy & zero guessing.
 */
export function calculateNutritionDeterministically(
  mealNameInput: string,
  portionWeightInput: string | number,
  language: 'ar' | 'en' = 'ar'
): NutritionResult | null {
  const isArabic = language === 'ar';
  let portionGrams = typeof portionWeightInput === 'number' ? portionWeightInput : parseFloat(portionWeightInput);

  // Check if portion is embedded in meal name
  const { cleanedFoodName, extractedGrams } = extractEmbeddedGrams(mealNameInput);
  if (extractedGrams && (!portionGrams || isNaN(portionGrams))) {
    portionGrams = extractedGrams;
  }
  if (!portionGrams || isNaN(portionGrams) || portionGrams <= 0) {
    portionGrams = 100;
  }

  // Check if multiple ingredients are passed
  const multiParts = parseMultiIngredients(mealNameInput);
  if (multiParts.length > 1) {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalSugar = 0;
    let totalSodium = 0;
    const breakdown: Array<{
      foodName: string;
      portionGrams: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }> = [];

    let allMatched = true;

    for (const part of multiParts) {
      const match = findBestFoodMatch(part.foodName);
      if (match) {
        const itemPortion = part.grams;
        const metrics = calculatePortionFromEntry(match, itemPortion);
        totalCalories += metrics.calories;
        totalProtein += metrics.protein;
        totalCarbs += metrics.carbs;
        totalFat += metrics.fat;
        totalSugar += metrics.sugar;
        totalSodium += metrics.sodium;
        breakdown.push({
          foodName: isArabic ? match.nameAr : match.nameEn,
          portionGrams: itemPortion,
          calories: parseFloat(metrics.calories.toFixed(1)),
          protein: parseFloat(metrics.protein.toFixed(1)),
          carbs: parseFloat(metrics.carbs.toFixed(1)),
          fat: parseFloat(metrics.fat.toFixed(1)),
        });
      } else {
        allMatched = false;
      }
    }

    if (allMatched && breakdown.length > 0) {
      return {
        calories: totalCalories.toFixed(1),
        protein: totalProtein.toFixed(1),
        carbs: totalCarbs.toFixed(1),
        fat: totalFat.toFixed(1),
        sugar: totalSugar.toFixed(1),
        sodium: totalSodium.toFixed(1),
        calculatedPortionGrams: portionGrams,
        breakdown,
        note: isArabic ? 'تم حساب كل مكون بدقة رياضية مجمعة.' : 'Calculated ingredient-by-ingredient with exact math.',
      };
    }
  }

  // Single food search
  const stateHint = detectFoodState(mealNameInput);
  const match = findBestFoodMatch(cleanedFoodName || mealNameInput, stateHint);

  if (match) {
    const rawMetrics = calculatePortionFromEntry(match, portionGrams);
    
    // Formatting to 1 decimal place with proper rounding
    const result: NutritionResult = {
      calories: rawMetrics.calories.toFixed(1),
      protein: rawMetrics.protein.toFixed(1),
      carbs: rawMetrics.carbs.toFixed(1),
      fat: rawMetrics.fat.toFixed(1),
      sugar: rawMetrics.sugar.toFixed(1),
      sodium: rawMetrics.sodium.toFixed(1),
      matchedFood: isArabic ? match.nameAr : match.nameEn,
      foodState: match.state,
      calculatedPortionGrams: portionGrams,
    };

    // Clarification notice if ambiguous
    if (stateHint === 'unknown' && (match.category === 'poultry' || match.category === 'meat' || match.category === 'grain')) {
      result.clarificationPrompt = isArabic
        ? `الحساب تم على أساس (${match.nameAr}). إذا كان الوزن قبل الطبخ يرجى توضيح (نيء).`
        : `Calculated based on (${match.nameEn}). If the weight is pre-cooking, specify (raw).`;
    }

    return result;
  }

  return null;
}
