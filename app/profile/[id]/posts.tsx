import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  ViewStyle,
  Platform
} from 'react-native';

import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BRAND, GRADIENT_CONFIG } from '../../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '@/components/GradientButton';

// Handle requestAnimationFrame polyfill for web
if (Platform.OS === 'web') {
  if (typeof global.requestAnimationFrame !== 'function') {
    global.requestAnimationFrame = function(callback) {
      return setTimeout(callback, 0);
    };
    global.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
}

import Animated, { 
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { TapGestureHandler, State } from 'react-native-gesture-handler';
// Types
interface Post {
  id: string;
  imageUrl: string | null;
  likes: number;
  comments: number;
}

type ViewMode = 'grid' | 'list';

// Constants
const { width } = Dimensions.get('window');
const numColumns = 3;
const itemSize = (width - 4) / numColumns;

const PostsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Animation values
  const viewModeButtonScale = useSharedValue(1);
  const isWeb = Platform.OS === 'web';
  
  useEffect(() => {
    // Fetch posts data when component mounts
    fetchPosts();
  }, [id]);
  
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock data
      const mockPosts = Array(20).fill(null).map((_, index) => ({
        id: String(index + 1),
        imageUrl: null,
        likes: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 20),
      }));
      
      setPosts(mockPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewModeChange = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    
    // Only use haptics on native platforms
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Animate button press
    viewModeButtonScale.value = withSpring(0.9, { damping: 10, stiffness: 400 }, () => {
      viewModeButtonScale.value = withSpring(1);
    });
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };
  
  const viewModeButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: viewModeButtonScale.value }],
    };
  });
  // Grid Item Component
  const GridItem = ({ item }: { item: Post }) => {
    const [isLiked, setIsLiked] = useState(false);
    const scale = useSharedValue(1);
    const heartScale = useSharedValue(0);
    const heartOpacity = useSharedValue(0);
    
    const handleLike = () => {
      setIsLiked(prev => !prev);
      if (!isWeb) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    };
    
    const onDoubleTap = () => {
      if (!isLiked) {
        setIsLiked(true);
        if (!isWeb) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
      
      // Scale the post briefly
      scale.value = withSequence(
        withSpring(0.95, { damping: 15, stiffness: 200 }),
        withSpring(1, { damping: 15, stiffness: 200 })
      );
      
      // Animate heart
      heartScale.value = 0;
      heartOpacity.value = 1;
      heartScale.value = withSpring(1.2, { damping: 15, stiffness: 200 }, () => {
        setTimeout(() => {
          heartOpacity.value = withSpring(0);
        }, 800);
      });
    };
    
    const onPressIn = () => {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
      if (!isWeb) {
        Haptics.selectionAsync();
      }
    };
    
    const onPressOut = () => {
      scale.value = withSpring(1);
    };
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));
    
    const heartAnimatedStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: heartScale.value },
        { rotate: `${heartScale.value * 20}deg` }
      ],
      opacity: heartOpacity.value,
    }));
    
    // Web doesn't support TapGestureHandler well, use regular TouchableOpacity for web
    if (isWeb) {
      return (
        <Animated.View 
          style={[styles.postItem, { width: itemSize, height: itemSize }, animatedStyle]}
          entering={FadeIn.delay(parseInt(item.id) * 30).duration(300)}
        >
          <TouchableOpacity
            style={styles.postItemTouchable}
            onPress={() => router.push(`/post/${item.id}`)}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onLongPress={handleLike}
            delayLongPress={200}
          >
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
            ) : (
              <View style={styles.postPlaceholder}>
                <Ionicons name="image-outline" size={24} color="#ccc" />
              </View>
            )}
            
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.postOverlay}
            >
              <View style={styles.postStats}>
                <TouchableOpacity onPress={handleLike} style={styles.statItem}>
                  <Ionicons 
                    name={isLiked ? "heart" : "heart-outline"} 
                    size={16} 
                    color={isLiked ? "#ff3b30" : "#fff"} 
                  />
                  <Text style={styles.statText}>
                    {isLiked ? item.likes + 1 : item.likes}
                  </Text>
                </TouchableOpacity>
                <View style={styles.statItem}>
                  <Ionicons name="chatbubble-outline" size={16} color="#fff" />
                  <Text style={styles.statText}>{item.comments}</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      );
    }
    
    // Native implementation with TapGestureHandler
    return (
      <TapGestureHandler
        numberOfTaps={2}
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === State.ACTIVE) {
            onDoubleTap();
          }
        }}
      >
        <Animated.View>
          <Animated.View 
            style={[styles.postItem, { width: itemSize, height: itemSize }, animatedStyle]}
            entering={FadeIn.delay(parseInt(item.id) * 30).duration(300)}
          >
            <TouchableOpacity
              style={styles.postItemTouchable}
              onPress={() => router.push(`/post/${item.id}`)}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onLongPress={handleLike}
              delayLongPress={200}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
              ) : (
                <View style={styles.postPlaceholder}>
                  <Ionicons name="image-outline" size={24} color="#ccc" />
                </View>
              )}
              
              {/* Heart animation overlay */}
              <Animated.View style={[styles.heartAnimationContainer, heartAnimatedStyle]}>
                <LinearGradient
                  {...GRADIENT_CONFIG}
                  style={styles.heartGradient}
                >
                  <Ionicons name="heart" size={50} color="#fff" />
                </LinearGradient>
              </Animated.View>
              
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.postOverlay}
              >
                <View style={styles.postStats}>
                  <View style={styles.statItem}>
                    <Ionicons 
                      name={isLiked ? "heart" : "heart-outline"} 
                      size={16} 
                      color={isLiked ? "#ff3b30" : "#fff"} 
                    />
                    <Text style={styles.statText}>
                      {isLiked ? item.likes + 1 : item.likes}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="chatbubble-outline" size={16} color="#fff" />
                    <Text style={styles.statText}>{item.comments}</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </TapGestureHandler>
    );
  };
  
  // List Item Component
  const ListItem = ({ item }: { item: Post }) => {
    const [isLiked, setIsLiked] = useState(false);
    const scale = useSharedValue(1);
    const heartScale = useSharedValue(0);
    const heartOpacity = useSharedValue(0);
    
    const handleLike = () => {
      setIsLiked(prev => !prev);
      if (!isWeb) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    };
    
    const onDoubleTap = () => {
      if (!isLiked) {
        setIsLiked(true);
        if (!isWeb) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
      
      // Scale the item briefly
      scale.value = withSequence(
        withSpring(0.98, { damping: 15, stiffness: 200 }),
        withSpring(1, { damping: 15, stiffness: 200 })
      );
      
      // Animate heart
      heartScale.value = 0;
      heartOpacity.value = 1;
      heartScale.value = withSpring(1.2, { damping: 15, stiffness: 200 }, () => {
        setTimeout(() => {
          heartOpacity.value = withSpring(0);
        }, 800);
      });
    };
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));
    
    const heartAnimatedStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: heartScale.value },
        { rotate: `${heartScale.value * 20}deg` }
      ],
      opacity: heartOpacity.value,
    }));
    
    // Web implementation without TapGestureHandler
    if (isWeb) {
      return (
        <Animated.View style={[styles.listItem, animatedStyle]}>
          <TouchableOpacity 
            style={styles.listItemTouchable}
            onPress={() => router.push(`/post/${item.id}`)}
            onLongPress={handleLike}
            delayLongPress={200}
          >
            <View style={styles.listImageContainer}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.listImage} />
              ) : (
                <View style={styles.listPlaceholder}>
                  <Ionicons name="image-outline" size={24} color="#ccc" />
                </View>
              )}
            </View>
            
            <View style={styles.listContent}>
              <View style={styles.listStats}>
                <TouchableOpacity 
                  onPress={handleLike} 
                  style={styles.listStatItem}
                >
                  <LinearGradient
                    {...GRADIENT_CONFIG}
                    style={styles.listStatIcon}
                  >
                    <Ionicons 
                      name={isLiked ? "heart" : "heart-outline"} 
                      size={14} 
                      color="#fff"
                    />
                  </LinearGradient>
                  <Text style={styles.listStatText}>
                    {isLiked ? item.likes + 1 : item.likes}
                  </Text>
                </TouchableOpacity>
                
                <View style={styles.listStatItem}>
                  <LinearGradient
                    {...GRADIENT_CONFIG}
                    style={styles.listStatIcon}
                  >
                    <Ionicons name="chatbubble-outline" size={14} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.listStatText}>{item.comments}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    }
    
    // Native implementation with TapGestureHandler
    return (
      <TapGestureHandler
        numberOfTaps={2}
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === State.ACTIVE) {
            onDoubleTap();
          }
        }}
      >
        <Animated.View>
          <Animated.View style={[styles.listItem, animatedStyle]}>
            <TouchableOpacity 
              style={styles.listItemTouchable}
              onPress={() => {
                if (!isWeb) {
                  Haptics.selectionAsync();
                }
                router.push(`/post/${item.id}`);
              }}
            >
              <View style={styles.listImageContainer}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.listImage} />
                ) : (
                  <View style={styles.listPlaceholder}>
                    <Ionicons name="image-outline" size={24} color="#ccc" />
                  </View>
                )}
                
                {/* Heart animation overlay for list item */}
                <Animated.View style={[styles.listHeartContainer, heartAnimatedStyle]}>
                  <LinearGradient
                    {...GRADIENT_CONFIG}
                    style={styles.heartGradient}
                  >
                    <Ionicons name="heart" size={30} color="#fff" />
                  </LinearGradient>
                </Animated.View>
              </View>
              
              <View style={styles.listContent}>
                <View style={styles.listStats}>
                  <TouchableOpacity 
                    onPress={handleLike} 
                    style={styles.listStatItem}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <LinearGradient
                      {...GRADIENT_CONFIG}
                      style={styles.listStatIcon}
                    >
                      <Ionicons 
                        name={isLiked ? "heart" : "heart-outline"} 
                        size={14} 
                        color="#fff"
                      />
                    </LinearGradient>
                    <Text style={styles.listStatText}>
                      {isLiked ? item.likes + 1 : item.likes}
                    </Text>
                  </TouchableOpacity>
                  
                  <View style={styles.listStatItem}>
                    <LinearGradient
                      {...GRADIENT_CONFIG}
                      style={styles.listStatIcon}
                    >
                      <Ionicons name="chatbubble-outline" size={14} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.listStatText}>{item.comments}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </TapGestureHandler>
    );
  };
  
  // Loading item component
  const LoadingItem = () => {
    // Use simpler animations for web to avoid requestAnimationFrame issues
    if (isWeb) {
      return (
        <View style={[styles.postItem, { width: itemSize, height: itemSize }]}>
          <View style={styles.postPlaceholder}>
            <LinearGradient
              {...GRADIENT_CONFIG}
              style={styles.loadingIconContainer}
            >
              <Ionicons name="image-outline" size={20} color="#fff" />
            </LinearGradient>
          </View>
        </View>
      );
    }
    
    // Native platform animations
    // Create animated values for opacity and shimmer position
    const opacity = useSharedValue(0.4);
    const shimmerPosition = useSharedValue(-100);
    
    // Start the animations when component mounts
    useEffect(() => {
      // Opacity animation
      opacity.value = withRepeat(
        withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1, // infinite repeats
        true // reverse
      );
      
      // Shimmer animation
      shimmerPosition.value = withRepeat(
        withTiming(100, { duration: 1000, easing: Easing.linear }),
        -1, // infinite repeats
        false // don't reverse
      );
    }, []);
    
    // Create animated styles
    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: opacity.value,
      };
    });
    
    const shimmerStyle = useAnimatedStyle(() => {
      return {
        left: `${shimmerPosition.value}%`,
        opacity: 0.5,
      };
    });
    
    return (
      <Animated.View style={[styles.postItem, { width: itemSize, height: itemSize }, animatedStyle]}>
        <View style={styles.postPlaceholder}>
          <LinearGradient
            {...GRADIENT_CONFIG}
            style={styles.loadingIconContainer}
          >
            <Ionicons name="image-outline" size={20} color="#fff" />
          </LinearGradient>
        </View>
        <Animated.View style={[styles.shimmerOverlay, shimmerStyle]} />
      </Animated.View>
    );
  };
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={BRAND} />
        </TouchableOpacity>
        
        <Text style={styles.title}>Posts</Text>
        
        <Animated.View style={viewModeButtonStyle}>
          <TouchableOpacity 
            onPress={handleViewModeChange}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <LinearGradient 
              {...GRADIENT_CONFIG} 
              style={styles.viewModeButton}
            >
              <Ionicons 
                name={viewMode === 'grid' ? "list" : "grid"} 
                size={20} 
                color="white" 
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item }) => viewMode === 'grid' ? 
            <GridItem item={item} /> : 
            <ListItem item={item} />
          }
          keyExtractor={item => item.id}
          numColumns={viewMode === 'grid' ? numColumns : 1}
          key={viewMode} // Reset layout when switching views
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={BRAND}
              colors={[BRAND]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <LinearGradient
                {...GRADIENT_CONFIG}
                style={styles.emptyStateIconContainer}
              >
                <Ionicons name="images-outline" size={40} color="#fff" />
              </LinearGradient>
              <Text style={styles.emptyStateTitle}>No Posts Found</Text>
              <Text style={styles.emptyStateText}>Posts will appear here</Text>
            </View>
          }
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
    fontSize: 18,
    fontWeight: '600',
    color: BRAND,
  },
  viewModeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 4,
  },
  
  // Grid view styles
  postItem: {
    margin: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  postItemTouchable: {
    width: '100%',
    height: '100%',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1,
  },
  postOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 8,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  statText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  
  // List view styles
  listItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  listPlaceholder: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  listStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  listStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  listStatText: {
    color: BRAND,
    fontSize: 12,
    marginLeft: 4,
  },
  listStatIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  listItemTouchable: {
    flexDirection: 'row',
    flex: 1,
  },
  listHeartContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
  },
  heartAnimationContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  heartGradient: {
    borderRadius: 25,
    padding: 8,
  },
  
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    minHeight: 300,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BRAND,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#687076',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    transform: [{ skewX: '-20deg' }],
  },
  shimmerLine: {
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

export default PostsScreen;
