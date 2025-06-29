import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import ProfileScreenContent from '@/components/ProfileScreenContent';
import { BRAND } from '@/constants/Colors';

export default function ProfileTab() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Login token:', token);

        if (!token) {
          // If no token, redirect to login
          router.replace('/login');
          return;
        }
        

        const response = await axios.get('https://dev.dressitnow.com/api/my-profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userId = response.data.data.id;

       // For now, we'll use a hardcoded user ID
       // const mockUserId = '1';
        setUserId(userId);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BRAND} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No user profile found. Please login again.</Text>
      </View>
    );
  }

  return <ProfileScreenContent userId={userId} isOwnProfile={true} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});
