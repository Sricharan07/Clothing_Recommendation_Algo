import allClothingData from '../../data/fixed_clothing_items.json';

/**
 * DataLoader - Handles loading and processing clothing data
 */
const DataLoader = {
  loadClothingData,
  extractColorFromName,
  categorizeByName,
  styleByBrand,
  getPriceRange
};

export default DataLoader;

/**
 * Load clothing data from the unified dataset JSON file
 */
export async function loadClothingData() {
  try {
    console.log(`Loading all ${allClothingData.length} clothing items from dataset`);
    
    // Process the data to ensure all fields are valid
    const processedData = allClothingData.map(item => {
      return {
        ...item,
        // Ensure color exists
        color: item.color || extractColorFromName(item.name) || 'unknown',
        // Ensure category exists
        category: item.category || categorizeByName(item.name) || 'other',
        // Ensure style exists
        style: item.style || styleByBrand(item.brand) || 'casual',
        // Ensure fit exists
        fit: item.fit || 'regular',
        // Ensure subcategory exists
        subcategory: item.subcategory || 'other',
        // Format price if exists
        price: item.price || null,
        // Default price range if missing
        price_range: item.price_range || getPriceRange(item.price) || 'unknown'
      };
    });
    
    return processedData;
  } catch (error) {
    console.error('Error loading clothing data:', error);
    return getFallbackData();
  }
}

/**
 * Extract color from item name
 */
function extractColorFromName(name) {
  if (!name) return null;
  
  const colorPatterns = [
    'black', 'white', 'blue', 'red', 'green', 'pink', 'purple', 'gray', 'grey',
    'beige', 'brown', 'yellow', 'orange', 'navy', 'teal', 'burgundy', 'ivory',
    'olive', 'cream', 'charcoal'
  ];
  
  const nameLower = name.toLowerCase();
  
  for (const color of colorPatterns) {
    if (nameLower.includes(color)) {
      return color;
    }
  }
  
  return null;
}

/**
 * Categorize by name keywords
 */
function categorizeByName(name) {
  if (!name) return 'other';
  
  const nameLower = name.toLowerCase();
  
  const categories = [
    { name: 'tops', keywords: ['tee', 'shirt', 'top', 'blouse', 'sweater', 'sweatshirt', 'hoodie', 'tank'] },
    { name: 'bottoms', keywords: ['jean', 'pant', 'trouser', 'legging', 'short', 'skirt', 'jogger'] },
    { name: 'dresses', keywords: ['dress', 'romper', 'jumpsuit'] },
    { name: 'activewear', keywords: ['sport', 'active', 'yoga', 'gym', 'workout', 'run', 'performance'] },
    { name: 'outerwear', keywords: ['jacket', 'coat', 'bomber', 'cardigan'] }
  ];
  
  for (const category of categories) {
    for (const keyword of category.keywords) {
      if (nameLower.includes(keyword)) {
        return category.name;
      }
    }
  }
  
  return 'other';
}

/**
 * Determine style based on brand
 */
function styleByBrand(brand) {
  if (!brand) return 'casual';
  
  const brandLower = brand.toLowerCase();
  
  const brandStyles = {
    'alo yoga': 'athletic',
    'gymshark': 'athletic',
    'vuori': 'athletic',
    'princess polly': 'casual',
    'edikted': 'streetwear',
    'nakd': 'minimalist',
    'cupshe': 'casual',
    'altardstate': 'bohemian'
  };
  
  for (const [brandName, style] of Object.entries(brandStyles)) {
    if (brandLower.includes(brandName.toLowerCase())) {
      return style;
    }
  }
  
  return 'casual';
}

/**
 * Determine price range from price
 */
function getPriceRange(price) {
  if (!price || isNaN(price)) return 'unknown';
  
  const priceNum = parseFloat(price);
  
  if (priceNum <= 30) return 'budget';
  if (priceNum <= 75) return 'mid-range';
  if (priceNum <= 150) return 'premium';
  return 'luxury';
}

/**
 * Fallback data in case of loading failure
 */
function getFallbackData() {
  return [
    {
      id: 'fallback_1',
      name: 'Sample Product',
      brand: 'Sample Brand',
      category: 'tops',
      subcategory: 't-shirt',
      color: 'blue',
      price: 49.99,
      price_range: 'mid-range',
      image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop',
      product_url: '#',
      style: 'casual',
      fit: 'regular'
    }
  ];
}