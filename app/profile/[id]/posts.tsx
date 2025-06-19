import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Dimensions,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  ScrollView,
  ViewStyle,
} from 'react-native';

import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BRAND, GRADIENT_CONFIG } from '../../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import Animated, { 
  FadeIn, 
  FadeOut, 
  withSpring,
  withSequence,
  useAnimatedStyle,
  useSharedValue,

} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';


interface Post {
  id: string;
  imageUrl: string | null;
  likes: number;
  comments: number;
  caption: string;
  createdAt: string;
}

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'popular' | 'recent';
type CategoryType = 'all' | 'outfits' | 'accessories' | 'shoes' | 'bags';

const PostsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Animation value refs for category buttons
const GridItem = ({ item }: { item: Post }) => {
  const [isLiked, setIsLiked] = React.useState(false);
  const scale = useSharedValue(1);
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);

  const onDoubleTap = () => {
    setIsLiked(prev => !prev);

    scale.value = withSpring(1.1, { damping: 15, stiffness: 200 }, () => {
      scale.value = withSpring(1);
    });

    heartScale.value = 0;
    heartOpacity.value = 1;
    heartScale.value = withSpring(1.2, { damping: 15, stiffness: 200 }, () => {
      setTimeout(() => {
        heartOpacity.value = withSpring(0);
      }, 500);
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: heartScale.value },
      { rotate: `${heartScale.value * 30}deg` },
    ],
    opacity: heartOpacity.value,
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1);
  };

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
          <Animated.Pressable 
            style={[styles.postItem, { width: itemSize, height: itemSize }, animatedStyle]}
            onPress={() => router.push(`/post/${item.id}`)}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            entering={FadeIn.delay(parseInt(item.id) * 30).duration(300)}
          >
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
            ) : (
              <View style={styles.postPlaceholder}>
                <Ionicons name="image-outline" size={24} color="#ccc" />
              </View>
            )}
            <Pressable 
              style={({pressed}) => [
                styles.postOverlay,
                { opacity: pressed ? 1 : 0 }
              ]}
            >
              <View style={styles.postStats}>
                <View style={styles.statItem}>
                  <Ionicons 
                    name={isLiked ? "heart" : "heart-outline"} 
                    size={16} 
                    color={isLiked ? "#ff3b30" : "#fff"} 
                  />
                  <Text style={[styles.statText, isLiked && { color: "#ff3b30" }]}>
                    {isLiked ? item.likes + 1 : item.likes}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="chatbubble" size={16} color="#fff" />
                  <Text style={styles.statText}>{item.comments}</Text>
                </View>
              </View>
            </Pressable>
            <Animated.View style={[styles.heartAnimationContainer, heartAnimatedStyle]}>
              <Ionicons name="heart" size={80} color="#fff" style={styles.heartIcon} />
            </Animated.View>
          </Animated.Pressable>
        </Animated.View>
      </TapGestureHandler>
    );
  };

  const GridLoadingItem = () => (
    <MotiView
      style={[styles.postItem, { width: itemSize, height: itemSize }]}
      from={{ opacity: 0.4 }}
      animate={{ opacity: 0.8 }}
      transition={{
        type: 'timing',
        duration: 800,
        loop: true,
      }}
    >
      <View style={styles.shimmerOverlay} />
    </MotiView>
  );

  const ShimmerEffect = ({ style }: { style: ViewStyle }) => (
    <MotiView
      style={[style, styles.shimmerEffect]}
      from={{ opacity: 0.3, left: '-20%' }}
      animate={{ opacity: 0.8, left: '120%' }}
      transition={{
        type: 'timing',
        duration: 1000,
        loop: true,
        repeatReverse: false,
      }}
    />
  );

  const ListLoadingItem = () => (
    <MotiView
      style={styles.listItem}
      from={{ opacity: 0.7 }}
      animate={{ opacity: 0.9 }}
      transition={{
        type: 'timing',
        duration: 800,
        loop: true,
      }}
    >
      <View style={styles.listImageContainer}>
        <View style={styles.listPlaceholder}>
          <ShimmerEffect style={styles.shimmerOverlay} />
        </View>
      </View>
      <View style={[styles.listContent, { gap: 8 }]}>
        <View style={[styles.shimmerLine, { width: '80%' }]}>
          <ShimmerEffect style={styles.shimmerOverlay} />
        </View>
        <View style={[styles.shimmerLine, { width: '60%' }]}>
          <ShimmerEffect style={styles.shimmerOverlay} />
        </View>
        <View style={styles.listStats}>
          <View style={[styles.shimmerLine, { width: 50 }]}>
            <ShimmerEffect style={styles.shimmerOverlay} />
          </View>
          <View style={[styles.shimmerLine, { width: 50, marginLeft: 16 }]}>
            <ShimmerEffect style={styles.shimmerOverlay} />
          </View>
        </View>
      </View>
    </MotiView>
  );

  const renderListItem = ({ item }: { item: Post }) => {
    const [isLiked, setIsLiked] = useState(false);
    const scale = useSharedValue(1);
    const heartScale = useSharedValue(0);
    const heartOpacity = useSharedValue(0);

    const onDoubleTap = () => {
      setIsLiked(prev => !prev);
      // Item scale animation
      scale.value = withSequence(
        withSpring(0.95, { damping: 15, stiffness: 200 }),
        withSpring(1, { damping: 15, stiffness: 200 }),
      );
      
      // Heart animation
      heartScale.value = 0;
      heartOpacity.value = 1;
      heartScale.value = withSpring(1.2, {
        damping: 15,
        stiffness: 200,
      }, () => {
        // Delay the fade out
        setTimeout(() => {
          heartOpacity.value = withSpring(0);
        }, 800);
      });
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

    const onPressIn = () => {
      scale.value = withSpring(0.98, {
        damping: 10,
        stiffness: 400,
      });
    };

    const onPressOut = () => {
      scale.value = withSpring(1);
    };
    
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
          <Animated.Pressable 
            style={[styles.listItem, animatedStyle]}
            onPress={() => router.push(`/post/${item.id}`)}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            entering={FadeIn.delay(parseInt(item.id) * 20).duration(300)}
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
              <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text>
              <View style={styles.listStats}>
                <View style={styles.statItem}>
                  <Ionicons 
                    name={isLiked ? "heart" : "heart-outline"} 
                    size={14} 
                    color={isLiked ? "#ff3b30" : BRAND} 
                  />
                  <Text style={[styles.listStatText, isLiked && { color: "#ff3b30" }]}>
                    {isLiked ? item.likes + 1 : item.likes}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="chatbubble" size={14} color={BRAND} />
                  <Text style={styles.listStatText}>{item.comments}</Text>
                </View>
                <Text style={styles.timestamp}>{item.createdAt}</Text>
              </View>
            </View>
            
            <Animated.View style={[styles.listHeartContainer, heartAnimatedStyle]}>
              <Ionicons name="heart" size={50} color="#fff" style={styles.heartIcon} />
            </Animated.View>
          </Animated.Pressable>
        </Animated.View>
      </TapGestureHandler>
  );
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={BRAND} />
        </TouchableOpacity>
        <Text style={styles.title}>Posts</Text>
        <TouchableOpacity 
          onPress={handleViewModeChange}
        >
          <Ionicons 
            name={viewMode === 'grid' ? "list" : "grid"} 
            size={24} 
            color={BRAND} 
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#687076" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search posts..."
            defaultValue={searchQuery}
            onChangeText={debouncedSearch}
            placeholderTextColor="#687076"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#687076" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {(['all', 'outfits', 'accessories', 'shoes', 'bags'] as CategoryType[]).map((category) => (
          <Animated.View 
            key={category}
            style={useAnimatedStyle(() => {
              return {
                transform: [{ scale: categoryButtonScales.current[category]?.value || 1 }],
              };
            })}
          >
            <TouchableOpacity 
              style={styles.categoryButton}
              onPress={() => handleCategoryChange(category)}
              onPressIn={() => {
                Haptics.selectionAsync();
                const button = categoryButtonScales.current[category];
                if (button) {
                  button.value = withSpring(0.9, { damping: 10, stiffness: 400 });
                }
              }}
              onPressOut={() => {
                const button = categoryButtonScales.current[category];
                if (button) {
                  button.value = withSpring(1);
                }
              }}
            >
            {selectedCategory === category ? (
              <LinearGradient
                colors={GRADIENT_CONFIG.colors}
                start={GRADIENT_CONFIG.start}
                end={GRADIENT_CONFIG.end}
                style={styles.categoryGradient}
              >
                <Text style={styles.activeCategoryText}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </LinearGradient>
            ) : (
              <View style={styles.categoryInactive}>
                <Text style={styles.categoryText}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </View>
            )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      <View style={styles.filterContainer}>
        <Animated.View
          style={useAnimatedStyle(() => {
            return {
              transform: [{ scale: filterButtonScales.current.all.value }],
            };
          })}
        >
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => handleFilterChange('all')}
            onPressIn={() => {
              Haptics.selectionAsync();
              filterButtonScales.current.all.value = withSpring(0.9, { damping: 10, stiffness: 400 });
            }}
            onPressOut={() => {
              filterButtonScales.current.all.value = withSpring(1);
            }}
          >
          {filterType === 'all' ? (
            <LinearGradient
              colors={GRADIENT_CONFIG.colors}
              start={GRADIENT_CONFIG.start}
              end={GRADIENT_CONFIG.end}
              style={styles.filterGradient}
            >
              <Text style={styles.activeFilterText}>All</Text>
            </LinearGradient>
          ) : (
            <View style={styles.filterInactive}>
              <Text style={styles.filterText}>All</Text>
            </View>
          )}
          </TouchableOpacity>
        </Animated.View>
        <Animated.View
          style={useAnimatedStyle(() => {
            return {
              transform: [{ scale: filterButtonScales.current.popular.value }],
            };
          })}
        >
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => handleFilterChange('popular')}
            onPressIn={() => {
              Haptics.selectionAsync();
              filterButtonScales.current.popular.value = withSpring(0.9, { damping: 10, stiffness: 400 });
            }}
            onPressOut={() => {
              filterButtonScales.current.popular.value = withSpring(1);
            }}
          >
          {filterType === 'popular' ? (
            <LinearGradient
              colors={GRADIENT_CONFIG.colors}
              start={GRADIENT_CONFIG.start}
              end={GRADIENT_CONFIG.end}
              style={styles.filterGradient}
            >
              <Text style={styles.activeFilterText}>Popular</Text>
            </LinearGradient>
          ) : (
            <View style={styles.filterInactive}>
              <Text style={styles.filterText}>Popular</Text>
            </View>
          )}
          </TouchableOpacity>
        </Animated.View>
        <Animated.View
          style={useAnimatedStyle(() => {
            return {
              transform: [{ scale: filterButtonScales.current.recent.value }],
            };
          })}
        >
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => handleFilterChange('recent')}
            onPressIn={() => {
              Haptics.selectionAsync();
              filterButtonScales.current.recent.value = withSpring(0.9, { damping: 10, stiffness: 400 });
            }}
            onPressOut={() => {
              filterButtonScales.current.recent.value = withSpring(1);
            }}
          >
          {filterType === 'recent' ? (
            <LinearGradient
              colors={GRADIENT_CONFIG.colors}
              start={GRADIENT_CONFIG.start}
              end={GRADIENT_CONFIG.end}
              style={styles.filterGradient}
            >
              <Text style={styles.activeFilterText}>Recent</Text>
            </LinearGradient>
          ) : (
            <View style={styles.filterInactive}>
              <Text style={styles.filterText}>Recent</Text>
            </View>
          )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {isLoading ? (
        <Animated.FlatList
          entering={FadeIn}
          exiting={FadeOut}
          data={Array(12).fill(null)}
          renderItem={() => viewMode === 'grid' ? <GridLoadingItem /> : <ListLoadingItem />}
          keyExtractor={(_, index) => String(index)}
          numColumns={numColumns}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Animated.FlatList
          entering={FadeIn}
          exiting={FadeOut}
          layout={Layout}
          data={filteredPosts}
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          keyExtractor={item => item.id}
          numColumns={numColumns}
          key={viewMode} // Reset layout when switching views
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={12}
          maxToRenderPerBatch={9}
          windowSize={5}
          ListEmptyComponent={!isLoading && <EmptyState />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore && (
            <View style={styles.loadingMore}>
              <ActivityIndicator color={BRAND} />
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={BRAND}
              colors={[BRAND]}
              progressBackgroundColor="#f8f8f8"
              progressViewOffset={10}
              size="large"
              title="Updating Posts..."
              titleColor={BRAND}
            />
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
    fontSize: 16,
    fontWeight: '600',
    color: BRAND,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButton: {
    overflow: 'hidden',
    borderRadius: 16,
    marginRight: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  filterGradient: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterInactive: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  activeFilterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  filterText: {
    fontSize: 14,
    color: '#687076',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 0.5,
  },
  postItem: {
    margin: 0.5,
    position: 'relative',
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
    aspectRatio: 1,
  },
  postOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  statText: {
    color: '#fff',
    fontSize: 14,
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
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  caption: {
    fontSize: 14,
    color: '#11181C',
    lineHeight: 20,
  },
  listStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listStatText: {
    color: BRAND,
    fontSize: 12,
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#687076',
    marginLeft: 'auto',
  },
  shimmerLine: {
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  postItemLoading: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  searchContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#11181C',
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoriesContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryButton: {
    marginRight: 8,
    overflow: 'hidden',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  categoryGradient: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryInactive: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  activeCategoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryText: {
    fontSize: 14,
    color: '#687076',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BRAND,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#687076',
    marginTop: 8,
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  likeIconOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  heartAnimationContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  heartIcon: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    transform: [{ skewX: '-20deg' }],
    borderRadius: 4,
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  listHeartContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default PostsScreen;

