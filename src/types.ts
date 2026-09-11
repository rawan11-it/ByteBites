export type Language = 'ar' | 'en';
export type Theme = 'dark' | 'light';
export type TextSize = 'normal' | 'large' | 'xlarge';
export type Page = 'welcome' | 'home' | 'wheel' | 'saver' | 'diet' | 'account' | 'chat' | 'recipe' | 'my-kitchen';

export interface RecipeHistoryItem {
  id?: string;
  category: string;
  title: string;
  timestamp?: number;
}

export interface Recipe {
  id: string;
  title: string;
  titleEn: string;
  image: string;
  rating: number;
  time: string;
  timeEn: string;
  calories: string;
  caloriesEn: string;
  difficulty: string;
  difficultyEn: string;
  servings: string;
  servingsEn: string;
  category: string;
  categoryEn: string;
  ingredients: string[];
  ingredientsEn: string[];
  instructions: string[];
  instructionsEn: string[];
  aiTip: string;
  aiTipEn: string;
  source?: 'preset' | 'user' | 'saver' | 'wheel' | 'ai';
  userId?: string;
  isPublic?: boolean;
  authorName?: string;
  createdAt?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time?: string;
  hasSmartCard?: boolean;
  smartCardTitle?: string;
  smartCardContent?: string;
  smartCardRecipeId?: string;
}
