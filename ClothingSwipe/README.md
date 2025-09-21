# Clothing Swipe App

A Tinder-like mobile application for browsing clothing items. Users can swipe right to like items or swipe left to pass.

## Features

- Swipe interface for browsing clothing items
- Card-based UI with images and item details
- "Discover" tab to view all available items
- Gesture handling for smooth swiping experience
- Placeholder images for demonstration purposes

## Tech Stack

- React Native / Expo
- TypeScript
- React Native Gesture Handler
- React Native Reanimated
- Expo Router

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd ClothingSwipe
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on your preferred platform:
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   
   # For web
   npm run web
   ```

## Project Structure

- `/app`: Main application screens using Expo Router
- `/components`: Reusable UI components
- `/data`: Sample clothing data
- `/constants`: Theme and style constants
- `/hooks`: Custom React hooks

## Next Steps

- Implement backend integration for real clothing data
- Add user authentication
- Create user profiles with liked items
- Add filtering options
- Implement recommendations based on user preferences