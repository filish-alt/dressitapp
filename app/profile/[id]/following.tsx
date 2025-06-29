import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BRAND, GRADIENT_CONFIG } from '../../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientButton from '@/components/GradientButton';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Response Types
interface ApiFollowing {
  id: string | number;
  name: string;
  username: string;
  profile_image: string | null;
  is_following: boolean;
}

interface FollowingApiResponse {
  following: ApiFollowing[];
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
interface Following {
  id: string;
  name: string;
  username: string;
  profileImage: string | null;
  isFollowing: boolean;
  isLoading?: boolean;
}

const FollowingScreen = () => {
  const router = useRouter();
  const { id, data, count } = useLocalSearchParams();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [following, setFollowing] = useState<Following[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    const loadFollowing = async () => {
      try {
        // If data was passed from the profile screen, use it
        if (data) {
          try {
            const parsedData = JSON.parse(data as string);
            // Transform API data structure to match our component's expected format
            const formattedFollowing = parsedData.map((user: ApiFollowing) => ({
              id: user.id.toString(),
              name: user.name,
              username: user.username,
              profileImage: user.profile_image,
              isFollowing: user.is_following
            }));
            setFollowing(formattedFollowing);
            setLoading(false);
          } catch (parseError) {
            console.error('Error parsing following data:', parseError);
            // If parse error, fetch from API directly
            await fetchFollowingFromApi();
          }
        } else {
          // If no data was passed, fetch from API directly
          await fetchFollowingFromApi();
        }
      } catch (e) {
        console.error('Error loading following:', e);
        setError('Failed to load following data');
        setLoading(false);
      }
    };

    loadFollowing();
  }, [id, data]);

  // Function to load following from API directly
  const fetchFollowingFromApi = async () => {
    setLoading(true);
    setRefreshing(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        // Redirect to login if no token found
        router.replace('/login');
        return;
      }

      console.log('Fetching following for user ID:', id);

      const response = await axios.get(`https://dev.dressitnow.com/api/user/${id}/following`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('API Response:', response.data);

      const formattedFollowing = (response.data.data || []).map((user: { id: { toString: () => any; }; name: any; nickname: any; profile_image: any; is_following: any; }) => ({
        id: user.id.toString(),
        name: user.name,
        username: user.nickname,
        profileImage: user.profile_image,
        isFollowing: user.is_following
      }));

      setFollowing(formattedFollowing);
      setFollowingCount(response.data.total || formattedFollowing.length);

    } catch (e: any) {
      console.error('Error fetching following:', e);
      
      // Handle unauthorized errors (expired token)
      if (e.response && e.response.status === 401) {
        await AsyncStorage.removeItem('token');
        Alert.alert('Session Expired', 'Please login again.');
        router.replace('/login');
        return;
      }
      
      setError(e.message || 'Failed to load following data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const handleMessage = (userId: string, userName: string) => {
  router.push({
    pathname: '/message',
    params: {
      userId,
      name: userName,
    },
  });
};
  const handleFollowToggle = async (itemId: string) => {
    // Set loading state for this specific item
    setLoadingStates(prev => ({ ...prev, [itemId]: true }));
    
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Error', 'You need to be logged in to follow users');
        router.replace('/login');
        return;
      }
      
      const user = following.find(f => f.id === itemId);
      if (!user) return;
      
      // Determine the API endpoint based on current follow status
      const endpoint = user.isFollowing ? 'unfollow' : 'follow';
      
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
        // Update the following list with the new follow status
        const newFollowing = [...following];
        const index = newFollowing.findIndex(f => f.id === itemId);
        newFollowing[index] = {
          ...newFollowing[index],
          isFollowing: response.data.is_following
        };
        setFollowing(newFollowing);
      } else {
        throw new Error(response.data.message || `Failed to ${endpoint} user`);
      }
    } catch (error: any) {
      console.error(`Failed to toggle follow status:`, error);
      
      // Handle unauthorized errors (expired token)
      if (error.response && error.response.status === 401) {
        await AsyncStorage.removeItem('token');
        Alert.alert('Session Expired', 'Please login again.');
        router.replace('/login');
        return;
      }
      
      Alert.alert(
        'Error',
        error.message || 'Failed to update follow status. Please try again later.'
      );
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const renderItem = ({ item }: { item: Following }) => (
    <TouchableOpacity 
      style={styles.followingItem}
      onPress={() => router.push(`/profile/${item.id}`)}
    >
      {item.profileImage ? (
        <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="person" size={20} color="#ccc" />
        </View>
      )}
      <View style={styles.followingInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
      <GradientButton
        title="Message"
        onPress={() => handleMessage(item.id, item.name)}
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
          <Text style={styles.title}>Following</Text>
          <TouchableOpacity 
            style={{ width: 24, alignItems: 'center' }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => setMenuVisible(true)}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color={BRAND} />
          </TouchableOpacity>
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
          <Text style={styles.title}>Following</Text>
          <TouchableOpacity 
            style={{ width: 24, alignItems: 'center' }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => setMenuVisible(true)}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color={BRAND} />
          </TouchableOpacity>
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
          Following {count ? `(${count})` : followingCount > 0 ? `(${followingCount})` : ''}
        </Text>
        <TouchableOpacity 
          style={{ width: 24, alignItems: 'center' }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => setMenuVisible(true)}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={BRAND} />
          ) : (
            <Ionicons name="ellipsis-horizontal" size={24} color={BRAND} />
          )}
        </TouchableOpacity>
      </View>
      {following.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LinearGradient
            {...GRADIENT_CONFIG}
            style={styles.emptyIconContainer}
          >
            <Ionicons name="people-outline" size={30} color="#fff" />
          </LinearGradient>
          <Text style={styles.emptyTitle}>Not Following Anyone Yet</Text>
          <Text style={styles.emptyText}>
            When you follow people, they'll show up here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={following}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={fetchFollowingFromApi}
          ListFooterComponent={loading ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={BRAND} />
            </View>
          ) : null}
        />
      )}
      
      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setMenuVisible(false);
                fetchFollowingFromApi();
              }}
            >
              <Ionicons name="refresh-outline" size={24} color={BRAND} />
              <Text style={styles.menuText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingVertical: 20, // Increased padding to move icons lower
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: 12, // Added margin to move header down
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: BRAND,
  },
  listContent: {
    padding: 16,
  },
  followingItem: {
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
  followingInfo: {
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
  loadingFooter: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: BRAND,
  },
});

export default FollowingScreen;

