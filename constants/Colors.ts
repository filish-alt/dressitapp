/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Define the brand color as a constant for consistent use throughout the app
export const BRAND = '#000';
const tintColorDark = '#fff';

export const GRADIENT_CONFIG = {
  colors: ['#364DEF', '#5828AF'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
};

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: BRAND,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: BRAND,
  },
  dark: {
    text: '#11181C', // Changed to dark text for better contrast on white background
    background: '#fff', // Changed from black to white as requested
    tint: BRAND,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: BRAND,
  },
};
