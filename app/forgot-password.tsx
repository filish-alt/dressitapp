import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import GradientButton from '../components/ui/GradientButton';
import axios from 'axios';

const ForgotPasswordScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    setLoading(true);
    try {
      const response = await axios.post('https://dev.dressitnow.com/api/forgot-password-otp', { email });
      Alert.alert('Success', 'Password reset instructions sent to your email.');
      router.push('/reset-password');
    } catch (error: any) {
      Alert.alert('Request Failed', error?.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <GradientButton onPress={handleForgotPassword} title={loading ? 'Sending...' : 'Send Reset Link'} />
      <TouchableOpacity onPress={() => router.push('/login')}><Text style={styles.link}>Back to Login</Text></TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#364DEF',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  link: {
    color: '#5828AF',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen; 