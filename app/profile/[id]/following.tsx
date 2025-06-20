import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BRAND } from '../../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientButton from '@/components/GradientButton';

interface Following {
  id: string;
  name: string;
  username: string;
  profileImage: string | null;
  isFollowing: boolean;
  isLoading?: boolean;
}

const FollowingScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [following, setFollowing] = useState<Following[]>(
    Array(20).fill(null).map((_, i) => ({
      id: String(i + 1),
      name: `User ${i + 1}`,
      username: `user${i + 1}`,
      profileImage: null,
      isFollowing: true
    }))
  );
  
  const handleFollowToggle = async (itemId: string) => {
    // Set loading state for this specific item
    setLoadingStates(prev => ({ ...prev, [itemId]: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Toggle follow status
      const newFollowing = [...following];
      const index = newFollowing.findIndex(f => f.id === itemId);
      newFollowing[index] = {
        ...newFollowing[index],
        isFollowing: !newFollowing[index].isFollowing
      };
      setFollowing(newFollowing);
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const renderItem = ({ item }: { item: Following }) => (
    <TouchableOpacity 
      style={styles.followingItem}
      onPress={() => router.push(`/profile/${item.id}`)}
    >
      {item.profileImage ? (
        <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="person" size={20} color="#ccc" />
        </View>
      )}
      <View style={styles.followingInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
      <GradientButton
        title={item.isFollowing ? 'Following' : 'Follow'}
        onPress={() => handleFollowToggle(item.id)}
        loading={loadingStates[item.id]}
        style={styles.followButton}
        textStyle={styles.followButtonText}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={BRAND} />
        </TouchableOpacity>
        <Text style={styles.title}>Following</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={following}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
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
  listContent: {
    padding: 16,
  },
  followingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  placeholderImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: BRAND,
  },
  username: {
    fontSize: 12,
    color: '#687076',
    marginTop: 2,
  },
  followButton: {
    marginLeft: 12,
    minWidth: 90,
  },
  followButtonText: {
    fontSize: 12,
  },
});

export default FollowingScreen;

