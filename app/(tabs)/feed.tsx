import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl, 
  View, 
  TouchableOpacity,
  Text,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import PostCard from '@/components/post/PostCard';
import { Post, getPosts, likePost, unlikePost } from '@/services/posts';
import { useTheme } from '@/context/ThemeContext';
import { BRAND } from '@/constants/Colors';

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { colors } = useTheme();
  const backgroundColor = colors.background;
  const textColor = colors.text;

  // Fetch initial posts
  useEffect(() => {
    loadPosts();
  }, []);

  // Load posts from API
  const loadPosts = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        setPage(1);
        setError(null);
      } else if (!refresh && !loadingMore) {
        setLoading(true);
        setError(null);
      }

      const currentPage = refresh ? 1 : page;
      const newPosts = await getPosts({ 
        page: currentPage, 
        limit: 10,
        sortBy: 'latest'
      });

      if (newPosts.length === 0) {
        setHasMorePosts(false);
      } else {
        if (refresh || currentPage === 1) {
          setPosts(newPosts);
        } else {
          setPosts(prevPosts => {
            const existingIds = new Set(prevPosts.map(post => post.id));
            const uniqueNewPosts = newPosts.filter(post => !existingIds.has(post.id));
            return [...prevPosts, ...uniqueNewPosts];
          });
        }
        setPage(currentPage + 1);
      }
    } catch (err) {
      setError('Failed to load posts. Please try again.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Pull to refresh handler
  const handleRefresh = useCallback(() => {
    if (!refreshing) {
      loadPosts(true);
    }
  }, [refreshing]);

  // Load more posts when reaching the end of the list
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMorePosts && !loading && !refreshing) {
      setLoadingMore(true);
      loadPosts();
    }
  }, [loadingMore, hasMorePosts, loading, refreshing]);


const handleLike = useCallback(async (postId: string) => {
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  const newIsLiked = !post.isLiked;
  const newLikeCount = newIsLiked ? post.likeCount + 1 : post.likeCount - 1;

  // Optimistic UI update
  setPosts(prevPosts => 
    prevPosts.map(p => 
      p.id === postId 
        ? { ...p, isLiked: newIsLiked, likeCount: newLikeCount }
        : p
    )
  );

  try {
    await likePost(postId);
  } catch (error) {
    console.error(`Error toggling like for post ${postId}:`, error);

    // Revert UI on error
    setPosts(prevPosts => 
      prevPosts.map(p => 
        p.id === postId 
          ? { ...p, isLiked: post.isLiked, likeCount: post.likeCount }
          : p
      )
    );

    Alert.alert('Error', 'Failed to update like status. Please try again.');
  }
}, [posts]);



  // Handle comment action
  const handleComment = useCallback((postId: string) => {
    router.push(`/post/${postId}/comments`);
  }, [router]);

  // Handle "Dress It Up" action
  const handleDressItUp = useCallback((postId: string) => {
    router.push(`/post/${postId}/dress-it-up`);
  }, [router]);

  // Render a post item
  const renderItem = useCallback(({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onLike={handleLike}
      onComment={handleComment}
      onDressItUp={handleDressItUp}
      dressItUpButtonStyle={styles.dressItUpButton}
    />
  ), [handleLike, handleComment, handleDressItUp]);

  // Render the footer (loading indicator when loading more posts)
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#364DEF" />
      </View>
    );
  }, [loadingMore]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="images-outline" size={64} color={textColor} style={styles.emptyIcon} />
        <ThemedText type="subtitle" style={styles.emptyTitle}>No Posts Yet</ThemedText>
        <ThemedText style={styles.emptyText}>
          Start following stylish users to see their outfit posts here!
        </ThemedText>
      </View>
    );
  }, [loading, textColor]);

  // Render error state
  const renderError = useCallback(() => {
    if (!error) return null;
    
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" style={styles.errorIcon} />
        <ThemedText type="subtitle" style={styles.errorTitle}>Oops!</ThemedText>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadPosts(true)}>
          <ThemedText style={styles.retryText}>Try Again</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }, [error]);

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadPosts(true)}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
          <ThemedText type="title" style={styles.headerTitle}>RESS IT</ThemedText>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/post')}
        >
          <Ionicons name="add-circle-outline" size={28} color={BRAND} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={BRAND} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={64} color={textColor} />
              <ThemedText type="subtitle" style={styles.emptyTitle}>No Posts Yet</ThemedText>
              <ThemedText style={styles.emptyText}>
                Start following stylish users to see their posts here!
              </ThemedText>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[BRAND]}
              tintColor={BRAND}
            />
          }
          // Performance optimizations
          initialNumToRender={3}
          maxToRenderPerBatch={5}
          windowSize={7}
          removeClippedSubviews={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  createButton: {
    padding: 8,
  },
  dressItUpButton: {
    width: '45%',
    alignSelf: 'center',
    marginHorizontal: '2.5%',
    marginVertical: 8,
    backgroundColor: BRAND,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 60,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    marginBottom: 16,
  },

  retryButton: {
    backgroundColor: BRAND,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#e74c3c',
  },
  errorText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
});

