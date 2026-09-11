import React from 'react';
import { useApp } from '../context/AppContext';
import { Page } from '../types';

interface NavItem {
  key: Page;
  icon: string;
  label: string;
}

export const BottomNav: React.FC = () => {
  const { currentPage, navigateTo, t, theme } = useApp();

  // Do not show bottom nav on welcome screen or chat screen (Chat has full screen input and top back bar)
  if (currentPage === 'welcome' || currentPage === 'chat') {
    return null;
  }

  const isDark = theme === 'dark';

  const navItems: NavItem[] = [
    { key: 'home', icon: 'home', label: t.nav.home },
    { key: 'wheel', icon: 'cached', label: t.nav.wheel },
    { key: 'saver', icon: 'kitchen', label: t.nav.saver },
    { key: 'diet', icon: 'nutrition', label: t.nav.diet },
    { key: 'account', icon: 'person', label: t.nav.account },
  ];

  return (
    <nav
      id="unified-bottom-navigation"
      className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl backdrop-blur-xl border-t shadow-[0_-4px_20px_0_rgba(0,0,0,0.3)] flex flex-row justify-around items-center px-2 py-2 max-w-lg mx-auto md:max-w-xl transition-colors duration-200 ${
        isDark
          ? 'bg-[#002117]/90 border-white/10 text-white'
          : 'bg-[#d6fff6]/95 border-[#006853]/20 text-[#00352f]'
      }`}
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
    >
      {navItems.map((item) => {
        const isActive = currentPage === item.key;
        return (
          <button
            key={item.key}
            id={`nav-item-${item.key}`}
            onClick={() => navigateTo(item.key)}
            className={`nav-btn flex flex-col items-center justify-center transition-all duration-200 w-16 h-14 rounded-xl active:scale-90 cursor-pointer ${
              isActive ? 'active-nav-item' : 'inactive-nav-item'
            } ${
              isActive
                ? isDark
                  ? 'bg-[#00f9cb] text-[#00352f] shadow-[0_0_15px_rgba(176,240,214,0.3)] font-bold'
                  : 'bg-[#006853] text-white shadow-md font-bold'
                : isDark
                ? 'text-white/75 hover:bg-white/5 hover:text-white'
                : 'text-[#004236] hover:bg-[#006853]/15 font-semibold'
            }`}
          >
            <span
              className={`nav-icon material-symbols-outlined mb-0.5 text-[22px] transition-colors ${
                isActive
                  ? isDark ? 'text-[#00352f]' : 'text-white'
                  : isDark ? 'text-white/80' : 'text-[#004236]'
              }`}
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {item.icon}
            </span>
            <span
              className={`nav-label font-label-caps text-[11px] leading-tight transition-colors ${
                isActive
                  ? isDark ? 'text-[#00352f] font-bold' : 'text-white font-bold'
                  : isDark ? 'text-white/80 font-normal' : 'text-[#004236] font-semibold'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
