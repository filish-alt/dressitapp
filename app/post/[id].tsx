import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BRAND } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const PostDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [post, setPost] = React.useState({
    id,
    imageUrl: null,
    caption: 'Beautiful summer collection 🌸✨ #fashion #style #summer',
    likes: 128,
    comments: 24,
    user: {
      name: 'Sarah Johnson',
      username: 'fashionista_sarah',
      profileImage: null,
    },
    createdAt: '2h ago',
    isLiked: false,
  });

  const handleLike = () => {
    setPost(prev => ({
      ...prev,
      isLiked: !prev.isLiked,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={BRAND} />
        </TouchableOpacity>
        <Text style={styles.title}>Post</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color={BRAND} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.userInfo}>
          <TouchableOpacity 
            style={styles.userHeader}
            onPress={() => router.push(`/profile/${post.user.username}`)}
          >
            {post.user.profileImage ? (
              <Image source={{ uri: post.user.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="person" size={20} color="#ccc" />
              </View>
            )}
            <View style={styles.userText}>
              <Text style={styles.name}>{post.user.name}</Text>
              <Text style={styles.username}>@{post.user.username}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          {post.imageUrl ? (
            <Image 
              source={{ uri: post.imageUrl }} 
              style={styles.postImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.postPlaceholder}>
              <Ionicons name="image-outline" size={48} color="#ccc" />
            </View>
          )}
        </View>

        <View style={styles.postContent}>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Ionicons 
                name={post.isLiked ? "heart" : "heart-outline"} 
                size={24} 
                color={post.isLiked ? "#ff3b30" : BRAND} 
              />
              <Text style={[
                styles.actionCount,
                post.isLiked && { color: "#ff3b30" }
              ]}>
                {post.likes}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={24} color={BRAND} />
              <Text style={styles.actionCount}>{post.comments}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={24} color={BRAND} />
            </TouchableOpacity>
          </View>

          <Text style={styles.caption}>{post.caption}</Text>
          <Text style={styles.timestamp}>{post.createdAt}</Text>
        </View>
      </ScrollView>
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
  userInfo: {
    padding: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  userText: {
    marginLeft: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: BRAND,
  },
  username: {
    fontSize: 12,
    color: '#687076',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postPlaceholder: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContent: {
    padding: 16,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionCount: {
    marginLeft: 4,
    color: BRAND,
    fontSize: 14,
  },
  caption: {
    fontSize: 14,
    color: '#11181C',
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: '#687076',
    marginTop: 8,
  },
});

export default PostDetailScreen;

