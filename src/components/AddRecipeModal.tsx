import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Recipe } from '../types';

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecipeCreated?: (recipe: Recipe) => void;
}

export const AddRecipeModal: React.FC<AddRecipeModalProps> = ({
  isOpen,
  onClose,
  onRecipeCreated,
}) => {
  const { language, theme, addUserRecipe, navigateTo } = useApp();
  const isDark = theme === 'dark';
  const isArabic = language === 'ar';

  const [title, setTitle] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [instructionsText, setInstructionsText] = useState('');
  const [servings, setServings] = useState('');
  const [time, setTime] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [createdRecipe, setCreatedRecipe] = useState<Recipe | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle('');
    setIngredientsText('');
    setInstructionsText('');
    setServings('');
    setTime('');
    setIsPublic(false);
    setErrorMessage(null);
    setSavedSuccessfully(false);
    setCreatedRecipe(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate all 5 required fields
    const cleanTitle = title.trim();
    const cleanServings = servings.trim();
    const cleanTime = time.trim();

    // Parse ingredients by newline or commas
    const ingredients = ingredientsText
      .split('\n')
      .map(i => i.trim())
      .filter(i => i.length > 0);

    // Parse instructions by newline
    const instructions = instructionsText
      .split('\n')
      .map(i => i.trim())
      .filter(i => i.length > 0);

    if (!cleanTitle || ingredients.length === 0 || instructions.length === 0 || !cleanServings || !cleanTime) {
      setErrorMessage(
        isArabic
          ? 'جميع الحقول مطلوبة (اسم الوصفة، المكونات، طريقة التحضير، عدد الأشخاص، ووقت الطهي)'
          : 'All fields are required (Recipe title, ingredients, instructions, servings, and cooking time)'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addUserRecipe({
        title: cleanTitle,
        ingredients,
        instructions,
        servings: cleanServings,
        time: cleanTime,
        isPublic,
      });

      if (result.success && result.recipe) {
        setSavedSuccessfully(true);
        setCreatedRecipe(result.recipe);
        if (onRecipeCreated) {
          onRecipeCreated(result.recipe);
        }
      } else {
        setErrorMessage(
          result.error ||
            (isArabic
              ? 'حدث خطأ أثناء حفظ الوصفة في قاعدة البيانات. يرجى المحاولة مرة أخرى.'
              : 'Failed to save recipe to database. Please try again.')
        );
      }
    } catch (err: any) {
      console.error('Error saving user recipe:', err);
      setErrorMessage(
        err?.message ||
          (isArabic
            ? 'فشل الاتصال بالخادم لحفظ الوصفة.'
            : 'Connection error while saving recipe.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="add-recipe-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={handleClose}
    >
      <div
        id="add-recipe-modal-dialog"
        className={`w-full max-w-xl my-8 rounded-3xl p-6 md:p-8 shadow-2xl border transition-all ${
          isDark
            ? 'bg-[#002117] border-white/15 text-white'
            : 'bg-white border-[#006853]/20 text-[#00352f]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success View after real DB save */}
        {savedSuccessfully ? (
          <div className="text-center py-6 space-y-5 animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#00f9cb]/20 border-2 border-[#00f9cb] flex items-center justify-center text-[#00f9cb]">
              <span className="material-symbols-outlined text-3xl font-bold">check_circle</span>
            </div>

            <div className="space-y-2">
              <h3 className={`font-headline-md text-2xl font-bold ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
                {isArabic ? 'تم حفظ الوصفة' : 'Recipe Saved'}
              </h3>
              <p className={`text-sm ${isDark ? 'text-white/80' : 'text-[#00352f]'}`}>
                {isArabic
                  ? 'تم حفظ وصفتك بنجاح في مفضلتك وقاعدة البيانات، وأصبحت متاحة للشيف بايت!'
                  : 'Your recipe has been successfully saved to your favorites and is now known by Chef Byte!'}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              {createdRecipe && (
                <button
                  id="view-newly-created-recipe-btn"
                  onClick={() => {
                    handleClose();
                    navigateTo('recipe', createdRecipe.id);
                  }}
                  className="py-3 px-6 rounded-full font-label-caps text-sm font-bold bg-[#00f9cb] text-[#00352f] hover:bg-[#00f9cb]/90 transition-all cursor-pointer shadow-lg shadow-[#00f9cb]/30 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">restaurant_menu</span>
                  <span>{isArabic ? 'عرض الوصفة' : 'View Recipe'}</span>
                </button>
              )}

              <button
                id="add-another-recipe-btn"
                onClick={resetForm}
                className={`py-3 px-6 rounded-full font-label-caps text-sm font-semibold border transition-all cursor-pointer ${
                  isDark
                    ? 'border-white/20 hover:bg-white/10 text-white'
                    : 'border-[#006853]/30 hover:bg-[#006853]/10 text-[#00352f]'
                }`}
              >
                {isArabic ? 'إضافة وصفة أخرى +' : 'Add Another +'}
              </button>

              <button
                id="close-add-recipe-success-btn"
                onClick={handleClose}
                className={`py-3 px-6 rounded-full font-label-caps text-sm font-semibold border transition-all cursor-pointer ${
                  isDark
                    ? 'border-white/10 hover:bg-white/5 text-white/70'
                    : 'border-gray-200 hover:bg-gray-100 text-gray-600'
                }`}
              >
                {isArabic ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <div>
            {/* Header */}
            <div className={`flex items-center justify-between pb-4 mb-5 border-b ${isDark ? 'border-white/10' : 'border-[#006853]/15'}`}>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-2xl ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
                  skillet
                </span>
                <h3 className={`font-headline-md text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
                  {isArabic ? 'مطبخك الخاص - إضافة وصفة جديدة 🍳' : 'Your Private Kitchen - Add Recipe 🍳'}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isDark
                    ? 'hover:bg-white/10 text-white/70 hover:text-white'
                    : 'hover:bg-black/5 text-[#00352f]/70 hover:text-[#00352f]'
                }`}
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-red-400">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Recipe Title */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/90' : 'text-[#00352f]'}`}>
                  {isArabic ? 'اسم الوصفة *' : 'Recipe Name *'}
                </label>
                <input
                  id="recipe-input-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isArabic ? 'مثلاً: كبسة دجاج بالزعفران، فتوش...' : 'e.g. Saffron Chicken Kabsa, Fattoush...'}
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-body-md outline-none transition-colors ${
                    isDark
                      ? 'bg-white/5 border-white/15 focus:border-[#00f9cb] text-white placeholder-white/40'
                      : 'bg-[#aef6e9]/10 border-[#006853]/25 focus:border-[#006853] text-[#00352f] placeholder-gray-400'
                  }`}
                />
              </div>

              {/* Servings & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/90' : 'text-[#00352f]'}`}>
                    {isArabic ? 'عدد الأشخاص / الحصص *' : 'Servings / Persons *'}
                  </label>
                  <input
                    id="recipe-input-servings"
                    type="text"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    placeholder={isArabic ? 'مثلاً: 4 أشخاص' : 'e.g. 4 servings'}
                    required
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-body-md outline-none transition-colors ${
                      isDark
                        ? 'bg-white/5 border-white/15 focus:border-[#00f9cb] text-white placeholder-white/40'
                        : 'bg-[#aef6e9]/10 border-[#006853]/25 focus:border-[#006853] text-[#00352f] placeholder-gray-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/90' : 'text-[#00352f]'}`}>
                    {isArabic ? 'وقت التحضير والطهي *' : 'Cooking & Prep Time *'}
                  </label>
                  <input
                    id="recipe-input-time"
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder={isArabic ? 'مثلاً: 35 دقيقة' : 'e.g. 35 mins'}
                    required
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-body-md outline-none transition-colors ${
                      isDark
                        ? 'bg-white/5 border-white/15 focus:border-[#00f9cb] text-white placeholder-white/40'
                        : 'bg-[#aef6e9]/10 border-[#006853]/25 focus:border-[#006853] text-[#00352f] placeholder-gray-400'
                    }`}
                  />
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`block text-xs font-semibold ${isDark ? 'text-white/90' : 'text-[#00352f]'}`}>
                    {isArabic ? 'المكونات *' : 'Ingredients *'}
                  </label>
                  <span className={`text-[11px] ${isDark ? 'text-white/50' : 'text-[#00352f]/70'}`}>
                    {isArabic ? '(اكتب كل مكون في سطر منفصل)' : '(One ingredient per line)'}
                  </span>
                </div>
                <textarea
                  id="recipe-input-ingredients"
                  rows={4}
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  placeholder={
                    isArabic
                      ? '500غ صدور دجاج\n2 كوب أرز بسمتي\n1 بصلة مفرومة\n2 فص ثوم مهروس\nملعقة بهارات مشكلة\nملح وفلفل أسود'
                      : '500g chicken breasts\n2 cups basmati rice\n1 diced onion\n2 minced garlic cloves\n1 tbsp mixed spices\nSalt & black pepper'
                  }
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-body-md outline-none transition-colors leading-relaxed ${
                    isDark
                      ? 'bg-white/5 border-white/15 focus:border-[#00f9cb] text-white placeholder-white/40'
                      : 'bg-[#aef6e9]/10 border-[#006853]/25 focus:border-[#006853] text-[#00352f] placeholder-gray-400'
                  }`}
                />
              </div>

              {/* Preparation / Instructions */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`block text-xs font-semibold ${isDark ? 'text-white/90' : 'text-[#00352f]'}`}>
                    {isArabic ? 'طريقة التحضير والطهي *' : 'Preparation & Cooking Steps *'}
                  </label>
                  <span className={`text-[11px] ${isDark ? 'text-white/50' : 'text-[#00352f]/70'}`}>
                    {isArabic ? '(اكتب خطوات التحضير بالتفصيل)' : '(Detail each cooking step)'}
                  </span>
                </div>
                <textarea
                  id="recipe-input-instructions"
                  rows={4}
                  value={instructionsText}
                  onChange={(e) => setInstructionsText(e.target.value)}
                  placeholder={
                    isArabic
                      ? '1. نسخن الزيت في قدر مناسب ونحمر البصل والثوم حتى يكتسب لوناً ذهبياً.\n2. نضيف قطع الدجاج والبهارات ونقلب حتى يتغير لونه.\n3. نضيف الماء ونتركه يغلي حتى ينضج الدجاج.\n4. نضيف الأرز المغسول ونتركه على نار هادئة حتى ينضج تماماً.'
                      : '1. Heat oil in a deep pot, sauté onion and garlic until fragrant.\n2. Add chicken pieces and spices, stir until browned.\n3. Add water and simmer until cooked.\n4. Add washed rice and cook over low heat until tender.'
                  }
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-body-md outline-none transition-colors leading-relaxed ${
                    isDark
                      ? 'bg-white/5 border-white/15 focus:border-[#00f9cb] text-white placeholder-white/40'
                      : 'bg-[#aef6e9]/10 border-[#006853]/25 focus:border-[#006853] text-[#00352f] placeholder-gray-400'
                  }`}
                />
              </div>

              {/* Privacy Choice (Private vs Public) */}
              <div className="space-y-2 pt-1">
                <label className={`block font-label-caps text-xs font-semibold ${isDark ? 'text-white/90' : 'text-[#00352f]/90'}`}>
                  {isArabic ? 'خصوصية الوصفة (اختر مستوى المشاركة)' : 'Recipe Privacy Level'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    id="privacy-option-private"
                    onClick={() => setIsPublic(false)}
                    className={`p-3 rounded-2xl border text-right rtl:text-right ltr:text-left transition-all cursor-pointer ${
                      !isPublic
                        ? isDark
                          ? 'border-[#00f9cb] bg-[#00f9cb]/15 shadow-sm'
                          : 'border-[#006853] bg-[#aef6e9]/40 shadow-sm'
                        : isDark
                        ? 'border-white/10 bg-white/5 hover:border-white/20'
                        : 'border-[#006853]/15 bg-white hover:border-[#006853]/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`material-symbols-outlined text-base ${!isPublic ? (isDark ? 'text-[#00f9cb]' : 'text-[#006853]') : 'text-gray-400'}`}>
                        lock
                      </span>
                      <span className="font-headline-md font-bold text-xs sm:text-sm leading-snug">
                        {isArabic ? 'وصفة خاصة (لي فقط)' : 'Private Recipe (Me only)'}
                      </span>
                      {!isPublic && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold mr-auto rtl:mr-auto ltr:ml-auto shrink-0 ${
                          isDark ? 'bg-[#00f9cb] text-[#00352f]' : 'bg-[#006853] text-white'
                        }`}>
                          {isArabic ? 'الافتراضي' : 'Default'}
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isDark ? 'text-white/70' : 'text-[#00352f]/75'}`}>
                      {isArabic
                        ? 'تبقى سرية في مطبخك فقط ولا يراها أحد غيرك، ويستعين بها بايت لمساعدتك وحدك.'
                        : 'Kept private in your kitchen. Only accessible to you and your Byte assistant.'}
                    </p>
                  </button>

                  <button
                    type="button"
                    id="privacy-option-public"
                    onClick={() => setIsPublic(true)}
                    className={`p-3 rounded-2xl border text-right rtl:text-right ltr:text-left transition-all cursor-pointer ${
                      isPublic
                        ? isDark
                          ? 'border-[#00f9cb] bg-[#00f9cb]/15 shadow-sm'
                          : 'border-[#006853] bg-[#aef6e9]/40 shadow-sm'
                        : isDark
                        ? 'border-white/10 bg-white/5 hover:border-white/20'
                        : 'border-[#006853]/15 bg-white hover:border-[#006853]/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`material-symbols-outlined text-base ${isPublic ? (isDark ? 'text-[#00f9cb]' : 'text-[#006853]') : 'text-gray-400'}`}>
                        public
                      </span>
                      <span className="font-headline-md font-bold text-xs sm:text-sm leading-snug">
                        {isArabic ? 'وصفة عامة (مشاركة)' : 'Public Recipe (Shared)'}
                      </span>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isDark ? 'text-white/70' : 'text-[#00352f]/75'}`}>
                      {isArabic
                        ? 'تشارك وصفتك مع مجتمع بايت بايتس، ويمكن لبايت اقتراحها لإلهام باقي المستخدمين.'
                        : 'Share with the community. Byte can suggest it to inspire other home chefs.'}
                    </p>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  id="cancel-add-recipe-btn"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className={`py-2.5 px-5 rounded-full font-label-caps text-xs font-bold border transition-all cursor-pointer ${
                    isDark
                      ? 'border-white/20 hover:bg-white/10 text-white'
                      : 'border-gray-300 hover:bg-gray-100 text-[#00352f]'
                  }`}
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  id="submit-save-recipe-btn"
                  disabled={isSubmitting}
                  className="py-2.5 px-6 rounded-full font-label-caps text-xs font-bold bg-[#00f9cb] text-[#00352f] hover:shadow-[0_0_20px_rgba(0,249,203,0.5)] active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                      <span>{isArabic ? 'جاري الحفظ...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">save</span>
                      <span>{isArabic ? 'حفظ الوصفة' : 'Save Recipe'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
