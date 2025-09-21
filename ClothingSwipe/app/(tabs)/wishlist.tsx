import React, { useEffect } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useRecommendation } from '../context/RecommendationContext';
import { LinearGradient } from 'expo-linear-gradient';
import ClothingImage from '@/components/ClothingImage';

export default function WishlistScreen() {
  const { wishlistItems, removeFromWishlist } = useRecommendation();

  console.log(`[Wishlist Screen] Displaying ${wishlistItems.length} wishlist items`);

  useEffect(() => {
    console.log(`[Wishlist Screen] Wishlist updated - now showing ${wishlistItems.length} items`);
  }, [wishlistItems]);

  // Handle item removal from wishlist
  const handleRemoveItem = (item) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromWishlist(item.id) }
      ]
    );
  };

  // Format price to display in a nice way
  const formatPrice = (price) => {
    if (!price) return 'Price not available';
    return `$${price.toFixed(2)}`;
  };

  // Render each item in the wishlist
  const renderWishlistItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <ClothingImage
            imageUrl={item.image_url}
            category={item.category}
            style={styles.image}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          />
        </View>
        <View style={styles.contentContainer}>
          <ThemedText type="subtitle" numberOfLines={1} style={styles.brand}>
            {item.brand}
          </ThemedText>
          <ThemedText type="subtitle" numberOfLines={2} style={styles.name}>
            {item.name}
          </ThemedText>
          <ThemedText style={styles.price}>
            {formatPrice(item.price)}
          </ThemedText>
          <View style={styles.tagsContainer}>
            {item.category && (
              <View style={styles.tag}>
                <ThemedText style={styles.tagText}>{item.category}</ThemedText>
              </View>
            )}
            {item.color && (
              <View style={[styles.tag, { backgroundColor: '#f0e6ff' }]}>
                <ThemedText style={styles.tagText}>{item.color}</ThemedText>
              </View>
            )}
            {item.style && (
              <View style={[styles.tag, { backgroundColor: '#fff0e6' }]}>
                <ThemedText style={styles.tagText}>{item.style}</ThemedText>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item)}
        >
          <ThemedText style={styles.removeButtonText}>×</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render empty state when wishlist is empty
  const renderEmptyState = () => (
    <ThemedView style={styles.emptyContainer}>
      <LinearGradient
        colors={['#f8f8f8', '#e1e1e1', '#f8f8f8']}
        style={styles.emptyGradient}
      >
        <View style={styles.emptyImageContainer}>
          <ThemedText style={styles.emptyIcon}>💕</ThemedText>
        </View>
        <ThemedText type="title" style={styles.emptyTitle}>
          Your wishlist is empty
        </ThemedText>
        <ThemedText style={styles.emptyText}>
          Items you like will appear here. Start swiping to build your wishlist based on your preferences!
        </ThemedText>
      </LinearGradient>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="dark" />
      <ThemedText type="title" style={styles.title}>
        My Wishlist ({wishlistItems.length} items)
      </ThemedText>
      <FlatList
        data={wishlistItems}
        renderItem={renderWishlistItem}
        keyExtractor={(item, index) => `${item.id || 'item'}-${index}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 20,
    color: '#333',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  itemContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    borderBottomLeftRadius: 12,
  },
  contentContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  brand: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4a80f5',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e6f7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#333',
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 8,
    right: 8,
  },
  removeButtonText: {
    fontSize: 20,
    color: '#999',
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  emptyGradient: {
    width: '100%',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
  },
  emptyImageContainer: {
    width: 120,
    height: 120,
    marginBottom: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 50,
  },
  emptyTitle: {
    fontSize: 22,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});