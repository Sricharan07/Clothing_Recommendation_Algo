import React from 'react';
import { StyleSheet, ActivityIndicator, View, StatusBar, Dimensions } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import SwipeCards from '@/components/SwipeCards';
import { useRecommendation } from '../context/RecommendationContext';
import { LinearGradient } from 'expo-linear-gradient';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function HomeScreen() {
  const {
    currentItems,
    isLoading,
    handleLike,
    handleDislike,
    loadNewRecommendations,
    clearAllPreferences,
    loadMoreIfNeeded
  } = useRecommendation();

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <LinearGradient
          colors={['#667EEA', '#764BA2', '#667EEA']}
          style={styles.loadingGradient}
        >
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <ThemedText style={styles.loadingText}>Discovering your style...</ThemedText>
            <ThemedText style={styles.loadingSubtext}>Finding the perfect matches for you</ThemedText>
          </View>
        </LinearGradient>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Cards take the full screen - clean like Bumble/Tinder */}
      <SwipeCards
        data={currentItems}
        onSwipeLeft={handleDislike}
        onSwipeRight={handleLike}
        onRefresh={loadNewRecommendations}
        onClearPreferences={clearAllPreferences}
        loadMoreIfNeeded={loadMoreIfNeeded}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 24,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});