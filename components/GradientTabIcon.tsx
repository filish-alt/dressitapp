import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GRADIENT_CONFIG } from '@/constants/Colors';

type IconType = 'Ionicons' | 'MaterialCommunityIcons';

interface GradientTabIconProps {
  focused: boolean;
  color: string;
  size: number;
  name: string;
  focusedName?: string;
  type?: IconType;
}

const GradientTabIcon: React.FC<GradientTabIconProps> = ({
  focused,
  color,
  size,
  name,
  focusedName,
  type = 'Ionicons',
}) => {
  // Determine the actual icon name based on focused state and provided names
  const iconName = focused && focusedName ? focusedName : name;

  // If not focused, just render the regular icon
  if (!focused) {
    return type === 'Ionicons' ? (
      <Ionicons name={iconName as any} size={size} color={color} />
    ) : (
      <MaterialCommunityIcons name={iconName as any} size={size} color={color} />
    );
  }

  // If focused, wrap with gradient
  return (
    <View style={styles.container}>
      <LinearGradient
        {...GRADIENT_CONFIG}
        style={[styles.gradient, { width: size * 1.8, height: size * 1.8 }]}
      >
        {type === 'Ionicons' ? (
          <Ionicons name={iconName as any} size={size} color="white" />
        ) : (
          <MaterialCommunityIcons name={iconName as any} size={size} color="white" />
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GradientTabIcon;

