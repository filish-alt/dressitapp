import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { BRAND } from '@/constants/Colors';

// Example category data
const categories = [
  { id: '1', name: 'Dresses', icon: 'shirt-outline' },
  { id: '2', name: 'Tops', icon: 'shirt-outline' },
  { id: '3', name: 'Bottoms', icon: 'grid-outline' },
  { id: '4', name: 'Shoes', icon: 'footsteps-outline' },
  { id: '5', name: 'Accessories', icon: 'watch-outline' },
  { id: '6', name: 'Outerwear', icon: 'storefront-outline' },
];

export default function SearchScreen() {
  const { colors } = useTheme();
  const backgroundColor = colors.background;
  const textColor = colors.text;
  const [searchQuery, setSearchQuery] = useState('');

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={styles.categoryIconContainer}>
        <Ionicons name={item.icon} size={24} color={BRAND} />
      </View>
      <Text style={[styles.categoryName, { color: textColor }]}>{item.name}</Text>
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

      {/* Categories Section */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Categories</Text>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.categoriesContainer}
        />
      </View>

      {/* Trending Section */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Trending</Text>
        <View style={styles.trendingContainer}>
          <TouchableOpacity style={styles.trendingItem}>
            <Text style={styles.trendingText}>#summerstyle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.trendingItem}>
            <Text style={styles.trendingText}>#casualchic</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.trendingItem}>
            <Text style={styles.trendingText}>#formalwear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.trendingItem}>
            <Text style={styles.trendingText}>#streetwear</Text>
          </TouchableOpacity>
        </View>
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
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingBottom: 16,
  },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  categoryIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    textAlign: 'center',
  },
  trendingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  trendingItem: {
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
  },
  trendingText: {
    color: BRAND,
    fontWeight: '500',
  },
});

