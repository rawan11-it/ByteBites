import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Recipe } from '../types';
import { AddRecipeModal } from '../components/AddRecipeModal';
import { resolveRecipeImage } from '../utils/recipeImageEngine';

export const MyKitchenScreen: React.FC = () => {
  const {
    language,
    theme,
    navigateTo,
    userKitchenRecipes,
    deleteUserRecipePermanently,
  } = useApp();

  const isDark = theme === 'dark';
  const isArabic = language === 'ar';

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!recipeToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUserRecipePermanently(recipeToDelete.id);
      setRecipeToDelete(null);
    } catch (err) {
      console.error('Error deleting recipe:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      id="my-kitchen-screen-container"
      className={`min-h-screen pt-20 pb-28 px-4 sm:px-6 transition-colors duration-200 ${
        isDark ? 'bg-[#002117] text-white' : 'bg-[#d6fff6] text-[#00352f]'
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header Bar */}
        <div
          id="my-kitchen-header-bar"
          className={`flex items-center justify-between gap-4 border-b pb-4 pt-2 ${
            isDark ? 'border-white/10' : 'border-[#006853]/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="my-kitchen-back-btn"
              onClick={() => navigateTo('home')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border ${
                isDark
                  ? 'bg-white/5 border-white/15 text-white hover:bg-white/10'
                  : 'bg-white border-[#006853]/20 text-[#00352f] hover:bg-[#006853]/10'
              }`}
              title={isArabic ? 'العودة للرئيسية' : 'Back to Home'}
            >
              <span className="material-symbols-outlined text-2xl rtl:rotate-180">
                arrow_back
              </span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1
                  id="my-kitchen-page-title"
                  className={`font-headline-md text-2xl sm:text-3xl font-bold tracking-tight ${
                    isDark ? 'text-white' : 'text-[#00352f]'
                  }`}
                >
                  {isArabic ? 'مطبخك الخاص 🍳' : 'My Kitchen 🍳'}
                </h1>
                {userKitchenRecipes.length > 0 && (
                  <span
                    id="my-kitchen-recipe-counter"
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      isDark
                        ? 'bg-[#00f9cb]/20 text-[#00f9cb] border border-[#00f9cb]/40'
                        : 'bg-[#006853]/15 text-[#006853] border border-[#006853]/30'
                    }`}
                  >
                    {userKitchenRecipes.length} {isArabic ? 'وصفة' : 'recipes'}
                  </span>
                )}
              </div>
              <p
                id="my-kitchen-page-subtitle"
                className={`text-xs sm:text-sm mt-0.5 ${
                  isDark ? 'text-white/70' : 'text-[#00352f]'
                }`}
              >
                {isArabic
                  ? 'مساحتك الخاصة لابتكار وحفظ وصفاتك المميزة، ومشاركتها مع مجتمع بايت بايتس إن أردت.'
                  : 'Your space to create, store, and share your personal recipes with the ByteBites community.'}
              </p>
            </div>
          </div>

          {/* Top Add Recipe Button when recipes exist */}
          {userKitchenRecipes.length > 0 && (
            <button
              type="button"
              id="my-kitchen-top-add-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="py-2.5 px-4 sm:px-5 rounded-2xl font-label-caps text-xs sm:text-sm font-bold bg-[#00f9cb] text-[#00352f] hover:shadow-[0_0_20px_rgba(0,249,203,0.4)] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span className="material-symbols-outlined text-lg font-bold">add</span>
              <span className="hidden sm:inline">
                {isArabic ? 'إضافة وصفة جديدة' : 'Add Recipe'}
              </span>
            </button>
          )}
        </div>

        {/* Main Content Area */}
        {userKitchenRecipes.length === 0 ? (
          /* ==================================================
             EMPTY STATE — EXACTLY AS SPECIFIED:
             "لايوجد لديك وصفات بعد!" with a clear "+" add button
             ================================================== */
          <div
            id="my-kitchen-empty-state-view"
            className={`py-16 sm:py-24 px-6 rounded-3xl border text-center flex flex-col items-center justify-center transition-all ${
              isDark
                ? 'bg-[#002117]/80 border-white/10'
                : 'bg-white/80 border-[#006853]/15'
            }`}
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-6 bg-[#00f9cb]/10 border border-[#00f9cb]/30 text-[#00f9cb]">
              <span className="material-symbols-outlined text-4xl sm:text-5xl font-light">
                menu_book
              </span>
            </div>

            <h2
              id="my-kitchen-empty-state-text"
              className={`font-headline-md text-2xl sm:text-3xl font-bold tracking-tight mb-2 ${
                isDark ? 'text-white' : 'text-[#00352f]'
              }`}
            >
              {isArabic ? 'لايوجد لديك وصفات بعد!' : 'You have no recipes yet!'}
            </h2>

            <p
              id="my-kitchen-empty-state-hint"
              className={`max-w-md text-xs sm:text-sm mb-8 leading-relaxed ${
                isDark ? 'text-white/70' : 'text-[#00352f]'
              }`}
            >
              {isArabic
                ? 'اضغط على زر (+) لإضافة وصفتك الخاصة الأولى وتحديد مكوناتها وطريقة تحضيرها مع مستوى الخصوصية.'
                : 'Tap the (+) button below to add your first personal recipe with ingredients, cooking steps, and privacy settings.'}
            </p>

            {/* Clear "+" add button */}
            <button
              type="button"
              id="my-kitchen-empty-add-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#00f9cb] text-[#00352f] flex items-center justify-center shadow-[0_0_25px_rgba(0,249,203,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
              title={isArabic ? 'إضافة وصفة جديدة' : 'Add Recipe'}
            >
              <span className="material-symbols-outlined text-4xl sm:text-5xl font-bold group-hover:rotate-90 transition-transform duration-300">
                add
              </span>
            </button>
            <span className={`mt-3 font-label-caps text-xs font-semibold ${isDark ? 'text-white/80' : 'text-[#00352f]'}`}>
              {isArabic ? 'إضافة وصفة' : 'Add Recipe'}
            </span>
          </div>
        ) : (
          /* ==================================================
             RECIPES LIST — USER'S PERSONAL RECIPES
             ================================================== */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userKitchenRecipes.map((recipe) => {
                const isRecipePrivate = !recipe.isPublic;
                return (
                  <div
                    key={recipe.id}
                    id={`my-kitchen-recipe-card-${recipe.id}`}
                    className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-lg ${
                      isDark
                        ? 'bg-white/5 border-white/10 hover:border-white/20'
                        : 'bg-white border-[#006853]/15 hover:border-[#006853]/35'
                    }`}
                  >
                    {/* Card Header & Media */}
                    <div className="relative h-44 w-full overflow-hidden bg-black/20">
                      <img
                        src={recipe.image || resolveRecipeImage(recipe)}
                        alt={recipe.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Privacy Badge on Card */}
                      <div className="absolute top-3 right-3 rtl:right-3 ltr:left-3 flex items-center gap-1.5">
                        <span
                          id={`recipe-privacy-badge-${recipe.id}`}
                          className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 backdrop-blur-md shadow-sm ${
                            isRecipePrivate
                              ? 'bg-black/60 text-[#00f9cb] border border-[#00f9cb]/40'
                              : 'bg-blue-900/70 text-blue-200 border border-blue-400/40'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs">
                            {isRecipePrivate ? 'lock' : 'public'}
                          </span>
                          <span>
                            {isRecipePrivate
                              ? (isArabic ? 'خاصة 🔒' : 'Private')
                              : (isArabic ? 'عامة 🌐' : 'Public')}
                          </span>
                        </span>
                      </div>

                      {/* Title over image */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3
                          id={`recipe-card-title-${recipe.id}`}
                          className="font-headline-md text-lg font-bold text-white line-clamp-1 drop-shadow-md"
                        >
                          {recipe.title}
                        </h3>
                      </div>
                    </div>

                    {/* Card Meta & Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <div className={`flex items-center gap-1 font-semibold ${isDark ? 'text-white/80' : 'text-[#00352f]'}`}>
                          <span className={`material-symbols-outlined text-sm ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
                            schedule
                          </span>
                          <span>{recipe.time || (isArabic ? '30 دقيقة' : '30 mins')}</span>
                        </div>

                        <div className={`flex items-center gap-1 font-semibold ${isDark ? 'text-white/80' : 'text-[#00352f]'}`}>
                          <span className={`material-symbols-outlined text-sm ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
                            group
                          </span>
                          <span>{recipe.servings || (isArabic ? '4 أشخاص' : '4 Servings')}</span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className={`flex items-center gap-2 pt-2 border-t ${isDark ? 'border-white/10' : 'border-[#006853]/15'}`}>
                        <button
                          type="button"
                          id={`view-recipe-btn-${recipe.id}`}
                          onClick={() => navigateTo('recipe', recipe.id)}
                          className="flex-1 py-2.5 px-3 rounded-xl font-label-caps text-xs font-bold bg-[#00f9cb] text-[#00352f] hover:bg-[#00f9cb]/90 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-base">
                            visibility
                          </span>
                          <span>{isArabic ? 'عرض الوصفة' : 'View'}</span>
                        </button>

                        <button
                          type="button"
                          id={`delete-recipe-btn-${recipe.id}`}
                          onClick={() => setRecipeToDelete(recipe)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer active:scale-90 text-red-400 hover:text-red-300 hover:bg-red-500/10 ${
                            isDark ? 'border-white/10' : 'border-[#006853]/20'
                          }`}
                          title={isArabic ? 'حذف الوصفة' : 'Delete recipe'}
                        >
                          <span className="material-symbols-outlined text-base">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Recipe Modal */}
      <AddRecipeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onRecipeCreated={() => {
          setIsAddModalOpen(false);
        }}
      />

      {/* Delete Confirmation Dialog */}
      {recipeToDelete && (
        <div
          id="delete-recipe-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => !isDeleting && setRecipeToDelete(null)}
        >
          <div
            id="delete-recipe-modal-dialog"
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border transition-all ${
              isDark
                ? 'bg-[#002117] border-white/15 text-white'
                : 'bg-white border-[#006853]/20 text-[#00352f]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">delete_forever</span>
            </div>

            <h3 className="font-headline-md text-lg font-bold mb-2">
              {isArabic ? 'حذف الوصفة نهائياً؟' : 'Delete Recipe Permanently?'}
            </h3>

            <p className={`text-xs leading-relaxed mb-6 ${isDark ? 'text-white/70' : 'text-[#00352f]/70'}`}>
              {isArabic
                ? `هل أنت متأكد من رغبتك في حذف وصفتك "${recipeToDelete.title}" من مطبخك الخاص؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to permanently delete "${recipeToDelete.title}" from your private kitchen? This cannot be undone.`}
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                id="cancel-delete-recipe-btn"
                disabled={isDeleting}
                onClick={() => setRecipeToDelete(null)}
                className={`py-2 px-4 rounded-full font-label-caps text-xs font-semibold border transition-all cursor-pointer ${
                  isDark
                    ? 'border-white/20 hover:bg-white/10 text-white'
                    : 'border-gray-300 hover:bg-gray-100 text-[#00352f]'
                }`}
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                id="confirm-delete-recipe-btn"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="py-2 px-5 rounded-full font-label-caps text-xs font-bold bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <span className="material-symbols-outlined text-sm animate-spin">
                    progress_activity
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-sm">delete</span>
                )}
                <span>{isArabic ? 'تأكيد الحذف' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
