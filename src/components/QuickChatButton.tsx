import React from 'react';
import { useApp } from '../context/AppContext';

export const QuickChatButton: React.FC = () => {
  const { currentPage, navigateTo, language, theme } = useApp();

  // Show on home, saver, wheel, and diet pages
  if (currentPage !== 'home' && currentPage !== 'saver' && currentPage !== 'wheel' && currentPage !== 'diet') {
    return null;
  }

  const isArabic = language === 'ar';
  const isDark = theme === 'dark';

  return (
    <button
      id="quick-chat-floating-button"
      onClick={() => navigateTo('chat')}
      aria-label={isArabic ? 'المحادثة مع بايت' : 'Chat with Byte'}
      title={isArabic ? 'المحادثة مع بايت' : 'Chat with Byte'}
      className={`fixed bottom-24 z-40 w-12 h-12 md:w-14 md:h-14 rounded-full shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md flex items-center justify-center ${
        isArabic ? 'left-4 md:left-8' : 'right-4 md:right-8'
      } ${
        isDark
          ? 'bg-gradient-to-tr from-[#00f9cb] to-[#0aceff] text-[#002117] shadow-[0_4px_20px_rgba(0,249,203,0.4)] hover:shadow-[0_6px_25px_rgba(0,249,203,0.6)] border border-white/20'
          : 'bg-gradient-to-tr from-[#006853] to-[#004d3d] text-white shadow-[0_4px_16px_rgba(0,104,83,0.35)] hover:shadow-[0_6px_22px_rgba(0,104,83,0.5)] border border-emerald-300/30'
      }`}
    >
      <span
        className="material-symbols-outlined text-2xl md:text-3xl"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        forum
      </span>
    </button>
  );
};
