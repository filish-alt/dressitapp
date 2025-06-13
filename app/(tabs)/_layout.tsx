import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { BRAND } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';

export default function TabLayout() {
  const { colors, theme } = useTheme();
  const textColor = colors.text;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: BRAND,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
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
      }}>
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "search" : "search-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Post',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons 
              name="plus-box-outline" 
              size={26} 
              color={color} 
            />
          ),
          // Placeholder - will be implemented in future
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent default behavior for now
            e.preventDefault();
            // In the future, this would open a post creation screen
            alert('Post creation will be available in a future update');
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={24} 
              color={color} 
            />
          ),
          // Placeholder - will be implemented in future
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent default behavior for now
            e.preventDefault();
            // In the future, this would navigate to the profile screen
            alert('Profile screen will be available in a future update');
          },
        }}
      />
    </Tabs>
  );
}
