import React, { useState } from 'react';
import { 
  FlatList, 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView, 
  StatusBar,
  Dimensions
} from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import ClothingImage from '@/components/ClothingImage';
import { useRecommendation } from '../context/RecommendationContext';
import { LinearGradient } from 'expo-linear-gradient';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ExploreScreen() {
  const { clothingData, isLoading, likedItems } = useRecommendation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <LinearGradient
          colors={['#f8f8f8', '#e1e1e1', '#f8f8f8']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#4a80f5" />
          <ThemedText style={styles.loadingText}>Loading clothing items...</ThemedText>
        </LinearGradient>
      </ThemedView>
    );
  }
  
  // Get unique categories and ensure 'all' is first
  const categories = ['all', ...Array.from(new Set(clothingData.map(item => item.category || 'other').filter(Boolean)))];
  
  // Filter items based on selected category
  const filteredItems = selectedCategory === 'all' 
    ? clothingData 
    : clothingData.filter(item => item.category === selectedCategory || 
        (selectedCategory === 'other' && (!item.category || item.category === 'other')));
  
  // Get liked items
  const userLikes = clothingData.filter(item => likedItems.includes(item.id));
  
  // Get category color for visual cues
  const getCategoryColor = (category) => {
    const colors = {
      tops: '#2980b9',
      bottoms: '#e74c3c',
      dresses: '#8e44ad',
      activewear: '#27ae60',
      outerwear: '#d35400',
      swimwear: '#16a085',
      accessories: '#34495e',
      other: '#7f8c8d',
      all: '#4a80f5'
    };
    return colors[category?.toLowerCase()] || colors.other;
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Discover</ThemedText>
        
        {/* Categories filter */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.categoryTab, 
                selectedCategory === item && styles.selectedCategory,
                { borderColor: getCategoryColor(item) }
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              {selectedCategory === item ? (
                <LinearGradient
                  colors={[getCategoryColor(item), shadeColor(getCategoryColor(item), -20)]}
                  style={styles.selectedGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <ThemedText style={styles.selectedCategoryText}>
                    {capitalizeFirstLetter(item)}
                  </ThemedText>
                </LinearGradient>
              ) : (
                <ThemedText style={[styles.categoryText, { color: getCategoryColor(item) }]}>
                  {capitalizeFirstLetter(item)}
                </ThemedText>
              )}
            </TouchableOpacity>
          )}
          style={styles.categoryList}
          contentContainerStyle={styles.categoryListContent}
        />
        
        {/* Show liked items section if any */}
        {userLikes.length > 0 && selectedCategory === 'all' && (
          <View style={styles.likesSection}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.subtitle}>Your Favorites</ThemedText>
              <TouchableOpacity>
                <ThemedText style={styles.viewAllText}>View All</ThemedText>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={userLikes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.likeItemContainer}>
                  <ClothingImage 
                    imageUrl={item.image_url}
                    category={item.category}
                    style={styles.likeItemImage}
                    resizeMode="cover" 
                  />
                  <ThemedText numberOfLines={1} style={styles.likeItemName}>
                    {item.name || 'Unknown item'}
                  </ThemedText>
                  <ThemedText style={styles.likeBrand}>
                    {item.brand || ''}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
        
        {/* Section title for main grid */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.subtitle}>
            {selectedCategory === 'all' ? 'All Items' : capitalizeFirstLetter(selectedCategory)}
          </ThemedText>
          <TouchableOpacity>
            <ThemedText style={styles.sortText}>Sort</ThemedText>
          </TouchableOpacity>
        </View>
        
        {/* Main grid of items */}
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.itemContainer}>
              <View style={styles.itemImageContainer}>
                <ClothingImage 
                  imageUrl={item.image_url}
                  category={item.category}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                {likedItems.includes(item.id) && (
                  <View style={styles.likedBadge}>
                    <LinearGradient
                      colors={['#FF6B6B', '#FF2442']}
                      style={styles.likedGradient}
                    >
                      <ThemedText style={styles.likedText}>❤️</ThemedText>
                    </LinearGradient>
                  </View>
                )}
              </View>
              <View style={styles.itemInfo}>
                <ThemedText numberOfLines={1} style={styles.itemName}>{item.name || 'Unknown item'}</ThemedText>
                <ThemedText style={styles.itemBrand}>{item.brand || 'Unknown brand'}</ThemedText>
                <ThemedText style={styles.itemPrice}>
                  {item.price ? `$${item.price}` : 'Price unavailable'}
                </ThemedText>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

// Helper functions
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Shade a hex color (positive percent lightens, negative darkens)
const shadeColor = (hex, percent) => {
  const f = parseInt(hex.slice(1), 16);
  const t = percent < 0 ? 0 : 255;
  const p = percent < 0 ? percent * -1 : percent;
  const R = f >> 16;
  const G = f >> 8 & 0x00FF;
  const B = f & 0x0000FF;
  return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + 
    (Math.round((t - G) * p) + G) * 0x100 + 
    (Math.round((t - B) * p) + B)).toString(16).slice(1);
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  title: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllText: {
    color: '#4a80f5',
    fontWeight: '500',
  },
  sortText: {
    color: '#4a80f5',
    fontWeight: '500',
  },
  categoryList: {
    marginBottom: 10,
  },
  categoryListContent: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  selectedCategory: {
    borderWidth: 0,
    shadowColor: '#4a80f5',
    shadowOffset: { width: 0, y: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedGradient: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  likesSection: {
    marginBottom: 5,
  },
  likeItemContainer: {
    width: 130,
    marginRight: 14,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
    marginBottom: 5,
  },
  likeItemImage: {
    width: 130,
    height: 160,
    borderRadius: 10,
  },
  likeItemName: {
    fontSize: 13,
    marginTop: 8,
    paddingHorizontal: 8,
    fontWeight: '500',
  },
  likeBrand: {
    fontSize: 12,
    opacity: 0.7,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  listContent: {
    padding: 10,
    paddingBottom: 40,
  },
  itemContainer: {
    flex: 1,
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  itemImageContainer: {
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  itemInfo: {
    padding: 12,
  },
  itemName: {
    fontWeight: '500',
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  itemPrice: {
    fontWeight: 'bold',
    marginTop: 4,
    color: '#2e8b57',
  },
  likedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
  },
  likedGradient: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likedText: {
    fontSize: 14,
  },
});