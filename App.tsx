/** Ponto de entrada do app RIVA — carrega fonte Sora antes de renderizar */
import React, { useState } from 'react';
import { View, ActivityIndicator, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
} from '@expo-google-fonts/sora';
import { NavigationProvider, useNavigation } from './src/context/NavigationContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { AuthProvider } from './src/context/AuthContext';
import { ChatProvider } from './src/context/ChatContext';
import { RecentlyViewedProvider } from './src/context/RecentlyViewedContext';
import { ConversasRecentesProvider } from './src/context/ConversasRecentesContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { VeiculosScreen } from './src/screens/VeiculosScreen';
import { CompararScreen } from './src/screens/CompararScreen';
import { NoticiasScreen } from './src/screens/NoticiasScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { Sidebar } from './src/components/home/Sidebar';
import { IntroAnimation } from './src/components/splash/IntroAnimation';
import { Colors } from './src/theme/colors';
import { DESKTOP_BREAKPOINT, SIDEBAR_DOCKED_WIDTH } from './src/utils/layout';

function AppScreens() {
  const { activeScreen, sidebarOpen, closeSidebar } = useNavigation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <View style={{ flex: 1, paddingLeft: isDesktop ? SIDEBAR_DOCKED_WIDTH : 0 }}>
        {activeScreen === 'Veículos' ? (
          <VeiculosScreen />
        ) : activeScreen === 'Comparar' ? (
          <CompararScreen />
        ) : activeScreen === 'Notícias' ? (
          <NoticiasScreen />
        ) : activeScreen === 'Perfil' ? (
          <ProfileScreen />
        ) : (
          <HomeScreen />
        )}
      </View>
      <Sidebar visible={sidebarOpen} onClose={closeSidebar} />
      <LoginScreen />
    </View>
  );
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationProvider>
       <AuthProvider>
        <FavoritesProvider>
         <RecentlyViewedProvider>
         <ConversasRecentesProvider>
         <ChatProvider>
          <StatusBar style="light" />
          <AppScreens />
          {showIntro && <IntroAnimation onFinish={() => setShowIntro(false)} />}
         </ChatProvider>
         </ConversasRecentesProvider>
         </RecentlyViewedProvider>
        </FavoritesProvider>
       </AuthProvider>
      </NavigationProvider>
    </SafeAreaProvider>
  );
}