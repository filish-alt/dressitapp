import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND } from '../../constants/Colors';
import ProfileScreenContent from '@/components/ProfileScreenContent';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the param types for this route
interface ProfileParams {
  id: string;
}
const ViewProfileScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<ProfileParams>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authenticateAndFetchId = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        if (!token) {
          // Redirect to login if not authenticated
          router.replace('/login');
          return;
        }

        // Simulate fetching the authenticated user ID
        const mockAuthId = '1';

        if (mockAuthId === id) {
          // Redirect to the profile tab if viewing own profile
          router.replace('(tabs)/profile');
          return;
        }
      } catch (e) {
        console.error('Error fetching or validating user:', e);
        setError('Error loading profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    authenticateAndFetchId();
  }, [id, router]);
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={BRAND} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>

          <ProfileScreenContent userId={id} isOwnProfile={false} />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BRAND,
  },
});

export default ViewProfileScreen;
