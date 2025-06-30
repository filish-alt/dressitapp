import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  ActivityIndicator, 
  StyleProp 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { GRADIENT_CONFIG } from '@/constants/Colors';

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
  disabled?: boolean;
}

const GradientButton: React.FC<GradientButtonProps> = ({ 
  onPress, 
  title, 
  style, 
  loading = false,
  disabled = false 
}) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={[styles.buttonContainer, style]}
    disabled={loading || disabled}
    activeOpacity={0.8}
  >
    <LinearGradient
      {...GRADIENT_CONFIG}
      style={[
        styles.gradient,
        (disabled && !loading) && styles.disabledGradient
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
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
    justifyContent: 'center',
    borderRadius: 25,
    minHeight: 50,
  },
  disabledGradient: {
    opacity: 0.6,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default GradientButton; 