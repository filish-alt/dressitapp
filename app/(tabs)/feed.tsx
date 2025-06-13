import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl, 
  View, 
  TouchableOpacity,
  Text,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import PostCard from '@/components/post/PostCard';
import { fetchPosts } from '@/lib/mocks/mockPosts';
import { Post } from '@/lib/types/post';
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
  const { colors, theme, toggleTheme } = useTheme();
  const backgroundColor = colors.background;
  const textColor = colors.text;

  // Fetch initial posts
  useEffect(() => {
    loadPosts();
  }, []);

  // Load posts from our mock API
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
      const newPosts = await fetchPosts(currentPage);

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

  // Handle like action
  const handleLike = useCallback((postId: string) => {
    console.log(`Like/unlike post: ${postId}`);
  }, []);

  // Handle comment action
  const handleComment = useCallback((postId: string) => {
    Alert.alert('Comments', 'Comments section will be implemented in a future update.');
    console.log(`Comment on post: ${postId}`);
  }, []);


  const handleDressItUp = useCallback((postId: string) => {
    Alert.alert('Dress It Up', 'This feature will allow you to try on this outfit virtually!');
    console.log(`Dress up item from post: ${postId}`);
  }, []);

  // Handle view all comments
  const handleViewComments = useCallback((postId: string) => {
    Alert.alert('View Comments', 'Full comments view will be implemented in a future update.');
    console.log(`View all comments for post: ${postId}`);
  }, []);

  // Render a post item
const renderItem = useCallback(({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onLike={handleLike}
      onComment={handleComment}
      onDressItUp={handleDressItUp}
      onViewComments={handleViewComments}
      dressItUpButtonStyle={styles.dressItUpButton}
    />
  ), [handleLike, handleComment, handleDressItUp, handleViewComments]);

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => Alert.alert('Menu', 'Menu functionality will be implemented in a future update.')}>
            <Ionicons name="menu-outline" size={28} color={textColor} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>DressIt</ThemedText>
        </View>
        <View style={styles.headerRight}>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={theme === 'dark' ? BRAND : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleTheme}
            value={theme === 'dark'}
            style={styles.themeToggle}
          />
        </View>
      </View>

      {/* Error State */}
      {error ? renderError() : (
        <>
          {loading && !refreshing && !loadingMore ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#364DEF" />
            </View>
          ) : (
            /* Content - Posts Feed */
            <FlatList
              data={posts}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={renderEmpty}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={['#364DEF']}
                  tintColor="#364DEF"
                />
              }
              // Performance optimizations
              initialNumToRender={3}
              maxToRenderPerBatch={5}
              windowSize={7}
              removeClippedSubviews={true}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  headerIcon: {
    padding: 5,
  },
  themeToggle: {
    marginLeft: 8,
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
  errorTitle: {
    marginBottom: 8,
    color: '#e74c3c',
  },
  errorText: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#364DEF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

