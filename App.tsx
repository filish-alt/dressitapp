import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Platform } from 'react-native';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

// Import your components
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { BRAND } from './constants/Colors';
import { HapticTab } from './components/HapticTab';
import GradientTabIcon from './components/GradientTabIcon';
import TabBarBackground from './components/ui/TabBarBackground';

// Import screens - you'll need to update these imports based on your actual screen files
import LoginScreen from './app/login';
import RegisterScreen from './app/register';
import OTPScreen from './app/otp';
import ForgotPasswordScreen from './app/forgot-password';
import ResetPasswordScreen from './app/reset-password';
import WelcomeScreen from './app/welcome';
import FeedScreen from './app/(tabs)/feed';
import SearchScreen from './app/(tabs)/search';
import PostScreen from './app/(tabs)/post';
import ProfileScreen from './app/(tabs)/profile';
import ProfileUpdateScreen from './app/profileupdate';
import MessageScreen from './app/message';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { colors, theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: BRAND,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            height: 50,
            borderTopWidth: 0.5,
            borderTopColor: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(100,100,100,0.1)',
            backgroundColor: colors.background,
          },
          default: {
            height: 50,
            borderTopWidth: 0.5,
            borderTopColor: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(100,100,100,0.1)',
            backgroundColor: colors.background,
          },
        }),
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <GradientTabIcon 
              focused={focused}
              name="home-outline"
              focusedName="home"
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <GradientTabIcon 
              focused={focused}
              name="search-outline"
              focusedName="search"
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Post"
        component={PostScreen}
        options={{
          title: 'Post',
          tabBarIcon: ({ color, focused }) => (
            <GradientTabIcon 
              focused={focused}
              name="plus-box-outline"
              focusedName="plus-box"
              size={26} 
              color={color}
              type="MaterialCommunityIcons"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <GradientTabIcon 
              focused={focused}
              name="person-outline"
              focusedName="person"
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
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
        <NavigationContainer theme={navigationTheme}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="OTP" component={OTPScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Tabs" component={TabNavigator} />
              <Stack.Screen name="ProfileUpdate" component={ProfileUpdateScreen} />
              <Stack.Screen name="Message" component={MessageScreen} />
            </Stack.Navigator>
            <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
          </GestureHandlerRootView>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
