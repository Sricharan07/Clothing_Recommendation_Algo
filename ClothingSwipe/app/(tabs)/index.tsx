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
          colors={['#f8f8f8', '#e1e1e1', '#f8f8f8']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#4a80f5" />
          <ThemedText style={styles.loadingText}>Loading your style matches...</ThemedText>
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
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
});