import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Modal, ScrollView, Dimensions, Alert, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { BRAND, GRADIENT_CONFIG } from '../constants/Colors';
import axios from 'axios';
import { Post, getMyPosts } from '../services/posts'; // Add import for Post and getPosts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken, refreshToken, logout } from '../services/auth';

// API response types
interface Follower {
  id: string;
  name: string;
  username: string;
  profile_image: string | null;
  is_following: boolean;
}

interface Following {
  id: string;
  name: string;
  username: string;
  profile_image: string | null;
}

interface FollowersResponse {
  followers: Follower[];
  count_follower: number;
}
interface FollowingsResponse {
  following: Following[];
  total: number;
}


// Helper component for gradient buttons
const GradientButton: React.FC<{
  title: string;
  onPress: () => void;
  style?: any;
  loading?: boolean;
}> = ({ title, onPress, style, loading = false }) => {
  return (
    <TouchableOpacity style={[styles.gradientButtonContainer, style]} onPress={onPress} disabled={loading}>
      <LinearGradient {...GRADIENT_CONFIG} style={styles.gradientButton}>
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Using Post interface imported from services/posts.ts
// Loading and error view definitions moved to before main component
interface PostsErrorViewProps {
  error: string | null;
  onRetry: () => void;
}

const PostsLoadingView = () => (
  <View style={styles.postsLoadingContainer}>
    <ActivityIndicator size="large" color={BRAND} />
  </View>
);

const PostsErrorView: React.FC<PostsErrorViewProps> = ({ error, onRetry }) => (
  <View style={styles.postsErrorContainer}>
    <Text style={styles.errorText}>{error}</Text>
    <TouchableOpacity onPress={onRetry}>
      <Text style={styles.retryText}>Try Again</Text>
    </TouchableOpacity>
  </View>
);

interface ProfileScreenContentProps {
  userId: string;
  isOwnProfile: boolean;
  showHeader?: boolean;
}

const ProfileScreenContent: React.FC<ProfileScreenContentProps> = ({ 
  userId, 
  isOwnProfile, 
  showHeader = true 
}) => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<any>({ 
    profileImage: null,
    name: '',
    username: '',
    bio: '',
    location: '',
    stats: {
      posts: 0,
      followers: 0,
      following: 0,
    },
    isFollowing: false,
  });
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Following[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
   const [followingCount, setFollowingCount] = useState(0);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followersError, setFollowersError] = useState<string | null>(null);


// Fetch user posts function outside of useEffect
const fetchUserPosts = async () => {
  setPostsLoading(true);
  setPostsError(null);

  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      console.warn('No token found. Redirecting to login...');
      navigation.navigate('Login');
      return;
    }

    const fetchedPosts = await getMyPosts({ user_id: userId });
    setPosts(fetchedPosts);
  } catch (error: any) {
    console.error('Failed to fetch posts:', error);
    
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      Alert.alert('Session Expired', 'Please log in again.');
      navigation.navigate('Login');
    } else {
      setPostsError('Failed to load posts. Please try again.');
    }
  } finally {
    setPostsLoading(false);
  }
};


// Profile data fetch
const fetchProfileData = async () => {
  try {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    console.log('Login token:', token);

    if (!token) {
      Alert.alert('Unauthorized', 'No token found. Please login again.');
      navigation.navigate('Login');
      return;
    }

    // Use different endpoints based on whether it's the user's own profile or another user's profile
    const endpoint = isOwnProfile 
      ? 'https://dev.dressitnow.com/api/my-profile' 
      : `https://dev.dressitnow.com/api/user/${userId}`;

    console.log(`Fetching profile data from endpoint: ${endpoint}`);

    // Function to extract profile data from API response
    const extractProfileData = (userData: any) => {
      return {
        name: userData.name || '',
        username: userData.nickname || '',
        bio: userData.bio || '',
        location: userData.location || '',
        profileImage: userData.profile_image || null,
        stats: {
          posts: userData.count_look || 0,
          followers: userData.count_follower || 0,
          following: userData.count_following || 0,
        },
        isFollowing: userData.is_following || false,
      };
    };

    try {
      // First attempt with current token
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data || !response.data.data) {
        throw new Error('Invalid response structure from API');
      }

      const profileData = extractProfileData(response.data.data);
      setProfile(profileData);
      fetchFollowers();
      fetchFollowing();
    } catch (apiError: any) {
      // If we get a 401 Unauthorized, try to refresh the token
      if (apiError.response?.status === 401) {
        console.log('Token expired, attempting to refresh...');
        const newToken = await refreshToken();
        
        if (newToken) {
          // If token refresh succeeded, retry the request with the new token
          try {
            const retryResponse = await axios.get(endpoint, {
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
            });
            
            if (!retryResponse.data || !retryResponse.data.data) {
              throw new Error('Invalid response structure from API after token refresh');
            }
            
            const profileData = extractProfileData(retryResponse.data.data);
            setProfile(profileData);
            fetchFollowers();
            fetchFollowing();
          } catch (retryError) {
            console.error('Error after token refresh:', retryError);
            throw retryError;
          }
        } else {
          // If token refresh failed, redirect to login
          console.error('Token refresh failed');
          await logout();
          Alert.alert('Session Expired', 'Your session has expired. Please login again.');
          navigation.navigate('Login');
          throw new Error('Authentication failed - token refresh failed');
        }
      } else {
        // If not a 401, throw the original error
        throw apiError;
      }
    }
  } catch (error: any) {
    console.error('Failed to fetch profile data:', error?.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response) {
      // Server responded with a status other than 200 range
      if (error.response.status === 401) {
        await logout();
        Alert.alert('Session Expired', 'Your session has expired. Please login again.');
        navigation.navigate('Login');
      } else if (error.response.status === 404) {
        Alert.alert('Not Found', 'User profile not found.');
      } else {
        Alert.alert('Error', `Failed to load profile: ${error.response.data?.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      Alert.alert('Network Error', 'Could not connect to the server. Please check your internet connection.');
    } else {
      // Something else happened while setting up the request
      Alert.alert('Error', `An unexpected error occurred: ${error.message}`);
    }
  } finally {
    setLoading(false);
  }
};

const handleRefresh = async () => {
  setRefreshing(true);
  
  // Create a copy of the current profile state to maintain during refresh
  const currentProfile = { ...profile };
  
  try {
    // Execute fetch operations sequentially instead of in parallel
    // to better manage error states and prevent undefined access
    try {
      await fetchProfileData();
    } catch (error) {
      console.error('Error refreshing profile data:', error);
      // Restore previous profile state on error
      setProfile(currentProfile);
    }
    
    try {
      await fetchUserPosts();
    } catch (error) {
      console.error('Error refreshing posts:', error);
      setPostsError('Failed to refresh posts');
    }
    
  } catch (error) {
    console.error('Error during refresh:', error);
    // If any other errors occur, ensure we maintain the original profile state
    setProfile(currentProfile);
  } finally {
    setRefreshing(false);
  }
};

  useEffect(() => {
    // Check authentication before loading data
    const checkAuthAndLoadData = async () => {
      try {

        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Authentication Required', 'Please log in to view profiles.');
          navigation.navigate('Login');
          return;
        }
        
        // Prevent multiple simultaneous data fetches
        await fetchProfileData();
        await fetchUserPosts();
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    
    checkAuthAndLoadData();
  }, [userId]);

  const fetchFollowers = async () => {
    setFollowersLoading(true);
    setFollowersError(null);
    
    try {
      // Get auth token
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.warn('No authentication token found');
        throw new Error('Authentication required');
      }
      
      // Make API request
      const response = await axios.get<FollowersResponse>(
        `https://dev.dressitnow.com/api/user/${userId}/followers`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.status !== 200) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Update state with followers data
      setFollowers(response.data.followers);
      setFollowersCount(response.data.total);
      
      // Update profile stats with actual follower count
      setProfile(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          followers: (response.data.total || 0)
        }
      }));
    } catch (error) {
      console.error('Failed to fetch followers:', error);
      setFollowersError('Failed to load followers');
    } finally {
      setFollowersLoading(false);
    }
  };
const fetchFollowing = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await axios.get<FollowingsResponse>(
      `https://dev.dressitnow.com/api/user/${userId}/following`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status !== 200) {
      throw new Error(`API error: ${response.status}`);
    }


      setFollowing(response.data.following);
      setFollowingCount(response.data.total);

    setProfile(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        following: (response.data.total || 0),
      },
    }));
  } catch (error) {
    console.error('Failed to fetch following:', error);
  }
};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BRAND} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{profile ? 'Failed to load profile data.' : 'Loading...'}</Text>
      </View>
    );
  }

  const handleStatPress = (type: 'posts' | 'followers' | 'following') => {
    // Pass the followers data as params when navigating to the followers screen
    if (type === 'followers') {
      // Use the href format with query parameters
      const href = `/profile/${userId}/${type}?data=${encodeURIComponent(JSON.stringify(followers))}&count=${followersCount}`;
      navigation.navigate('ProfileFollowers', { userId, data: followers, count: followersCount });
    } else {
      navigation.navigate(`Profile${type.charAt(0).toUpperCase() + type.slice(1)}`, { userId });
    }
  };

  const handleFollowPress = async () => {
    // Handle follow/unfollow toggle
    setIsLoadingFollow(true);
    try {
      // Get auth token
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.warn('No authentication token found');
        throw new Error('Authentication required');
      }
      
      // Determine endpoint based on current follow status
      const endpoint = profile.isFollowing ? 'unfollow' : 'follow';
      
      // Make API request to follow/unfollow
      const response = await axios.post(
        `https://dev.dressitnow.com/api/user/${userId}/${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.status !== 200) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Update UI based on response
      const isNowFollowing = !profile.isFollowing;
      setProfile((prev: any) => ({
        ...prev,
        isFollowing: isNowFollowing,
        stats: {
          ...prev.stats,
          followers: isNowFollowing ? prev.stats.followers + 1 : prev.stats.followers - 1
        }
      }));
      
      // Refresh followers data
      fetchFollowers();
    } catch (error) {
      console.error('Failed to update follow status:', error);
      // Show error message or toast here
    } finally {
      setIsLoadingFollow(false);
    }
  };
  
  const handleEditProfile = () => {
    setMenuVisible(false);
    navigation.navigate('ProfileUpdate');
  };
  
  interface PostGridProps {
    postItems: Post[];
  }

  const PostGrid: React.FC<PostGridProps> = ({ postItems }) => {
    const width = Dimensions.get('window').width;
    const itemSize = (width - 4) / 3;

    return (
      <View style={styles.postsGrid}>
        {postItems.map((post) => (
          <TouchableOpacity 
            key={post.id}
            style={[styles.postItem, { width: itemSize, height: itemSize }]}
            onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
          >
            {post.media?.[0]?.url ? (
              <Image 
                source={{ uri: post.media[0].url }} 
                style={styles.postImage} 
              />
            ) : (
              <View style={styles.postPlaceholder}>
                <Ionicons name="image-outline" size={24} color="#ccc" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      {showHeader && (
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={BRAND} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setMenuVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <LinearGradient
              {...GRADIENT_CONFIG}
              style={styles.menuIconGradient}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            // Only allow refresh when not in loading state
            onRefresh={loading ? undefined : handleRefresh}
            tintColor={BRAND}
            colors={[BRAND]}
            // Prevent refresh if already loading data
            enabled={!loading}
          />
        }
      >

        {postsLoading ? (
          <PostsLoadingView />
        ) : postsError ? (
          <PostsErrorView error={postsError} onRetry={fetchUserPosts} />
        ) : null}
        <View style={styles.profileContainer}>
          <View style={styles.imageContainer}>
            {profile?.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="person" size={40} color="#ccc" />
              </View>
            )}
          </View>
          
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={14} color="#687076" /> {profile.location}
          </Text>

          <View style={styles.statsContainer}>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => navigation.navigate('ProfilePosts', { userId })}
            >
              <Text style={styles.statCount}>{profile.stats.posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => navigation.navigate('ProfileFollowers', { userId })}
            >
              <Text style={styles.statCount}>{profile.stats.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => navigation.navigate('ProfileFollowing', { userId })}
            >
              <Text style={styles.statCount}>{profile.stats.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtons}>
            {isOwnProfile ? (
              // Edit profile button for own profile
              <GradientButton
                title="Edit Profile"
                onPress={handleEditProfile}
                style={styles.editProfileButton}
              />
            ) : (
              <>
                {/* Follow/unfollow button for others' profiles */}
                <GradientButton
                  title={profile.isFollowing ? 'Following' : 'Follow'}
                  onPress={handleFollowPress}
                  loading={isLoadingFollow}
                  style={styles.followButton}
                />
                
                <GradientButton
                  title="Message"
                  onPress={() => navigation.navigate('Message')}
                  style={styles.messageButton}
                />
              </>
            )}
          </View>
          
          {/* Posts Grid */}
          <PostGrid postItems={posts} />
        </View>
      </ScrollView>
      
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
              onPress={handleEditProfile}
            >
              <Ionicons name="create-outline" size={24} color={BRAND} />
              <Text style={styles.menuText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: 12,
  },
  menuIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  profileContainer: {
    padding: 16,
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: BRAND,
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#687076',
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: '#11181C',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  location: {
    fontSize: 14,
    color: '#687076',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statCount: {
    fontSize: 16,
    fontWeight: '600',
    color: BRAND,
  },
  statLabel: {
    fontSize: 12,
    color: '#687076',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  gradientButtonContainer: {
    borderRadius: 6,
    overflow: 'hidden',
    flex: 1,
    height: 36,
  },
  followButton: {
    marginRight: 8,
  },
  editProfileButton: {
    flex: 1,
  },
  messageButton: {
    marginLeft: 8,
  },
  gradientButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
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
  },
  postsLoadingContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    marginHorizontal: -16,
    marginTop: 16,
  },
  postsErrorContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    marginHorizontal: -16,
    marginTop: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  retryText: {
    color: BRAND,
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
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
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
    marginHorizontal: -16,
    marginTop: 16,
  },
  postItem: {
    backgroundColor: '#f0f0f0',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
});

export default ProfileScreenContent;

