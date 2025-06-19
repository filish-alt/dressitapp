import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BRAND } from '../../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Follower {
  id: string;
  name: string;
  username: string;
  profileImage: string | null;
  isFollowing: boolean;
}

const FollowersScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [followers, setFollowers] = React.useState<Follower[]>(
    Array(20).fill(null).map((_, i) => ({
      id: String(i + 1),
      name: `User ${i + 1}`,
      username: `user${i + 1}`,
      profileImage: null,
      isFollowing: Math.random() > 0.5
    }))
  );

  const renderItem = ({ item }: { item: Follower }) => (
    <TouchableOpacity 
      style={styles.followerItem}
      onPress={() => router.push(`/profile/${item.id}`)}
    >
      {item.profileImage ? (
        <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="person" size={20} color="#ccc" />
        </View>
      )}
      <View style={styles.followerInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
      <TouchableOpacity 
        style={[
          styles.followButton,
          item.isFollowing && styles.followingButton
        ]}
        onPress={() => {
          // Toggle follow status
          const newFollowers = [...followers];
          const index = newFollowers.findIndex(f => f.id === item.id);
          newFollowers[index] = {
            ...newFollowers[index],
            isFollowing: !newFollowers[index].isFollowing
          };
          setFollowers(newFollowers);
        }}
      >
        <Text style={[
          styles.followButtonText,
          item.isFollowing && styles.followingButtonText
        ]}>
          {item.isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={BRAND} />
        </TouchableOpacity>
        <Text style={styles.title}>Followers</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={followers}
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
  followerItem: {
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
  followerInfo: {
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
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: BRAND,
    marginLeft: 12,
  },
  followingButton: {
    backgroundColor: '#f0f0f0',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  followingButtonText: {
    color: BRAND,
  },
});

export default FollowersScreen;

