import React, { useState } from 'react';
import { Recipe } from '../types';
import { useApp } from '../context/AppContext';
import { DeleteRecipeModal } from './DeleteRecipeModal';
import { resolveRecipeImage } from '../utils/recipeImageEngine';

interface RecipeDetailViewProps {
  recipe: Recipe;
  onBack?: () => void;
  backButtonLabel?: string;
}

export const RecipeDetailView: React.FC<RecipeDetailViewProps> = ({
  recipe,
  onBack,
  backButtonLabel,
}) => {
  const { isRecipeSaved, toggleSaveRecipe, deleteUserRecipePermanently, t, theme, language } = useApp();
  const isDark = theme === 'dark';
  const isArabic = language === 'ar';

  const isSaved = isRecipeSaved(recipe.id);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  const title = isArabic ? recipe.title : recipe.titleEn;
  const time = isArabic ? recipe.time : recipe.timeEn;
  const calories = isArabic ? recipe.calories : recipe.caloriesEn;
  const difficulty = isArabic ? recipe.difficulty : recipe.difficultyEn;
  const servings = isArabic ? recipe.servings : recipe.servingsEn;
  const ingredients = isArabic ? recipe.ingredients : recipe.ingredientsEn;
  const instructions = isArabic ? recipe.instructions : recipe.instructionsEn;
  const initialTip = isArabic ? recipe.aiTip : recipe.aiTipEn;

  const [currentTip, setCurrentTip] = useState(initialTip);
  const [isFetchingTip, setIsFetchingTip] = useState(false);

  const handleSaveToggle = () => {
    if (isSaved) {
      setIsDeleteModalOpen(true);
    } else {
      toggleSaveRecipe(recipe.id, recipe);
      setSaveSuccessToast(true);
      setTimeout(() => setSaveSuccessToast(false), 3500);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    await deleteUserRecipePermanently(recipe.id);
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    if (onBack) {
      onBack();
    }
  };

  const handleFetchNewTip = async () => {
    if (isFetchingTip) return;
    setIsFetchingTip(true);
    try {
      const response = await fetch('/api/ai/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeTitle: title,
          ingredients,
          language,
        }),
      });
      const data = await response.json();
      if (data.success && data.tip) {
        setCurrentTip(data.tip);
      }
    } catch (err) {
      console.error('Failed to fetch new tip from Byte:', err);
    } finally {
      setIsFetchingTip(false);
    }
  };

  return (
    <div
      id={`recipe-detail-view-${recipe.id}`}
      className={`w-full transition-colors duration-200 animate-fade-in ${
        isDark ? 'text-white' : 'text-[#00352f]'
      }`}
    >
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Optional Back Button Header */}
        {onBack && (
          <div className="flex items-center justify-between pb-1">
            <button
              id="recipe-detail-back-btn"
              onClick={onBack}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-label-caps transition-all active:scale-95 cursor-pointer shadow-sm ${
                isDark
                  ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                  : 'bg-white/90 hover:bg-white border-[#006853]/20 text-[#00352f]'
              }`}
            >
              <span
                className="material-symbols-outlined text-base"
                style={{ transform: isArabic ? 'rotate(0deg)' : 'rotate(180deg)' }}
              >
                arrow_back
              </span>
              <span>{backButtonLabel || t.recipe.back}</span>
            </button>

            {/* Save Toggle Pill */}
            <button
              id="recipe-quick-save-btn"
              onClick={handleSaveToggle}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-label-caps transition-all active:scale-95 cursor-pointer shadow-sm ${
                isSaved
                  ? 'bg-[#00f9cb] text-[#00352f] font-bold shadow-[0_0_15px_rgba(0,249,203,0.4)]'
                  : isDark
                  ? 'bg-white/10 hover:bg-white/20 border border-[#00f9cb]/40 text-[#00f9cb]'
                  : 'bg-white hover:bg-white/90 border border-[#006853]/30 text-[#006853]'
              }`}
            >
              <span
                className="material-symbols-outlined text-base"
                style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
              >
                {isSaved ? 'bookmark_added' : 'bookmark'}
              </span>
              <span>{isSaved ? t.recipe.savedRecipe : t.recipe.saveRecipe}</span>
            </button>
          </div>
        )}

        {/* Recipe Header Image Banner */}
        <div className="relative w-full h-[260px] md:h-[380px] rounded-3xl overflow-hidden shadow-xl border border-white/10">
          <img
            src={recipe.image || resolveRecipeImage(recipe)}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 flex items-center gap-1 text-[#00f9cb] font-label-caps text-xs">
            <span className="material-symbols-outlined text-sm">smart_toy</span>
            <span>{isArabic ? 'ابتكار بايت' : 'Byte Creation'}</span>
          </div>
        </div>

        {/* Title & Metadata Badges */}
        <header className="space-y-4">
          <h1 className={`font-display-lg-mobile text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
            {title}
          </h1>

          <div className="flex flex-wrap gap-2.5">
            <div
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-label-caps ${
                isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white/90 border-[#006853]/20 text-[#00352f]'
              }`}
            >
              <span className="material-symbols-outlined text-[#00f9cb] text-base">timer</span>
              <span>{time}</span>
            </div>

            {/* Calories badge - hidden for Saver and Wheel generated recipes per requirement 11 */}
            {calories &&
              recipe.source !== 'saver' &&
              recipe.source !== 'wheel' &&
              !recipe.id?.startsWith('saver_') &&
              !recipe.id?.startsWith('wheel_') &&
              calories !== '0' &&
              calories !== '0 kcal' && (
                <div
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-label-caps ${
                    isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white/90 border-[#006853]/20 text-[#00352f]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[#00f9cb] text-base">local_fire_department</span>
                  <span>{calories}</span>
                </div>
              )}

            <div
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-label-caps ${
                isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white/90 border-[#006853]/20 text-[#00352f]'
              }`}
            >
              <span className="material-symbols-outlined text-[#00f9cb] text-base">cookie</span>
              <span>{difficulty}</span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-label-caps ${
                isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white/90 border-[#006853]/20 text-[#00352f]'
              }`}
            >
              <span className="material-symbols-outlined text-[#00f9cb] text-base">restaurant</span>
              <span>{servings}</span>
            </div>
          </div>
        </header>

        {/* Ingredients Card */}
        <section
          className={`rounded-2xl p-6 shadow-md transition-all ${
            isDark ? 'glass-panel ai-glow border border-white/10' : 'bg-white/95 border border-[#006853]/20'
          }`}
        >
          <h2 className={`font-headline-md text-lg md:text-xl font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
            <span className="material-symbols-outlined">kitchen</span>
            <span>{t.recipe.ingredients}</span>
          </h2>
          <ul className="space-y-3">
            {ingredients.map((item, idx) => {
              const isAvailable = item.includes('موجود عندك') || item.includes('In your fridge');
              const isToBuy = item.includes('تحتاج تشتريه') || item.includes('Need to buy');
              return (
                <li
                  key={idx}
                  className={`flex items-center justify-between gap-3 border-b pb-2.5 text-sm font-body-md ${
                    isDark ? 'border-white/10 text-white/90' : 'border-gray-200 text-[#00352f] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isAvailable ? (isDark ? 'bg-[#00f9cb]' : 'bg-[#006853]') : isToBuy ? 'bg-amber-500' : (isDark ? 'bg-[#00f9cb]' : 'bg-[#006853]')
                      }`}
                    />
                    <span>{item}</span>
                  </div>
                  {isAvailable && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold shrink-0 border border-emerald-500/30">
                      {isArabic ? 'متوفر عندك' : 'In your fridge'}
                    </span>
                  )}
                  {isToBuy && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold shrink-0 border border-amber-500/30">
                      {isArabic ? 'تحتاج تشتريه' : 'Need to buy'}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Instructions Card */}
        <section
          className={`rounded-2xl p-6 shadow-md transition-all ${
            isDark ? 'glass-panel ai-glow border border-white/10' : 'bg-white/95 border border-[#006853]/20'
          }`}
        >
          <h2 className={`font-headline-md text-lg md:text-xl font-bold mb-5 flex items-center gap-2 ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
            <span className="material-symbols-outlined">menu_book</span>
            <span>{t.recipe.instructions}</span>
          </h2>
          <div className="space-y-5 relative before:absolute before:right-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#00f9cb]/20">
            {instructions.map((step, idx) => (
              <div key={idx} className="flex gap-4 relative z-10 items-start">
                <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                  isDark ? 'bg-[#00f9cb] text-[#00352f]' : 'bg-[#006853] text-white'
                }`}>
                  {idx + 1}
                </div>
                <p className={`font-body-md text-sm leading-relaxed pt-0.5 ${isDark ? 'text-white/90' : 'text-[#00352f]'}`}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Byte AI Tip Card */}
        <section
          className={`rounded-2xl p-5 border relative overflow-hidden flex flex-col md:flex-row items-center gap-4 ${
            isDark
              ? 'glass-panel border-[#00f9cb]/30 bg-gradient-to-br from-white/5 to-[#00f9cb]/10'
              : 'bg-white/95 border-[#006853]/20 shadow-md'
          }`}
        >
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#00f9cb]/40 shrink-0 bg-[#0d2a22]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1OT03rqd39DlxJL9ZoZ4LaoDVXoea-paKqjQ3zLHaLNyYwxfS9QVTa6ey72JDWrh0KoqmmxzUUgUIsnPgZcMpyILM08S8Z67Mrz02zcD4m04U5P80bKSbW6V73cXr0o7Dbcy34-ri5TcOqkA_4iaohzHNHdL_zje-ia0kvvgx-KF2yUVOU4Nstdyq8TtZ0hticyMZkVlZM_ptDU5LMza6ScvKAhpFIvt0vMrIgbzyCaxcfFi7uXvy"
              alt="Byte Tip"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 text-center md:text-right">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className={`flex items-center justify-center md:justify-start gap-1.5 ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
                <span className="material-symbols-outlined text-lg">lightbulb</span>
                <span className="font-ai-spark text-sm font-semibold">{t.recipe.byteTipTitle}</span>
              </div>
              <button
                id="recipe-another-tip-btn"
                onClick={handleFetchNewTip}
                disabled={isFetchingTip}
                className={`text-[11px] font-label-caps font-semibold px-3 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                  isDark
                    ? 'border-[#00f9cb]/30 text-[#00f9cb] hover:bg-[#00f9cb]/10'
                    : 'border-[#006853]/30 text-[#006853] hover:bg-[#006853]/10'
                } ${isFetchingTip ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <span className="material-symbols-outlined text-xs">auto_awesome</span>
                <span>{isFetchingTip ? (isArabic ? 'جاري الاستشارة...' : 'Consulting...') : (isArabic ? 'نصيحة أخرى من بايت' : 'Another Tip from Byte')}</span>
              </button>
            </div>
            <p className={`font-body-md text-xs leading-relaxed ${isDark ? 'text-white/80' : 'text-[#00352f]/80'}`}>
              "{currentTip}"
            </p>
          </div>
        </section>
      </div>

      {/* Toast confirmation for "تم حفظ الوصفة" */}
      {saveSuccessToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#00f9cb] text-[#00352f] px-5 py-2.5 rounded-full font-label-caps text-sm font-bold shadow-lg shadow-[#00f9cb]/40 flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span>{isArabic ? 'تم حفظ الوصفة' : 'Recipe Saved'}</span>
        </div>
      )}

      {/* Delete Recipe Confirmation Modal */}
      <DeleteRecipeModal
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
