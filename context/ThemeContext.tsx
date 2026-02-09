import React, { createContext, ReactNode, useContext } from 'react';

// Modern Minimalist Theme System
type ThemeColors = {
    // Backgrounds
    background: string;
    surface: string;
    surfaceElevated: string;

    // Text
    text: string;
    textSecondary: string;
    textMuted: string;

    // Accent
    tint: string;
    tintMuted: string;

    // Semantic
    success: string;
    warning: string;
    error: string;

    // UI Elements
    icon: string;
    border: string;
    divider: string;

    // Tab Bar
    tabIconDefault: string;
    tabIconSelected: string;
};

// Black & Gold Theme - Luxury Barbershop
const modernDark: ThemeColors = {
    // Pure black backgrounds
    background: '#000000',
    surface: '#0D0D0D',
    surfaceElevated: '#1A1A1A',

    // Clean white/cream typography
    text: '#FFFFFF',
    textSecondary: '#B8B8B8',
    textMuted: '#666666',

    // Gold accent - matches logo
    tint: '#C9A227',
    tintMuted: '#C9A22725',

    // Semantic colors
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',

    // UI Elements
    icon: '#888888',
    border: '#222222',
    divider: '#1A1A1A',

    // Tab Bar
    tabIconDefault: '#555555',
    tabIconSelected: '#C9A227',
};

// Light Theme - Black & Gold variant
const modernLight: ThemeColors = {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',

    text: '#0A0A0A',
    textSecondary: '#525252',
    textMuted: '#A1A1A1',

    tint: '#9A7B0A',
    tintMuted: '#9A7B0A15',

    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',

    icon: '#737373',
    border: '#E5E5E5',
    divider: '#F0F0F0',

    tabIconDefault: '#A1A1A1',
    tabIconSelected: '#9A7B0A',
};

export const AppThemes = {
    modern: {
        name: 'Modern',
        light: modernLight,
        dark: modernDark,
    }
};

type ThemeContextType = {
    colors: ThemeColors;
    isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useAppTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useAppTheme must be used within an AppThemeProvider');
    }
    return context;
};

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
    // Always use dark theme - no device theme interaction
    const isDark = true;
    const colors = modernDark;

    return (
        <ThemeContext.Provider value={{ colors, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};
