import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { Platform } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        // Haptics functionality removed for React Native CLI
        // Can be replaced with react-native-haptic-feedback if needed
        props.onPressIn?.(ev);
      }}
    />
  );
}
