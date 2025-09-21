# ClothingSwipe - Clothing Recommendation App

A React Native clothing recommendation app built with Expo that allows users to swipe through clothing items, save favorites to a wishlist, and discover new styles through an intuitive card-based interface.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Development Commands](#development-commands)
- [Build Commands](#build-commands)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Technology Stack](#technology-stack)

## ✨ Features

- **Swipe Interface**: Tinder-like card swiping for clothing items
- **Wishlist Management**: Save liked items to a persistent wishlist
- **Data Persistence**: Uses AsyncStorage to maintain user preferences
- **TypeScript Support**: Full TypeScript implementation for better development experience
- **Cross-Platform**: Works on iOS, Android, and Web
- **Modern UI**: Beautiful interface with gradients and smooth animations
- **Expo Router**: File-based routing system

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your system:

### Node.js and npm
```bash
# Check if Node.js is installed
node --version
npm --version

# If not installed, download from https://nodejs.org/
# Recommended: Node.js 18.x or higher
```

### Expo CLI
```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Or using yarn
yarn global add @expo/cli

# Verify installation
expo --version
```

### Development Tools (Optional)
- **Visual Studio Code** or your preferred IDE
- **Expo Go App** on your mobile device (for testing on physical devices)

## 🚀 Installation

### 1. Clone the Repository
   ```bash
git clone <repository-url>
   cd ClothingSwipe
```

### 2. Install Dependencies
```bash
# Using npm
   npm install

# Or using yarn
yarn install
```

### 3. Install Expo CLI (if not already installed)
```bash
npm install -g @expo/cli
```

### 4. Start the Development Server
```bash
# Using npm
npm start

# Or using yarn
yarn start

# This will start the Metro bundler and show a QR code
```

### 5. Run on Different Platforms

#### iOS Simulator (macOS only)
```bash
# Using npm
npm run ios

# Or using yarn
yarn ios
```

#### Android Emulator
```bash
# Using npm
npm run android

# Or using yarn
yarn android
```

#### Web Browser
```bash
# Using npm
npm run web

# Or using yarn
yarn web
```

## 📝 Available Scripts

The following scripts are available in the `package.json`:

### Development Scripts
```bash
# Start the development server
npm start

# Reset the project (removes all generated files)
npm run reset-project

# Run on Android emulator/device
npm run android

# Run on iOS simulator (macOS only)
npm run ios

# Run on web browser
npm run web

# Run ESLint
npm run lint
```

### Alternative Yarn Commands
```bash
# Start development server
yarn start

# Reset project
yarn reset-project

# Android
yarn android

# iOS
yarn ios

# Web
yarn web

# Lint
yarn lint
```

## 🎯 Development Commands

### Starting Development

#### Option 1: Expo CLI
```bash
# Start with Expo CLI
expo start

# Or with npx
npx expo start
```

#### Option 2: Using npm scripts
   ```bash
   npm start
   ```

### Platform-Specific Development

#### iOS Development
   ```bash
# Requires macOS and Xcode
expo start --ios
# or
   npm run ios
```

#### Android Development
```bash
# Requires Android Studio and Android SDK
expo start --android
# or
   npm run android
```
   
#### Web Development
```bash
expo start --web
# or
   npm run web
   ```

### Testing on Devices

#### Using Expo Go (Recommended)
1. Install **Expo Go** app on your iOS/Android device
2. Run `npm start` in terminal
3. Scan the QR code with Expo Go app
4. The app will load on your device

#### Using Simulators
```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android
```

## 📦 Build Commands

### Production Builds

#### Build for All Platforms
```bash
# Build for all platforms
expo build

# Or with EAS Build (recommended)
npx eas build --platform all
```

#### Platform-Specific Builds

```bash
# iOS (requires macOS)
npx eas build --platform ios

# Android
npx eas build --platform android

# Web
npx eas build --platform web
```

### EAS Build Setup

1. Install EAS CLI:
```bash
npm install -g @expo/eas-cli
```

2. Login to your Expo account:
```bash
npx eas login
```

3. Configure EAS Build (optional):
```bash
npx eas build:configure
```

### Local Builds

#### iOS (macOS only)
```bash
# Requires Xcode
expo build:ios

# Or with EAS
npx eas build --platform ios --profile development
```

#### Android
```bash
# Requires Android Studio
expo build:android

# Or with EAS
npx eas build --platform android --profile development
```

## 📁 Project Structure

```
ClothingSwipe/
├── app/                          # Main application code
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── _layout.tsx          # Tab layout configuration
│   │   ├── index.tsx            # Home screen with swipe cards
│   │   ├── wishlist.tsx         # Wishlist screen
│   │   └── explore.tsx          # Browse/explore screen
│   ├── context/                  # React Context providers
│   │   └── RecommendationContext.js
│   ├── utils/                    # Utility functions
│   │   └── DataLoader.js
│   └── _layout.tsx               # Root layout
├── components/                   # Reusable UI components
│   ├── SwipeCards.tsx           # Main swipe interface
│   ├── ClothingCard.tsx         # Individual clothing item card
│   ├── ClothingImage.tsx        # Image component
│   ├── themed-text.tsx          # Themed text component
│   ├── themed-view.tsx          # Themed view component
│   └── ui/                      # UI components
├── constants/                    # App constants
│   └── theme.ts                 # Theme configuration
├── data/                        # Data files
│   ├── all_clothing_items.json
│   ├── clothing_data.json
│   ├── fixed_clothing_items.json
│   └── unified_clothing_data.csv
├── hooks/                       # React hooks
├── assets/                      # Static assets
│   └── images/                  # Image files
├── node_modules/                # Dependencies
├── .expo/                       # Expo configuration
├── app.json                     # Expo app configuration
├── expo-env.d.ts               # TypeScript definitions
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── eslint.config.js             # ESLint configuration
└── README.md                    # This file
```

## 🔧 Troubleshooting

### Common Issues

#### 1. **Metro Bundler Issues**
```bash
# Clear Metro cache
npm start -- --clear

# Or delete node_modules and reinstall
rm -rf node_modules
npm install
```

#### 2. **iOS Simulator Issues**
```bash
# Clear iOS build cache
npx expo install --fix

# Reinstall iOS dependencies
cd ios && pod install
```

#### 3. **Android Emulator Issues**
```bash
# Clear Android cache
npm start -- --clear

# Check if Android SDK is properly configured
expo doctor
```

#### 4. **TypeScript Errors**
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Fix common TypeScript issues
npx expo install --fix
```

#### 5. **AsyncStorage Issues**
```bash
# Clear AsyncStorage data (development only)
# Use the "Clear All & Start Fresh" button in the app
```

### Debug Commands

#### Check Project Health
```bash
# Run Expo doctor to check for issues
npx expo doctor

# Check TypeScript compilation
npx tsc --noEmit

# Run ESLint
npm run lint
```

#### Clear Caches
```bash
# Clear all caches
npm start -- --clear

# Clear Expo cache
npx expo install --fix

# Clear Metro bundler cache
rm -rf .expo
```

### Performance Issues

#### Metro Bundler Performance
```bash
# Use legacy bundler for better performance on some systems
EXPO_USE_METRO_LEGACY=true npm start
```

#### Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

## 🛠️ Technology Stack

### Core Technologies
- **React Native**: 0.81.4
- **Expo**: ~54.0.9
- **TypeScript**: ~5.9.2
- **React**: 19.1.0

### Navigation & Routing
- **Expo Router**: ~6.0.7
- **React Navigation**: 7.x
  - Bottom Tabs: ^7.4.0
  - Native: ^7.1.8
  - Elements: ^2.6.3

### UI & Styling
- **Expo Linear Gradient**: ^15.0.7
- **Expo Image**: ~3.0.8
- **Expo Status Bar**: ~3.0.8
- **Expo System UI**: ~6.0.7

### Data Management
- **AsyncStorage**: 2.2.0 (for data persistence)
- **Expo File System**: ^19.0.14

### Development Tools
- **ESLint**: ^9.25.0
- **Expo CLI**: Global installation required
- **TypeScript**: ~5.9.2

### Device Features
- **Expo Haptics**: ~15.0.7
- **Expo Font**: ~14.0.8
- **Expo Splash Screen**: ~31.0.10

### Animation & Gestures
- **React Native Reanimated**: ~4.1.0
- **React Native Gesture Handler**: ~2.28.0
- **React Native Worklets**: 0.5.1

## 📱 Platform Support

### iOS
- **Minimum Version**: iOS 13.0
- **Simulator Support**: Yes (macOS only)
- **Physical Device**: Yes (via Expo Go or development build)

### Android
- **Minimum Version**: Android 8.0
- **Emulator Support**: Yes
- **Physical Device**: Yes (via Expo Go or development build)

### Web
- **Browser Support**: Modern browsers
- **Static Export**: Yes
- **Development Server**: Yes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is private and proprietary.

---

**For support or questions, please refer to the troubleshooting section or check the Expo documentation at https://docs.expo.dev/**