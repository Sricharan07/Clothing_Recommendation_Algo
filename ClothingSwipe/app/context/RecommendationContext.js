import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RecommendationEngine from '../../recommendation_engine';
import DataLoader from '../utils/DataLoader';

// Create the context
const RecommendationContext = createContext();

// Context Provider component
export function RecommendationProvider({ children }) {
  const [clothingData, setClothingData] = useState([]);
  const [recommendationEngine, setRecommendationEngine] = useState(null);
  const [currentItems, setCurrentItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState([]);

  // Configuration
  const BATCH_SIZE = 10;

  // Load data on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        console.log('[CONTEXT] Starting data fetch process');

        // Load clothing data
        const data = await DataLoader.loadClothingData();
        console.log(`[CONTEXT] Loaded ${data.length} clothing items`);

        if (!data || data.length === 0) {
          console.error('[CONTEXT] No clothing data loaded, cannot continue');
          setIsLoading(false);
          return;
        }

        setClothingData(data);

        // Initialize recommendation engine
        const engine = new RecommendationEngine(data);
        setRecommendationEngine(engine);

        // Load saved state
        await loadSavedState(engine);

        // Get initial recommendations
        const initialRecs = engine.getRecommendations(BATCH_SIZE);
        console.log(`[CONTEXT] Generated ${initialRecs.length} initial recommendations`);

        setCurrentItems(initialRecs);
        setIsLoading(false);
        console.log('[CONTEXT] Initialization completed successfully');
      } catch (error) {
        console.error('[CONTEXT] Error in data loading:', error);
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Load saved state from AsyncStorage
  const loadSavedState = async (engine) => {
    try {
      console.log(`[CONTEXT] Loading saved state from AsyncStorage`);

      // Load wishlist items
      const savedWishlistItems = await AsyncStorage.getItem('wishlistItems');
      if (savedWishlistItems) {
        const wishlist = JSON.parse(savedWishlistItems);
        console.log(`[CONTEXT] Found ${wishlist.length} saved wishlist items`);
        setWishlistItems(wishlist);

        // Set engine wishlist state
        const wishlistIds = wishlist.map(item => item.id);
        engine.wishlistItems = [...wishlistIds];
      } else {
        console.log(`[CONTEXT] No saved wishlist found`);
        setWishlistItems([]);
        engine.wishlistItems = [];
      }

      // Load engine state
      const savedEngineState = await AsyncStorage.getItem('engineState');
      if (savedEngineState) {
        const engineState = JSON.parse(savedEngineState);
        console.log(`[CONTEXT] Restoring engine state`);
        engine.restoreState(engineState);
      } else {
        console.log(`[CONTEXT] No saved engine state found`);
      }

      console.log('[CONTEXT] State loaded and synchronized successfully');
    } catch (error) {
      console.error('[CONTEXT] Error loading saved state:', error);
      console.log('[CONTEXT] Starting with fresh state');
      setWishlistItems([]);
    }
  };

  // Save state to AsyncStorage
  const saveState = async () => {
    try {
      // Save wishlist items
      await AsyncStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
      console.log(`[CONTEXT] Saved ${wishlistItems.length} wishlist items`);

      // Save engine state if available
      if (recommendationEngine) {
        const engineState = recommendationEngine.getStateForSaving();
        await AsyncStorage.setItem('engineState', JSON.stringify(engineState));
        console.log(`[CONTEXT] Saved engine state`);
      }
    } catch (error) {
      console.error('[CONTEXT] Error saving state:', error);
    }
  };

  // Auto-save state when wishlist changes
  useEffect(() => {
    if (wishlistItems.length === 0 && !recommendationEngine) {
      return; // Skip initial empty state
    }

    console.log(`[CONTEXT] Wishlist changed - scheduling save (${wishlistItems.length} items)`);

    const timeoutId = setTimeout(saveState, 500);
    return () => clearTimeout(timeoutId);
  }, [wishlistItems, recommendationEngine]);

  // Handle when user likes an item (right swipe)
  const handleLike = (item) => {
    if (!recommendationEngine || !item) {
      console.log(`[CONTEXT] handleLike called but missing engine or item`);
      return;
    }

    console.log(`[CONTEXT] User liked item: ${item.name} (${item.id})`);

    // Add to engine's wishlist
    recommendationEngine.addToWishlist(item.id);

    // Add to UI wishlist state
    const wishlistItem = { ...item, dateAdded: new Date().toISOString() };

    setWishlistItems(prev => {
      // Check for duplicates
      const exists = prev.some(existingItem => existingItem.id === item.id);
      if (exists) {
        console.log(`[CONTEXT] Item ${item.id} already exists in wishlist, skipping`);
        return prev;
      }

      const newWishlist = [...prev, wishlistItem];
      console.log(`[CONTEXT] Added ${item.id} to wishlist - new count: ${newWishlist.length}`);
      return newWishlist;
    });

    // Process swipe in engine
    recommendationEngine.processSwipe();

    console.log(`[CONTEXT] Like processing complete for ${item.id}`);
  };

  // Handle when user dislikes an item (left swipe)
  const handleDislike = (item) => {
    if (!recommendationEngine || !item) return;

    console.log(`[CONTEXT] User disliked item: ${item.name} (${item.id})`);

    // Add to engine's dislike system
    recommendationEngine.addToDislike(item.id);

    // Process swipe in engine
    recommendationEngine.processSwipe();

    console.log(`[CONTEXT] Dislike processing complete for ${item.id}`);
  };

  // Load more items if we're running low
  const loadMoreIfNeeded = (currentIndex = 0) => {
    if (!recommendationEngine) {
      console.log('[CONTEXT] loadMoreIfNeeded: No recommendation engine available');
      return;
    }

    const remainingItems = Math.max(0, currentItems.length - currentIndex - 1);
    const threshold = Math.max(3, BATCH_SIZE / 2);

    console.log(`[CONTEXT] loadMoreIfNeeded: CurrentIndex: ${currentIndex}, Total items: ${currentItems.length}, Remaining: ${remainingItems}, Threshold: ${threshold}`);

    // Load more when we're getting close to the end
    if (remainingItems <= threshold) {
      console.log(`[CONTEXT] Loading more items - only ${remainingItems} remaining after current index ${currentIndex}`);

      try {
        // Get more recommendations
        const newItems = recommendationEngine.getRecommendations(BATCH_SIZE);

        if (newItems && newItems.length > 0) {
          setCurrentItems(prevItems => {
            const updatedItems = [...prevItems, ...newItems];
            console.log(`[CONTEXT] Added ${newItems.length} new items, total now: ${updatedItems.length}`);
            return updatedItems;
          });
        } else {
          console.log('[CONTEXT] No new items returned from engine');
        }
      } catch (error) {
        console.error('[CONTEXT] Error loading more items:', error);
      }
    } else {
      console.log(`[CONTEXT] Still have ${remainingItems} items remaining, not loading more yet`);
    }
  };

  // Load fresh recommendations
  const loadNewRecommendations = () => {
    if (!recommendationEngine) {
      console.log('[CONTEXT] loadNewRecommendations: No recommendation engine available');
      return;
    }

    try {
      // Reset shown items for fresh content
      recommendationEngine.resetUsedItems();

      // Get fresh recommendations
      const newItems = recommendationEngine.getRecommendations(BATCH_SIZE);

      if (newItems && newItems.length > 0) {
        setCurrentItems(newItems);
        console.log(`[CONTEXT] Loaded ${newItems.length} fresh recommendations`);
      }
    } catch (error) {
      console.error('[CONTEXT] Error loading fresh recommendations:', error);
    }
  };

  // Clear all preferences and start fresh
  const clearAllPreferences = async () => {
    if (!recommendationEngine) return;

    try {
      // Clear AsyncStorage
      await AsyncStorage.multiRemove(['wishlistItems', 'engineState']);
      console.log('[CONTEXT] Cleared all stored data');

      // Reset wishlist
      setWishlistItems([]);

      // Reset engine to fresh state
      recommendationEngine.wishlistItems = [];
      recommendationEngine.firstTimeDislikes = [];
      recommendationEngine.permanentDislikes = [];
      recommendationEngine.shownItems = [];
      recommendationEngine.totalSwipes = 0;

      // Get fresh recommendations
      const freshItems = recommendationEngine.getRecommendations(BATCH_SIZE);
      setCurrentItems(freshItems);

      console.log('[CONTEXT] All preferences cleared - starting fresh');
    } catch (error) {
      console.error('[CONTEXT] Error clearing preferences:', error);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (itemId) => {
    console.log(`[CONTEXT] Removing ${itemId} from wishlist`);

    // Remove from UI state
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));

    // Remove from engine
    if (recommendationEngine) {
      recommendationEngine.wishlistItems = recommendationEngine.wishlistItems.filter(id => id !== itemId);
    }

    console.log(`[CONTEXT] Item ${itemId} removed from wishlist`);
  };

  // Value to be provided by the context
  const value = {
    clothingData,
    currentItems,
    isLoading,
    wishlistItems,
    handleLike,
    handleDislike,
    removeFromWishlist,
    loadNewRecommendations,
    clearAllPreferences,
    loadMoreIfNeeded,
  };

  return (
    <RecommendationContext.Provider value={value}>
      {children}
    </RecommendationContext.Provider>
  );
}

// Custom hook to use the recommendation context
export function useRecommendation() {
  return useContext(RecommendationContext);
}

export default RecommendationContext;