// Classification-based recommendation engine for Clothing Swipe app
// Implements functionality.md requirements using available data attributes

class RecommendationEngine {
  constructor(clothingData) {
    this.clothingData = clothingData;

    // User interaction tracking
    this.wishlistItems = []; // Items user liked (right swipe)
    this.firstTimeDislikes = new Map(); // itemId -> swipeNumberWhenDisliked
    this.permanentDislikes = []; // Items disliked twice (never shown again)
    this.shownItems = new Set(); // Track what we've shown

    // Swipe counting
    this.totalSwipes = 0;

    // User preferences learned from wishlist
    this.userPreferences = {
      categories: new Map(),
      subcategories: new Map(),
      brands: new Map(),
      styles: new Map(),
      colors: new Map(),
      priceRanges: new Map()
    };

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
      this.updateUserPreferences();
      console.log(`[ENGINE] Wishlist now has ${this.wishlistItems.length} items`);
    }
  }

  // Handle dislike when user left swipes
  addToDislike(itemId) {
    console.log(`[ENGINE] Processing dislike for ${itemId}`);

    // Check if this item was already disliked once
    if (this.firstTimeDislikes.has(itemId)) {
      // Second dislike - make it permanent
      console.log(`[ENGINE] Second dislike - adding ${itemId} to permanent dislikes`);
      this.firstTimeDislikes.delete(itemId);
      this.permanentDislikes.push(itemId);
    } else {
      // First dislike - add to temporary dislike list with current swipe number
      console.log(`[ENGINE] First dislike - adding ${itemId} to temporary dislikes`);
      this.firstTimeDislikes.set(itemId, this.totalSwipes);
    }
  }

  // Process each swipe (increment counters)
  processSwipe() {
    this.totalSwipes++;
    console.log(`[ENGINE] Processed swipe ${this.totalSwipes}`);
  }

  // Update user preferences based on wishlist items
  updateUserPreferences() {
    // Reset preferences
    Object.values(this.userPreferences).forEach(map => map.clear());

    // Build preferences from wishlist items
    this.wishlistItems.forEach(itemId => {
      const item = this.clothingData.find(i => i.id === itemId);
      if (!item) return;

      // Count occurrences of each attribute
      this.incrementPreference('categories', item.category);
      this.incrementPreference('subcategories', item.subcategory);
      this.incrementPreference('brands', item.brand);
      this.incrementPreference('styles', item.style);
      this.incrementPreference('colors', item.color);
      this.incrementPreference('priceRanges', item.price_range);
    });

    console.log(`[ENGINE] Updated preferences based on ${this.wishlistItems.length} wishlist items`);
  }

  // Increment preference counter for a given attribute
  incrementPreference(attributeType, attributeValue) {
    if (!attributeValue) return;

    const currentCount = this.userPreferences[attributeType].get(attributeValue) || 0;
    this.userPreferences[attributeType].set(attributeValue, currentCount + 1);
  }

  // Check if an item should be shown based on dislike rules
  shouldShowDislikedItem(itemId) {
    // Never show permanently disliked items
    if (this.permanentDislikes.includes(itemId)) {
      return false;
    }

    // For first-time dislikes, check if 25 swipes have passed
    if (this.firstTimeDislikes.has(itemId)) {
      const swipeWhenDisliked = this.firstTimeDislikes.get(itemId);
      const swipesSinceDislike = this.totalSwipes - swipeWhenDisliked;

      if (swipesSinceDislike >= this.TEMP_DISLIKE_DURATION) {
        // 25 swipes have passed, remove from temp dislikes and allow to be shown
        this.firstTimeDislikes.delete(itemId);
        return true;
      }
      return false; // Still within 25 swipe cooldown
    }

    return true;
  }

  // Check if we should reduce recommendations for similar items to a disliked item
  shouldReduceSimilarItems(item, dislikedItemId) {
    const dislikedItem = this.clothingData.find(i => i.id === dislikedItemId);
    if (!dislikedItem) return false;

    // Calculate similarity based on available attributes
    let similarityScore = 0;
    let totalAttributes = 0;

    // Same category (high weight)
    if (item.category && dislikedItem.category) {
      totalAttributes++;
      if (item.category === dislikedItem.category) similarityScore++;
    }

    // Same subcategory (high weight)
    if (item.subcategory && dislikedItem.subcategory) {
      totalAttributes++;
      if (item.subcategory === dislikedItem.subcategory) similarityScore++;
    }

    // Same brand (medium weight)
    if (item.brand && dislikedItem.brand) {
      totalAttributes++;
      if (item.brand === dislikedItem.brand) similarityScore += 0.7;
    }

    // Same style (medium weight)
    if (item.style && dislikedItem.style) {
      totalAttributes++;
      if (item.style === dislikedItem.style) similarityScore += 0.7;
    }

    // Same color (lower weight)
    if (item.color && dislikedItem.color) {
      totalAttributes++;
      if (item.color === dislikedItem.color) similarityScore += 0.5;
    }

    // Same price range (lower weight)
    if (item.price_range && dislikedItem.price_range) {
      totalAttributes++;
      if (item.price_range === dislikedItem.price_range) similarityScore += 0.3;
    }

    // Consider items similar if similarity score is above threshold
    const similarityRatio = totalAttributes > 0 ? similarityScore / totalAttributes : 0;
    return similarityRatio > 0.6; // 60% similarity threshold
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

      // Reduce similar items to recently disliked items
      const recentDislikes = Array.from(this.firstTimeDislikes.keys()).slice(-5); // Last 5 dislikes
      for (const dislikedItemId of recentDislikes) {
        if (this.shouldReduceSimilarItems(item, dislikedItemId)) {
          // Reduce probability of showing similar items (skip 70% of the time)
          if (Math.random() < 0.7) {
            return false;
          }
        }
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

  // Calculate preference score for an item based on user's wishlist preferences
  calculatePreferenceScore(item) {
    if (this.wishlistItems.length === 0) {
      return Math.random(); // Random score for new users
    }

    let score = 0;

    // Category matching (highest weight)
    const categoryWeight = this.userPreferences.categories.get(item.category) || 0;
    score += categoryWeight * 3.0;

    // Subcategory matching (high weight)
    const subcategoryWeight = this.userPreferences.subcategories.get(item.subcategory) || 0;
    score += subcategoryWeight * 2.5;

    // Brand matching (medium weight)
    const brandWeight = this.userPreferences.brands.get(item.brand) || 0;
    score += brandWeight * 2.0;

    // Style matching (medium weight)
    const styleWeight = this.userPreferences.styles.get(item.style) || 0;
    score += styleWeight * 1.5;

    // Color matching (lower weight)
    const colorWeight = this.userPreferences.colors.get(item.color) || 0;
    score += colorWeight * 1.0;

    // Price range matching (lower weight)
    const priceWeight = this.userPreferences.priceRanges.get(item.price_range) || 0;
    score += priceWeight * 0.8;

    // Add small random factor for variety
    score += Math.random() * 0.5;

    return score;
  }

  // Get personalized recommendations based on wishlist
  getPersonalizedRecommendations(count) {
    const availableItems = this.getAvailableItems();

    if (availableItems.length === 0) {
      return [];
    }

    // Score items based on user preferences
    const scoredItems = availableItems.map(item => ({
      ...item,
      score: this.calculatePreferenceScore(item)
    }));

    // Sort by score (highest first)
    scoredItems.sort((a, b) => b.score - a.score);

    // Take top items with some randomness for variety
    const topCount = Math.min(count * 3, scoredItems.length);
    const topItems = scoredItems.slice(0, topCount);

    const recommendations = [];
    for (let i = 0; i < count && topItems.length > 0; i++) {
      // Weighted random selection from top items
      const weights = topItems.map((_, index) => 1 / (index + 1)); // Higher weight for better scores
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

      let random = Math.random() * totalWeight;
      let selectedIndex = 0;

      for (let j = 0; j < weights.length; j++) {
        random -= weights[j];
        if (random <= 0) {
          selectedIndex = j;
          break;
        }
      }

      const selectedItem = topItems.splice(selectedIndex, 1)[0];
      recommendations.push(selectedItem);
      this.shownItems.add(selectedItem.id);
    }

    return recommendations;
  }

  // Main recommendation function
  getRecommendations(count = 10) {
    console.log(`[ENGINE] Getting ${count} recommendations`);
    console.log(`[ENGINE] Current state: Wishlist=${this.wishlistItems.length}, TempDislikes=${this.firstTimeDislikes.size}, PermanentDislikes=${this.permanentDislikes.length}, TotalSwipes=${this.totalSwipes}`);

    const recommendations = [];

    // Every 10 swipes, show a random exploration item
    if (this.totalSwipes > 0 && this.totalSwipes % this.EXPLORATION_INTERVAL === 0) {
      console.log(`[ENGINE] Time for exploration (swipe ${this.totalSwipes})`);
      const explorationItem = this.getExplorationItem();
      if (explorationItem) {
        recommendations.push(explorationItem);
        this.shownItems.add(explorationItem.id);
      }
    }

    // Fill remaining slots with personalized recommendations
    const remainingCount = count - recommendations.length;
    if (remainingCount > 0) {
      const personalizedRecs = this.getPersonalizedRecommendations(remainingCount);
      recommendations.push(...personalizedRecs);
    }

    console.log(`[ENGINE] Returning ${recommendations.length} recommendations`);
    return recommendations;
  }

  // Save current state
  getStateForSaving() {
    return {
      wishlistItems: [...this.wishlistItems],
      firstTimeDislikes: Object.fromEntries(this.firstTimeDislikes),
      permanentDislikes: [...this.permanentDislikes],
      totalSwipes: this.totalSwipes,
      shownItems: Array.from(this.shownItems)
    };
  }

  // Restore saved state
  restoreState(savedData) {
    console.log(`[ENGINE] Restoring state`);

    if (savedData.wishlistItems) {
      this.wishlistItems = [...savedData.wishlistItems];
    }
    if (savedData.firstTimeDislikes) {
      this.firstTimeDislikes = new Map(Object.entries(savedData.firstTimeDislikes));
    }
    if (savedData.permanentDislikes) {
      this.permanentDislikes = [...savedData.permanentDislikes];
    }
    if (savedData.totalSwipes) {
      this.totalSwipes = savedData.totalSwipes;
    }
    if (savedData.shownItems) {
      this.shownItems = new Set(savedData.shownItems);
    }

    // Rebuild preferences
    this.updateUserPreferences();

    console.log(`[ENGINE] State restored successfully`);
  }

  // Reset shown items (for when running low on content)
  resetUsedItems() {
    console.log(`[ENGINE] Resetting shown items for fresh content`);
    this.shownItems.clear();
  }

  // Check if item is available for recommendations
  isItemAvailable(itemId) {
    return !this.wishlistItems.includes(itemId) &&
           !this.permanentDislikes.includes(itemId) &&
           this.shouldShowDislikedItem(itemId);
  }
}

export default RecommendationEngine;