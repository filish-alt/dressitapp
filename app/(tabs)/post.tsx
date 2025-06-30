import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { BRAND, GRADIENT_CONFIG } from '@/constants/Colors';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import GradientButton from '@/components/ui/GradientButton';

// Constants for file validation
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'heic', 'heif'];
const ALLOWED_VIDEO_TYPES = ['mp4', 'mov', '3gp', 'avi'];


export default function CreateLook() {
  const navigation = useNavigation();
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [location, setLocation] = useState('');
  const [media, setMedia] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const progressAnimation = new Animated.Value(0);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await requestMediaPermission();
      await loadProfile();
      setIsLoading(false);
    };
    
    initialize();
  }, []);

  const requestMediaPermission = async () => {
    // For React Native CLI, permissions are handled automatically by react-native-image-picker
    setPermissionStatus('granted');
  };

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Error', 'Please login to create a look');
        return;
      }
      
      const res = await axios.get('https://dev.dressitnow.com/api/my-profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data.data);
    } catch (error: any) {
      console.error('Error loading profile:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load profile data');
    }
  };

  const pickMedia = async () => {
    try {
      const options = {
        mediaType: 'mixed' as MediaType,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.7,
        selectionLimit: 10,
      };

      launchImageLibrary(options, (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorMessage) {
          return;
        }

        if (response.assets) {
          const validAssets = response.assets.map(asset => {
            const fileExtension = asset.uri?.split('.').pop()?.toLowerCase() || '';
            const isVideo = ALLOWED_VIDEO_TYPES.includes(fileExtension);
            
            return {
              uri: asset.uri,
              fileSize: asset.fileSize || 0,
              fileType: isVideo ? 'video' : 'image',
              fileExtension,
              type: asset.type,
              fileName: asset.fileName,
            };
          });
          
          setMedia([...media, ...validAssets]);
        }
      });
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to select media');
    }
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const validateFields = (): boolean => {
    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please enter a description for your look');
      return false;
    }
    
    if (!goal.trim() || isNaN(Number(goal)) || Number(goal) <= 0) {
      Alert.alert('Invalid Goal', 'Please enter a valid goal amount');
      return false;
    }
    
    if (!location.trim()) {
      Alert.alert('Missing Information', 'Please enter a location');
      return false;
    }
    
    if (media.length === 0) {
      Alert.alert('Media Required', 'Please select at least one image or video');
      return false;
    }
    
    return true;
  };

  const validateProfile = (): { isValid: boolean; missingFields: string[] } => {
    const requiredFields = [
      { key: 'name', label: 'Name' },
      { key: 'gender', label: 'Gender' },
      { key: 'interested_in', label: 'Interested in' },
      { key: 'dob', label: 'Date of birth' }
    ];
    
    const missingFields = requiredFields
      .filter(field => !profile?.[field.key])
      .map(field => field.label);
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };

  const handleSubmit = async () => {
    if (!validateFields()) {
      return;
    }
    
    const { isValid, missingFields } = validateProfile();
    if (!isValid) {
      Alert.alert(
        'Incomplete Profile',
        `Please enter this info to publish your looks:\n• ${missingFields.join('\n• ')}`
      );
      return;
    }
    
    setIsSubmitting(true);
    setShowProgress(true);
    setUploadProgress(0);
    progressAnimation.setValue(0);
    
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Error', 'Please login to create a look');
        return;
      }
      
      const formData = new FormData();
      
      formData.append('description', description);
      formData.append('set_goal', goal);
      formData.append('location', location);
      
      // Total file size for progress calculation
      const totalSize = media.reduce((total, file) => total + (file.fileSize || 0), 0);
      
      media.forEach((file, index) => {
        const fileExtension = file.fileExtension || file.uri.split('.').pop()?.toLowerCase() || '';
        const isVideo = ALLOWED_VIDEO_TYPES.includes(fileExtension);
        
        formData.append('media[]', {
          uri: file.uri,
          name: `media_${index}.${fileExtension || (isVideo ? 'mp4' : 'jpg')}`,
          type: isVideo ? `video/${fileExtension || 'mp4'}` : `image/${fileExtension || 'jpeg'}`
        } as any);
      });
      
      const response = await axios.post('https://dev.dressitnow.com/api/looks', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          // Calculate progress percentage
          const progress = progressEvent.loaded / progressEvent.total;
          setUploadProgress(progress);
          
      
          Animated.timing(progressAnimation, {
            toValue: progress,
            duration: 200,
            useNativeDriver: false
          }).start();
        }
      });
      
      Alert.alert('Success', 'Your look has been published!', [
        { text: 'OK', onPress: () => {
          setDescription('');
          setGoal('');
          setLocation('');
          setMedia([]);
          (navigation as any).navigate('Tabs', { screen: 'Feed' })
        }}
      ]);
    } catch (error: any) {
      console.error('Create look error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create look');
    } finally {
      setIsSubmitting(false);
      setShowProgress(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Look</Text>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              {/* Media Picker Section */}
              <View style={styles.mediaSection}>
                <Text style={styles.sectionTitle}>Upload Media</Text>
                <TouchableOpacity style={styles.mediaPickerButton} onPress={pickMedia}>
                  <LinearGradient
                    {...GRADIENT_CONFIG}
                    style={styles.mediaPickerGradient}
                  >
                    <Ionicons name="image" size={24} color="#fff" />
                    <Text style={styles.mediaPickerText}>
                      {media.length > 0 ? 'Add More Media' : 'Select Images/Videos'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                {media.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.mediaPreviewContainer}
                  >
                    {media.map((item, index) => {
                      const fileExtension = item.fileExtension || item.uri.split('.').pop()?.toLowerCase() || '';
                      const isVideo = item.fileType === 'video' || ALLOWED_VIDEO_TYPES.includes(fileExtension);
                      
                      return (
                        <View key={index} style={styles.mediaPreview}>
                          {isVideo ? (
                            <View style={styles.videoPlaceholder}>
                              <Ionicons name="play-circle" size={30} color="#fff" />
                              <Text style={styles.videoText}>Video</Text>
                            </View>
                          ) : (
                            <Image source={{ uri: item.uri }} style={styles.mediaImage} />
                          )}
                          
                          {isVideo && (
                            <View style={styles.videoIndicator}>
                              <Ionicons name="videocam" size={18} color="#fff" />
                            </View>
                          )}
                          
                          <View style={styles.fileInfoContainer}>
                            <Text style={styles.fileTypeText}>
                              {isVideo ? 'Video' : 'Image'}
                            </Text>
                            {item.fileSize && (
                              <Text style={styles.fileSizeText}>
                                {(item.fileSize / (1024 * 1024)).toFixed(1)}MB
                              </Text>
                            )}
                          </View>
                          
                          <TouchableOpacity
                            style={styles.removeMediaButton}
                            onPress={() => removeMedia(index)}
                          >
                            <Ionicons name="close-circle" size={24} color="#ff3b30" />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              
              {/* Description Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  style={styles.textAreaInput}
                  multiline
                  numberOfLines={4}
                  placeholder="Describe your look..."
                  placeholderTextColor="#999"
                />
              </View>
              
              {/* Goal Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Goal Amount (Money)</Text>
                <View style={styles.currencyInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    value={goal}
                    onChangeText={setGoal}
                    style={styles.currencyInput}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
              
              {/* Location Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                <View style={styles.locationInputContainer}>
                  <Ionicons name="location-outline" size={20} color="#687076" style={styles.locationIcon} />
                  <TextInput
                    value={location}
                    onChangeText={setLocation}
                    style={styles.locationInput}
                    placeholder="Enter location..."
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
              
              {/* Upload Progress Indicator */}
              {showProgress && (
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>
                    Uploading: {Math.round(uploadProgress * 100)}%
                  </Text>
                  <View style={styles.progressBarContainer}>
                    <Animated.View 
                      style={[
                        styles.progressBar,
                        {
                          width: progressAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%']
                          })
                        }
                      ]}
                    />
                  </View>
                </View>
              )}
              
              {/* Submit Button */}
              <GradientButton
                title={isSubmitting ? "Publishing..." : "Publish Look"}
                onPress={handleSubmit}
                style={styles.submitButton}
                loading={isSubmitting}
                disabled={isSubmitting}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BRAND,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  formContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: BRAND,
    fontSize: 16,
  },
  // Media Picker Styles
  mediaSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: BRAND,
  },
  mediaPickerButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mediaPickerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  mediaPickerText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  mediaPreviewContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  mediaPreview: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 10,
  },
  fileInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 4,
  },
  fileTypeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  fileSizeText: {
    color: '#fff',
    fontSize: 9,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    textAlign: 'center',
    marginBottom: 8,
    color: BRAND,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: BRAND,
  },
  // Input Styles
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: BRAND,
  },
  textAreaInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  currencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#687076',
    paddingRight: 8,
  },
  currencyInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  submitButton: {
    marginTop: 20,
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
});

