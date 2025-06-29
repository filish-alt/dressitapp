import { Comment } from '@/lib/types/post';
import api, { handleApiError } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface PostMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  profile_image?: string;
  description: string;
  location?: string;
  media: PostMedia[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  set_goal?: string;
  createdAt: string;
}



// Types for API responses
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Types for pagination
interface PaginationParams {
  page?: number;
  limit?: number;
  user_id?: string;
}

// Types for post creation
export interface CreatePostData {
  description: string;
  location: string;
  price: number;
  currency: string;
  media: FormData | File[] | Blob[];
  set_goal?: string; // The funding goal amount
}

// Types for post filters
export interface PostFilters extends PaginationParams {
  user_id?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'latest' | 'popular' | 'price_low' | 'price_high';
}

// Types for comment creation
export interface CreateCommentData {
  text: string;
}

/**
 * Fetches posts with optional pagination and filters
 */
export const getPosts = async (filters?: PostFilters): Promise<Post[]> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const response = await api.get<ApiResponse<Post[]>>('/all-looks', { 
      params: filters,
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Fetches a specific post by ID
 */
export const getPostById = async (postId: string): Promise<Post> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const response = await api.get<ApiResponse<Post>>(`/all-looks/${postId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching post ${postId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Creates a new post
 */
export const createPost = async (postData: FormData): Promise<Post> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const response = await api.post<ApiResponse<Post>>('/looks', postData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Updates an existing post
 */
export const updatePost = async (postId: string, postData: Partial<CreatePostData>): Promise<Post> => {
  try {
    const formData = new FormData();
    
    // Append only the fields that are provided
    if (postData.description) {
      formData.append('description', postData.description);
    }
    
    if (postData.location) {
      formData.append('location', postData.location);
    }
    
    if (postData.price) {
      formData.append('price', postData.price.toString());
    }
    
    if (postData.currency) {
      formData.append('currency', postData.currency);
    }
    
    if (postData.set_goal) {
      formData.append('set_goal', postData.set_goal);
    }
    
    // Append media if provided
    if (postData.media) {
      if (postData.media instanceof FormData) {
        for (const [key, value] of postData.media.entries()) {
          formData.append(key, value);
        }
      } else {
        postData.media.forEach((file, index) => {
          formData.append(`media[${index}]`, file);
        });
      }
    }
    
    const response = await api.put<ApiResponse<Post>>(`/looks/${postId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  } catch (error) {
    console.error(`Error updating post ${postId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Deletes a post
 */
export const deletePost = async (postId: string): Promise<boolean> => {
  try {
    await api.delete(`/looks/${postId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting post ${postId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Likes a post
 */
export const likePost = async (postId: string): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    await api.put(`/looks-like-unlike/${postId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error(`Error liking post ${postId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Unlikes a post
 */
export const unlikePost = async (postId: string): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    await api.put(`/looks-like-unlike/${postId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error(`Error unliking post ${postId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Saves (bookmarks) a post
 */
export const savePost = async (postId: string): Promise<void> => {
  try {
    await api.post(`/looks/${postId}/save`);
  } catch (error) {
    console.error(`Error saving post ${postId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Unsaves (removes bookmark) a post
 */
export const unsavePost = async (postId: string): Promise<void> => {
  try {
    await api.delete(`/looks/${postId}/save`);
  } catch (error) {
    console.error(`Error unsaving post ${postId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Gets comments for a post
 */
export const getPostComments = async (postId: string, params?: PaginationParams): Promise<Comment[]> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const response = await api.get<ApiResponse<Comment[]>>(`/looks-comments/${postId}`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Adds a comment to a post
 */
export const addComment = async (postId: string, text: string): Promise<Comment> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const response = await api.post<ApiResponse<Comment>>(`/looks-comments/${postId}`, 
      { text },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error adding comment to post ${postId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Deletes a comment from a post
 */
export const deleteComment = async (postId: string, commentId: string): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    await api.delete(`/looks/${postId}/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error(`Error deleting comment ${commentId} from post ${postId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Gets posts by a specific user
 */
export const getUserPosts = async (userId: string, params?: PaginationParams): Promise<Post[]> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const response = await api.get<ApiResponse<Post[]>>(`/all-looks/${userId}`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching posts for user ${userId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Gets saved/bookmarked posts for the current user
 */
export const getSavedPosts = async (params?: PaginationParams): Promise<Post[]> => {
  try {
    const response = await api.get<ApiResponse<Post[]>>('/looks/saved', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Gets the current user's own posts
 */


export const getMyPosts = async (): Promise<Post[]> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await api.get<ApiResponse<Post[]>>('/looks', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching my posts:', error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Contributes/donates to a post's goal
 */
export const contributeToPost = async (postId: string, amount: number): Promise<void> => {
  try {
    await api.post(`/looks/${postId}/contribute`, { amount });
  } catch (error) {
    console.error(`Error contributing to post ${postId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Gets trending/popular posts
 */
// export const getTrendingPosts = async (params?: PaginationParams): Promise<Post[]> => {
//   try {
//     const filters: PostFilters = {
//       ...params,
//       sortBy: 'popular'
//     };
//     const response = await api.get<ApiResponse<Post[]>>('/looks/trending', { params: filters });
//     return response.data.data;
//   } catch (error) {
//     console.error('Error fetching trending posts:', error);
//     throw new Error(handleApiError(error));
//   }
// };

// /**
//  * Reports a post for inappropriate content
//  */
// export const reportPost = async (postId: string, reason: string): Promise<void> => {
//   try {
//     await api.post(`/looks/${postId}/report`, { reason });
//   } catch (error) {
//     console.error(`Error reporting post ${postId}:`, error);
//     throw new Error(handleApiError(error));
//   }
//};

