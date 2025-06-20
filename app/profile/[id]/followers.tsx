import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BRAND, GRADIENT_CONFIG } from '../../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientButton from '@/components/GradientButton';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Response Types
interface ApiFollower {
  id: string | number;
  name: string;
  username: string;
  profile_image: string | null;
  is_following: boolean;
}

interface FollowersApiResponse {
  followers: ApiFollower[];
  total: number;
  status: string;
  message?: string;
}

interface FollowApiResponse {
  status: string;
  message: string;
  is_following: boolean;
}

// Component Types
interface Follower {
  id: string;
  name: string;
  username: string;
  profileImage: string | null;
  isFollowing: boolean;
  isLoading?: boolean;
}

const FollowersScreen = () => {
  const router = useRouter();
  const { id, data, count } = useLocalSearchParams();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadFollowers = async () => {
      try {
        // If data was passed from the profile screen, use it
        if (data) {
          try {
            const parsedData = JSON.parse(data as string);
            // Transform API data structure to match our component's expected format
            const formattedFollowers = parsedData.map((follower: ApiFollower) => ({
              id: follower.id.toString(),
              name: follower.name,
              username: follower.username,
              profileImage: follower.profile_image,
              isFollowing: follower.is_following
            }));
            setFollowers(formattedFollowers);
            setLoading(false);
          } catch (parseError) {
            console.error('Error parsing followers data:', parseError);
            // If parse error, fetch from API directly
            await fetchFollowersFromApi();
          }
        } else {
          // If no data was passed, fetch from API directly
          await fetchFollowersFromApi();
        }
      } catch (e) {
        console.error('Error loading followers:', e);
        setError('Failed to load followers data');
        setLoading(false);
      }
    };

    loadFollowers();
  }, [id, data]);
  // Function to load followers from API directly
const fetchFollowersFromApi = async () => {
  setLoading(true);
  setError(null);

  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Fetching followers for user ID:', id);

    const response = await axios.get(`https://dev.dressitnow.com/api/user/${id}/followers`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('API Response:', response.data);

    const formattedFollowers = (response.data.data || []).map(follower => ({
  id: follower.id.toString(),
  name: follower.name,
  username: follower.username,
  profileImage: follower.profile_image,
  isFollowing: follower.is_following
}));

    setFollowers(formattedFollowers);

  } catch (e: any) {
    console.error('Error fetching followers:', e);
    setError(e.message || 'Failed to load followers data');
  } finally {
    setLoading(false);
  }
};

  
  const handleFollowToggle = async (itemId: string) => {
    // Set loading state for this specific item
    setLoadingStates(prev => ({ ...prev, [itemId]: true }));
    
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Error', 'You need to be logged in to follow users');
        return;
      }
      
      const follower = followers.find(f => f.id === itemId);
      if (!follower) return;
      
      // Determine the API endpoint based on current follow status
      const endpoint = follower.isFollowing ? 'unfollow' : 'follow';
      
      // Make API request to follow/unfollow
      const response = await axios.post<FollowApiResponse>(
        `https://dev.dressitnow.com/api/user/${itemId}/${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.status === 'success') {
        // Update the followers list with the new follow status
        const newFollowers = [...followers];
        const index = newFollowers.findIndex(f => f.id === itemId);
        newFollowers[index] = {
          ...newFollowers[index],
          isFollowing: response.data.is_following
        };
        setFollowers(newFollowers);
      } else {
        throw new Error(response.data.message || `Failed to ${endpoint} user`);
      }
    } catch (error: any) {
      console.error(`Failed to toggle follow status:`, error);
      Alert.alert(
        'Error',
        error.message || 'Failed to update follow status. Please try again later.'
      );
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const renderItem = ({ item }: { item: Follower }) => (
    <TouchableOpacity 
      style={styles.followerItem}
      onPress={() => router.push(`/profile/${item.id}`)}
    >
      {item.profileImage ? (
        <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="person" size={20} color="#ccc" />
        </View>
      )}
      <View style={styles.followerInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
      <GradientButton
        title={item.isFollowing ? 'Following' : 'Follow'}
        onPress={() => handleFollowToggle(item.id)}
        loading={loadingStates[item.id]}
        style={styles.followButton}
        textStyle={styles.followButtonText}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={BRAND} />
          </TouchableOpacity>
          <Text style={styles.title}>Followers</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={BRAND} />
          </TouchableOpacity>
          <Text style={styles.title}>Followers</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={BRAND} />
        </TouchableOpacity>
        <Text style={styles.title}>
          Followers {count ? `(${count})` : followers.length > 0 ? `(${followers.length})` : ''}
        </Text>
        <View style={{ width: 24 }} />
      </View>
      {followers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LinearGradient
            {...GRADIENT_CONFIG}
            style={styles.emptyIconContainer}
          >
            <Ionicons name="people-outline" size={30} color="#fff" />
          </LinearGradient>
          <Text style={styles.emptyTitle}>No Followers Yet</Text>
          <Text style={styles.emptyText}>
            When people follow you, they'll show up here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={followers}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: BRAND,
  },
  listContent: {
    padding: 16,
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  placeholderImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: BRAND,
  },
  username: {
    fontSize: 12,
    color: '#687076',
    marginTop: 2,
  },
  followButton: {
    marginLeft: 12,
    minWidth: 90,
  },
  followButtonText: {
    fontSize: 12,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BRAND,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#687076',
    textAlign: 'center',
  },
});

export default FollowersScreen;

