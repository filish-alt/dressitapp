import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { BRAND, GRADIENT_CONFIG } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import api, { handleApiError } from '@/services/api';
import { useCallback } from 'react';
// Define interfaces for API responses
interface User {
  id: number;
  name: string;
  username: string;
  profile_image: string;
  bio?: string;
}

interface Look {
  id: number;
  image: string;
  title: string;
  description?: string;
  user_id: number;
}

// Mock data for fallback when API fails
const MOCK_USERS: User[] = [
  {
    id: 1,
    name: 'Jane Smith',
    username: 'janesmith',
    profile_image: 'https://randomuser.me/api/portraits/women/1.jpg',
    bio: 'Fashion enthusiast and style blogger'
  },
  {
    id: 2,
    name: 'John Doe',
    username: 'johndoe',
    profile_image: 'https://randomuser.me/api/portraits/men/1.jpg',
    bio: 'Streetwear lover'
  },
  {
    id: 3,
    name: 'Alice Johnson',
    username: 'alicestyle',
    profile_image: 'https://randomuser.me/api/portraits/women/2.jpg',
    bio: 'Vintage fashion collector'
  },
  {
    id: 4,
    name: 'Robert Williams',
    username: 'robstylist',
    profile_image: 'https://randomuser.me/api/portraits/men/2.jpg',
    bio: 'Professional stylist'
  },
  {
    id: 5,
    name: 'Emma Davis',
    username: 'emmafashion',
    profile_image: 'https://randomuser.me/api/portraits/women/3.jpg',
    bio: 'Fashion designer'
  },
  {
    id: 6,
    name: 'Michael Brown',
    username: 'mikebrown',
    profile_image: 'https://randomuser.me/api/portraits/men/3.jpg',
    bio: 'Casual style enthusiast'
  }
];

const MOCK_LOOKS: Look[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    title: 'Summer Casual',
    description: 'Perfect for hot summer days',
    user_id: 1
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800',
    title: 'Evening Elegance',
    description: 'Formal evening wear',
    user_id: 2
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
    title: 'Street Style',
    description: 'Urban fashion',
    user_id: 3
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800',
    title: 'Vintage Inspired',
    description: 'Classic looks with a modern twist',
    user_id: 4
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800',
    title: 'Minimalist Chic',
    description: 'Simple yet sophisticated',
    user_id: 5
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=800',
    title: 'Autumn Layers',
    description: 'Cozy fall fashion',
    user_id: 6
  }
];

// Custom hooks for fetching data
const useUserSearch = (query: string) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const fetchUsers = useCallback(async (skipRetry = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use the api instance that already has the baseURL configured
      const response = await api.get('/user/profile/2', {
        params: query ? { search: query } : {}
      });
      
      setUsers(Array.isArray(response.data) ? response.data : [response.data]);
      setRetryCount(0); // Reset retry count on success
    } catch (err: any) {
      console.error('Error fetching users:', err);
      
      // Check if we should retry
      if (!skipRetry && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        
        // Schedule retry after delay
        setTimeout(() => {
          fetchUsers(true);
        }, delay);
        
        setError(`Request failed. Retrying in ${delay/1000} seconds...`);
      } else {
        // After max retries or if skipRetry is true, fallback to mock data
        setUsers(MOCK_USERS);
        setError('Using sample data due to API error: ' + handleApiError(err));
      }
    } finally {
      if (skipRetry) {
        setLoading(false);
      }
    }
  }, [query, loading, retryCount]);

  // Manual refresh without exponential backoff
  const manualRefresh = useCallback(() => {
    setRetryCount(0);
    return fetchUsers(true);
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return { 
    users, 
    loading, 
    error, 
    refetch: manualRefresh,
    retryCount
  };
};
const useLooksSearch = (query: string) => {
  const [looks, setLooks] = useState<Look[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const fetchLooks = useCallback(async (skipRetry = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use the api instance that already has the baseURL configured
      const response = await api.get('/looks', {
        params: query ? { search: query } : {}
      });
      
      setLooks(response.data || []);
      setRetryCount(0); // Reset retry count on success
    } catch (err: any) {
      console.error('Error fetching looks:', err);
      
      // Check if we should retry
      if (!skipRetry && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        
        // Schedule retry after delay
        setTimeout(() => {
          fetchLooks(true);
        }, delay);
        
        setError(`Request failed. Retrying in ${delay/1000} seconds...`);
      } else {
        // After max retries or if skipRetry is true, fallback to mock data
        setLooks(MOCK_LOOKS);
        setError('Using sample data due to API error: ' + handleApiError(err));
      }
    } finally {
      if (skipRetry) {
        setLoading(false);
      }
    }
  }, [query, loading, retryCount]);

  // Manual refresh without exponential backoff
  const manualRefresh = useCallback(() => {
    setRetryCount(0);
    return fetchLooks(true);
  }, [fetchLooks]);

  useEffect(() => {
    fetchLooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return { 
    looks, 
    loading, 
    error, 
    refetch: manualRefresh,
    retryCount
  };
};

export default function SearchScreen() {
  const { colors } = useTheme();
  const backgroundColor = colors.background;
  const textColor = colors.text;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'looks'>('users');
  
  // Use our custom hooks to fetch data
  const { 
    users, 
    loading: usersLoading, 
    error: usersError, 
    refetch: refetchUsers,
    retryCount: usersRetryCount 
  } = useUserSearch(searchQuery);
  
  const { 
    looks, 
    loading: looksLoading, 
    error: looksError, 
    refetch: refetchLooks,
    retryCount: looksRetryCount 
  } = useLooksSearch(searchQuery);

  // Get the screen width for responsive grid sizing
  const screenWidth = Dimensions.get('window').width;
  const userItemWidth = screenWidth / 3 - 16;
  const lookItemWidth = screenWidth / 2 - 24;

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity style={[styles.userItem, { width: userItemWidth }]}>
      <View style={styles.userAvatarContainer}>
        <Image 
          source={{ uri: item.profile_image || 'https://via.placeholder.com/150' }} 
          style={styles.userAvatar} 
          resizeMode="cover" 
        />
      </View>
      <Text style={[styles.userName, { color: textColor }]} numberOfLines={1}>
        {item.username || item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderLookItem = ({ item }: { item: Look }) => (
    <TouchableOpacity style={[styles.lookItem, { width: lookItemWidth }]}>
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/300' }} 
        style={styles.lookImage} 
        resizeMode="cover" 
      />
      <Text style={[styles.lookTitle, { color: textColor }]} numberOfLines={1}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
          <Text style={[styles.headerTitle, { color: textColor }]}>Search</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#687076" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for outfits, styles, users..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#687076" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBarContainer}>
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setActiveTab('users')}
        >
          {activeTab === 'users' ? (
            <LinearGradient {...GRADIENT_CONFIG} style={styles.activeTabGradient}>
              <Text style={styles.activeTabText}>Users</Text>
            </LinearGradient>
          ) : (
            <Text style={[styles.tabText, { color: textColor }]}>Users</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => setActiveTab('looks')}
        >
          {activeTab === 'looks' ? (
            <LinearGradient {...GRADIENT_CONFIG} style={styles.activeTabGradient}>
              <Text style={styles.activeTabText}>Looks</Text>
            </LinearGradient>
          ) : (
            <Text style={[styles.tabText, { color: textColor }]}>Looks</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.contentContainer}>
        {/* Users Tab Content */}
        {activeTab === 'users' && (
          <>
            {usersLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={GRADIENT_CONFIG.colors[0]} />
                {usersRetryCount > 0 && (
                  <Text style={styles.retryText}>Retry attempt {usersRetryCount}/{3}</Text>
                )}
              </View>
            ) : usersError ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: textColor }]}>{usersError}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={refetchUsers}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : users.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={50} color={GRADIENT_CONFIG.colors[0]} />
                <Text style={[styles.emptyText, { color: textColor }]}>No users found</Text>
              </View>
            ) : (
              <FlatList
                data={users}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                contentContainerStyle={styles.gridContainer}
                showsVerticalScrollIndicator={false}
                onRefresh={refetchUsers}
                refreshing={usersLoading}
              />
            )}
          </>
        )}

        {/* Looks Tab Content */}
        {activeTab === 'looks' && (
          <>
            {looksLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={GRADIENT_CONFIG.colors[0]} />
                {looksRetryCount > 0 && (
                  <Text style={styles.retryText}>Retry attempt {looksRetryCount}/{3}</Text>
                )}
              </View>
            ) : looksError ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: textColor }]}>{looksError}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={refetchLooks}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : looks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="images-outline" size={50} color={GRADIENT_CONFIG.colors[0]} />
                <Text style={[styles.emptyText, { color: textColor }]}>No looks found</Text>
              </View>
            ) : (
              <FlatList
                data={looks}
                renderItem={renderLookItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.gridContainer}
                showsVerticalScrollIndicator={false}
                onRefresh={refetchLooks}
                refreshing={looksLoading}
              />
            )}
          </>
        )}
      </View>
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
  logo: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 8,
  },
  // Tab Bar Styles
  tabBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tabItem: {
    marginRight: 20,
    paddingVertical: 8,
  },
  activeTabGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Content Styles
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  gridContainer: {
    paddingBottom: 16,
  },
  // User Item Styles
  userItem: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  userAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  userAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  userName: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Look Item Styles
  lookItem: {
    marginBottom: 20,
    marginHorizontal: 8,
  },
  lookImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  lookTitle: {
    fontSize: 14,
    marginTop: 8,
  },
  // State Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: GRADIENT_CONFIG.colors[0],
    borderRadius: 20,
  },
  retryText: {
    color: '#fff',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
  },
});

