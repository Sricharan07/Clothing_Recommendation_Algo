# Clothing Recommendation Algorithm Documentation

## Overview

This document explains the recommendation algorithm used in the Clothing Swipe app. The algorithm analyzes user preferences based on their swipe actions and recommends clothing items they are likely to prefer.

## Algorithm Components

### 1. Data Processing and Classification

Before recommendations can be made, the raw clothing data from various brands is processed and classified:

- **Category Classification**: Items are categorized into tops, bottoms, dresses, activewear, outerwear, etc.
- **Style Classification**: Items are classified as casual, athletic, formal, streetwear, bohemian, etc.
- **Color Extraction**: Colors are extracted from product names or existing color data
- **Price Range Classification**: Items are categorized as budget, mid-range, premium, or luxury
- **Brand Analysis**: Each brand is associated with a predominant style

### 2. User Preference Tracking

The app tracks user preferences through their interactions:

- **Likes**: When a user swipes right, the item's attributes (category, style, color, etc.) are recorded as positive preferences
- **Dislikes**: When a user swipes left, the attributes are recorded as negative preferences
- **Preference Weights**: Different attributes have different importance weights (e.g., category has higher weight than color)

### 3. Content-Based Filtering

The primary recommendation approach is content-based filtering:

```javascript
// Calculate score for an item based on user preferences
calculateItemScore(item) {
  let score = 0;
  
  // Base score
  score += 1;
  
  // Brand preference
  if (this.userPreferences.brands[item.brand]) {
    score += this.userPreferences.brands[item.brand] * 2;
  }
  
  // Category preference
  if (this.userPreferences.categories[item.category]) {
    score += this.userPreferences.categories[item.category] * 3;
  }
  
  // Style preference
  if (this.userPreferences.styles[item.style]) {
    score += this.userPreferences.styles[item.style] * 2.5;
  }
  
  // Color preference
  if (this.userPreferences.colors[item.color]) {
    score += this.userPreferences.colors[item.color] * 1.5;
  }
  
  // Price range preference
  if (this.userPreferences.priceRanges[item.price_range]) {
    score += this.userPreferences.priceRanges[item.price_range] * 1;
  }
  
  // If item is similar to previously disliked items, reduce score
  const similarToDisliked = this.userDislikes.some(dislikedId => {
    const dislikedItem = this.clothingData.find(i => i.id === dislikedId);
    return this.calculateSimilarity(item, dislikedItem) > 0.7;
  });
  
  if (similarToDisliked) {
    score -= 5;
  }
  
  return score;
}
```

### 4. Cold Start Handling

For new users with no interaction history, the algorithm:

1. Displays a diverse set of popular items across different categories and brands
2. Uses diversity to learn user preferences quickly
3. Gradually shifts to personalized recommendations as the user swipes

### 5. Similarity Calculation

The algorithm calculates similarity between items to find related items:

```javascript
// Calculate similarity between two items (0-1 scale)
calculateSimilarity(item1, item2) {
  if (!item1 || !item2) return 0;
  
  let similarityPoints = 0;
  let totalPoints = 0;
  
  // Brand similarity
  totalPoints += 1;
  if (item1.brand === item2.brand) {
    similarityPoints += 1;
  }
  
  // Category similarity
  totalPoints += 2;
  if (item1.category === item2.category) {
    similarityPoints += 2;
  }
  
  // Subcategory similarity
  totalPoints += 1.5;
  if (item1.subcategory === item2.subcategory) {
    similarityPoints += 1.5;
  }
  
  // Style similarity
  totalPoints += 1.5;
  if (item1.style === item2.style) {
    similarityPoints += 1.5;
  }
  
  // Color similarity
  totalPoints += 1;
  if (item1.color === item2.color) {
    similarityPoints += 1;
  }
  
  // Price range similarity
  totalPoints += 1;
  if (item1.price_range === item2.price_range) {
    similarityPoints += 1;
  }
  
  return totalPoints > 0 ? similarityPoints / totalPoints : 0;
}
```

## Future Improvements

1. **Collaborative Filtering**: As more user data is collected, incorporate user-user and item-item collaborative filtering
2. **Machine Learning Models**: Implement models to predict user preferences with higher accuracy
3. **Image-Based Recommendations**: Use image analysis to identify visual similarities between clothing items
4. **Session-Based Recommendations**: Take into account the user's current browsing session context
5. **Time-Based Factors**: Consider seasonality and trending items

## Data Flow

1. User swipes on items
2. User preferences are updated
3. Recommendation engine scores all available items based on user preferences
4. Highest scored items are shown to the user next
5. Process repeats, continuously refining recommendations

## Performance Considerations

- Scoring and similarity calculations are optimized for mobile performance
- Preference tracking uses incremental updates rather than recalculating from scratch
- For larger datasets, batch processing and pagination would be implemented
