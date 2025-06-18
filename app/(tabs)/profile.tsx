import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import GradientButton from '../../components/ui/GradientButton';
import axios from 'axios';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BRAND, GRADIENT_CONFIG } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen: React.FC = () => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('male');
  const [interestedIn, setInterestedIn] = useState('female');
  const [dob, setDob] = useState(new Date());
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const initialize = async () => {
      await requestImagePermission();
      await fetchUserProfile();
    };

    initialize();
  }, []);

  const requestImagePermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Sorry, we need camera roll permissions to upload profile picture!'
        );
      }
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
         console.log('Login token:',token)
      if (!token) {
        Alert.alert('Unauthorized', 'No token found. Please login again.');
        return;
      }

      // const response = await axios.get('https://dev.dressitnow.com/api/profile', {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });

      // const user = response.data.data.user;
   const loadTestUser = async () => {
    const user = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      location: 'Ethiopia',
      bio: 'Test bio',
      nickname: 'tester',
      gender: 'female',
      interested_in: 'male',
      dob: '1995-05-10',
      profile_image: null,
    };

      setName(user?.name || '');
      setEmail(user?.email || '');
      setPhone(user?.phone || '');
      setLocation(user?.location || '');
      setBio(user?.bio || '');
      setNickname(user?.nickname || '');
      setGender(user?.gender || 'male');
      setInterestedIn(user?.interested_in || 'female');
      setDob(user?.dob ? new Date(user.dob) : new Date());
      setProfileImage(user?.profile_image || null);
  };  loadTestUser();
    } catch (error: any) {
      console.error('Profile fetch error:', error?.response?.data || error.message);
      Alert.alert('Error', 'Failed to fetch user profile');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Validate phone
    const phoneRegex = /^\+\d{1,3}\d{5,14}$/;
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dob;
    setShowDatePicker(Platform.OS === 'ios');
    setDob(currentDate);
  };

const handleUpdateProfile = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      console.log("again token",token)
        if (!token) {
          Alert.alert('Unauthorized', 'Please login again');
          return;
        }
      // Create form data for image upload
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('location', location);
      formData.append('bio', bio);
      formData.append('nickname', nickname);
      formData.append('gender', gender);
      formData.append('interested_in', interestedIn);
      formData.append('dob', formatDate(dob));
      
      if (profileImage) {
        const filename = profileImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image';
        
        formData.append('profile_image', {
          uri: profileImage,
          name: filename,
          type,
        } as any);
      }
      
      const response = await axios.post(
        'https://dev.dressitnow.com/api/update-profile',
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      Alert.alert('Success', 'Profile updated successfully!');
      console.log('Update response:', response.data);
      
    } catch (error: any) {
        console.log('Profile update error:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        headers: error?.response?.headers,
        config: error?.config
      });
      Alert.alert(
        'Update Failed',
        error?.response?.data?.message || 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Profile Setup</Text>
          
          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="person" size={60} color="#ccc" />
                </View>
              )}
              <LinearGradient
              colors={['#364DEF', '#5828AF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
                 style={styles.editIconContainer}>
                <Ionicons name="camera" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <View style={styles.formContainer}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={[styles.input, errors.name ? styles.inputError : null]}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) {
                    setErrors({...errors, name: ''});
                  }
                }}
                placeholder="Enter your full name"
              />
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>
            
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email ? styles.inputError : null]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors({...errors, email: ''});
                  }
                }}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>
            
            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={[styles.input, errors.phone ? styles.inputError : null]}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (errors.phone) {
                    setErrors({...errors, phone: ''});
                  }
                }}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
              {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
            </View>
            
            {/* Location Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Enter your location"
              />
            </View>
            
            {/* Bio Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={4}
              />
            </View>
            
            {/* Nickname Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nickname</Text>
              <TextInput
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
                placeholder="Enter your nickname"
              />
            </View>
            
            {/* Gender Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderOptions}>
                
              <TouchableOpacity onPress={() => setGender('male')}>
                {gender === 'male' ? (
                  <LinearGradient
                    colors={['#364DEF', '#5828AF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.genderOption} // this must include borderRadius/padding
                  >
                    <Ionicons name="male" size={24} color="#fff" />
                    <Text style={[styles.genderText, { color: '#fff' }]}>Male</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.genderOption}>
                    <Ionicons name="male" size={29} color="#687076" />
                    <Text style={styles.genderText}>Male</Text>
                  </View>
                )}
              </TouchableOpacity>
                
              <TouchableOpacity onPress={() => setGender('female')}>
                {gender === 'female' ? (
                  <LinearGradient
                    colors={['#364DEF', '#5828AF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.genderOption} // this must include borderRadius/padding
                  >
                    <Ionicons name="female" size={24} color="#fff" />
                    <Text style={[styles.genderText, { color: '#fff' }]}>Female</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.genderOption}>
                    <Ionicons name="male" size={29} color="#687076" />
                    <Text style={styles.genderText}>Female</Text>
                  </View>
                )}
              </TouchableOpacity>
      
              <TouchableOpacity onPress={() => setGender('other')}>
                {gender === 'other' ? (
                  <LinearGradient
                    colors={['#364DEF', '#5828AF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.genderOption} // this must include borderRadius/padding
                  >
                    <Text style={[styles.genderText, { color: '#fff' }]}>Other</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.genderOption}>
                    <Ionicons name="male" size={29} color="#687076" />
                    <Text style={styles.genderText}>Other</Text>
                  </View>
                )}
              </TouchableOpacity>
              </View>
            </View>
            
            {/* Interested In */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>What Is Your Orientation</Text>
            <View style={styles.genderOptions}>
              
              {/* MALE */}
              <TouchableOpacity onPress={() => setInterestedIn('male')}>
                {interestedIn === 'male' ? (
                  <LinearGradient
                    colors={['#364DEF', '#5828AF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.genderOption}
                  >
                    <Ionicons name="male" size={24} color="#fff" />
                    <Text style={[styles.genderText, { color: '#fff' }]}>Male</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.genderOption}>
                    <Ionicons name="male" size={24} color="#687076" />
                    <Text style={styles.genderText}>Male</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* FEMALE */}
              <TouchableOpacity onPress={() => setInterestedIn('female')}>
                {interestedIn === 'female' ? (
                  <LinearGradient
                    colors={['#364DEF', '#5828AF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.genderOption}
                  >
                    <Ionicons name="female" size={24} color="#fff" />
                    <Text style={[styles.genderText, { color: '#fff' }]}>Female</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.genderOption}>
                    <Ionicons name="female" size={24} color="#687076" />
                    <Text style={styles.genderText}>Female</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* BOTH */}
              <TouchableOpacity onPress={() => setInterestedIn('both')}>
                {interestedIn === 'both' ? (
                  <LinearGradient
                    colors={['#364DEF', '#5828AF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.genderOption}
                  >
                    <MaterialCommunityIcons name="account-multiple" size={24} color="#fff" />
                    <Text style={[styles.genderText, { color: '#fff' }]}>Both</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.genderOption}>
                    <MaterialCommunityIcons name="account-multiple" size={24} color="#687076" />
                    <Text style={styles.genderText}>Both</Text>
                  </View>
                )}
              </TouchableOpacity>

            </View>
          </View>
            
            {/* Date of Birth */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(dob)}</Text>
                <Ionicons name="calendar-outline" size={24} color="#687076" />
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={dob}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                  maximumDate={new Date()}
                />
              )}
            </View>
            
            {/* Submit Button */}
            <GradientButton 
              onPress={handleUpdateProfile} 
              title={loading ? 'Updating...' : 'Update Profile'} 
              style={styles.updateButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 20,
    color   : BRAND ,
    alignSelf: 'center',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: BRAND,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#11181C',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  selectedGender: {
    borderColor: BRAND,
    backgroundColor: 'rgba(47, 182, 227, 0.1)',
  },
  genderText: {
    marginLeft: 8,
    color: '#687076',
  },
  selectedGenderText: {
    color: BRAND,
    fontWeight: '600',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
  updateButton: {
    marginTop: 20,
  },
});

export default ProfileScreen;

