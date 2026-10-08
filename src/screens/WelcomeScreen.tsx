import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const WelcomeScreen: React.FC = () => {
  const {
    navigateTo,
    t,
    theme,
    language,
    loginAsGuest,
    loginWithGoogle,
  } = useApp();

  const [isLoadingGuest, setIsLoadingGuest] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isDark = theme === 'dark';

  const handleGuestLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoadingGuest || isLoadingGoogle) return;
    setAuthError(null);
    setIsLoadingGuest(true);
    try {
      await loginAsGuest();
      navigateTo('home');
    } catch {
      // Fallback navigation so user is never blocked
      navigateTo('home');
    } finally {
      setIsLoadingGuest(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoadingGuest || isLoadingGoogle) return;
    setAuthError(null);
    setIsLoadingGoogle(true);
    try {
      await loginWithGoogle();
      navigateTo('home');
    } catch (err: any) {
      console.error('Google login error:', err);
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        if (err?.code === 'auth/popup-blocked') {
          setAuthError(
            language === 'ar'
              ? 'تم حظر النافذة المنبثقة من قبل المتصفح، يرجى السماح بالنوافذ المنبثقة للمتابعة'
              : 'Popup was blocked by the browser. Please allow popups to continue.'
          );
        } else if (err?.code === 'auth/network-request-failed') {
          setAuthError(
            language === 'ar'
              ? 'تعذر الاتصال بخدمة تسجيل الدخول، يرجى التحقق من اتصال الإنترنت'
              : 'Could not connect to sign-in service, please check your internet connection.'
          );
        } else {
          setAuthError(
            language === 'ar'
              ? 'تعذر تسجيل الدخول باستخدام Google، يمكنك المتابعة بالدخول كضيف'
              : 'Could not sign in with Google. You can continue as a guest.'
          );
        }
      }
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  // Optional subtle floating particles
  const [particles, setParticles] = useState<Array<{ id: number; left: number; top: number; size: number; delay: number }>>([]);

  useEffect(() => {
    const items = Array.from({ length: 14 }).map((_, i) => ({
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
      className={`min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-hidden transition-colors duration-300 select-none ${
        isDark ? 'bg-[#061914] text-white' : 'bg-[#e6f7f2] text-[#00352f]'
      }`}
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
        <div 
          className={`absolute inset-0 transition-opacity duration-500 ${
            isDark
              ? 'bg-gradient-to-b from-[#041510]/85 via-[#09261e]/80 to-[#020b08]/92'
              : 'bg-gradient-to-b from-[#e6f7f2]/92 via-[#d4f3ea]/88 to-[#c2eee2]/96'
          }`} 
        />

        {/* Radial vignette overlay to draw the eye to the Byte mascot and input controls */}
        <div 
          className={`absolute inset-0 transition-all duration-500 ${
            isDark
              ? 'bg-[radial-gradient(ellipse_at_center,rgba(6,32,24,0.3)_0%,rgba(4,18,14,0.65)_60%,rgba(2,9,7,0.92)_100%)]'
              : 'bg-[radial-gradient(ellipse_at_center,rgba(230,247,242,0.3)_0%,rgba(212,243,234,0.65)_60%,rgba(194,238,226,0.92)_100%)]'
          }`} 
        />

        {/* Ambient warm lighting accent layer */}
        <div 
          className={`absolute inset-0 mix-blend-screen opacity-70 transition-opacity duration-500 ${
            isDark
              ? 'bg-gradient-to-tr from-[#00f9cb]/5 via-amber-500/10 to-transparent'
              : 'bg-gradient-to-tr from-[#006853]/5 via-amber-400/10 to-transparent'
          }`} 
        />
      </div>

      {/* Background ambient neon glow */}
      <div 
        className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 rounded-full blur-[120px] pointer-events-none z-0 ${
          isDark ? 'bg-[#00f9cb]/15' : 'bg-[#006853]/10'
        }`} 
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full blur-[1px] animate-float pointer-events-none z-0 ${
            isDark ? 'bg-[#00f9cb]/35' : 'bg-[#006853]/25'
          }`}
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Top App Name Title */}
      <header className="w-full flex items-center justify-center pt-1 pb-1 sm:pt-2 sm:pb-2 z-10">
        <h1
          id="welcome-app-logo-title"
          className={`font-display-lg-mobile text-2xl sm:text-3xl tracking-tight transition-colors ${
            isDark ? 'text-[#00f9cb]' : 'text-[#006853]'
          }`}
        >
          ByteBites
        </h1>
      </header>

      {/* Mascot circular illustration & Auth options */}
      <div className="flex flex-col items-center justify-center my-1 sm:my-auto w-full max-w-[360px] sm:max-w-md z-10 px-2">
        {/* Responsive Mascot Circular Frame (Expanded size for prominence) */}
        <div 
          id="welcome-mascot-frame"
          className={`relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 sm:border-[5px] backdrop-blur-sm group hover:scale-105 transition-all duration-500 ring-2 sm:ring-4 flex items-center justify-center shrink-0 ${
            isDark
              ? 'border-[#00f9cb]/60 shadow-[0_16px_50px_rgba(0,0,0,0.75)] bg-[#0d2a22]/90 ring-white/10'
              : 'border-[#006853]/40 shadow-[0_14px_40px_rgba(0,104,83,0.2)] bg-white ring-[#006853]/15'
          }`}
        >
          <img
            id="welcome-mascot-image"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwb831DohEUgHQiL9pnL8rBEnZs4vE7-NuYXUpkOzFUO7RGZRzXDOaD-OpY_cJDV-dAzJvPiT-ebQiOM5C-2CaBHAER1cT34C1ZC3CVBTPBheO-tpDMym8d7UUaJMcV7thOcLH8mNKmI7ZqXBk7ibzU3CbYdlmJAtCCt7sUxl9KmSNMnGuaWEuilJlDeNJyKVCDu6z5ScLnWGRL64ByBQhRuPzAmMsEh-4mU2P6puBk35jtC5sK58k0TiuZg20W3_PMUsgVd8JDLCnew"
            alt="Byte Robot Mascot"
            className="w-full h-full object-cover scale-110 drop-shadow-2xl transition-transform duration-500 group-hover:scale-115"
          />
        </div>

        {/* Authentication Options: Guest or Google */}
        <div className="w-full mt-12 sm:mt-14 space-y-2.5 sm:space-y-3">
          {/* Option 1: Continue / Sign in as Guest (Anonymous Auth) */}
          <button
            id="welcome-guest-login-button"
            type="button"
            onClick={handleGuestLogin}
            disabled={isLoadingGuest || isLoadingGoogle}
            style={{ height: '39.6px' }}
            className={`w-full h-[39.6px] px-4 sm:px-6 rounded-full font-headline-md text-sm sm:text-base transition-all active:scale-95 duration-200 cursor-pointer flex items-center justify-center gap-2 font-bold shadow-md ${
              isDark
                ? 'bg-[#00f9cb] hover:bg-[#00e2b8] text-[#00352f] shadow-[#00f9cb]/25 border border-[#00f9cb]/40'
                : 'bg-[#006853] hover:bg-[#005443] text-white shadow-[#006853]/20 border border-[#006853]/30'
            }`}
          >
            {isLoadingGuest ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-lg sm:text-xl">
                person
              </span>
            )}
            <span>{t.welcome.continueAsGuest}</span>
          </button>
        </div>

        {/* Subtle Divider */}
        <div className="w-full flex items-center justify-center my-1.5 sm:my-2.5 gap-3 px-3">
          <div className={`flex-1 h-px welcome-divider-line ${isDark ? 'bg-white/25' : 'bg-[#00352f]/20'}`} />
          <span className={`text-xs font-headline-md welcome-divider-text ${isDark ? 'text-white/80' : 'text-[#00352f]/80'} tracking-wide`}>
            {t.welcome.orDivider}
          </span>
          <div className={`flex-1 h-px welcome-divider-line ${isDark ? 'bg-white/25' : 'bg-[#00352f]/20'}`} />
        </div>

        {/* Option 2: Sign in with Google (Firebase Google Auth) */}
        <div className="w-full space-y-2">
          <button
            id="welcome-google-signin-button"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoadingGuest || isLoadingGoogle}
            className={`w-full flex items-center justify-center gap-2.5 sm:gap-3 rounded-full py-2.5 sm:py-3 px-4 sm:px-6 font-headline-md text-xs sm:text-sm transition-all shadow-md active:scale-95 duration-200 cursor-pointer bg-white text-[#00352f] ${
              isDark
                ? 'hover:bg-gray-50 border border-white/30'
                : 'hover:bg-emerald-50/50 border border-[#006853]/25'
            }`}
          >
            {isLoadingGoogle ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#00352f] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
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
            )}
            <span className="font-semibold text-xs sm:text-sm leading-normal whitespace-nowrap">
              {t.welcome.googleSignIn}
            </span>
          </button>

          {/* Friendly Auth Error Notice if needed */}
          {authError && (
            <p className={`text-xs text-center font-medium px-2 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
              {authError}
            </p>
          )}
        </div>

        {/* Small Journey Tagline Badge */}
        <div 
          className={`mt-3 sm:mt-4 flex items-center justify-center gap-2 text-xs px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full backdrop-blur-sm shadow-sm transition-all welcome-tagline-badge ${
            isDark
              ? 'bg-[#0d2a22]/70 border border-[#00f9cb]/30 text-[#00f9cb]'
              : 'bg-white/85 border border-[#006853]/25 text-[#006853]'
          }`}
        >
          <div 
            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full overflow-hidden shrink-0 border ${
              isDark ? 'border-[#00f9cb]/50' : 'border-[#006853]/35'
            }`}
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPMK2YHfOlYnPH6o4N91cvk5BVN11bLZwwE2QFpSoto2fqAF01GUz1YY3xq4htI5n_BNWGE67EDXglpSgLWxHSLA-HmCm8KMLg8yYzlicLG3Dvq2d7NDdGCFAc5M-AAc82ZwBBQLjolAd-tnX6mL_FypUaI56vLXcFNADYHil0tqJC7SCMhSJQW-oqgaqL1guKcW2eFIioVYODY7fYBduaW5PB1oQu9F2E25sAl6PyTdXpPWJ71QuHvYAQbkgf42i__m-JnnGUIbiaCg"
              alt="Byte"
              className="w-full h-full object-cover"
            />
          </div>
          <span 
            className={`font-body-md text-[11px] sm:text-xs font-medium tracking-wide welcome-tagline-text ${
              isDark ? 'text-[#00f9cb]' : 'text-[#006853]'
            }`}
          >
            {t.welcome.journeyTagline}
          </span>
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="w-full py-2 sm:py-3 text-center z-10">
        <p 
          className={`text-[11px] sm:text-xs font-body-md drop-shadow-sm welcome-footer-text ${
            isDark ? 'text-white/70' : 'text-[#00352f]/80'
          }`}
        >
          {t.welcome.copyright}
        </p>
      </footer>
    </div>
  );
};

