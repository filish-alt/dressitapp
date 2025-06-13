import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  colors: typeof Colors.light;
}

// Create the context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  colors: Colors.light,
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Use system preference as default
  const systemTheme = Appearance.getColorScheme() ?? 'light';
  const [theme, setTheme] = useState<ThemeType>(systemTheme as ThemeType);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@theme_preference');
        if (savedTheme) {
          setTheme(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };

    loadTheme();
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) {
        // Only update if no user preference is saved
        AsyncStorage.getItem('@theme_preference').then(savedTheme => {
          if (!savedTheme) {
            setTheme(colorScheme as ThemeType);
          }
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    // Save user preference
    AsyncStorage.setItem('@theme_preference', newTheme).catch(error => {
      console.error('Failed to save theme preference:', error);
    });
  };

  // Provide current theme colors and toggle function
  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        colors: Colors[theme],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for accessing theme context
export const useTheme = () => useContext(ThemeContext);

