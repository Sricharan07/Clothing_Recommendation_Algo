/**
 * Modern color palette for the Clothing Recommendation App
 * Enhanced with gradients and modern design elements
 */

import { Platform } from 'react-native';

// Modern color palette
const primaryColor = '#6366F1'; // Indigo
const secondaryColor = '#EC4899'; // Pink
const accentColor = '#10B981'; // Emerald
const dangerColor = '#EF4444'; // Red
const warningColor = '#F59E0B'; // Amber
const successColor = '#22C55E'; // Green

const tintColorLight = primaryColor;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#1F2937',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    // New modern colors
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    danger: dangerColor,
    warning: warningColor,
    success: successColor,
    surface: '#F9FAFB',
    surfaceVariant: '#F3F4F6',
    border: '#E5E7EB',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    // Gradients
    gradientStart: '#667EEA',
    gradientEnd: '#764BA2',
    cardGradientStart: 'rgba(255, 255, 255, 0.9)',
    cardGradientEnd: 'rgba(255, 255, 255, 0.7)',
  },
  dark: {
    text: '#F9FAFB',
    background: '#111827',
    tint: tintColorDark,
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    // New modern colors
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    danger: dangerColor,
    warning: warningColor,
    success: successColor,
    surface: '#1F2937',
    surfaceVariant: '#374151',
    border: '#4B5563',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
    // Gradients
    gradientStart: '#667EEA',
    gradientEnd: '#764BA2',
    cardGradientStart: 'rgba(31, 41, 55, 0.9)',
    cardGradientEnd: 'rgba(31, 41, 55, 0.7)',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
