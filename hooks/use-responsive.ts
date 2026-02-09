import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 13 Pro as reference: 390 x 844 points)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Device detection
export const isSmallDevice = SCREEN_WIDTH < 375;
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeDevice = SCREEN_WIDTH >= 414;

// Screen dimensions
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

// Responsive scaling functions
export const wp = (percentage: number): number => {
    return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * percentage) / 100);
};

export const hp = (percentage: number): number => {
    return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * percentage) / 100);
};

// Scale based on width (for horizontal elements)
export const horizontalScale = (size: number): number => {
    return PixelRatio.roundToNearestPixel((SCREEN_WIDTH / BASE_WIDTH) * size);
};

// Scale based on height (for vertical elements)
export const verticalScale = (size: number): number => {
    return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT / BASE_HEIGHT) * size);
};

// Moderate scale - less aggressive scaling for fonts and paddings
export const moderateScale = (size: number, factor: number = 0.5): number => {
    return PixelRatio.roundToNearestPixel(size + (horizontalScale(size) - size) * factor);
};

// Font scaling with min/max limits
export const fontScale = (size: number): number => {
    const scale = SCREEN_WIDTH / BASE_WIDTH;
    const newSize = size * scale;
    // Clamp between 80% and 120% of original size
    return PixelRatio.roundToNearestPixel(
        Math.max(size * 0.85, Math.min(newSize, size * 1.15))
    );
};

// Spacing utilities
export const spacing = {
    xs: moderateScale(4),
    sm: moderateScale(8),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(20),
    xxl: moderateScale(24),
    xxxl: moderateScale(32),
};

// Border radius utilities
export const radius = {
    sm: moderateScale(8),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(20),
    full: 9999,
};

// Common responsive values
export const responsive = {
    // Paddings
    screenPadding: moderateScale(20),
    cardPadding: moderateScale(16),

    // Heights
    buttonHeight: verticalScale(52),
    inputHeight: verticalScale(48),
    tabBarHeight: Platform.OS === 'ios' ? verticalScale(88) : verticalScale(70),

    // Card heights
    featuredCardHeight: verticalScale(200),

    // Icon sizes
    iconSmall: moderateScale(16),
    iconMedium: moderateScale(20),
    iconLarge: moderateScale(24),
    iconXLarge: moderateScale(28),

    // Font sizes
    fontXs: fontScale(11),
    fontSm: fontScale(13),
    fontMd: fontScale(15),
    fontLg: fontScale(18),
    fontXl: fontScale(24),
    fontXxl: fontScale(28),
    fontDisplay: fontScale(32),
};

// Hook for responsive values
export function useResponsive() {
    return {
        screenWidth: SCREEN_WIDTH,
        screenHeight: SCREEN_HEIGHT,
        isSmallDevice,
        isMediumDevice,
        isLargeDevice,
        spacing,
        radius,
        ...responsive,
        wp,
        hp,
        horizontalScale,
        verticalScale,
        moderateScale,
        fontScale,
    };
}
