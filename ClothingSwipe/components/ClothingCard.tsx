import React from 'react';
import { StyleSheet, Dimensions, View, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import ClothingImage from './ClothingImage';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface CardProps {
  item: {
    id: string;
    name: string;
    image_url?: string;
    brand: string;
    price: number;
    category?: string;
    subcategory?: string;
    color?: string;
    style?: string;
    price_range?: string;
    fit?: string;
  };
}

const ClothingCard = ({ item }: CardProps) => {
  // Format price if available
  const priceDisplay = item.price ? `$${item.price}` : 'Price unavailable';
  
  // Get category color for accent
  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'tops': return Colors.light.primary;
      case 'bottoms': return Colors.light.secondary;
      case 'dresses': return Colors.light.accent;
      case 'activewear': return Colors.light.success;
      case 'outerwear': return Colors.light.warning;
      default: return Colors.light.primary;
    }
  };

  return (
    <View style={styles.card}>
      <ClothingImage
        imageUrl={item.image_url}
        category={item.category}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Modern gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
        style={styles.gradientOverlay}
      />

      {/* Enhanced info overlay */}
      <View style={styles.overlay}>
        <View style={styles.infoContainer}>
          {/* Category badge */}
          {item.category && (
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
              <ThemedText style={styles.categoryText}>{item.category.toUpperCase()}</ThemedText>
            </View>
          )}
          
          <ThemedText style={styles.name}>{item.name || 'Unknown item'}</ThemedText>
          <ThemedText style={styles.brand}>{item.brand || 'Unknown brand'}</ThemedText>
          
          {/* Price with modern styling */}
          <View style={styles.priceContainer}>
            <ThemedText style={styles.price}>{priceDisplay}</ThemedText>
            {item.style && (
              <ThemedText style={styles.style}>{item.style}</ThemedText>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH * 0.95,
    height: SCREEN_HEIGHT * 0.8,
    borderRadius: 24,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 100, // Add space for buttons
  },
  infoContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 0, // Remove bottom margin to prevent overlap
    backdropFilter: 'blur(10px)',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: 'white',
    marginBottom: 6,
    lineHeight: 32,
  },
  brand: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.success,
  },
  style: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    textTransform: 'capitalize',
  },
});

export default ClothingCard;