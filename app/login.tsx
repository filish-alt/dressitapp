import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import GradientButton from '../components/ui/GradientButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
     let response: any
    try {
       response = await axios.post('http://dressit.rasoisoftware.com/api/login', { email, password });
      // Handle successful login (e.g., save token, navigate)
      console.log("response ",response)
      Alert.alert('Success', 'Login successful!');
      
      router.push('/welcome'); // Navigate to the welcome screen after successful login
    } catch (error: any) {
      console.log('Login error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        headers: error?.response?.headers,
        config: error?.config
      });
      
      Alert.alert(
        'Login Failed',
        JSON.stringify(error?.response?.data) ||
        error?.message ||
        'An error occurred'
      );
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Image 
          source={require('../assets/images/logo.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Text style={styles.title}>Login</Text>
        <Text style={styles.explanatoryText}>Enter your login credentials</Text>
        <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialCommunityIcons 
              name={showPassword ? 'eye-off' : 'eye'} 
              size={24} 
              color="#364DEF" 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.rememberMeRow}>
          <View style={styles.rememberMeContainer}>
            <Checkbox
              value={rememberMe}
              onValueChange={setRememberMe}
              color={rememberMe ? '#364DEF' : undefined}
              style={styles.checkbox}
            />
            <Text style={styles.rememberMeText}>Remember Me</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/forgot-password')}>
            <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        
        <GradientButton onPress={handleLogin} title={loading ? 'Logging in...' : 'Login'} />
        
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>
        
        <View style={styles.socialLoginContainer}>
          <Text style={styles.socialText}>Continue with social account</Text>
          <View style={styles.socialIconsContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <MaterialCommunityIcons name="google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <MaterialCommunityIcons name="facebook" size={24} color="#4267B2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <MaterialCommunityIcons name="apple" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have account? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.signupLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  explanatoryText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 18,
    fontSize: 16,
    color: '#000',
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 18,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#000',
  },
  eyeIcon: {
    padding: 10,
  },
  rememberMeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 8,
  },
  rememberMeText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPasswordLink: {
    color: '#5828AF',
    fontSize: 14,
    fontWeight: '500',
  },
  dividerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 14,
  },
  socialLoginContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
  },
  socialText: {
    color: '#000',
    marginBottom: 18,
    fontSize: 16,
    textAlign: 'center',
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  signupText: {
    color: '#000',
    fontSize: 15,
  },
  signupLink: {
    color: '#5828AF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
