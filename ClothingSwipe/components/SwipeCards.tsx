import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Text,
} from 'react-native';
import ClothingCard from './ClothingCard';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface SwipeCardsProps {
  data: Array<{
    id: string;
    name: string;
    image_url?: string;
    brand: string;
    category?: string;
    price: number;
    style?: string;
    color?: string;
    price_range?: string;
    fit?: string;
    subcategory?: string;
  }>;
  onSwipeLeft: (item: any) => void;
  onSwipeRight: (item: any) => void;
  onRefresh?: () => void;
  onClearPreferences?: () => void;
  loadMoreIfNeeded?: (currentIndex: number) => void;
}

const SwipeCards = ({ data, onSwipeLeft, onSwipeRight, onRefresh, onClearPreferences, loadMoreIfNeeded }: SwipeCardsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleLike = () => {
    const item = data[currentIndex];
    console.log('Liked:', item.name);
    onSwipeRight(item);
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);

    // Load more items if needed
    if (loadMoreIfNeeded) {
      loadMoreIfNeeded(newIndex);
    }
  };

  const handleDislike = () => {
    const item = data[currentIndex];
    console.log('Disliked:', item.name);
    onSwipeLeft(item);
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);

    // Load more items if needed
    if (loadMoreIfNeeded) {
      loadMoreIfNeeded(newIndex);
    }
  };

  if (!data || data.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No data available</ThemedText>
      </ThemedView>
    );
  }

  if (currentIndex >= data.length) {
    return (
      <ThemedView style={styles.endContainer}>
        <ThemedText style={styles.endText}>🎉 All Done!</ThemedText>
        <ThemedText style={styles.subtitle}>
          You've seen all {data.length} items
        </ThemedText>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            setCurrentIndex(0);
            if (onRefresh) {
              onRefresh();
            }
          }}
        >
          <ThemedText style={styles.resetButtonText}>Refresh Recommendations</ThemedText>
        </TouchableOpacity>

        {onClearPreferences && (
          <TouchableOpacity
            style={[styles.resetButton, { backgroundColor: '#FF5458', marginTop: 15 }]}
            onPress={() => {
              setCurrentIndex(0);
              onClearPreferences();
            }}
          >
            <ThemedText style={styles.resetButtonText}>Clear All Preferences</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    );
  }

  const currentItem = data[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        {/* Next card preview */}
        {currentIndex + 1 < data.length && (
          <View style={[styles.card, styles.nextCard]}>
            <ClothingCard item={data[currentIndex + 1]} />
          </View>
        )}

        {/* Current card */}
        <View style={[styles.card, styles.currentCard]}>
          <ClothingCard item={currentItem} />
        </View>

        {/* Action buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.dislikeButton]}
            onPress={handleDislike}
          >
            <Text style={styles.dislikeButtonText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.itemInfo}>
            <ThemedText style={styles.itemCounter}>
              {currentIndex + 1} / {data.length}
            </ThemedText>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={handleLike}
          >
            <Text style={styles.likeButtonText}>♥</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.8,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '85%',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  currentCard: {
    zIndex: 2,
  },
  nextCard: {
    zIndex: 1,
    opacity: 0.7,
    transform: [{ scale: 0.95 }, { translateY: 10 }],
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 3,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dislikeButton: {
    backgroundColor: '#FF5458',
  },
  likeButton: {
    backgroundColor: '#4CD964',
  },
  dislikeButtonText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  likeButtonText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  itemInfo: {
    alignItems: 'center',
  },
  itemCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  endContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f5f5f5',
  },
  endText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#4CD964',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SwipeCards;