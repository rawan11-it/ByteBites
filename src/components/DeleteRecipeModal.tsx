import React from 'react';
import { useApp } from '../context/AppContext';

interface DeleteRecipeModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteRecipeModal: React.FC<DeleteRecipeModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
  isDeleting = false,
}) => {
  const { language, theme, t } = useApp();
  const isDark = theme === 'dark';
  const isArabic = language === 'ar';

  if (!isOpen) return null;

  return (
    <div
      id="delete-recipe-confirmation-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-all ${
          isDark
            ? 'bg-[#002117] border-red-500/30 text-white'
            : 'bg-white border-red-400/40 text-[#00352f]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon Header */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500">
          <span className="material-symbols-outlined text-3xl">warning</span>
        </div>

        {/* Warning Text as strictly requested by user */}
        <p className={`font-headline-md text-sm md:text-base text-center leading-relaxed font-semibold mb-6 px-2 ${
          isDark ? 'text-red-400' : 'text-red-700'
        }`}>
          {t.recipe.deleteWarning ||
            (isArabic
              ? 'تنبيه: حذف هذه الوصفة سيؤدي لإزالتها نهائياً من مفضلتك ومن توليد بايت. هل أنت متأكد؟'
              : 'Warning: Deleting this recipe will permanently remove it from your favorites and from Byte generation. Are you sure?')}
        </p>

        {/* Action Buttons: "إلغاء" and "نعم، حذف" */}
        <div className="flex items-center gap-3">
          <button
            id="cancel-delete-recipe-btn"
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className={`flex-1 py-3 px-5 rounded-full font-label-caps text-sm font-bold border transition-all cursor-pointer text-center ${
              isDark
                ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-[#00352f]'
            }`}
          >
            {t.recipe.cancel || (isArabic ? 'إلغاء' : 'Cancel')}
          </button>

          <button
            id="confirm-delete-recipe-btn"
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 px-5 rounded-full font-label-caps text-sm font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            {isDeleting ? (
              <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-base">delete_forever</span>
            )}
            <span>{t.recipe.confirmDelete || (isArabic ? 'نعم، حذف' : 'Yes, delete')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
