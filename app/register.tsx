import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import GradientButton from '../components/ui/GradientButton';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFullForm, setShowFullForm] = useState(false);
  const [emailValidated, setEmailValidated] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);

  // const checkEmailUniqueness = async () => {
  //   if (!email || !email.trim()) {
  //     setEmailError('Email is required');
  //     return;
  //   }
    
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   if (!emailRegex.test(email)) {
  //     setEmailError('Please enter a valid email address');
  //     return;
  //   }
    
  //   setCheckingEmail(true);
  //   setEmailError('');
    
  //   try {
  //     // Mock email uniqueness check with setTimeout to simulate API delay
  //     await new Promise<void>((resolve, reject) => {
  //       setTimeout(() => {
  //         // Check if email contains "exists@" to simulate an already registered email
  //         if (email.toLowerCase().includes('exists@')) {
  //           reject(new Error('Email already exists'));
  //         } else {
  //           resolve();
  //         }
  //       }, 1000); // 1 second delay to simulate network request
  //     });
      
  //     // If we reach here, the email is available
  //     setEmailValidated(true);
  //     setShowFullForm(true);
      
  //   } catch (error: any) {
  //     // Handle the case where email already exists
  //     setEmailError('This email is already registered. Please sign in instead.');
  //     setEmailValidated(false);
  //     console.log('Email check error:', error.message);
  //   } finally {
  //     setCheckingEmail(false);
  //   }
  // };

const handleRegister = async () => {
  setLoading(true);
  try {
    const payload = {
      name,
      email,
      phone,
      password,
      password_confirmation: passwordConfirmation,
    };

    const response = await axios.post(
      'https://dev.dressitnow.com/api/register',
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const { status, message, data } = response.data;

    if (!status) {
      // If validation fails, extract first error message
      const firstErrorKey = Object.keys(data)[0];
      const firstErrorMsg = data[firstErrorKey][0] || 'Registration failed';
      Alert.alert('Registration Failed', firstErrorMsg);
      return; // Don't proceed
    }
    Alert.alert('Success', 'Registration successful! Please check your email for OTP.');
    router.push('/otp');

  } catch (error: any) {
    console.log('Registration error:', error?.response?.data);
    Alert.alert(
      'Registration Failed',
      error?.response?.data?.message || 'An unexpected error occurred.'
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/logo.png')} 
        style={styles.logo} 
        resizeMode="contain"
      />
      <Text style={styles.title}>Sign Up</Text>
       <Text style={styles.socialText}>Enter Your Credential to Register</Text>
      <View style={styles.formContainer}>
       
        
       
        {
          <>
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) setEmailError('');
          }}
          editable={!checkingEmail && !showFullForm}
        />
        
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Password Confirmation"
              secureTextEntry
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
            />
            <GradientButton 
              onPress={handleRegister} 
              title={loading ? 'Registering...' : 'Register'} 
            />
          </>
        }
      </View>
      
      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
       <View style={styles.socialLoginContainer}>
                <Text style={styles.socialText}>Or continue with</Text>
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
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#000', // Changed to black
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#000', // Changed to black
  },
  link: {
    color: '#5828AF', // Keeping this color for links
    marginTop: 20,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  loadingText: {
    marginLeft: 10,
    color: '#000', // Changed to black
  },
   socialLoginContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
  },
  socialText: {
    color: '#000',
    marginBottom: 15,
    fontSize: 14,
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default RegisterScreen; 