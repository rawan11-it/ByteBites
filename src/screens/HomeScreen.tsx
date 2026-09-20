import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Recipe } from '../types';
import { RecipeDetailView } from '../components/RecipeDetailView';
import { initialRecipes } from '../data/recipes';

export const HomeScreen: React.FC = () => {
  const { userName, navigateTo, t, theme, language, gender, isGoogleLoggedIn } = useApp();
  const isDark = theme === 'dark';
  const isRtl = language === 'ar';

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const getGreetingTitle = () => {
    if (language === 'ar') {
      const hasRealName = Boolean(userName && userName.trim() && userName !== 'ضيف بايت' && isGoogleLoggedIn);
      if (gender === 'female') {
        return hasRealName ? `حي الله ضيفتنا ${userName} 👋` : 'حي الله ضيفتنا 👋';
      }
      if (gender === 'male') {
        return hasRealName ? `حي الله ضيفنا ${userName} 👋` : 'حي الله ضيفنا 👋';
      }
      return hasRealName ? `أهلاً بك ${userName} 👋` : 'حي الله ضيفنا 👋';
    }
    const hasRealName = Boolean(userName && userName.trim() && userName !== 'ضيف بايت' && isGoogleLoggedIn);
    return hasRealName ? `Welcome ${userName} 👋` : 'Welcome Guest 👋';
  };

  const handleOpenRecipe = (recipeId: string) => {
    const found = initialRecipes?.find((r) => r.id === recipeId) || initialRecipes?.[0] || null;
    setSelectedRecipe(found);
  };

  if (selectedRecipe) {
    return (
      <div
        id="home-screen-container"
        className={`min-h-screen pt-20 pb-28 px-6 max-w-4xl mx-auto transition-colors duration-200 ${
          isDark ? 'bg-[#002117] text-white' : 'bg-[#d6fff6] text-[#00352f]'
        }`}
      >
        <RecipeDetailView
          recipe={selectedRecipe}
          onBack={() => setSelectedRecipe(null)}
          backButtonLabel={language === 'ar' ? 'الرجوع للرئيسية' : 'Back to Home'}
        />
      </div>
    );
  }

  return (
    <div
      id="home-screen-container"
      className={`min-h-screen pt-20 pb-28 px-6 max-w-5xl mx-auto transition-colors duration-200 ${
        isDark ? 'bg-[#002117] text-white' : 'bg-[#d6fff6] text-[#00352f]'
      }`}
    >
      {/* Welcome Section */}
      <section className="mb-6">
        <h2 className={`font-headline-md text-2xl md:text-3xl font-bold ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'} mb-1`}>
          {getGreetingTitle()}
        </h2>
        <p className={`font-body-md text-base ${isDark ? 'text-white/70' : 'text-[#00352f]/80'}`}>
          {t.home.greetingSub}
        </p>
      </section>

      {/* AI Assistant Card (Byte) */}
      <section className="mb-6">
        <div
          id="home-ai-assistant-card"
          onClick={() => navigateTo('my-kitchen')}
          className={`rounded-2xl p-6 relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-[0_0_20px_rgba(139,92,246,0.25)] hover:-translate-y-0.5 ${
            isDark
              ? 'glass-card ai-glow border border-purple-500/30 hover:border-purple-500/60'
              : 'bg-white/90 shadow-md border border-purple-400/30 hover:border-purple-500'
          }`}
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(6, 78, 59, 0.5) 0%, rgba(139, 92, 246, 0.25) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(238, 242, 255, 0.95) 100%)',
          }}
        >
          <div className="z-10 relative max-w-2xl">
            <h3 className={`font-headline-md text-xl md:text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
              {t.home.aiCardTitle}
            </h3>
            <p className={`font-body-md text-sm mb-4 leading-relaxed ${isDark ? 'text-white/80' : 'text-[#00352f]/80'}`}>
              {t.home.aiCardSub}
            </p>
            <button
              type="button"
              id="home-start-chat-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigateTo('my-kitchen');
              }}
              className="bg-gradient-ai text-white font-label-caps text-sm px-6 py-3 rounded-full hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 border border-purple-400/30 cursor-pointer"
            >
              <span>{t.home.startChatBtn}</span>
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ transform: isRtl ? 'rotate(0deg)' : 'rotate(180deg)' }}
              >
                arrow_back
              </span>
            </button>
          </div>

          {/* Decorative background blurs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#00f9cb]/20 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />
        </div>
      </section>

      {/* Primary Feature Navigation Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Smart Wheel Card */}
        <div
          id="home-card-wheel"
          onClick={() => navigateTo('wheel')}
          className={`group rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden border cursor-pointer hover:shadow-[0_0_20px_rgba(0,249,203,0.2)] hover:-translate-y-1 ${
            isDark
              ? 'glass-card border-white/10 hover:border-[#00f9cb]/50'
              : 'bg-white/80 border-[#006853]/20 hover:border-[#006853]'
          }`}
        >
          <div>
            <div className="w-12 h-12 rounded-full bg-[#00f9cb]/20 border border-[#00f9cb]/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[#00f9cb] text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                cached
              </span>
            </div>
            <h3 className={`font-headline-md text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
              {t.home.wheelTitle}
            </h3>
            <p className={`font-body-md text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-[#00352f]/70'}`}>
              {t.home.wheelDesc}
            </p>
          </div>
          <div className={`mt-6 flex items-center font-label-caps text-sm gap-2 group-hover:translate-x-[-4px] transition-transform w-fit ${isDark ? 'text-[#00f9cb]' : 'text-[#006853] font-bold'}`}>
            <span>{t.home.wheelBtn}</span>
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ transform: isRtl ? 'rotate(0deg)' : 'rotate(180deg)' }}
            >
              arrow_back
            </span>
          </div>
          <span className="material-symbols-outlined absolute -bottom-6 -left-6 text-[110px] text-[#00f9cb]/10 rotate-12 group-hover:rotate-45 transition-transform duration-700 pointer-events-none">
            casino
          </span>
        </div>

        {/* Fridge Saver Card */}
        <div
          id="home-card-saver"
          onClick={() => navigateTo('saver')}
          className={`group rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden border cursor-pointer hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:-translate-y-1 ${
            isDark
              ? 'glass-card border-white/10 hover:border-purple-500/50'
              : 'bg-white/80 border-purple-300 hover:border-purple-500'
          }`}
        >
          <div>
            <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-purple-300 text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                kitchen
              </span>
            </div>
            <h3 className={`font-headline-md text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
              {t.home.saverTitle}
            </h3>
            <p className={`font-body-md text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-[#00352f]/70'}`}>
              {t.home.saverDesc}
            </p>
          </div>
          <div className={`mt-6 flex items-center font-label-caps text-sm gap-2 group-hover:translate-x-[-4px] transition-transform w-fit ${isDark ? 'text-purple-300' : 'text-purple-700 font-bold'}`}>
            <span>{t.home.saverBtn}</span>
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ transform: isRtl ? 'rotate(0deg)' : 'rotate(180deg)' }}
            >
              arrow_back
            </span>
          </div>
          <span className="material-symbols-outlined absolute -bottom-6 -left-6 text-[110px] text-purple-400/10 -rotate-12 group-hover:-rotate-45 transition-transform duration-700 pointer-events-none">
            local_dining
          </span>
        </div>

        {/* Diet Mode Card */}
        <div
          id="home-card-diet"
          onClick={() => navigateTo('diet')}
          className={`group rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden border cursor-pointer hover:shadow-[0_0_20px_rgba(0,249,203,0.2)] hover:-translate-y-1 ${
            isDark
              ? 'glass-card border-white/10 hover:border-[#00f9cb]/50'
              : 'bg-white/80 border-[#006853]/20 hover:border-[#006853]'
          }`}
        >
          <div>
            <div className="w-12 h-12 rounded-full bg-[#00f9cb]/20 border border-[#00f9cb]/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[#00f9cb] text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                nutrition
              </span>
            </div>
            <h3 className={`font-headline-md text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
              {t.home.dietTitle}
            </h3>
            <p className={`font-body-md text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-[#00352f]/70'}`}>
              {t.home.dietDesc}
            </p>
          </div>
          <div className={`mt-6 flex items-center font-label-caps text-sm gap-2 group-hover:translate-x-[-4px] transition-transform w-fit ${isDark ? 'text-[#00f9cb]' : 'text-[#006853] font-bold'}`}>
            <span>{t.home.dietBtn}</span>
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ transform: isRtl ? 'rotate(0deg)' : 'rotate(180deg)' }}
            >
              arrow_back
            </span>
          </div>
          <span className="material-symbols-outlined absolute -bottom-6 -left-6 text-[110px] text-[#00f9cb]/10 rotate-12 group-hover:rotate-45 transition-transform duration-700 pointer-events-none">
            restaurant
          </span>
        </div>
      </section>

      {/* Quick Inspiration Section */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className={`font-headline-md text-xl font-bold ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
            {t.home.inspirationTitle}
          </h3>
          <span className="material-symbols-outlined text-[#0aceff] text-[24px]">local_fire_department</span>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 -mx-6 px-6 snap-x hide-scrollbar">
          {/* Card 1 */}
          <div
            id="inspiration-recipe-grilled-chicken"
            onClick={() => handleOpenRecipe('grilled-chicken-veg')}
            className="min-w-[220px] w-[220px] h-[260px] rounded-2xl overflow-hidden relative group snap-start cursor-pointer border border-white/10 shrink-0 shadow-md hover:scale-[1.02] transition-transform duration-300"
          >
            <div
              className="bg-cover bg-center w-full h-full absolute inset-0 group-hover:scale-110 transition-transform duration-500"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBrciS23qwazvd_x0kNZi86ZMZ7TyVOPkt8Fpz2XhtDYu3ubI9lnDDJDF4CdVNajqDt8ma1WwhqjNssZJYoQ4wjEaeNYpCM_iYB6OUL2XgJXmtQrhh4eqY6HQysy7GgrFY8MMrO6mrgwz-vc1_5NhXWXhtFW1Mm5MQIvUln1Iy3VQpNcdOFrAP5Pj3eAY3HohhpRDUSNrn3NSh62RTas-YxF0Q05mMmJ9x5XAF8a6mx_-RDAsedxgdy')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#002117] via-[#002117]/50 to-transparent" />
            <div className="absolute bottom-4 right-4 left-4 text-right">
              <span className="text-[#00f9cb] font-label-caps text-[12px] mb-1 block">
                {language === 'ar' ? 'غداء صحي' : 'Healthy Lunch'}
              </span>
              <h4 className="text-white font-body-lg font-semibold leading-tight">
                {language === 'ar' ? 'دجاج مشوي مع الخضار' : 'Grilled Chicken with Veg'}
              </h4>
            </div>
          </div>

          {/* Card 2 */}
          <div
            id="inspiration-recipe-quinoa-salad"
            onClick={() => handleOpenRecipe('quinoa-salad')}
            className="min-w-[220px] w-[220px] h-[260px] rounded-2xl overflow-hidden relative group snap-start cursor-pointer border border-white/10 shrink-0 shadow-md hover:scale-[1.02] transition-transform duration-300"
          >
            <div
              className="bg-cover bg-center w-full h-full absolute inset-0 group-hover:scale-110 transition-transform duration-500"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA5J8RqXdUUhTcthM_hLm3HjLnsbJ7zSH5DvRJufOshi-LkMXHRqoFkNLxZU6jVIv80dt472sqlhwoDxyn5fCc3FoaurP4gty7TlrJXZa6JK3Oa2KZuOrgz0WiPPmZo-qjHc3Je1yNJrXAwrLBK2jjzkYIVtJInlR-jl5UXxFPymy9sa_GWIldfdv7ez94U2rwMiIuEPYyIdIjnGlSYZYxSKh4gkN56j8IQVKNEiSi-8Qykkk8WYAVn')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#002117] via-[#002117]/50 to-transparent" />
            <div className="absolute bottom-4 right-4 left-4 text-right">
              <span className="text-[#00f9cb] font-label-caps text-[12px] mb-1 block">
                {language === 'ar' ? 'نباتي' : 'Vegetarian'}
              </span>
              <h4 className="text-white font-body-lg font-semibold leading-tight">
                {language === 'ar' ? 'سلطة الكينوا المنعشة' : 'Refreshing Quinoa Salad'}
              </h4>
            </div>
          </div>

          {/* Card 3 */}
          <div
            id="inspiration-recipe-tomato-soup"
            onClick={() => handleOpenRecipe('tomato-soup')}
            className="min-w-[220px] w-[220px] h-[260px] rounded-2xl overflow-hidden relative group snap-start cursor-pointer border border-white/10 shrink-0 shadow-md hover:scale-[1.02] transition-transform duration-300"
          >
            <div
              className="bg-cover bg-center w-full h-full absolute inset-0 group-hover:scale-110 transition-transform duration-500"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAJor7UZs4LeFf9a0v2oUGQNcngvH4XOrIBhI_D8H_ZA1pLsOrconFZAVp5bOFtIvd7bX72HJ7kdIhuIRMtLgx0fMKWp3gSEXK_A4Ou6M3sSWV1wd8BcHGGXPEsluZJzh4V0QQQI1n8QlYgJAU9Pfi_gVpY4J-ncddfRybulHv5kHL-o5satw2LDgPz7NiW2cfUzeUmrnllfKSygtRMn-lJZR3iA4_fuNLsXuJvqiuGwmY63Q1rbbDT')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#002117] via-[#002117]/50 to-transparent" />
            <div className="absolute bottom-4 right-4 left-4 text-right">
              <span className="text-[#00f9cb] font-label-caps text-[12px] mb-1 block">
                {language === 'ar' ? 'عشاء خفيف' : 'Light Dinner'}
              </span>
              <h4 className="text-white font-body-lg font-semibold leading-tight">
                {language === 'ar' ? 'شوربة الطماطم الكلاسيكية' : 'Classic Tomato Soup'}
              </h4>
            </div>
          </div>

          {/* Card 4: Authentic Saudi Kabsa */}
          <div
            id="inspiration-recipe-kabsa"
            onClick={() => handleOpenRecipe('machboos-chicken')}
            className="min-w-[220px] w-[220px] h-[260px] rounded-2xl overflow-hidden relative group snap-start cursor-pointer border border-white/10 shrink-0 shadow-md hover:scale-[1.02] transition-transform duration-300"
          >
            <div
              className="bg-cover bg-center w-full h-full absolute inset-0 group-hover:scale-110 transition-transform duration-500"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuACRoDmmoEwjED53UZ7REO0AkEMBFtPJKj5TNShv6uXNTw_eTgqP1h1cqfcCdxD9ibIH68dAebNU4ft45JIAm1eTH0BKO9eGelKrUAqHncx-W008QyQBD_DRDEkr9iCj0Y09giCjL0qCfaJSR0sxUwo_qOu1A5XOb_tYEXQjWTZMwde8YePgQRXFK5NWdVAuOx-JxZZy3O6cnhoBuEYlU_JVUqqzDPprr0CMdtdlhwTEGuwG7nMdIEE')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#002117] via-[#002117]/50 to-transparent" />
            <div className="absolute bottom-4 right-4 left-4 text-right">
              <span className="text-[#00f9cb] font-label-caps text-[12px] mb-1 block">
                {language === 'ar' ? 'أطباق سعودية أصيلة' : 'Authentic Saudi'}
              </span>
              <h4 className="text-white font-body-lg font-semibold leading-tight">
                {language === 'ar' ? 'كبسة دجاج سعودية بالأرز البسمتي' : 'Saudi Chicken Kabsa'}
              </h4>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

