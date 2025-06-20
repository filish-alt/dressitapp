import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENT_CONFIG } from '@/constants/Colors';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  style?: any;
  textStyle?: any;
  loading?: boolean;
  disabled?: boolean;
}

const GradientButton: React.FC<GradientButtonProps> = ({ 
  title, 
  onPress, 
  style, 
  textStyle,
  loading = false,
  disabled = false
}) => {
  return (
    <TouchableOpacity 
      style={[styles.buttonContainer, style]} 
      onPress={onPress} 
      disabled={loading || disabled}
    >
      <LinearGradient {...GRADIENT_CONFIG} style={styles.gradient}>
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  gradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default GradientButton;

