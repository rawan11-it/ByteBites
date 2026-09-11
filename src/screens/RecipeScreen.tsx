import React from 'react';
import { useApp } from '../context/AppContext';

export const RecipeScreen: React.FC = () => {
  const { activeRecipe, isRecipeSaved, toggleSaveRecipe, t, theme, language, navigateTo } = useApp();
  const isDark = theme === 'dark';
  const isArabic = language === 'ar';

  const isSaved = isRecipeSaved(activeRecipe.id);

  const title = isArabic ? activeRecipe.title : activeRecipe.titleEn;
  const time = isArabic ? activeRecipe.time : activeRecipe.timeEn;
  const difficulty = isArabic ? activeRecipe.difficulty : activeRecipe.difficultyEn;
  const servings = isArabic ? activeRecipe.servings : activeRecipe.servingsEn;
  const ingredients = isArabic ? activeRecipe.ingredients : activeRecipe.ingredientsEn;
  const instructions = isArabic ? activeRecipe.instructions : activeRecipe.instructionsEn;
  const aiTip = isArabic ? activeRecipe.aiTip : activeRecipe.aiTipEn;

  return (
    <div
      id="recipe-screen-container"
      className={`min-h-screen pt-16 pb-32 transition-colors duration-200 ${
        isDark ? 'bg-[#064e3b] text-white' : 'bg-[#d6fff6] text-[#00352f]'
      }`}
    >
      <main className="w-full max-w-4xl mx-auto px-4 md:px-8 py-4 space-y-6">
        {/* Back Button to My Kitchen */}
        <div className="flex items-center justify-between pb-1">
          <button
            type="button"
            id="recipe-back-to-kitchen-btn"
            onClick={() => navigateTo('my-kitchen')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-label-caps transition-all active:scale-95 cursor-pointer shadow-sm ${
              isDark
                ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                : 'bg-white/90 hover:bg-white border-[#006853]/20 text-[#00352f]'
            }`}
            title={isArabic ? 'العودة لمطبخك الخاص' : 'Back to My Kitchen'}
          >
            <span className="material-symbols-outlined text-base rtl:rotate-180">
              arrow_back
            </span>
            <span>{isArabic ? 'العودة لمطبخك الخاص' : 'Back to My Kitchen'}</span>
          </button>
        </div>

        {/* Recipe Header Image Banner */}
        <div className="relative w-full h-[280px] md:h-[400px] rounded-3xl overflow-hidden shadow-xl border border-white/10">
          <img
            src={activeRecipe.image}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
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
            {ingredients.map((item, idx) => (
              <li
                key={idx}
                className={`flex items-center gap-3 border-b pb-2.5 text-sm font-body-md ${
                  isDark ? 'border-white/10 text-white/90' : 'border-gray-200 text-[#00352f] font-medium'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isDark ? 'bg-[#00f9cb]' : 'bg-[#006853]'}`} />
                <span>{item}</span>
              </li>
            ))}
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
            <div className={`flex items-center justify-center md:justify-start gap-1.5 mb-1 ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
              <span className="material-symbols-outlined text-lg">lightbulb</span>
              <span className="font-ai-spark text-sm font-semibold">{t.recipe.byteTipTitle}</span>
            </div>
            <p className={`font-body-md text-xs leading-relaxed ${isDark ? 'text-white/80' : 'text-[#00352f]'}`}>
              "{aiTip}"
            </p>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Save CTA Bar */}
      <div
        id="recipe-sticky-save-bar"
        className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t shadow-[0_-8px_30px_rgba(0,0,0,0.3)] transition-colors duration-200 ${
          isDark ? 'bg-[#064e3b]/95 border-white/10' : 'bg-[#d6fff6]/95 border-[#006853]/20'
        }`}
      >
        <div className="max-w-4xl mx-auto px-6 py-3.5 flex items-center justify-center">
          <button
            id="recipe-save-toggle-btn"
            onClick={() => toggleSaveRecipe(activeRecipe.id)}
            className={`w-full max-w-sm py-3.5 px-6 rounded-2xl font-label-caps text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 duration-200 cursor-pointer ${
              isSaved
                ? 'bg-[#00f9cb] text-[#00352f] font-bold shadow-[0_0_20px_rgba(0,249,203,0.4)]'
                : isDark
                ? 'border-2 border-[#00f9cb] text-[#00f9cb] hover:bg-[#00f9cb]/10'
                : 'border-2 border-[#006853] text-[#006853] hover:bg-[#006853]/10'
            }`}
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
            >
              {isSaved ? 'bookmark_added' : 'bookmark'}
            </span>
            <span>{isSaved ? t.recipe.savedRecipe : t.recipe.saveRecipe}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
