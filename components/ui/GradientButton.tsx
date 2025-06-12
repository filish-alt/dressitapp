import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
}

const GradientButton: React.FC<GradientButtonProps> = ({ onPress, title, style }) => (
  <TouchableOpacity onPress={onPress} style={[styles.buttonContainer, style]}>
    <LinearGradient
      colors={['#364DEF', '#5828AF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradient}
    >
      <Text style={styles.text}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    marginVertical: 10,
  },
  gradient: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 25,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default GradientButton; 