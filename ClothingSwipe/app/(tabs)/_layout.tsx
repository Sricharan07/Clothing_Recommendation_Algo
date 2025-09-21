import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRecommendation } from '../context/RecommendationContext';

// Custom tab bar button with gradient background
const TabBarButton = (props) => {
  const { focused, icon, label } = props;
  
  return (
    <HapticTab {...props}>
      <View style={[styles.tabButton, focused && styles.tabButtonActive]}>
        {focused ? (
          <LinearGradient
            colors={['#4a80f5', '#1a56e8']}
            style={styles.tabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <IconSymbol size={24} name={icon} color="#ffffff" />
          </LinearGradient>
        ) : (
          <IconSymbol size={24} name={icon} color="#888888" />
        )}
      </View>
    </HapticTab>
  );
};

// Badge indicator for wishlist tab
const WishlistTabButton = (props) => {
  const { wishlistItems } = useRecommendation();
  const hasItems = wishlistItems && wishlistItems.length > 0;
  
  return (
    <View style={styles.badgeContainer}>
      <TabBarButton {...props} icon="bookmark.fill" label="Wishlist" />
      {hasItems && <View style={styles.badge} />}
    </View>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Swipe',
          tabBarButton: (props) => (
            <TabBarButton
              {...props}
              icon="heart.fill"
              label="Swipe"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarButton: (props) => (
            <WishlistTabButton {...props} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Discover',
          tabBarButton: (props) => (
            <TabBarButton
              {...props}
              icon="square.grid.2x2.fill"
              label="Discover"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#ffffff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  tabButtonActive: {
    shadowColor: '#4a80f5',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff6b6b',
  }
});