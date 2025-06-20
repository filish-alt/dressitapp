import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Image, 
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import GradientButton from '../components/ui/GradientButton';

const OTPScreen: React.FC = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  
  // Create separate state for each digit
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  // Track which input is focused
  const [focusedInput, setFocusedInput] = useState<number | null>(null);
  
  // Create refs for each input
  const inputRefs = useRef<Array<TextInput | null>>([]);
  for (let i = 0; i < 6; i++) {
    // Initialize if needed
    if (!inputRefs.current[i]) {
      inputRefs.current[i] = null;
    }
  }

  // Handle input change for each digit
  const handleOtpChange = (text: string, index: number) => {
    // Only allow one digit per input
    if (text.length > 1) {
      text = text.slice(0, 1);
    }
    
    // Update the OTP array
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    
    // Auto focus to next input if a digit was entered
    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace key press
  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace when current input is empty
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  // Focus the first input when the component mounts
  useEffect(() => {
    // Short timeout to ensure the input is ready
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const verifyOtp = async () => {
    // Combine all digits into a single OTP string
    const otpString = otp.join('');
    
    // Validate that all digits were entered
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter all 6 digits of the OTP');
      return;
    }
    
    setLoading(true);
    try {
      // API call to verify OTP
      const response = await axios.post('https://dev.dressitnow.com/api/verify-otp', {
        email,
        otp: otpString
      });
      
      Alert.alert('Success', 'OTP verified successfully!');
      router.push('/home'); // Navigate to home screen after successful verification
    } catch (error: any) {
      console.log('OTP verification error:', error);
      Alert.alert(
        'Verification Failed',
        error?.response?.data?.message || 'An error occurred during verification'
      );
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      // API call to resend OTP
      const response = await axios.post('http://dressit.rasoisoftware.com/api/resend-otp', {
        email
      });
      
      Alert.alert('Success', 'New OTP has been sent to your email');
    } catch (error: any) {
      Alert.alert(
        'Resend Failed',
        error?.response?.data?.message || 'Failed to resend OTP'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Image 
            source={require('../assets/images/icon.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
          
          <Text style={styles.title}>Verification Code</Text>
          
          <Text style={styles.subtitle}>
            We have sent a verification code to {email || 'your email'}
          </Text>
          
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                style={[
                  styles.otpInput,
                  focusedInput === index && styles.otpInputFocused,
                  digit !== '' && styles.otpInputFilled
                ]}
                value={digit}
                onChangeText={text => handleOtpChange(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                onFocus={() => setFocusedInput(index)}
                onBlur={() => setFocusedInput(null)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>
          
          <GradientButton 
            onPress={verifyOtp} 
            title={loading ? 'Verifying...' : 'Verify'} 
          />
          
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={resendOtp}>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
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
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#000',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: '#f9f9f9',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  otpInputFocused: {
    borderColor: '#5828AF',
    borderWidth: 2,
    shadowColor: '#5828AF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  otpInputFilled: {
    backgroundColor: '#f0e6ff',
    borderColor: '#5828AF',
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    color: '#000',
    fontSize: 14,
  },
  resendLink: {
    color: '#5828AF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  backLink: {
    color: '#5828AF',
    marginTop: 20,
    fontSize: 16,
  },
});

export default OTPScreen;
