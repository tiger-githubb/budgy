// Re-export color system
export { DarkColors, LightColors, createThemeColors, useThemeColors } from './colors';
export type { ThemeColors } from './colors';

// Static COLORS for backward compatibility (defaults to light mode)
// Gradually migrate to useThemeColors() hook for dynamic theming
export const COLORS = {
    // Premium Gold & Black Palette
    primary: '#E5B84B', // Gold
    primaryDark: '#CCA341',
    secondary: '#000000',

    background: '#F2F2F7', // iOS system grouped background
    surface: '#FFFFFF',
    surfaceSecondary: '#F2F2F7',
    surfaceHighlight: '#E5E5EA',

    text: {
        primary: '#000000',
        secondary: 'rgba(60, 60, 67, 0.6)',
        tertiary: 'rgba(60, 60, 67, 0.3)',
        inverse: '#FFFFFF',
    },

    status: {
        success: '#34C759', // iOS system green
        warning: '#FF9500', // iOS system orange
        danger: '#FF3B30', // iOS system red
        info: '#007AFF', // iOS system blue
    },

    border: '#C6C6C8', // iOS opaque separator
    separator: '#3C3C4349', // iOS separator
};

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

export const RADIUS = {
    s: 8,
    m: 12, // iOS standard corner radius
    l: 16,
    xl: 22, // iOS card/modal corners
    full: 9999,
};

export const SHADOWS = {
    soft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
};

// iOS Typography
export const TYPOGRAPHY = {
    largeTitle: {
        fontSize: 34,
        fontWeight: '700' as const,
        letterSpacing: 0.37,
    },
    title1: {
        fontSize: 28,
        fontWeight: '700' as const,
        letterSpacing: 0.36,
    },
    title2: {
        fontSize: 22,
        fontWeight: '700' as const,
        letterSpacing: 0.35,
    },
    title3: {
        fontSize: 20,
        fontWeight: '600' as const,
        letterSpacing: 0.38,
    },
    headline: {
        fontSize: 17,
        fontWeight: '600' as const,
        letterSpacing: -0.41,
    },
    body: {
        fontSize: 17,
        fontWeight: '400' as const,
        letterSpacing: -0.41,
    },
    callout: {
        fontSize: 16,
        fontWeight: '400' as const,
        letterSpacing: -0.32,
    },
    subheadline: {
        fontSize: 15,
        fontWeight: '400' as const,
        letterSpacing: -0.24,
    },
    footnote: {
        fontSize: 13,
        fontWeight: '400' as const,
        letterSpacing: -0.08,
    },
    caption1: {
        fontSize: 12,
        fontWeight: '400' as const,
        letterSpacing: 0,
    },
    caption2: {
        fontSize: 11,
        fontWeight: '400' as const,
        letterSpacing: 0.07,
    },
};
