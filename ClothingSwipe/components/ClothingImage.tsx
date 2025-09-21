import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, View, ActivityIndicator } from 'react-native';
import { ThemedText } from './themed-text';
import { LinearGradient } from 'expo-linear-gradient';

interface ClothingImageProps {
  imageUrl?: string;
  category?: string;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

const getCategoryColor = (category: string = 'other'): string => {
  const colors: {[key: string]: string} = {
    tops: '#2980b9',
    bottoms: '#e74c3c',
    dresses: '#8e44ad',
    activewear: '#27ae60',
    outerwear: '#d35400',
    swimwear: '#16a085',
    accessories: '#34495e',
    other: '#7f8c8d'
  };
  
  return colors[category?.toLowerCase()] || colors.other;
};

const getCategoryEmoji = (category: string = 'other'): string => {
  const emojis: {[key: string]: string} = {
    tops: '👕',
    bottoms: '👖',
    dresses: '👗',
    activewear: '🏃‍♀️',
    outerwear: '🧥',
    swimwear: '🩱',
    accessories: '👜',
    other: '👚'
  };
  
  return emojis[category?.toLowerCase()] || emojis.other;
};

const ClothingImage = ({
  imageUrl,
  category = 'other',
  style = {},
  resizeMode = 'cover'
}: ClothingImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Use imageUrl directly, no complex processing for now
  const enhancedImageUrl = imageUrl;

  const isValidUrl = enhancedImageUrl &&
    (enhancedImageUrl.startsWith('http://') || enhancedImageUrl.startsWith('https://'));

  // Ensure enhancedImageUrl is valid and not null/undefined
  const validImageUrl = isValidUrl ? enhancedImageUrl : null;
  
  // Simple loading effect - no complex caching for now
  useEffect(() => {
    // Just show loading state briefly then hide it
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [validImageUrl]);
  
  if (!isValidUrl) {
    return (
      <View style={[styles.fallbackContainer, style]}>
        <LinearGradient
          colors={['#f5f5f5', getCategoryColor(category), '#f5f5f5']}
          style={styles.gradient}
        >
          <View style={styles.fallbackContent}>
            <ThemedText style={styles.fallbackEmoji}>{getCategoryEmoji(category)}</ThemedText>
            <ThemedText style={styles.fallbackText}>{category}</ThemedText>
          </View>
        </LinearGradient>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, style]}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={['#f5f5f5', getCategoryColor(category), '#f5f5f5']}
            style={styles.gradient}
          >
            <ActivityIndicator size="large" color="#fff" />
          </LinearGradient>
        </View>
      )}

      {validImageUrl && (
        <Image
          source={{ uri: validImageUrl }}
          style={styles.image}
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          resizeMode={resizeMode}
        />
      )}

      {!validImageUrl && (
        <View style={[styles.fallbackContainer, { position: 'absolute' }]}>
          <LinearGradient
            colors={['#f5f5f5', getCategoryColor(category), '#f5f5f5']}
            style={styles.gradient}
          >
            <View style={styles.fallbackContent}>
              <ThemedText style={styles.fallbackEmoji}>{getCategoryEmoji(category)}</ThemedText>
              <ThemedText style={styles.fallbackText}>{category}</ThemedText>
            </View>
          </LinearGradient>
        </View>
      )}

      {hasError && (
        <View style={[styles.fallbackContainer, { position: 'absolute' }]}>
          <LinearGradient
            colors={['#f5f5f5', getCategoryColor(category), '#f5f5f5']}
            style={styles.gradient}
          >
            <View style={styles.fallbackContent}>
              <ThemedText style={styles.fallbackEmoji}>{getCategoryEmoji(category)}</ThemedText>
              <ThemedText style={styles.fallbackText}>{category}</ThemedText>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Add a subtle gradient overlay for better text visibility */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.overlay}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  fallbackContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  fallbackText: {
    textTransform: 'capitalize',
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%', // Make gradient cover more area for better visibility
  }
});

export default ClothingImage;