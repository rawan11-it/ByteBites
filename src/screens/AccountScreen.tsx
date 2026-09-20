import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Recipe } from '../types';
import { RecipeDetailView } from '../components/RecipeDetailView';
import { AboutView } from '../components/AboutView';
import { FaqView } from '../components/FaqView';
import { DeleteRecipeModal } from '../components/DeleteRecipeModal';

export const AccountScreen: React.FC = () => {
  const {
    userName,
    userEmail,
    setUserName,
    language,
    setLanguage,
    theme,
    setTheme,
    textSize,
    setTextSize,
    gender,
    setGender,
    isGoogleLoggedIn,
    isFirebaseSyncing,
    toggleGoogleLogin,
    savedRecipesList,
    deleteUserRecipePermanently,
    navigateTo,
    t,
  } = useApp();

  const isDark = theme === 'dark';
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [viewingSavedRecipe, setViewingSavedRecipe] = useState<Recipe | null>(null);
  const [viewingSubView, setViewingSubView] = useState<'about' | 'faq' | null>(null);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!recipeToDelete) return;
    setIsDeleting(true);
    await deleteUserRecipePermanently(recipeToDelete.id);
    setIsDeleting(false);
    if (viewingSavedRecipe?.id === recipeToDelete.id) {
      setViewingSavedRecipe(null);
    }
    setRecipeToDelete(null);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
    }
    setIsEditingName(false);
  };

  const handleSignOut = () => {
    if (isGoogleLoggedIn) {
      toggleGoogleLogin();
    }
    // Navigate back to welcome or reset
    navigateTo('welcome');
  };

  if (viewingSavedRecipe) {
    return (
      <div
        id="account-screen-container"
        className={`min-h-screen pt-20 pb-32 px-6 max-w-4xl mx-auto transition-colors duration-200 ${
          isDark ? 'bg-[#133b30] text-white' : 'bg-[#d6fff6] text-[#00352f]'
        }`}
      >
        <RecipeDetailView
          recipe={viewingSavedRecipe}
          onBack={() => setViewingSavedRecipe(null)}
          backButtonLabel={language === 'ar' ? 'الرجوع لحسابي' : 'Back to Account'}
        />
      </div>
    );
  }

  if (viewingSubView === 'about') {
    return (
      <div
        id="account-screen-container"
        className={`min-h-screen pt-20 pb-32 px-6 max-w-lg mx-auto transition-colors duration-200 ${
          isDark ? 'bg-[#133b30] text-white' : 'bg-[#d6fff6] text-[#00352f]'
        }`}
      >
        <AboutView onBack={() => setViewingSubView(null)} />
      </div>
    );
  }

  if (viewingSubView === 'faq') {
    return (
      <div
        id="account-screen-container"
        className={`min-h-screen pt-20 pb-32 px-6 max-w-lg mx-auto transition-colors duration-200 ${
          isDark ? 'bg-[#133b30] text-white' : 'bg-[#d6fff6] text-[#00352f]'
        }`}
      >
        <FaqView onBack={() => setViewingSubView(null)} />
      </div>
    );
  }

  return (
    <div
      id="account-screen-container"
      className={`min-h-screen pt-20 pb-32 px-6 max-w-lg mx-auto transition-colors duration-200 ${
        isDark ? 'bg-[#133b30] text-white' : 'bg-[#d6fff6] text-[#00352f]'
      }`}
    >
      {/* Profile Header */}
      <section
        id="profile-header-card"
        className={`flex flex-col items-center text-center space-y-4 pt-6 p-6 rounded-3xl shadow-sm mb-6 transition-all ${
          isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-[#006853]/15'
        }`}
      >
        <div className="relative">
          <div
            className={`w-28 h-28 rounded-full border-4 shadow-md overflow-hidden flex items-center justify-center ${
              isDark ? 'bg-white/10 border-[#00f9cb]/30' : 'bg-[#aef6e9] border-white'
            }`}
          >
            <span className={`material-symbols-outlined text-6xl ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
              account_circle
            </span>
          </div>
          <button
            id="edit-profile-name-btn"
            onClick={() => setIsEditingName(!isEditingName)}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#00f9cb] text-[#00352f] flex items-center justify-center shadow-md hover:bg-[#00e9be] transition-colors cursor-pointer"
            title="Edit Name"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
        </div>

        <div>
          {isEditingName ? (
            <form onSubmit={handleSaveName} className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className={`py-1 px-3 rounded-xl border text-sm font-headline-md outline-none text-center ${
                  isDark ? 'bg-white/10 text-white border-[#00f9cb]' : 'bg-white text-[#00352f] border-[#006853]'
                }`}
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1 bg-[#00f9cb] text-[#00352f] text-xs font-bold rounded-xl"
              >
                ✓
              </button>
            </form>
          ) : (
            <h2 className={`font-headline-md text-xl font-bold ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
              {userName || t.account.accountName}
            </h2>
          )}
          <p
            id="user-account-email-display"
            className={`font-body-md text-[11px] sm:text-xs mt-1 max-w-full break-all truncate px-2 ${isDark ? 'text-white/70' : 'text-[#00352f]'}`}
            title={isGoogleLoggedIn ? userEmail : undefined}
          >
            {isGoogleLoggedIn ? (userEmail || t.account.signedInAs) : t.account.guestType}
          </p>
          {isGoogleLoggedIn && (
            <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isFirebaseSyncing ? 'animate-ping' : 'animate-pulse'}`}></span>
              <span>{language === 'ar' ? 'مزامنة Firebase السحابية نشطة' : 'Firebase Cloud Sync Active'}</span>
            </div>
          )}
        </div>
      </section>

      {/* Auth Action Buttons */}
      <section className="space-y-3 mb-6">
        <button
          id="google-signin-button"
          onClick={toggleGoogleLogin}
          className={`w-full flex items-center justify-center gap-3 rounded-full py-3.5 px-6 font-ai-spark text-sm transition-all shadow-sm active:scale-95 duration-200 cursor-pointer ${
            isDark
              ? 'bg-white text-[#00352f] hover:bg-gray-100'
              : 'bg-white text-[#00352f] border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="font-semibold">
            {isGoogleLoggedIn ? t.account.signedInAs : t.account.googleSignIn}
          </span>
        </button>

        <button
          id="signout-button"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 bg-[#fb5151] hover:bg-[#b31b25] text-white rounded-full py-3.5 px-6 font-ai-spark text-sm transition-colors shadow-sm active:scale-95 duration-200 cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          <span className="font-semibold">{t.account.signOut}</span>
        </button>
      </section>

      {/* Settings Section (Language and Theme) */}
      <section
        id="settings-section-card"
        className={`rounded-3xl p-6 ambient-glow border mb-6 transition-all ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-[#006853]/15'
        }`}
      >
        <div className="flex items-center gap-2 mb-6">
          <span className={`material-symbols-outlined ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
            settings
          </span>
          <h3 className={`font-headline-md text-lg font-bold ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
            {t.account.settings}
          </h3>
        </div>

        <div className="space-y-5">
          {/* Language Row */}
          <div className="flex items-center justify-between">
            <span className={`font-body-lg text-sm font-semibold ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
              {t.account.language}
            </span>
            <div
              className={`flex rounded-full p-1 border ${
                isDark ? 'bg-white/10 border-white/10' : 'bg-[#aef6e9]/50 border-[#006853]/15'
              }`}
            >
              <button
                id="language-btn-ar"
                onClick={() => setLanguage('ar')}
                className={`px-3.5 py-1.5 rounded-full font-label-caps text-xs transition-all cursor-pointer ${
                  language === 'ar'
                    ? 'bg-[#00f9cb] text-[#00352f] font-bold shadow-sm'
                    : isDark
                    ? 'text-white/70 hover:text-white'
                    : 'text-[#00352f]/70 hover:text-[#00352f]'
                }`}
              >
                🇸🇦 العربية
              </button>
              <button
                id="language-btn-en"
                onClick={() => setLanguage('en')}
                className={`px-3.5 py-1.5 rounded-full font-label-caps text-xs transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#00f9cb] text-[#00352f] font-bold shadow-sm'
                    : isDark
                    ? 'text-white/70 hover:text-white'
                    : 'text-[#00352f]/70 hover:text-[#00352f]'
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          {/* Theme Row */}
          <div className="flex items-center justify-between">
            <span className={`font-body-lg text-sm font-semibold ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
              {t.account.theme}
            </span>
            <div
              className={`flex rounded-full p-1 border ${
                isDark ? 'bg-white/10 border-white/10' : 'bg-[#aef6e9]/50 border-[#006853]/15'
              }`}
            >
              <button
                id="theme-btn-light"
                onClick={() => setTheme('light')}
                className={`px-3 py-1.5 rounded-full font-label-caps text-xs transition-all flex items-center gap-1 cursor-pointer ${
                  theme === 'light'
                    ? 'bg-[#00f9cb] text-[#00352f] font-bold shadow-sm'
                    : isDark
                    ? 'text-white/70 hover:text-white'
                    : 'text-[#00352f]/70 hover:text-[#00352f]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">light_mode</span>
                <span>{t.account.lightMode}</span>
              </button>
              <button
                id="theme-btn-dark"
                onClick={() => setTheme('dark')}
                className={`px-3 py-1.5 rounded-full font-label-caps text-xs transition-all flex items-center gap-1 cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#00f9cb] text-[#00352f] font-bold shadow-sm'
                    : isDark
                    ? 'text-white/70 hover:text-white'
                    : 'text-[#00352f]/70 hover:text-[#00352f]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">dark_mode</span>
                <span>{t.account.darkMode}</span>
              </button>
            </div>
          </div>

          {/* Gender Row */}
          <div id="settings-gender-section" className="flex flex-col gap-2 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className={`font-body-lg text-sm font-semibold ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
                {t.account.gender}
              </span>
              <div
                className={`flex rounded-full p-1 border ${
                  isDark ? 'bg-white/10 border-white/10' : 'bg-[#aef6e9]/50 border-[#006853]/15'
                }`}
              >
                <button
                  type="button"
                  id="gender-btn-male"
                  onClick={() => setGender(gender === 'male' ? null : 'male')}
                  className={`px-3.5 py-1.5 rounded-full font-label-caps text-xs transition-all cursor-pointer ${
                    gender === 'male'
                      ? 'bg-[#00f9cb] text-[#00352f] font-bold shadow-sm'
                      : isDark
                      ? 'text-white/70 hover:text-white'
                      : 'text-[#00352f]/70 hover:text-[#00352f]'
                  }`}
                >
                  {t.account.genderMale}
                </button>
                <button
                  type="button"
                  id="gender-btn-female"
                  onClick={() => setGender(gender === 'female' ? null : 'female')}
                  className={`px-3.5 py-1.5 rounded-full font-label-caps text-xs transition-all cursor-pointer ${
                    gender === 'female'
                      ? 'bg-[#00f9cb] text-[#00352f] font-bold shadow-sm'
                      : isDark
                      ? 'text-white/70 hover:text-white'
                      : 'text-[#00352f]/70 hover:text-[#00352f]'
                  }`}
                >
                  {t.account.genderFemale}
                </button>
              </div>
            </div>
            {/* Explanatory Note */}
            <p className={`text-xs leading-relaxed ${isDark ? 'text-white/60' : 'text-[#00352f]/70'}`}>
              {t.account.genderNote}
            </p>
          </div>

          {/* Quick Chat Row / Button in Settings */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex flex-col">
              <span className={`font-body-lg text-sm font-semibold ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
                {t.account.quickChat}
              </span>
              <span className={`text-xs ${isDark ? 'text-white/60' : 'text-[#00352f]/70'}`}>
                {t.account.quickChatDesc}
              </span>
            </div>
            <button
              id="settings-quick-chat-btn"
              onClick={() => navigateTo('chat')}
              className="px-4 py-2 rounded-full font-label-caps text-xs transition-all flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-[#00f9cb] to-[#0aceff] text-[#00352f] font-bold shadow-sm hover:opacity-90 active:scale-95"
            >
              <span className="material-symbols-outlined text-base">chat</span>
              <span>{t.account.chatWithByte}</span>
            </button>
          </div>

          {/* Text-Size / Magnifier Accessibility Control (Directly Under Quick Chat Button) */}
          <div id="settings-text-size-section" className="flex flex-col gap-2.5 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`material-symbols-outlined text-base ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
                  format_size
                </span>
                <span className={`font-body-lg text-sm font-semibold ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
                  {t.account.textSize}
                </span>
              </div>
              <span className={`text-xs font-semibold ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
                {textSize === 'normal' ? t.account.textSizeNormal : textSize === 'large' ? t.account.textSizeLarge : t.account.textSizeXLarge}
              </span>
            </div>
            <div
              className={`flex rounded-full p-1 border justify-between gap-1 ${
                isDark ? 'bg-white/10 border-white/10' : 'bg-[#aef6e9]/50 border-[#006853]/15'
              }`}
            >
              <button
                id="text-size-btn-normal"
                onClick={() => setTextSize('normal')}
                className={`flex-1 py-1.5 px-2 rounded-full font-label-caps text-xs transition-all text-center cursor-pointer ${
                  textSize === 'normal'
                    ? 'bg-[#00f9cb] text-[#00352f] font-bold shadow-sm'
                    : isDark
                    ? 'text-white/70 hover:text-white'
                    : 'text-[#00352f] font-semibold hover:text-[#00352f]'
                }`}
              >
                {t.account.textSizeNormal}
              </button>
              <button
                id="text-size-btn-large"
                onClick={() => setTextSize('large')}
                className={`flex-1 py-1.5 px-2 rounded-full font-label-caps text-xs transition-all text-center cursor-pointer ${
                  textSize === 'large'
                    ? 'bg-[#00f9cb] text-[#00352f] font-bold shadow-sm'
                    : isDark
                    ? 'text-white/70 hover:text-white'
                    : 'text-[#00352f] font-semibold hover:text-[#00352f]'
                }`}
              >
                {t.account.textSizeLarge}
              </button>
              <button
                id="text-size-btn-xlarge"
                onClick={() => setTextSize('xlarge')}
                className={`flex-1 py-1.5 px-2 rounded-full font-label-caps text-xs transition-all text-center cursor-pointer ${
                  textSize === 'xlarge'
                    ? 'bg-[#00f9cb] text-[#00352f] font-bold shadow-sm'
                    : isDark
                    ? 'text-white/70 hover:text-white'
                    : 'text-[#00352f] font-semibold hover:text-[#00352f]'
                }`}
              >
                {t.account.textSizeXLarge}
              </button>
            </div>
          </div>

          {/* Contact Option in Settings */}
          <div
            id="settings-contact-us-row"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t border-white/10"
          >
            <div className="flex items-center gap-2 shrink-0">
              <span className={`material-symbols-outlined text-base ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
                mail
              </span>
              <span className={`font-body-lg text-sm font-semibold ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
                {t.account.contactUs}
              </span>
            </div>
            <a
              id="contact-email-link"
              href={`mailto:${t.account.contactEmail}`}
              dir="ltr"
              className={`font-mono text-[10px] sm:text-xs font-medium tracking-tight px-2 py-0.5 rounded-lg border transition-all truncate max-w-[200px] sm:max-w-none self-start sm:self-auto ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 text-[#00f9cb] border-white/10 hover:border-[#00f9cb]/40'
                  : 'bg-[#aef6e9]/25 hover:bg-[#aef6e9]/40 text-[#006853] border-[#006853]/15'
              }`}
            >
              {t.account.contactEmail}
            </a>
          </div>
        </div>
      </section>

      {/* More Section (المزيد) */}
      <section
        id="more-section-card"
        className={`rounded-3xl p-6 ambient-glow border mb-6 transition-all ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-[#006853]/15'
        }`}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className={`material-symbols-outlined ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
            more_horiz
          </span>
          <h3 className={`font-headline-md text-lg font-bold ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
            {t.account.more}
          </h3>
        </div>

        <div className="space-y-3">
          {/* حول ByteBites */}
          <button
            id="more-about-bytebites-btn"
            onClick={() => setViewingSubView('about')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
              isDark
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                : 'bg-[#aef6e9]/20 hover:bg-[#aef6e9]/40 border-[#006853]/15 text-[#00352f]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>info</span>
              <span className="font-body-md text-sm font-semibold">{t.account.aboutByteBites}</span>
            </div>
            <span className="material-symbols-outlined text-sm rtl:rotate-180">chevron_right</span>
          </button>

          {/* الأسئلة الشائعة */}
          <button
            id="more-faq-btn"
            onClick={() => setViewingSubView('faq')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
              isDark
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                : 'bg-[#aef6e9]/20 hover:bg-[#aef6e9]/40 border-[#006853]/15 text-[#00352f]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>help_outline</span>
              <span className="font-body-md text-sm font-semibold">{t.account.faq}</span>
            </div>
            <span className="material-symbols-outlined text-sm rtl:rotate-180">chevron_right</span>
          </button>
        </div>
      </section>

      {/* Saved Recipes Section */}
      <section
        id="saved-recipes-section"
        className={`rounded-3xl p-6 shadow-sm mb-6 transition-all ${
          isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-[#006853]/15'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
              bookmark
            </span>
            <h3 className={`font-headline-md text-lg font-bold ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
              {t.account.savedRecipes}
            </h3>
          </div>
          <span className={`text-xs font-label-caps font-bold ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
            ({savedRecipesList.length})
          </span>
        </div>

        {savedRecipesList.length === 0 ? (
          <p className={`text-xs text-center py-6 ${isDark ? 'text-white/60' : 'text-[#00352f]'}`}>
            {t.account.noSaved}
          </p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 hide-scrollbar">
            {savedRecipesList.map((rec) => {
              const recTitle = language === 'ar' ? rec.title : rec.titleEn;
              const recTime = language === 'ar' ? rec.time : rec.timeEn;
              return (
                <div
                  key={rec.id}
                  id={`saved-recipe-item-${rec.id}`}
                  onClick={() => setViewingSavedRecipe(rec)}
                  className={`shrink-0 w-44 rounded-2xl overflow-hidden shadow-sm border transition-all duration-200 hover:scale-[1.03] cursor-pointer ${
                    isDark
                      ? 'bg-white/10 border-white/10 hover:border-[#00f9cb]/50'
                      : 'bg-white border-[#006853]/20 hover:border-[#006853]'
                  }`}
                >
                  <div className="h-28 relative overflow-hidden bg-black/20">
                    <img src={rec.image} alt={recTitle} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      id={`delete-saved-recipe-btn-${rec.id}`}
                      title={language === 'ar' ? 'حذف الوصفة' : 'Delete recipe'}
                      onClick={(e) => {
                        e.stopPropagation();
                        setRecipeToDelete(rec);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-red-500/80 backdrop-blur-sm flex items-center justify-center text-[#00f9cb] hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">
                        delete
                      </span>
                    </button>
                  </div>
                  <div className="p-3 space-y-1">
                    <h4 className={`font-body-md text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
                      {recTitle}
                    </h4>
                    {/* Cooking duration without any meal rating */}
                    <div className="flex items-center text-xs">
                      <span className={`flex items-center gap-1 font-medium ${isDark ? 'text-gray-400' : 'text-[#00352f]'}`}>
                        <span className={`material-symbols-outlined text-[14px] ${isDark ? 'text-gray-400' : 'text-[#006853]'}`}>schedule</span>
                        <span>{recTime}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Mascot Branding Footer Box */}
      <section
        className={`rounded-3xl p-6 flex flex-col md:flex-row items-center gap-5 overflow-hidden relative mb-4 transition-all ${
          isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-[#006853]/15'
        }`}
      >
        <div className="w-28 h-28 shrink-0 relative z-10">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwb831DohEUgHQiL9pnL8rBEnZs4vE7-NuYXUpkOzFUO7RGZRzXDOaD-OpY_cJDV-dAzJvPiT-ebQiOM5C-2CaBHAER1cT34C1ZC3CVBTPBheO-tpDMym8d7UUaJMcV7thOcLH8mNKmI7ZqXBk7ibzU3CbYdlmJAtCCt7sUxl9KmSNMnGuaWEuilJlDeNJyKVCDu6z5ScLnWGRL64ByBQhRuPzAmMsEh-4mU2P6puBk35jtC5sK58k0TiuZg20W3_PMUsgVd8JDLCnew"
            alt="Byte Robot Mascot"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>
        <div className="text-center md:text-right relative z-10">
          <h4 className={`font-display-lg-mobile text-xl font-bold mb-1.5 ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
            Byte Bites
          </h4>
          <p className={`font-body-md text-xs leading-relaxed ${isDark ? 'text-white/80' : 'text-[#00352f]'}`}>
            {t.account.mascotDesc}
          </p>
        </div>
      </section>

      {/* Footer copyright */}
      <footer className="w-full py-4 text-center">
        <p className={`text-xs font-body-md ${isDark ? 'text-white/40' : 'text-[#00352f]'}`}>
          {t.account.copyright}
        </p>
      </footer>

      {/* Delete Recipe Confirmation Modal */}
      <DeleteRecipeModal
        isOpen={!!recipeToDelete}
        onCancel={() => setRecipeToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

