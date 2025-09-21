import React from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import ClothingImage from './ClothingImage';
import { LinearGradient } from 'expo-linear-gradient';

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

  return (
    <View style={styles.card}>
      <ClothingImage
        imageUrl={item.image_url}
        category={item.category}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Clean overlay with basic info - like Bumble/Tinder */}
      <View style={styles.overlay}>
        <View style={styles.infoContainer}>
          <ThemedText style={styles.name}>{item.name || 'Unknown item'}</ThemedText>
          <ThemedText style={styles.brand}>{item.brand || 'Unknown brand'}</ThemedText>
          <ThemedText style={styles.price}>{priceDisplay}</ThemedText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH * 0.95,
    height: SCREEN_HEIGHT * 0.8,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  infoContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 5,
  },
  brand: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
  },
});

export default ClothingCard;