/**
 * Type definitions for the DressIt app feed
 */

// User interface for post creators and commenters
export interface User {
  id: string;
  username: string;
  avatar: string;
  isVerified?: boolean;
}

// Comment interface for post comments
export interface Comment {
  id: string;
  user: User;
  text: string;
  createdAt: string;
  likes: number;
}

// Post interface for clothing items
export interface Post {
  id: string;
  user: User;
  images: string[]; // Array of image URLs (support multiple images in the future)
  description: string;
  location: string;
  price: number;
  currency: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
  isLiked?: boolean; // Whether the current user has liked this post
  isSaved?: boolean; // Whether the current user has saved this post
}

