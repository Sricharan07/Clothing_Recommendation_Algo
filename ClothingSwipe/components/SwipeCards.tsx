import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Text,
  Animated,
  PanGestureHandler,
  State,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ClothingCard from './ClothingCard';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { Colors } from '../constants/theme';

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
  const [likeAnimation] = useState(new Animated.Value(0));
  const [dislikeAnimation] = useState(new Animated.Value(0));

  const handleLike = () => {
    const item = data[currentIndex];
    console.log('Liked:', item.name);
    
    // Animate like button
    Animated.sequence([
      Animated.timing(likeAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

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
    
    // Animate dislike button
    Animated.sequence([
      Animated.timing(dislikeAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(dislikeAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

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

        {/* Modern action buttons */}
        <View style={styles.buttonsContainer}>
          <Animated.View
            style={[
              styles.actionButtonWrapper,
              {
                transform: [
                  {
                    scale: dislikeAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.actionButton, styles.dislikeButton]}
              onPress={handleDislike}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.itemInfo}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${((currentIndex + 1) / data.length) * 100}%` }
                  ]} 
                />
              </View>
              <ThemedText style={styles.itemCounter}>
                {currentIndex + 1} / {data.length}
              </ThemedText>
            </View>
          </View>

          <Animated.View
            style={[
              styles.actionButtonWrapper,
              {
                transform: [
                  {
                    scale: likeAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.actionButton, styles.likeButton]}
              onPress={handleLike}
              activeOpacity={0.8}
            >
              <Ionicons name="heart" size={24} color="white" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.surface,
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
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  currentCard: {
    zIndex: 2,
  },
  nextCard: {
    zIndex: 1,
    opacity: 0.6,
    transform: [{ scale: 0.92 }, { translateY: 15 }],
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 0,
    zIndex: 3,
  },
  actionButtonWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dislikeButton: {
    backgroundColor: Colors.light.danger,
  },
  likeButton: {
    backgroundColor: Colors.light.success,
  },
  itemInfo: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 20,
  },
  progressContainer: {
    alignItems: 'center',
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
  itemCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  endContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.light.surface,
  },
  endText: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.light.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  resetButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default SwipeCards;