import { Tabs } from 'expo-router';
import React from 'react';
import './polyfills';

import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import GradientTabIcon from '@/components/GradientTabIcon';
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
      <Tabs.Screen
        name="search"
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
      <Tabs.Screen
        name="post"
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
      <Tabs.Screen
        name="profile"
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
    </Tabs>
  );
}
