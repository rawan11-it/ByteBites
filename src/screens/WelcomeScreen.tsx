import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const WelcomeScreen: React.FC = () => {
  const { userName, setUserName, navigateTo, t, theme, language, isGoogleLoggedIn, toggleGoogleLogin } = useApp();
  const [inputName, setInputName] = useState(userName || '');

  const isDark = theme === 'dark';

  const handleContinueWithName = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      setUserName(inputName.trim());
    } else {
      setUserName(language === 'ar' ? 'روان' : 'Rawan');
    }
    navigateTo('home');
  };

  const handleGoogleSignIn = () => {
    if (!isGoogleLoggedIn) {
      toggleGoogleLogin();
    }
    if (inputName.trim()) {
      setUserName(inputName.trim());
    } else {
      setUserName(language === 'ar' ? 'روان' : 'Rawan');
    }
    navigateTo('home');
  };

  // Optional subtle particles
  const [particles, setParticles] = useState<Array<{ id: number; left: number; top: number; size: number; delay: number }>>([]);

  useEffect(() => {
    const items = Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      left: Math.random() * 90 + 5,
      top: Math.random() * 90 + 5,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 4,
    }));
    setParticles(items);
  }, []);

  return (
    <div
      id="welcome-screen-container"
      className="min-h-screen w-full flex flex-col items-center justify-between p-6 relative overflow-hidden text-white bg-[#061914] transition-colors duration-300 select-none"
    >
      {/* Luxurious Modern Kitchen Background Layer */}
      <div 
        id="welcome-kitchen-bg-layer"
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      >
        <img
          src="/images/welcome-kitchen-bg.jpg"
          onError={(e) => {
            // High-reliability CDN fallback for the luxurious dark green marble kitchen
            (e.currentTarget as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?auto=format&fit=crop&w=1920&q=85";
          }}
          alt="Luxurious modern kitchen in dark green with an elegant marble countertop"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
          referrerPolicy="no-referrer"
        />

        {/* Smooth Integration Gradient Overlays for High Legibility & Warmth */}
        {/* Primary rich emerald-dark gradient: balances the green cabinets and marble while keeping central readability */}
        <div 
          className={`absolute inset-0 transition-opacity duration-500 ${
            isDark
              ? 'bg-gradient-to-b from-[#041510]/85 via-[#09261e]/80 to-[#020b08]/92'
              : 'bg-gradient-to-b from-[#062018]/75 via-[#0b2f25]/75 to-[#03130f]/90'
          }`} 
        />

        {/* Radial vignette overlay to draw the eye to the Byte mascot and input controls */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,32,24,0.3)_0%,rgba(4,18,14,0.65)_60%,rgba(2,9,7,0.92)_100%)]" />

        {/* Ambient warm lighting accent layer complementing the kitchen's warm architectural lighting */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#00f9cb]/5 via-amber-500/10 to-transparent mix-blend-screen opacity-70" />
      </div>

      {/* Background ambient neon glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#00f9cb]/15 blur-[120px] pointer-events-none z-0" />

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[#00f9cb]/35 blur-[1px] animate-float pointer-events-none z-0"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Top App Name Title matching other pages */}
      <header className="w-full flex items-center justify-center pt-2 pb-1 z-10">
        <h1
          id="welcome-app-logo-title"
          className="font-display-lg-mobile text-display-lg-mobile tracking-tight text-[#00f9cb]"
        >
          ByteBites
        </h1>
      </header>

      {/* Mascot circular illustration & Auth options */}
      <div className="flex flex-col items-center justify-center my-auto w-full max-w-sm z-10">
        <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-[#00f9cb]/50 shadow-[0_16px_50px_rgba(0,0,0,0.65)] flex items-center justify-center bg-[#0d2a22]/90 backdrop-blur-sm group hover:scale-105 transition-transform duration-500 ring-2 ring-white/10">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwb831DohEUgHQiL9pnL8rBEnZs4vE7-NuYXUpkOzFUO7RGZRzXDOaD-OpY_cJDV-dAzJvPiT-ebQiOM5C-2CaBHAER1cT34C1ZC3CVBTPBheO-tpDMym8d7UUaJMcV7thOcLH8mNKmI7ZqXBk7ibzU3CbYdlmJAtCCt7sUxl9KmSNMnGuaWEuilJlDeNJyKVCDu6z5ScLnWGRL64ByBQhRuPzAmMsEh-4mU2P6puBk35jtC5sK58k0TiuZg20W3_PMUsgVd8JDLCnew"
            alt="Byte Robot Mascot"
            className="w-full h-full object-cover scale-110 drop-shadow-2xl"
          />
        </div>

        {/* 1. Name Input & Clear Continue Button */}
        <form onSubmit={handleContinueWithName} className="w-full mt-6 space-y-3 px-1">
          <div className="relative">
            <input
              id="welcome-user-name-input"
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder={t.welcome.namePlaceholder}
              className="w-full py-3.5 px-6 rounded-full text-center font-headline-md text-base outline-none shadow-lg transition-all bg-white text-[#00352f] placeholder-gray-500 focus:ring-4 focus:ring-[#00f9cb]/60 border border-white/20"
            />
          </div>

          <button
            id="welcome-continue-name-button"
            type="submit"
            className="w-full py-3.5 px-6 rounded-full font-headline-md text-base transition-all active:scale-95 duration-200 cursor-pointer flex items-center justify-center gap-2 bg-[#00f9cb] hover:bg-[#00e2b8] text-[#00352f] font-bold shadow-lg shadow-[#00f9cb]/25 border border-[#00f9cb]/40"
          >
            <span>{t.welcome.continueButton}</span>
            <span className="material-symbols-outlined text-lg">
              {language === 'ar' ? 'arrow_back' : 'arrow_forward'}
            </span>
          </button>
        </form>

        {/* Subtle Divider */}
        <div className="w-full flex items-center justify-center my-3 gap-3 px-3">
          <div className="flex-1 h-px bg-white/25" />
          <span className="text-xs font-headline-md text-white/80 tracking-wide">
            {t.welcome.orDivider}
          </span>
          <div className="flex-1 h-px bg-white/25" />
        </div>

        {/* 2. Google Sign-In & 3. Guest Options */}
        <div className="w-full px-1 space-y-2.5">
          <button
            id="welcome-google-signin-button"
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 rounded-full py-3 px-6 font-headline-md text-sm transition-all shadow-lg active:scale-95 duration-200 cursor-pointer bg-white text-[#00352f] hover:bg-gray-50 border border-white/30"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            <span className="font-semibold text-sm sm:text-[15px] leading-[30px] whitespace-nowrap">
              {t.welcome.googleSignIn}
            </span>
          </button>
        </div>

        {/* Small Journey Tagline Badge with subtle glass backdrop */}
        <div className="mt-5 flex items-center justify-center gap-2 text-sm px-3.5 py-1 rounded-full bg-[#0d2a22]/70 backdrop-blur-sm border border-[#00f9cb]/30 shadow-md">
          <div className="w-5 h-5 rounded-full overflow-hidden border border-[#00f9cb]/50 shrink-0">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPMK2YHfOlYnPH6o4N91cvk5BVN11bLZwwE2QFpSoto2fqAF01GUz1YY3xq4htI5n_BNWGE67EDXglpSgLWxHSLA-HmCm8KMLg8yYzlicLG3Dvq2d7NDdGCFAc5M-AAc82ZwBBQLjolAd-tnX6mL_FypUaI56vLXcFNADYHil0tqJC7SCMhSJQW-oqgaqL1guKcW2eFIioVYODY7fYBduaW5PB1oQu9F2E25sAl6PyTdXpPWJ71QuHvYAQbkgf42i__m-JnnGUIbiaCg"
              alt="Byte"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-body-md text-xs text-[#00f9cb] font-medium tracking-wide">
            {t.welcome.journeyTagline}
          </span>
        </div>
      </div>

      {/* Footer copyright (platform rights with precision) */}
      <footer className="w-full py-3 text-center z-10">
        <p className="text-xs font-body-md text-white/70 drop-shadow-sm">
          {t.welcome.copyright}
        </p>
      </footer>
    </div>
  );
};
