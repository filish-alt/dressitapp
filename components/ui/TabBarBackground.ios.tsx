import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';

// Alternative to BlurView for React Native CLI
// You can install @react-native-community/blur for blur effect if needed
export default function BlurTabBarBackground() {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background
          // For dark mode, you might want to use: 'rgba(0, 0, 0, 0.8)'
        }
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
