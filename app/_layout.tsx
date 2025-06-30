import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
//import { StatusBar } from 'expo-status-bar';
import { StatusBar } from 'react-native';
import 'react-native-reanimated';
import { PaperProvider, MD3DarkTheme, MD3LightTheme, adaptNavigationTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { BRAND } from '@/constants/Colors';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider>
      <RootLayoutNavigation />
    </ThemeProvider>
  );
}

function RootLayoutNavigation() {
  const { theme, colors } = useTheme();
  
  // Customize the navigation theme based on our app theme
  const navigationTheme = {
    ...(theme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: BRAND,
      background: colors.background,
      card: colors.background,
      text: colors.text,
    },
  };
  // Create a Paper theme that matches our app theme
  const paperTheme = theme === 'dark' 
    ? { ...MD3DarkTheme, colors: { ...MD3DarkTheme.colors, primary: BRAND, ...colors } }
    : { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, primary: BRAND, ...colors } };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <NavigationThemeProvider value={navigationTheme}>
         <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="otp" />
            <Stack.Screen name="forgot-password" />
            <Stack.Screen name="reset-password" />
            <Stack.Screen name="+not-found" />
          </Stack>
          </GestureHandlerRootView>
           <StatusBar barStyle="dark-content" />
        </NavigationThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
