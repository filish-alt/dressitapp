import React, { useState, useCallback, memo, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions, TextInput, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, withSpring, useAnimatedStyle, withSequence } from 'react-native-reanimated';
import { TapGestureHandler } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { getPostComments, addComment } from '@/services/posts';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import GradientButton from '@/components/ui/GradientButton';
import { Post } from '@/lib/types/post';
import { useThemeColor } from '@/hooks/useThemeColor';

const { width } = Dimensions.get('window');
const DOUBLE_TAP_DELAY = 300;

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onDressItUp?: (postId: string) => void;
  onViewComments?: (postId: string) => void;
  raisedAmount?: number; // New prop for raised amount
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onDressItUp,
  onViewComments,
  raisedAmount = 45, // Default value
}) => {
  // Safely check if post and user are defined before accessing properties
  const isValidPost = post && post.user;
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  // Initialize comments with post.comments or empty array, will be updated from API
  const [comments, setComments] = useState<Array<import('@/lib/types/post').Comment>>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const lastTap = useSharedValue(0);
  const heartScale = useSharedValue(0);
  
  // Get target amount directly from post.set_goal
  const targetAmount = post?.set_goal ? parseFloat(post.set_goal) : 0;

  const progressPercentage = targetAmount > 0 ? (raisedAmount / targetAmount) * 100 : 0;


  // Fetch comments for the post
  const router = useRouter();  

  const fetchComments = useCallback(async () => {
    try {
      setIsLoadingComments(true);
      const fetchedComments = await getPostComments(post.id);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [post.id]);

  const handleViewAllComments = () => {
    router.push(`/comments/${post.id}`);  
  };

  // Add a new comment to the post
  const handleAddComment = async () => {
     console.log("cpmment 111")
    if (!newComment.trim()) return;
    
    try {
      setIsPostingComment(true);
      const comment = await addComment(post.id, newComment.trim());
      console.log("cpmment",comment)
      // Add the new comment to the beginning of the comments array
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsPostingComment(false);
    }
  };

  // Fetch comments when the component mounts
  // Fetch comments when component mounts
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Format currency based on the post's currency
  const formatCurrency = (amount: number | string, currency: string): string => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(numericAmount);
  };

  // Handle double tap to like
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.value < DOUBLE_TAP_DELAY) {
      if (!liked) {
        handleLike();
        // Animate heart
        heartScale.value = withSequence(
          withSpring(1, { damping: 5, stiffness: 100 }),
          withSpring(0, { damping: 5, stiffness: 100 })
        );
      }
    }
    lastTap.value = now;
  }, [liked, lastTap, heartScale]);

  // Handle like button press
  const handleLike = useCallback(() => {
    setLiked(prev => !prev);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    onLike && onLike(post.id);
  }, [liked, post.id, onLike]);

  // Animated style for heart icon
  const heartAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: heartScale.value }],
      opacity: heartScale.value,
    };
  });

  return (
    <ThemedView style={[styles.container, { backgroundColor: 'white' }]}>
      {/* Post Header */}
      <View style={styles.header}>
        {/* Use fallback for profile image with proper null checks */}
        {isValidPost && post.user.profile_image ? (
          <Image 
            source={{ uri: post.user.profile_image }} 
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.placeholderAvatar]}>
            <Ionicons name="person" size={20} color="#ccc" />
          </View>
        )}
        <View style={styles.headerText}>
          <View style={styles.usernameContainer}>
            <ThemedText type="defaultSemiBold" style={[styles.username, { color: '#000' }]}>
              {isValidPost ? post.user.name : 'User'}
            </ThemedText>
            {isValidPost && post.user.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color="#0095f6" style={styles.verifiedBadge} />
            )}
          </View>
          <ThemedText style={[styles.location, { color: '#666' }]}>{post?.location || ''}</ThemedText>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Feather name="more-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Post Image with Heart Overlay at Top Right */}
      <TapGestureHandler onActivated={handleDoubleTap} numberOfTaps={2}>
        <Animated.View style={styles.imageContainer}>
          <Image
            source={{ uri: post?.media?.[0]?.media_path || null }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
          {/* Centered heart animation on double tap */}
          <Animated.View style={[styles.heartContainer, heartAnimatedStyle]}>
            <LinearGradient
              colors={['#364DEF', '#5828AF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.heartGradient}
            >
              <Ionicons name="heart" size={80} color="white" />
            </LinearGradient>
          </Animated.View>
          
          {/* Permanent heart at top right if liked */}
          {liked && (
            <View style={styles.topRightHeart}>
              <LinearGradient
                colors={['#364DEF', '#5828AF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.heartIconGradient}
              >
                <Ionicons name="heart" size={24} color="white" />
              </LinearGradient>
            </View>
          )}
        </Animated.View>
      </TapGestureHandler>

      {/* Funding Goal and Description */}
      <View style={styles.priceContainer}>
        <ThemedText type="defaultSemiBold" style={styles.price}>
          Target: {post?.set_goal 
            ? formatCurrency(post.set_goal, post.currency || 'USD') 
            : '$0.00'}
        </ThemedText>
        <ThemedText style={styles.description} numberOfLines={2}>
          {post?.description || 'No description available'}
        </ThemedText>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min(progressPercentage, 100)}%` }
            ]}
          />
        </View>
        <ThemedText style={styles.progressText}>
          {formatCurrency(raisedAmount, post?.currency || 'USD')} raised out of {formatCurrency(targetAmount, post?.currency || 'USD')}
        </ThemedText>
      </View>
      
      {/* Actions and Comment */}
      <View style={styles.actionsNewLayout}>
        <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
          <LinearGradient
            colors={['#364DEF', '#5828AF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.iconGradient}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={20}
              color="white"
            />
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => onComment && onComment(post.id)}
          style={styles.actionButton}
        >
          <LinearGradient
            colors={['#364DEF', '#5828AF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.iconGradient}
          >
            <Feather name="message-circle" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <LinearGradient
            colors={['#364DEF', '#5828AF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.iconGradient}
          >
            <Feather name="share" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.spacer} />
        
        <TouchableOpacity>
          <LinearGradient
            colors={['#364DEF', '#5828AF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.iconGradient}
          >
            <Feather name="bookmark" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Likes Count */}
      <ThemedText type="defaultSemiBold" style={[styles.likes, { color: '#000' }]}>
        {likesCount} likes
      </ThemedText>

      {/* Comments Section */}
      {isLoadingComments ? (
        <View style={styles.loadingComments}>
          <ActivityIndicator size="small" color="#364DEF" />
        </View>
      ) : (
        <>
          {/* Comments Preview */}
          {comments.length > 0 && (
            <TouchableOpacity
              style={styles.commentsPreview}
              onPress={handleViewAllComments}
            >
              <ThemedText style={[styles.viewComments, { color: '#666' }]}>
                View all {comments.length} comments
              </ThemedText>
            </TouchableOpacity>
          )}

          {/* Preview first two comments */}
          {comments.slice(0, 2).map((comment) => (
            <View key={comment.id} style={styles.commentPreview}>
              <ThemedText type="defaultSemiBold" style={[styles.commentUsername, { color: '#000' }]}>
                {comment.user?.id || 'Anonymous'}
              </ThemedText>
              <ThemedText style={[styles.commentText, { color: '#333' }]} numberOfLines={1}>
                {comment.comment}
              </ThemedText>
            </View>
          ))}
        </>
      )}

      {/* Posted Time */}
      <ThemedText style={[styles.timestamp, { color: '#999' }]}>
        {post?.created_at || post?.created_at 
          ? new Date( post?.created_at).toLocaleDateString() 
          : 'Unknown date'}
      </ThemedText>
      
      {/* Comment Input */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          placeholderTextColor="#999"
          multiline
        />
        {isPostingComment ? (
          <ActivityIndicator size="small" color="#364DEF" style={styles.commentButton} />
        ) : (
          <TouchableOpacity
            onPress={handleAddComment}
            style={styles.commentButton}
            disabled={!newComment.trim()}
          >
            <LinearGradient
              colors={['#364DEF', '#5828AF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.iconGradient, !newComment.trim() && styles.disabledButton]}
            >
              <Feather name="send" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Dress It Up Button */}
      <GradientButton
        title="Dress It Up"
        onPress={() => post?.id && onDressItUp && onDressItUp(post.id)}
        style={styles.dressItUpButton}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  placeholderAvatar: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  location: {
    fontSize: 12,
  },
  moreButton: {
    padding: 5,
  },
  imageContainer: {
    width: width,
    height: width,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heartContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  heartGradient: {
    borderRadius: 40,
    padding: 5,
  },
  topRightHeart: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 5,
  },
  heartIconGradient: {
    borderRadius: 20,
    padding: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionsNewLayout: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  leftActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: 12,
  },
  iconGradient: {
    borderRadius: 20,
    padding: 8,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
  priceContainer: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  likes: {
    paddingHorizontal: 12,
    marginVertical: 6,
    fontWeight: '600',
  },
  description: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
  },
  // Progress bar styles
  progressContainer: {
    paddingHorizontal: 12,
    marginVertical: 12,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#364DEF',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 6,
    fontSize: 12,
    color: '#666',
  },
  commentsPreview: {
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  viewComments: {
    fontSize: 14,
  },
  commentPreview: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  commentUsername: {
    marginRight: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  commentText: {
    flex: 1,
    fontSize: 14,
  },
  timestamp: {
    paddingHorizontal: 12,
    fontSize: 12,
    marginBottom: 12,
  },
  dressItUpButton: {
    marginHorizontal: 12,
    marginBottom: 12,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  commentInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
    color: '#000',
  },
  commentButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingComments: {
    paddingVertical: 12,
    alignItems: 'center',
  },
});

export default memo(PostCard);

