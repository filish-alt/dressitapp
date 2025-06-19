import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BRAND, GRADIENT_CONFIG } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Post {
  id: string;
  imageUrl: string | null;
}

const ViewProfileScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [menuVisible, setMenuVisible] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Sarah Johnson',
    username: 'fashionista_sarah',
    bio: 'Fashion enthusiast | Style blogger\nCreating beautiful content 📸✨\nBased in Addis Ababa',
    location: 'Ethiopia',
    profileImage: null,
    stats: {
      posts: 42,
      followers: 1234,
      following: 890
    },
    isFollowing: false,
    isLoadingFollow: false,
    posts: Array(9).fill(null).map((_, i) => ({
      id: String(i + 1),
      imageUrl: null
    }))
  });

  const handleStatPress = (type: 'posts' | 'followers' | 'following') => {
    router.push(`/profile/${id}/${type}`);
  };

  const handleFollowPress = async () => {
    setProfile(prev => ({ ...prev, isLoadingFollow: true }));
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setProfile(prev => ({
        ...prev,
        isFollowing: !prev.isFollowing,
        stats: {
          ...prev.stats,
          followers: prev.isFollowing ? prev.stats.followers - 1 : prev.stats.followers + 1
        }
      }));
    } finally {
      setProfile(prev => ({ ...prev, isLoadingFollow: false }));
    }
  };

  const handleEditProfile = () => {
    setMenuVisible(false);
    router.push('../profileupdate');
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
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={BRAND} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={24} color={BRAND} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileContainer}>
          {/* Profile Image */}
          <View style={styles.imageContainer}>
            {profile.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="person" size={40} color="#ccc" />
              </View>
            )}
          </View>

          {/* Profile Info */}
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={14} color="#687076" />
            {' ' + profile.location}
          </Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => handleStatPress('posts')}
            >
              <Text style={styles.statCount}>{profile.stats.posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => handleStatPress('followers')}
            >
              <Text style={styles.statCount}>{profile.stats.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => handleStatPress('following')}
            >
              <Text style={styles.statCount}>{profile.stats.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.followButton]} 
              onPress={handleFollowPress}
              disabled={profile.isLoadingFollow}
            >
              <LinearGradient
                colors={GRADIENT_CONFIG.colors}
                start={GRADIENT_CONFIG.start}
                end={GRADIENT_CONFIG.end}
                style={styles.gradientButton}
              >
                {profile.isLoadingFollow ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.followButtonText}>
                    {profile.isFollowing ? 'Following' : 'Follow'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.messageButton]} 
              onPress={() => router.push('/messages')}
            >
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  actionButton: {
    flex: 1,
    height: 36,
    borderRadius: 6,
    overflow: 'hidden',
  },
  followButton: {
    marginRight: 8,
  },
  messageButton: {
    marginLeft: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  messageButtonText: {
    color: BRAND,
    fontWeight: '600',
    fontSize: 14,
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

export default ViewProfileScreen;

