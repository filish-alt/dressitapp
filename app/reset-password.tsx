import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GradientButton from '../components/ui/GradientButton';
import axios from 'axios';

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const response = await axios.post('https://dev.dressitnow.com/api/reset-password-otp', { email, otp, password: newPassword });
      Alert.alert('Success', 'Password reset successful! You can now login.');
      (navigation as any).navigate('Tabs', { screen: 'Login' })
    } catch (error: any) {
      Alert.alert('Reset Failed', error?.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="OTP"
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
      />
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <GradientButton onPress={handleResetPassword} title={loading ? 'Resetting...' : 'Reset Password'} />
      <TouchableOpacity onPress={() =>(navigation as any).navigate('Tabs', { screen: 'Login' })}><Text style={styles.link}>Back to Login</Text></TouchableOpacity>
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

export default ResetPasswordScreen; 