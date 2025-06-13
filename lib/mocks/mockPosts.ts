import { Post, User, Comment } from '../types/post';

// Mock Users
const users: User[] = [
  {
    id: 'user1',
    username: 'sofia_style',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    isVerified: true,
  },
  {
    id: 'user2',
    username: 'fashion_alex',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 'user3',
    username: 'trend_watcher',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    isVerified: true,
  },
  {
    id: 'user4',
    username: 'streetwear_mike',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
  },
  {
    id: 'user5',
    username: 'chic_styles',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
];

// Mock Comments
const createComments = (postId: string): Comment[] => {
  const commentsByPost: Record<string, Comment[]> = {
    'post1': [
      {
        id: 'comment1',
        user: users[1],
        text: 'This looks amazing! Where can I find something similar?',
        createdAt: '2025-06-10T14:23:00Z',
        likes: 4,
      },
      {
        id: 'comment2',
        user: users[4],
        text: 'Love the color combination!',
        createdAt: '2025-06-10T15:45:00Z',
        likes: 2,
      },
    ],
    'post2': [
      {
        id: 'comment3',
        user: users[0],
        text: 'Would this be good for a summer wedding?',
        createdAt: '2025-06-11T09:12:00Z',
        likes: 1,
      },
    ],
    'post3': [
      {
        id: 'comment4',
        user: users[2],
        text: 'These shoes are to die for! 😍',
        createdAt: '2025-06-12T11:33:00Z',
        likes: 7,
      },
      {
        id: 'comment5',
        user: users[1],
        text: 'Do they come in other colors?',
        createdAt: '2025-06-12T12:05:00Z',
        likes: 3,
      },
      {
        id: 'comment6',
        user: users[4],
        text: 'Just ordered mine!',
        createdAt: '2025-06-12T14:18:00Z',
        likes: 5,
      },
    ],
    'post4': [
      {
        id: 'comment7',
        user: users[3],
        text: 'That bag looks so practical yet stylish',
        createdAt: '2025-06-09T16:42:00Z',
        likes: 6,
      },
    ],
    'post5': [
      {
        id: 'comment8',
        user: users[0],
        text: 'Perfect for my upcoming trip!',
        createdAt: '2025-06-08T10:30:00Z',
        likes: 9,
      },
      {
        id: 'comment9',
        user: users[2],
        text: 'Is this true to size?',
        createdAt: '2025-06-08T13:15:00Z',
        likes: 2,
      },
    ],
  };
  
  return commentsByPost[postId] || [];
};

// Mock Posts
export const mockPosts: Post[] = [
  {
    id: 'post1',
    user: users[0],
    images: ['https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
    description: 'Just found this gorgeous summer dress. Perfect for beach days and evening walks!',
    location: 'SoHo, New York',
    price: 129.99,
    currency: 'USD',
    likes: 245,
    comments: createComments('post1'),
    createdAt: '2025-06-10T12:30:00Z',
    isLiked: true,
  },
  {
    id: 'post2',
    user: users[1],
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
    description: 'Elegant evening wear for those special occasions. This dress makes a statement!',
    location: 'Beverly Hills',
    price: 349.50,
    currency: 'USD',
    likes: 512,
    comments: createComments('post2'),
    createdAt: '2025-06-11T08:45:00Z',
    isLiked: false,
  },
  {
    id: 'post3',
    user: users[2],
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
    description: 'These limited edition sneakers just dropped. Grab them while you can!',
    location: 'Downtown LA',
    price: 189.99,
    currency: 'USD',
    likes: 876,
    comments: createComments('post3'),
    createdAt: '2025-06-12T10:15:00Z',
    isLiked: true,
    isSaved: true,
  },
  {
    id: 'post4',
    user: users[3],
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
    description: 'This designer bag is a must-have accessory for any outfit. Versatile and timeless.',
    location: 'Milan, Italy',
    price: 1250.00,
    currency: 'EUR',
    likes: 1024,
    comments: createComments('post4'),
    createdAt: '2025-06-09T15:20:00Z',
    isLiked: false,
  },
  {
    id: 'post5',
    user: users[4],
    images: ['https://images.unsplash.com/photo-1580651214613-f4692d6d138f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
    description: 'Casual but chic outfit for everyday wear. So comfortable you won\'t want to take it off!',
    location: 'Paris, France',
    price: 89.95,
    currency: 'EUR',
    likes: 732,
    comments: createComments('post5'),
    createdAt: '2025-06-08T09:10:00Z',
    isLiked: true,
  },
];

// Helper function to simulate fetch with pagination
export const fetchPosts = (page: number = 1, limit: number = 5): Promise<Post[]> => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedPosts = [...mockPosts].slice(start, end);
      resolve(paginatedPosts);
    }, 500);
  });
};

