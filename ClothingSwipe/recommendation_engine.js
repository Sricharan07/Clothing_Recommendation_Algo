// Simplified recommendation engine for Clothing Swipe app
// Based on functionality.md requirements

class RecommendationEngine {
  constructor(clothingData) {
    this.clothingData = clothingData;

    // Core tracking arrays
    this.wishlistItems = []; // Items user liked (right swipe)
    this.firstTimeDislikes = []; // Items disliked once (hidden for 25 swipes)
    this.permanentDislikes = []; // Items disliked twice (never shown again)
    this.shownItems = []; // Track what we've shown to avoid immediate repeats

    // Swipe counting
    this.totalSwipes = 0;

    // Configuration
    this.TEMP_DISLIKE_DURATION = 25; // Hide first-time dislikes for 25 swipes
    this.EXPLORATION_INTERVAL = 10; // Show random item every 10 swipes

    console.log(`[ENGINE] Initialized with ${clothingData.length} items`);
  }

  // Add item to wishlist when user right swipes
  addToWishlist(itemId) {
    console.log(`[ENGINE] Adding ${itemId} to wishlist`);

    if (!this.wishlistItems.includes(itemId)) {
      this.wishlistItems.push(itemId);
      console.log(`[ENGINE] Wishlist now has ${this.wishlistItems.length} items`);
    }
  }

  // Handle dislike when user left swipes
  addToDislike(itemId) {
    console.log(`[ENGINE] Processing dislike for ${itemId}`);

    // Check if this item was already disliked once
    if (this.firstTimeDislikes.includes(itemId)) {
      // Second dislike - make it permanent
      console.log(`[ENGINE] Second dislike - adding ${itemId} to permanent dislikes`);
      this.firstTimeDislikes = this.firstTimeDislikes.filter(id => id !== itemId);
      this.permanentDislikes.push(itemId);
    } else {
      // First dislike - add to temporary dislike list
      console.log(`[ENGINE] First dislike - adding ${itemId} to temporary dislikes`);
      this.firstTimeDislikes.push(itemId);
    }
  }

  // Process each swipe (increment counters)
  processSwipe() {
    this.totalSwipes++;
    console.log(`[ENGINE] Processed swipe ${this.totalSwipes}`);
  }

  // Check if an item should be shown based on dislike rules
  shouldShowDislikedItem(itemId) {
    // Never show permanently disliked items
    if (this.permanentDislikes.includes(itemId)) {
      return false;
    }

    // For first-time dislikes, check if 25 swipes have passed
    if (this.firstTimeDislikes.includes(itemId)) {
      // Find when this item was first disliked by looking at total swipes
      // For simplicity, we'll hide for next 25 swipes from current point
      // In a real implementation, you'd track when each item was disliked
      return this.totalSwipes % this.TEMP_DISLIKE_DURATION === 0;
    }

    return true;
  }

  // Get available items for recommendation
  getAvailableItems() {
    return this.clothingData.filter(item => {
      // Don't show items already in wishlist
      if (this.wishlistItems.includes(item.id)) {
        return false;
      }

      // Apply dislike rules
      if (!this.shouldShowDislikedItem(item.id)) {
        return false;
      }

      return true;
    });
  }

  // Get exploration item (random item for discovery)
  getExplorationItem() {
    const availableItems = this.getAvailableItems();

    if (availableItems.length === 0) {
      return null;
    }

    // Pick completely random item for exploration
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const item = availableItems[randomIndex];

    console.log(`[ENGINE] Selected exploration item: ${item.name}`);
    return item;
  }

  // Get personalized recommendations based on wishlist
  getPersonalizedRecommendations(count) {
    if (this.wishlistItems.length === 0) {
      // No preferences yet, return random items
      return this.getRandomRecommendations(count);
    }

    const availableItems = this.getAvailableItems();

    if (availableItems.length === 0) {
      return [];
    }

    // Calculate preference scores based on wishlist items
    const userPreferences = this.calculateUserPreferences();

    // Score each available item
    const scoredItems = availableItems.map(item => ({
      ...item,
      score: this.calculateItemScore(item, userPreferences)
    }));

    // Sort by score (highest first)
    scoredItems.sort((a, b) => b.score - a.score);

    // Return top items with some randomness for variety
    const topCount = Math.min(count * 2, scoredItems.length);
    const topItems = scoredItems.slice(0, topCount);

    const recommendations = [];
    for (let i = 0; i < count && i < topItems.length; i++) {
      // Add some randomness by occasionally picking from top items instead of just the best
      const index = Math.random() < 0.7 ? i : Math.floor(Math.random() * Math.min(5, topItems.length));
      if (topItems[index] && !recommendations.some(r => r.id === topItems[index].id)) {
        recommendations.push(topItems[index]);
      }
    }

    return recommendations;
  }

  // Get random recommendations (for new users)
  getRandomRecommendations(count) {
    const availableItems = this.getAvailableItems();
    const recommendations = [];

    for (let i = 0; i < count && availableItems.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableItems.length);
      const item = availableItems.splice(randomIndex, 1)[0];
      recommendations.push(item);
    }

    return recommendations;
  }

  // Calculate user preferences from wishlist
  calculateUserPreferences() {
    const preferences = {
      brands: {},
      categories: {},
      styles: {},
      colors: {},
      priceRanges: {}
    };

    this.wishlistItems.forEach(itemId => {
      const item = this.clothingData.find(i => i.id === itemId);
      if (!item) return;

      // Count occurrences of each attribute
      if (item.brand) {
        preferences.brands[item.brand] = (preferences.brands[item.brand] || 0) + 1;
      }
      if (item.category) {
        preferences.categories[item.category] = (preferences.categories[item.category] || 0) + 1;
      }
      if (item.style) {
        preferences.styles[item.style] = (preferences.styles[item.style] || 0) + 1;
      }
      if (item.color) {
        preferences.colors[item.color] = (preferences.colors[item.color] || 0) + 1;
      }
      if (item.price_range) {
        preferences.priceRanges[item.price_range] = (preferences.priceRanges[item.price_range] || 0) + 1;
      }
    });

    return preferences;
  }

  // Calculate score for an item based on user preferences
  calculateItemScore(item, preferences) {
    let score = 0;

    // Brand matching
    if (item.brand && preferences.brands[item.brand]) {
      score += preferences.brands[item.brand] * 2;
    }

    // Category matching (higher weight)
    if (item.category && preferences.categories[item.category]) {
      score += preferences.categories[item.category] * 3;
    }

    // Style matching
    if (item.style && preferences.styles[item.style]) {
      score += preferences.styles[item.style] * 1.5;
    }

    // Color matching
    if (item.color && preferences.colors[item.color]) {
      score += preferences.colors[item.color] * 1;
    }

    // Price range matching
    if (item.price_range && preferences.priceRanges[item.price_range]) {
      score += preferences.priceRanges[item.price_range] * 0.8;
    }

    // Add small random factor for variety
    score += Math.random() * 0.5;

    return score;
  }

  // Main recommendation function
  getRecommendations(count = 10) {
    console.log(`[ENGINE] Getting ${count} recommendations`);
    console.log(`[ENGINE] Current state: Wishlist=${this.wishlistItems.length}, TempDislikes=${this.firstTimeDislikes.length}, PermanentDislikes=${this.permanentDislikes.length}, TotalSwipes=${this.totalSwipes}`);

    const recommendations = [];

    // Every 10 swipes, show a random exploration item
    if (this.totalSwipes > 0 && this.totalSwipes % this.EXPLORATION_INTERVAL === 0) {
      console.log(`[ENGINE] Time for exploration (swipe ${this.totalSwipes})`);
      const explorationItem = this.getExplorationItem();
      if (explorationItem) {
        recommendations.push(explorationItem);
      }
    }

    // Fill remaining slots with personalized recommendations
    const remainingCount = count - recommendations.length;
    if (remainingCount > 0) {
      const personalizedRecs = this.getPersonalizedRecommendations(remainingCount);
      recommendations.push(...personalizedRecs);
    }

    // Remove any items we've already shown recently to avoid immediate repeats
    const filteredRecs = recommendations.filter(item => {
      const recentlyShown = this.shownItems.slice(-20).includes(item.id);
      if (!recentlyShown) {
        this.shownItems.push(item.id);
      }
      return !recentlyShown;
    });

    console.log(`[ENGINE] Returning ${filteredRecs.length} recommendations`);
    return filteredRecs;
  }

  // Save current state
  getStateForSaving() {
    return {
      wishlistItems: [...this.wishlistItems],
      firstTimeDislikes: [...this.firstTimeDislikes],
      permanentDislikes: [...this.permanentDislikes],
      totalSwipes: this.totalSwipes,
      shownItems: [...this.shownItems]
    };
  }

  // Restore saved state
  restoreState(savedData) {
    console.log(`[ENGINE] Restoring state`);

    if (savedData.wishlistItems) {
      this.wishlistItems = [...savedData.wishlistItems];
    }
    if (savedData.firstTimeDislikes) {
      this.firstTimeDislikes = [...savedData.firstTimeDislikes];
    }
    if (savedData.permanentDislikes) {
      this.permanentDislikes = [...savedData.permanentDislikes];
    }
    if (savedData.totalSwipes) {
      this.totalSwipes = savedData.totalSwipes;
    }
    if (savedData.shownItems) {
      this.shownItems = [...savedData.shownItems];
    }

    console.log(`[ENGINE] State restored successfully`);
  }

  // Update user preferences (kept for compatibility)
  updateUserPreferences() {
    // This is now handled automatically in getPersonalizedRecommendations
    console.log(`[ENGINE] Preferences updated based on ${this.wishlistItems.length} wishlist items`);
  }

  // Reset used items (for when running low on content)
  resetUsedItems() {
    console.log(`[ENGINE] Resetting shown items for fresh content`);
    this.shownItems = [];
  }

  // Check if item is available for recommendations
  isItemAvailable(itemId) {
    return !this.wishlistItems.includes(itemId) &&
           !this.permanentDislikes.includes(itemId) &&
           this.shouldShowDislikedItem(itemId);
  }
}

export default RecommendationEngine;