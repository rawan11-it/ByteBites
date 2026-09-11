import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateNutritionDeterministically } from '../utils/nutritionEngine';

export const DietScreen: React.FC = () => {
  const { userId, t, theme, language } = useApp();
  const isDark = theme === 'dark';
  const isArabic = language === 'ar';

  const [mealName, setMealName] = useState('');
  const [portionWeight, setPortionWeight] = useState('');
  const [dietType, setDietType] = useState('low-carb');
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [validationError, setValidationError] = useState('');

  const [metrics, setMetrics] = useState({
    calories: '00.0',
    protein: '00.0',
    carbs: '00.0',
    fat: '00.0',
    sugar: '00.0',
    sodium: '00.0',
  });

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim() || !portionWeight.trim()) {
      setValidationError(t.diet.alertFill);
      return;
    }
    setValidationError('');
    setIsCalculating(true);

    try {
      // Check local deterministic database first for instant accurate calculation
      const localResult = calculateNutritionDeterministically(
        mealName.trim(),
        portionWeight.trim(),
        language as 'ar' | 'en'
      );

      if (localResult) {
        setMetrics({
          calories: localResult.calories,
          protein: localResult.protein,
          carbs: localResult.carbs,
          fat: localResult.fat,
          sugar: localResult.sugar,
          sodium: localResult.sodium,
        });
      } else {
        const response = await fetch('/api/ai/diet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mealName: mealName.trim(),
            portionWeight: portionWeight.trim(),
            dietType,
            language,
            userId,
          }),
        });

        const data = await response.json();
        const resData = data.analysis || data.metrics;
        if (data.success && resData) {
          setMetrics({
            calories: String(resData.calories || '0.0'),
            protein: String(resData.protein || '0.0'),
            carbs: String(resData.carbs || '0.0'),
            fat: String(resData.fat || '0.0'),
            sugar: String(resData.sugar || '0.0'),
            sodium: String(resData.sodium || '0.0'),
          });
        } else {
          throw new Error(data.error || 'Failed to calculate');
        }
      }
    } catch (err) {
      console.error('AI Diet calculation fallback:', err);
      // Fallback: use database calculator
      const fallbackResult = calculateNutritionDeterministically(
        mealName.trim(),
        portionWeight.trim(),
        language as 'ar' | 'en'
      );
      if (fallbackResult) {
        setMetrics({
          calories: fallbackResult.calories,
          protein: fallbackResult.protein,
          carbs: fallbackResult.carbs,
          fat: fallbackResult.fat,
          sugar: fallbackResult.sugar,
          sodium: fallbackResult.sodium,
        });
      }
    } finally {
      setIsCalculating(false);
      setHasCalculated(true);
      setTimeout(() => {
        const resultElement = document.getElementById('diet-results-section');
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <div
      id="diet-screen-container"
      className={`min-h-screen pt-20 pb-32 px-6 max-w-2xl mx-auto transition-colors duration-200 ${
        isDark ? 'bg-[#001f2a] text-white' : 'bg-[#d6fff6] text-[#00352f]'
      }`}
    >
      {/* Hero Section with Robot */}
      <section className="flex flex-col items-center text-center my-4">
        <div className="w-36 h-36 md:w-44 md:h-44 rounded-full glass-panel ai-glow flex items-center justify-center relative overflow-hidden mb-4 border-2 border-[#00f9cb]/30 shadow-lg">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQP68ns2hekW5cmdIC_1Cje4CpWgry28porRbkwjO6ZSShJXDm_5jNsCvllmB7Uo8iga1AC3VBbFSKt-FUfI2c8Z5x073WNbvpaernO__tnfDTOQDFFanUsFT2vcGhfX4L6w0_WTNSLgjJutGZt6LhSWH4gDrr33OLD593Wuc2Kp-n1HQyJRchLo1M1u1KNLruC-K1NEwF6ykLEJexC8jMYuwfnKJbRFloNBD0_gojBv20wyiAyG5gS4imY5f2MD7EfxMRCXkLsFXVEg"
            alt="Byte Diet Robot"
            className="object-cover w-full h-full rounded-full"
          />
        </div>
        <h2 className={`font-headline-md text-2xl font-bold mb-1 flex items-center justify-center gap-2 ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
          <span className={`material-symbols-outlined ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
            set_meal
          </span>
          <span>{t.diet.title}</span>
        </h2>
        <p className={`font-body-md text-sm leading-relaxed max-w-md ${isDark ? 'text-white/80' : 'text-[#00352f]'}`}>
          {t.diet.subtitle}
        </p>
      </section>

      {/* Customization Bento Box */}
      <section
        className={`glass-panel rounded-[2rem] p-6 md:p-8 ai-glow relative mb-8 transition-all ${
          isDark ? 'border-white/10' : 'bg-white/90 border-[#006853]/20 shadow-md'
        }`}
      >
        <div className="absolute top-0 left-0 bg-[#42f9e3] text-[#00352f] font-label-caps text-xs px-4 py-1.5 rounded-br-[1rem] rounded-tl-[2rem] flex items-center gap-1 shadow-sm font-bold">
          <span className="material-symbols-outlined text-sm">auto_awesome</span>
          <span>{t.diet.smartAnalysis}</span>
        </div>

        <h3 className={`font-headline-md text-xl font-bold mb-6 mt-4 md:mt-0 ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
          {t.diet.customizationTitle}
        </h3>

        <form onSubmit={handleCalculate} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Meal Name Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="meal-name-input" className={`font-label-caps text-xs ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
                {t.diet.mealNameLabel}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-4 flex items-center text-gray-400">
                  <span className="material-symbols-outlined text-lg">restaurant_menu</span>
                </span>
                <input
                  id="meal-name-input"
                  type="text"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder={t.diet.mealNamePlaceholder}
                  className={`w-full pl-4 pr-11 py-3.5 rounded-full border transition-all font-body-md text-sm outline-none ${
                    isDark
                      ? 'bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-[#00f9cb]'
                      : 'bg-white border-[#006853]/30 text-[#00352f] placeholder-gray-400 focus:border-[#006853]'
                  }`}
                />
              </div>
            </div>

            {/* Portion Weight Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="portion-weight-input" className={`font-label-caps text-xs ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
                {t.diet.portionLabel}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-4 flex items-center text-gray-400">
                  <span className="material-symbols-outlined text-lg">hourglass_empty</span>
                </span>
                <input
                  id="portion-weight-input"
                  type="number"
                  value={portionWeight}
                  onChange={(e) => setPortionWeight(e.target.value)}
                  placeholder="150"
                  className={`w-full pl-16 pr-11 py-3.5 rounded-full border transition-all font-body-md text-sm outline-none ${
                    isDark
                      ? 'bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-[#00f9cb]'
                      : 'bg-white border-[#006853]/30 text-[#00352f] placeholder-gray-400 focus:border-[#006853]'
                  }`}
                />
                <span className={`absolute inset-y-0 left-4 flex items-center font-label-caps text-xs ${isDark ? 'text-white/80' : 'text-[#00352f]/80'}`}>
                  {t.diet.gramUnit}
                </span>
              </div>
            </div>
          </div>

          {validationError && (
            <p className="text-red-400 text-xs text-center font-body-md">{validationError}</p>
          )}

          <button
            id="calculate-diet-values-btn"
            type="submit"
            disabled={isCalculating}
            className={`btn-gradient text-white rounded-full py-3.5 px-8 font-label-caps text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 mt-2 w-full md:w-auto self-center md:self-end cursor-pointer ${
              isCalculating ? 'opacity-80 cursor-wait' : ''
            }`}
          >
            {isCalculating ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                <span>{language === 'ar' ? 'جارٍ الحساب بواسطة بايت...' : 'Calculating with Byte...'}</span>
              </>
            ) : (
              <span>{t.diet.calculateBtn}</span>
            )}
          </button>
        </form>
      </section>

      {/* Results Section Grid */}
      <section id="diet-results-section" className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {/* Calories */}
        <div
          className={`glass-panel rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2 border-t-4 border-t-[#0aceff] transition-all duration-200 ${
            isDark ? 'hover:bg-white/10' : 'bg-white hover:bg-white/90 shadow-sm'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[#0aceff]/20 flex items-center justify-center mb-1">
            <span className={`material-symbols-outlined ${isDark ? 'text-[#0aceff]' : 'text-[#00647d]'}`}>local_fire_department</span>
          </div>
          <span className={`font-display-lg-mobile text-2xl md:text-3xl font-bold ${isDark ? 'text-[#0aceff]' : 'text-[#00647d]'}`}>
            {metrics.calories}
          </span>
          <span className={`font-label-caps text-xs font-semibold ${isDark ? 'text-white/70' : 'text-[#00352f]'}`}>
            {t.diet.calories}
          </span>
        </div>

        {/* Protein */}
        <div
          className={`glass-panel rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2 border-t-4 border-t-[#00f9cb] transition-all duration-200 ${
            isDark ? 'hover:bg-white/10' : 'bg-white hover:bg-white/90 shadow-sm'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[#00f9cb]/20 flex items-center justify-center mb-1">
            <span className={`material-symbols-outlined ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>fitness_center</span>
          </div>
          <span className={`font-display-lg-mobile text-2xl md:text-3xl font-bold ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
            {metrics.protein}
          </span>
          <span className={`font-label-caps text-xs font-semibold ${isDark ? 'text-white/70' : 'text-[#00352f]'}`}>
            {t.diet.protein}
          </span>
        </div>

        {/* Carbs */}
        <div
          className={`glass-panel rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2 border-t-4 border-t-[#42f9e3] transition-all duration-200 ${
            isDark ? 'hover:bg-white/10' : 'bg-white hover:bg-white/90 shadow-sm'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[#42f9e3]/20 flex items-center justify-center mb-1">
            <span className={`material-symbols-outlined ${isDark ? 'text-[#42f9e3]' : 'text-[#00675d]'}`}>grain</span>
          </div>
          <span className={`font-display-lg-mobile text-2xl md:text-3xl font-bold ${isDark ? 'text-[#42f9e3]' : 'text-[#00675d]'}`}>
            {metrics.carbs}
          </span>
          <span className={`font-label-caps text-xs font-semibold ${isDark ? 'text-white/70' : 'text-[#00352f]'}`}>
            {t.diet.carbs}
          </span>
        </div>

        {/* Fat */}
        <div
          className={`glass-panel rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2 border-t-4 border-t-[#00f9cb] transition-all duration-200 ${
            isDark ? 'hover:bg-white/10' : 'bg-white hover:bg-white/90 shadow-sm'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[#00f9cb]/20 flex items-center justify-center mb-1">
            <span className={`material-symbols-outlined ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>opacity</span>
          </div>
          <span className={`font-display-lg-mobile text-2xl md:text-3xl font-bold ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
            {metrics.fat}
          </span>
          <span className={`font-label-caps text-xs font-semibold ${isDark ? 'text-white/70' : 'text-[#00352f]'}`}>
            {t.diet.fat}
          </span>
        </div>

        {/* Sugar */}
        <div
          className={`glass-panel rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2 border-t-4 border-t-[#0aceff] transition-all duration-200 ${
            isDark ? 'hover:bg-white/10' : 'bg-white hover:bg-white/90 shadow-sm'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[#0aceff]/20 flex items-center justify-center mb-1">
            <span className={`material-symbols-outlined ${isDark ? 'text-[#0aceff]' : 'text-[#00647d]'}`}>icecream</span>
          </div>
          <span className={`font-display-lg-mobile text-2xl md:text-3xl font-bold ${isDark ? 'text-[#0aceff]' : 'text-[#00647d]'}`}>
            {metrics.sugar}
          </span>
          <span className={`font-label-caps text-xs font-semibold ${isDark ? 'text-white/70' : 'text-[#00352f]'}`}>
            {t.diet.sugar}
          </span>
        </div>

        {/* Sodium */}
        <div
          className={`glass-panel rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2 border-t-4 border-t-[#42f9e3] transition-all duration-200 ${
            isDark ? 'hover:bg-white/10' : 'bg-white hover:bg-white/90 shadow-sm'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[#42f9e3]/20 flex items-center justify-center mb-1">
            <span className={`material-symbols-outlined ${isDark ? 'text-[#42f9e3]' : 'text-[#00675d]'}`}>science</span>
          </div>
          <span className={`font-display-lg-mobile text-2xl md:text-3xl font-bold ${isDark ? 'text-[#42f9e3]' : 'text-[#00675d]'}`}>
            {metrics.sodium}
          </span>
          <span className={`font-label-caps text-xs font-semibold ${isDark ? 'text-white/70' : 'text-[#00352f]'}`}>
            {t.diet.sodium}
          </span>
        </div>
      </section>
    </div>
  );
};
