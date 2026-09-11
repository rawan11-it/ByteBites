import React from 'react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { currentPage, navigateTo, theme, language } = useApp();

  if (currentPage === 'welcome') {
    return null;
  }

  const isChatPage = currentPage === 'chat';
  const isDark = theme === 'dark';

  return (
    <header
      id="main-top-header"
      className={`fixed top-0 w-full z-50 h-16 backdrop-blur-xl border-b transition-colors duration-200 flex items-center justify-between px-6 ${
        isDark
          ? 'bg-[#002117]/85 border-white/10 text-white'
          : 'bg-[#d6fff6]/90 border-[#006853]/15 text-[#00352f]'
      }`}
    >
      {/* On Chat page, show the back button returning to Home */}
      {isChatPage ? (
        <div className="flex items-center gap-4">
          <button
            id="chat-back-button"
            onClick={() => navigateTo('home')}
            className={`p-2 rounded-full transition-colors active:scale-95 duration-200 flex items-center justify-center ${
              isDark
                ? 'text-[#00f9cb] hover:bg-white/10'
                : 'text-[#006853] hover:bg-[#006853]/10'
            }`}
            title="Back to Home"
          >
            <span
              className="material-symbols-outlined"
              style={{
                transform: language === 'ar' ? 'rotate(0deg)' : 'rotate(180deg)'
              }}
            >
              arrow_forward
            </span>
          </button>
          <h1 className={`font-display-lg-mobile text-display-lg-mobile tracking-tight ${
            isDark ? 'text-[#00f9cb]' : 'text-[#006853]'
          }`}>
            ByteBites
          </h1>
        </div>
      ) : (
        <div className="w-full flex items-center justify-center">
          <h1
            id="app-logo-title"
            className={`font-display-lg-mobile text-display-lg-mobile tracking-tight ${
              isDark ? 'text-[#00f9cb]' : 'text-[#006853]'
            }`}
          >
            ByteBites
          </h1>
        </div>
      )}
    </header>
  );
};
