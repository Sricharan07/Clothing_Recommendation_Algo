import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  View,
  TouchableOpacity,
  Easing
} from 'react-native';
import ClothingCard from './ClothingCard';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { LinearGradient } from 'expo-linear-gradient';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

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
  const position = useRef(new Animated.ValueXY()).current;
  const [isCardMoving, setIsCardMoving] = useState(false);
  const [preloadedIndices, setPreloadedIndices] = useState<number[]>([]);
  const currentIndexRef = useRef(0);

  // Track currentIndex changes and load more if needed
  useEffect(() => {
    currentIndexRef.current = currentIndex;
    console.log(`[SWIPE] currentIndex state changed to: ${currentIndex}`);

    // Call loadMoreIfNeeded when index changes
    if (loadMoreIfNeeded && currentIndex > 0) {
      loadMoreIfNeeded(currentIndex);
    }
  }, [currentIndex, loadMoreIfNeeded]);
  
  // Reset currentIndex when data changes (but preserve progress if possible)
  useEffect(() => {
    // Only reset if we're at the end of the current data or if data actually changed significantly
    if (currentIndex >= data.length || data.length === 0) {
      console.log(`[SWIPE] Data changed - length: ${data.length}, resetting currentIndex to 0`);
      setCurrentIndex(0);
      setIsCardMoving(false);
      position.setValue({ x: 0, y: 0 });
    } else {
      console.log(`[SWIPE] Data changed but preserving currentIndex: ${currentIndex}/${data.length}`);
    }
  }, [data.length]);

  // Debug: Log data changes
  useEffect(() => {
    console.log(`[SWIPE] Data prop changed - ${data.length} items`);
    if (data.length > 0) {
      console.log(`[SWIPE] First item: ${data[0]?.name} (${data[0]?.id})`);
      console.log(`[SWIPE] Data items:`, data.slice(0, 3).map((item, idx) => `${idx}: ${item.name} (${item.id})`));
    }
  }, [data]);

  // Debug: Log when component renders
  useEffect(() => {
    console.log(`[SWIPE] SwipeCards render - currentIndex: ${currentIndex}, data.length: ${data.length}, isCardMoving: ${isCardMoving}`);
  });

  // Preload next few cards
  useEffect(() => {
    const indicesToPreload = [];
    for (let i = currentIndex; i < currentIndex + 5 && i < data.length; i++) {
      indicesToPreload.push(i);
    }
    setPreloadedIndices(indicesToPreload);
  }, [currentIndex, data.length]);
  
  const rotation = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  // Like/dislike opacity based on swipe distance
  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const dislikeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Next card animation
  const nextCardOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.8, 1],
    extrapolate: 'clamp',
  });

  const nextCardScale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.9, 1],
    extrapolate: 'clamp',
  });
  
  // Card position animation for next card
  const nextCardTranslateY = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [0, 10, 0],
    extrapolate: 'clamp',
  });

  // Handle swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gesture) => {
        // Only respond to horizontal gestures with minimum movement
        return Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy * 2);
      },
      onPanResponderGrant: () => {
        setIsCardMoving(true);
      },
      onPanResponderMove: (evt, gesture) => {
        // Only track horizontal movement to avoid conflicts with vertical scrolling
        position.setValue({ x: gesture.dx, y: gesture.dy * 0.2 }); // Allow some vertical movement for better UX
      },
      onPanResponderRelease: (evt, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction: 'right' | 'left') => {
    console.log(`[SWIPE] Force swipe: ${direction} initiated`);
    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease),
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'right' | 'left') => {
    const item = data[currentIndex];

    // Safety check to ensure item exists
    if (!item) {
      console.error(`[SWIPE] No item found at index ${currentIndex}, data length: ${data.length}`);
      return;
    }

    console.log(`[SWIPE] Swipe complete: ${direction} for item ${item.name} (${item.id}) at index ${currentIndex}`);

    if (direction === 'right') {
      console.log(`[SWIPE] Calling onSwipeRight for ${item.id}`);
      onSwipeRight(item);
    } else {
      console.log(`[SWIPE] Calling onSwipeLeft for ${item.id}`);
      onSwipeLeft(item);
    }

    // Reset position with a slight delay to allow for smooth transition
    setTimeout(() => {
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex + 1;
        console.log(`[SWIPE] Incrementing currentIndex from ${prevIndex} to ${newIndex} (ref was: ${currentIndexRef.current})`);

        // Always allow progression - loadMoreIfNeeded will handle loading new items
        if (newIndex >= data.length) {
          console.log(`[SWIPE] Reached end of current data (${data.length} items), advancing to trigger loading`);
        } else {
          // Check what item we're moving to
          const nextItem = data[newIndex];
          console.log(`[SWIPE] Moving to next item: ${nextItem?.name} (${nextItem?.id})`);
        }

        return newIndex;
      });
      setIsCardMoving(false);
    }, 100);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      friction: 5,
      tension: 40,
    }).start(() => {
      setIsCardMoving(false);
    });
  };
  

  const renderCards = () => {
    if (currentIndex >= data.length) {
      return (
        <ThemedView style={styles.endCardsContainer}>
          <LinearGradient
            colors={['#f5f5f5', '#e1e1e1', '#f5f5f5']}
            style={styles.endCardGradient}
          >
            <ThemedText type="title" style={styles.endCardsTitle}>No more items!</ThemedText>
            <ThemedText style={styles.endCardsSubtitle}>
              You've seen all the clothing items.
            </ThemedText>
            <View style={styles.endCardsEmoji}>
              <ThemedText style={{fontSize: 50}}>👕👖👗</ThemedText>
            </View>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => {
                // Reset current index and call refresh callback
                setCurrentIndex(0);
                if (onRefresh) {
                  onRefresh();
                }
              }}
            >
              <LinearGradient
                colors={['#4a80f5', '#1a56e8']}
                style={styles.refreshGradient}
              >
                <ThemedText style={styles.refreshText}>Discover More</ThemedText>
              </LinearGradient>
            </TouchableOpacity>

            {onClearPreferences && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  // Reset current index and call clear preferences callback
                  setCurrentIndex(0);
                  if (onClearPreferences) {
                    onClearPreferences();
                  }
                }}
              >
                <LinearGradient
                  colors={['#ff6b6b', '#ee5a5a']}
                  style={styles.clearGradient}
                >
                  <ThemedText style={styles.clearText}>Clear All & Start Fresh</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </ThemedView>
      );
    }

    // Safety check for data array
    if (!data || data.length === 0) {
      return null;
    }

    return data
      .map((item, i) => {
        // Safety check for item
        if (!item || i < currentIndex) return null;

        // Only render cards that need to be visible or preloaded
        if (!preloadedIndices.includes(i)) return null;

        if (i === currentIndex) {
          return (
            <Animated.View
              key={item.id}
              style={[
                styles.cardContainer,
                {
                  transform: [
                    { translateX: position.x },
                    { translateY: position.y },
                    { rotate: rotation },
                  ],
                  zIndex: 999, // Always on top
                },
              ]}
              {...panResponder.panHandlers}
            >
              <Animated.View style={[styles.likeContainer, { opacity: likeOpacity }]}>
                <ThemedText type="subtitle" style={styles.likeText}>LIKE</ThemedText>
              </Animated.View>
              <Animated.View style={[styles.dislikeContainer, { opacity: dislikeOpacity }]}>
                <ThemedText type="subtitle" style={styles.dislikeText}>NOPE</ThemedText>
              </Animated.View>
              <ClothingCard item={item} />
            </Animated.View>
          );
        }

        // Show the next 2 cards with scaling effect
        if (i === currentIndex + 1) {
          return (
            <Animated.View
              key={item.id}
              style={[
                styles.cardContainer,
                {
                  opacity: nextCardOpacity,
                  transform: [
                    { scale: nextCardScale },
                    { translateY: nextCardTranslateY },
                  ],
                  zIndex: 998,
                },
              ]}
            >
              <ClothingCard item={item} />
            </Animated.View>
          );
        }
        
        // Additional cards with decreasing opacity and scale
        const cardIndex = i - currentIndex;
        const opacity = Math.max(0.2, 0.8 - (cardIndex - 1) * 0.2);
        const scale = Math.max(0.8, 0.95 - (cardIndex - 1) * 0.05);
        const translateY = 10 * cardIndex;
        
        return (
          <Animated.View
            key={item.id}
            style={[
              styles.cardContainer,
              {
                opacity,
                transform: [
                  { scale },
                  { translateY },
                ],
                zIndex: 990 - cardIndex,
              },
            ]}
          >
            <ClothingCard item={item} />
          </Animated.View>
        );
      })
      .reverse();
  };

  return (
    <View style={styles.container}>
      {renderCards()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  cardContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.95,
    height: SCREEN_HEIGHT * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endCardsContainer: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  endCardGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  endCardsTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  endCardsSubtitle: {
    marginTop: 15,
    opacity: 0.7,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  endCardsEmoji: {
    marginTop: 30,
    marginBottom: 30,
    padding: 20,
  },
  refreshButton: {
    width: 200,
    height: 55,
    borderRadius: 28,
    overflow: 'hidden',
    marginTop: 25,
    shadowColor: '#4a80f5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  refreshGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  clearButton: {
    width: 220,
    height: 55,
    borderRadius: 28,
    overflow: 'hidden',
    marginTop: 15,
    shadowColor: '#ff6b6b',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  clearGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  likeContainer: {
    position: 'absolute',
    top: 50,
    left: 40,
    zIndex: 10,
    transform: [{ rotate: '-30deg' }],
  },
  dislikeContainer: {
    position: 'absolute',
    top: 50,
    right: 40,
    zIndex: 10,
    transform: [{ rotate: '30deg' }],
  },
  likeText: {
    borderWidth: 3,
    borderColor: '#4CD964',
    color: '#4CD964',
    fontSize: 32,
    fontWeight: '800',
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
    shadowColor: '#4CD964',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  dislikeText: {
    borderWidth: 3,
    borderColor: '#FF3B30',
    color: '#FF3B30',
    fontSize: 32,
    fontWeight: '800',
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
    shadowColor: '#FF3B30',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});

export default SwipeCards;