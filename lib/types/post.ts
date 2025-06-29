/**
 * Type definitions for the DressIt app feed
 */

// User interface for post creators and commenters
export interface User {
  id: string;
  name: string;
  user_id?: string; // Added for compatibility with API
  profile_image: string | null;
  isVerified?: boolean;
}

// Comment interface for post comments
export interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    profile_image?: string | null;
  };
  comment: string;  // The actual comment text
  created_at: string;
}
// export interface Comment {
//   id: string;
//   user_id: string;
//   comment: string;
//   createdAt: string;
// }
// Media interface for post images and videos
export interface Media {
  id: string;
  media_path: string;
  media_type: string;
  look_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Post interface for clothing items
export interface Post {
  id: string;
  user: User;
  media: Media[]; // Array of media items (images, videos)
  description: string;
  location: string;
  set_goal: string; // Funding target amount
  currency: string;
  likes: number;
  comments: Comment[];
  created_at: string;
  isLiked?: boolean; // Whether the current user has liked this post
  isSaved?: boolean; // Whether the current user has saved this post
}

