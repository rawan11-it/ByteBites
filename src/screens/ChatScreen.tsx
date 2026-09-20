import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ChatMessage, Recipe } from '../types';
import { RecipeDetailView } from '../components/RecipeDetailView';
import { initialRecipes } from '../data/recipes';

export const ChatScreen: React.FC = () => {
  const { userId, t, theme, language, gender, persistSavedRecipe, savedRecipesList, allRecipes } = useApp();
  const isDark = theme === 'dark';
  const isArabic = language === 'ar';

  const getWelcomeText = () => {
    if (!isArabic) return t.chat.welcomeMsg;
    if (gender === 'female') {
      return 'أهلاً بكِ! أنا بايت 👨‍🍳 كيف يمكنني مساعدتكِ في مطبخكِ اليوم؟ هل تبحثين عن وصفة محددة أم ترغبين في اقتراح شيء بناءً على ما لديكِ في الثلاجة؟';
    }
    if (gender === 'male') {
      return 'أهلاً بك! أنا بايت 👨‍🍳 كيف يمكنني مساعدتك في مطبخك اليوم؟ هل تبحث عن وصفة محددة أم تريد مني اقتراح شيء بناءً على ما لديك في الثلاجة؟';
    }
    return t.chat.welcomeMsg;
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: getWelcomeText(),
    },
    {
      id: '2',
      sender: 'user',
      text: t.chat.userExample,
    },
    {
      id: '3',
      sender: 'ai',
      text: t.chat.aiReply,
      hasSmartCard: true,
      smartCardTitle: t.chat.smartSuggestion,
      smartCardRecipeId: 'machboos-chicken',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [saveToast, setSaveToast] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendDirect = (text: string) => {
    setInputText(text);
    setTimeout(() => {
      executeSend(text);
    }, 50);
  };

  const handleSend = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const messageToSend = inputText.trim();
    if (!messageToSend || isTyping || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
      await executeSend(messageToSend);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const executeSend = async (userText: string) => {
    if (!userText || isTyping) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: userText,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsTyping(true);

    try {
      // Format messages for the multi-turn Gemini API
      const apiMessages = newHistory.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text,
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          language,
          userId,
          gender,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Invalid response format');
      }

      const data = await response.json();
      if (data.success && data.reply) {
        // If recipe was successfully saved to database
        if (data.savedRecipe) {
          persistSavedRecipe(data.savedRecipe);
          setSaveToast(true);
          setTimeout(() => setSaveToast(false), 3500);
        }

        // Detect if response mentions specific dishes
        const lowerReply = data.reply.toLowerCase();
        let matchedRecipeId: string | undefined = data.savedRecipe?.id;
        if (!matchedRecipeId) {
          if (lowerReply.includes('مكبوس') || lowerReply.includes('machboos')) matchedRecipeId = 'machboos-chicken';
          else if (lowerReply.includes('كينوا') || lowerReply.includes('quinoa') || lowerReply.includes('سلطة')) matchedRecipeId = 'quinoa-salad';
          else if (lowerReply.includes('طماطم') || lowerReply.includes('شوربة') || lowerReply.includes('soup')) matchedRecipeId = 'tomato-soup';
          else if (lowerReply.includes('مشوي') || lowerReply.includes('grilled')) matchedRecipeId = 'grilled-chicken-veg';
          else if (lowerReply.includes('بيتزا') || lowerReply.includes('pizza') || lowerReply.includes('باستا')) matchedRecipeId = 'homemade-pizza';
        }

        const aiMsg: ChatMessage = {
          id: String(Date.now() + 1),
          sender: 'ai',
          text: data.reply,
          hasSmartCard: !!matchedRecipeId,
          smartCardTitle: data.savedRecipe ? (isArabic ? 'وصفتك في مطبخك الخاص 🍳' : 'Your Recipe in Private Kitchen') : t.chat.smartSuggestion,
          smartCardRecipeId: matchedRecipeId,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'Chat request failed');
      }
    } catch (err) {
      console.error('Error in Byte Chat:', err);
      const fallbackMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: isArabic
          ? (gender === 'female'
              ? 'أنا هنا معكِ! يبدو أن هناك ضغطاً بسيطاً في الشبكة، ولكن يمكنكِ سؤالي عن أي وصفة أو بدائل وسأجيبكِ فوراً.'
              : gender === 'male'
              ? 'أنا هنا معك! يبدو أن هناك ضغطاً بسيطاً في الشبكة، ولكن يمكنك سؤالي عن أي وصفة أو بدائل وسأجيبك فوراً.'
              : 'أنا هنا معك! يبدو أن هناك ضغطاً بسيطاً في الشبكة، ولكن يمكنك السؤال عن أي وصفة أو بدائل وسأجيب فوراً.')
          : 'I am here with you! There was a small network hiccup, but feel free to ask me anything about recipes or ingredients.',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
      isSubmittingRef.current = false;
    }
  };

  const handleAnotherSuggestion = async () => {
    if (isTyping) return;
    setIsTyping(true);

    try {
      const promptText = isArabic
        ? 'اقترح علي وصفة أخرى مميزة وسريعة تناسب الأجواء اليوم'
        : 'Suggest another distinctive and quick recipe for today';

      const userMsg: ChatMessage = {
        id: String(Date.now()),
        sender: 'user',
        text: promptText,
      };

      const newHistory = [...messages, userMsg];
      setMessages(newHistory);

      const apiMessages = newHistory.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text,
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          language,
          userId,
          gender,
        }),
      });

      const contentType2 = response.headers.get('content-type') || '';
      if (!contentType2.includes('application/json')) {
        throw new Error('Invalid response format');
      }

      const data = await response.json();
      if (data.success && data.reply) {
        const aiMsg: ChatMessage = {
          id: String(Date.now() + 1),
          sender: 'ai',
          text: data.reply,
          hasSmartCard: true,
          smartCardTitle: t.chat.smartSuggestion,
          smartCardRecipeId: 'quinoa-salad',
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error('Error in Byte another suggestion:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleViewRecipeFromChat = (recipeId?: string) => {
    const found =
      savedRecipesList?.find((r) => r.id === recipeId) ||
      allRecipes?.find((r) => r.id === recipeId) ||
      initialRecipes?.find((r) => r.id === recipeId) ||
      initialRecipes?.[0] || null;
    if (found) {
      setViewingRecipe(found);
    }
  };

  // If a recipe is being viewed from chat, show it inline seamlessly!
  if (viewingRecipe) {
    return (
      <div
        id="chat-screen-container"
        className={`min-h-screen pt-20 pb-32 px-6 max-w-4xl mx-auto transition-colors duration-200 ${
          isDark ? 'bg-[#002117] text-white' : 'bg-[#d6fff6] text-[#00352f]'
        }`}
      >
        <RecipeDetailView
          recipe={viewingRecipe}
          onBack={() => setViewingRecipe(null)}
          backButtonLabel={isArabic ? 'الرجوع للمحادثة' : 'Back to Chat'}
        />
      </div>
    );
  }

  return (
    <div
      id="chat-screen-container"
      className={`min-h-screen pt-20 pb-32 px-4 max-w-3xl mx-auto flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-[#002117] text-white' : 'bg-[#d6fff6] text-[#00352f]'
      }`}
    >
      {/* Introduction Avatar Header */}
      <div className="flex flex-col items-center justify-center py-4 mb-3 text-center">
        <div className="relative w-20 h-20 rounded-full overflow-hidden mb-2 border-2 border-[#00f9cb] shadow-lg">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPMK2YHfOlYnPH6o4N91cvk5BVN11bLZwwE2QFpSoto2fqAF01GUz1YY3xq4htI5n_BNWGE67EDXglpSgLWxHSLA-HmCm8KMLg8yYzlicLG3Dvq2d7NDdGCFAc5M-AAc82ZwBBQLjolAd-tnX6mL_FypUaI56vLXcFNADYHil0tqJC7SCMhSJQW-oqgaqL1guKcW2eFIioVYODY7fYBduaW5PB1oQu9F2E25sAl6PyTdXpPWJ71QuHvYAQbkgf42i__m-JnnGUIbiaCg"
            alt="Byte Avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className={`font-headline-md text-lg font-semibold ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
          {t.chat.title}
        </h2>
        <p className={`text-xs font-label-caps ${isDark ? 'text-white/60' : 'text-[#00352f]/70'}`}>
          {t.chat.subtitle}
        </p>
      </div>

      {/* Messages List */}
      <div className="flex-1 space-y-4 mb-4 overflow-y-auto px-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 max-w-[88%] ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar Icon */}
              <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden flex items-center justify-center border border-[#00f9cb]/40">
                {isUser ? (
                  <div className="w-full h-full bg-[#006853] flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-sm">person</span>
                  </div>
                ) : (
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPMK2YHfOlYnPH6o4N91cvk5BVN11bLZwwE2QFpSoto2fqAF01GUz1YY3xq4htI5n_BNWGE67EDXglpSgLWxHSLA-HmCm8KMLg8yYzlicLG3Dvq2d7NDdGCFAc5M-AAc82ZwBBQLjolAd-tnX6mL_FypUaI56vLXcFNADYHil0tqJC7SCMhSJQW-oqgaqL1guKcW2eFIioVYODY7fYBduaW5PB1oQu9F2E25sAl6PyTdXpPWJ71QuHvYAQbkgf42i__m-JnnGUIbiaCg"
                    alt="Byte"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#133b30] text-white rounded-bl-sm shadow-md'
                    : isDark
                    ? 'glass-panel rounded-br-sm border-white/10 text-white shadow-sm'
                    : 'bg-white text-[#00352f] rounded-br-sm shadow-md border border-[#006853]/15'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Smart Card with Action Chips */}
                {msg.hasSmartCard && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#00f9cb] font-bold">
                      <span className="material-symbols-outlined text-base">auto_awesome</span>
                      <span>{msg.smartCardTitle || t.chat.smartSuggestion}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-1">
                      <button
                        id="chat-view-recipe-chip"
                        onClick={() => handleViewRecipeFromChat(msg.smartCardRecipeId)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-label-caps flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                          isDark
                            ? 'bg-white/10 text-[#00f9cb] border border-[#00f9cb]/40 hover:bg-[#00f9cb]/20'
                            : 'bg-[#006853]/10 text-[#006853] border border-[#006853]/30 hover:bg-[#006853]/20'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">receipt_long</span>
                        <span>{t.chat.viewRecipe}</span>
                      </button>

                      <button
                        id="chat-another-suggestion-chip"
                        onClick={handleAnotherSuggestion}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-label-caps flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                          isDark
                            ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                            : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        <span>{t.chat.anotherSuggestion}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Confirmation Button for Saving Recipe to Private Kitchen */}
                {msg.sender === 'ai' && (msg.text.includes('هل ترغب في حفظ هذه الوصفة في مطبخك الخاص') || msg.text.includes('حفظ هذه الوصفة في مطبخك')) && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-2">
                    <button
                      type="button"
                      id="chat-confirm-save-recipe-btn"
                      onClick={() => handleSendDirect(isArabic ? 'نعم، احفظها في مطبخي الخاص 🍳' : 'Yes, please save it to my Private Kitchen 🍳')}
                      className="px-4 py-2 rounded-full text-xs font-label-caps bg-[#00f9cb] text-[#00352f] font-bold shadow-md hover:bg-[#00f9cb]/90 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-sm">bookmark_add</span>
                      <span>{isArabic ? 'نعم، احفظها في مطبخي الخاص 🍳' : 'Save to Private Kitchen 🍳'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs opacity-70 p-2 text-[#00f9cb]">
            <div className="w-2 h-2 rounded-full bg-[#00f9cb] animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-[#00f9cb] animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 rounded-full bg-[#00f9cb] animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Chat Input Area */}
      <div
        id="chat-bottom-input-bar"
        className={`fixed bottom-0 left-0 right-0 z-40 p-3 pb-safe backdrop-blur-xl border-t transition-colors duration-200 ${
          isDark ? 'bg-[#002117]/95 border-white/10' : 'bg-[#d6fff6]/95 border-[#006853]/20'
        }`}
      >
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center gap-2">
          {/* Text Input */}
          <input
            id="chat-message-input-field"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.chat.placeholder}
            disabled={isTyping}
            className={`flex-1 py-3 px-4 rounded-full border outline-none font-body-md text-sm transition-all ${
              isDark
                ? 'bg-white/10 border-white/15 text-white placeholder-white/50 focus:border-[#00f9cb]'
                : 'bg-white border-[#006853]/20 text-[#00352f] placeholder-gray-400 focus:border-[#006853]'
            }`}
          />

          {/* Send Button */}
          <button
            id="chat-send-message-btn"
            type="submit"
            onClick={handleSend}
            onMouseDown={(e) => {
              // Prevent input blur before click handler processes
              e.preventDefault();
            }}
            disabled={!inputText.trim() || isTyping}
            className={`w-11 h-11 rounded-full bg-[#133b30] hover:bg-[#184a3d] text-[#00f9cb] flex items-center justify-center shadow-md active:scale-95 transition-all shrink-0 cursor-pointer border border-[#00f9cb]/30 ${
              !inputText.trim() || isTyping ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Send"
          >
            <span
              className="material-symbols-outlined text-xl pointer-events-none select-none"
              style={{
                transform: language === 'ar' ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              send
            </span>
          </button>
        </form>
      </div>

      {/* Confirmation Toast: "تم حفظ الوصفة" */}
      {saveToast && (
        <div
          id="chat-saved-recipe-toast"
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#00f9cb] text-[#00352f] px-5 py-2.5 rounded-full font-label-caps text-sm font-bold shadow-xl shadow-[#00f9cb]/30 flex items-center gap-2 animate-bounce"
        >
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span>{isArabic ? 'تم حفظ الوصفة في مطبخك الخاص 🍳' : 'Recipe saved to Private Kitchen 🍳'}</span>
        </div>
      )}
    </div>
  );
};

