import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { QuickChatButton } from './components/QuickChatButton';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SaverScreen } from './screens/SaverScreen';
import { WheelScreen } from './screens/WheelScreen';
import { DietScreen } from './screens/DietScreen';
import { RecipeScreen } from './screens/RecipeScreen';
import { ChatScreen } from './screens/ChatScreen';
import { AccountScreen } from './screens/AccountScreen';
import { MyKitchenScreen } from './screens/MyKitchenScreen';

const MainLayout: React.FC = () => {
  const { currentPage, theme } = useApp();

  const renderScreen = () => {
    switch (currentPage) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'home':
        return <HomeScreen />;
      case 'my-kitchen':
        return <MyKitchenScreen />;
      case 'saver':
        return <SaverScreen />;
      case 'wheel':
        return <WheelScreen />;
      case 'diet':
        return <DietScreen />;
      case 'recipe':
        return <RecipeScreen />;
      case 'chat':
        return <ChatScreen />;
      case 'account':
        return <AccountScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div
      id="app-root-wrapper"
      className={`min-h-screen w-full relative transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#002117] text-white' : 'bg-[#d6fff6] text-[#00352f]'
      }`}
    >
      <Header />
      {renderScreen()}
      <QuickChatButton />
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
