import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Modal, ScrollView, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BRAND, GRADIENT_CONFIG } from '../constants/Colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  total: number;
}
interface FollowingsResponse {
  following: Following[];
  total: number;
}

interface Post {
  id: string;
  imageUrl: string | null;
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

interface Post {
  id: string;
  imageUrl: string | null;
}

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
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Following[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
   const [followingCount, setFollowingCount] = useState(0);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followersError, setFollowersError] = useState<string | null>(null);

  useEffect(() => {
  
   const fetchProfileData = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('Login token:', token);

    if (!token) {
      Alert.alert('Unauthorized', 'No token found. Please login again.');
      return;
    }

    const response = await axios.get('https://dev.dressitnow.com/api/my-profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const user = response.data.data;
    const profileData = {
      name: user.name,
      username: user.nickname,
      bio: user.bio || '',
      location: user.location || '',
      profileImage: user.profile_image || null,
      stats: {
        posts: user.count_look || 0,
        followers:user.count_follower,
        following:user.count_following,

      },
      isFollowing: false,
      posts: Array.from({ length: 9 }, (_, i) => ({
        id: String(i + 1),
        imageUrl: null,
      })),
    };

    setProfile(profileData);
    fetchFollowers();
    fetchFollowing();
  } catch (error: any) {
    console.error('Failed to fetch profile data:', error?.response?.data || error.message);
  } finally {
    setLoading(false);
  }
};


    fetchProfileData();
  }, [userId]);
  
  // Fetch followers data from API
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
        <Text style={styles.errorText}>Failed to load profile data.</Text>
      </View>
    );
  }

  const handleStatPress = (type: 'posts' | 'followers' | 'following') => {
    // Pass the followers data as params when navigating to the followers screen
    if (type === 'followers') {
      router.push({
        pathname: `/profile/${userId}/${type}`,
        params: { 
          data: JSON.stringify(followers),
          count: followersCount.toString()
        }
      });
    } else {
      router.push(`/profile/${userId}/${type}`);
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
    router.push('/profileupdate');
  };
  
  const PostGrid = ({ posts }: { posts: Post[] }) => {
    const width = Dimensions.get('window').width;
    const itemSize = (width - 4) / 3;

    return (
      <View style={styles.postsGrid}>
        {posts.map((post) => (
          <TouchableOpacity 
            key={post.id}
            style={[styles.postItem, { width: itemSize, height: itemSize }]}
            onPress={() => router.push(`/post/${post.id}`)}
          >
            {post.imageUrl ? (
              <Image 
                source={{ uri: post.imageUrl }} 
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
            onPress={() => router.back()}
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
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileContainer}>
          <View style={styles.imageContainer}>
            {profile.profileImage ? (
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
              onPress={() => router.push(`/profile/${userId}/posts`)}
            >
              <Text style={styles.statCount}>{profile.stats.posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => router.push(`/profile/${userId}/followers`)}
            >
              <Text style={styles.statCount}>{profile.stats.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => router.push(`/profile/${userId}/following`)}
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
                  onPress={() => router.push('/messages')}
                  style={styles.messageButton}
                />
              </>
            )}
          </View>
          
          {/* Posts Grid */}
          <PostGrid posts={profile.posts} />
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
  errorText: {
    color: 'red',
    fontSize: 16,
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

