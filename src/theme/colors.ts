import { useColorScheme } from '@/hooks/use-color-scheme';

// iOS System Colors
const iOS = {
    light: {
        // Backgrounds
        systemBackground: '#FFFFFF',
        secondarySystemBackground: '#F2F2F7',
        tertiarySystemBackground: '#FFFFFF',
        systemGroupedBackground: '#F2F2F7',
        secondarySystemGroupedBackground: '#FFFFFF',

        // Labels
        label: '#000000',
        secondaryLabel: '#3C3C43',
        tertiaryLabel: '#3C3C4399',
        quaternaryLabel: '#3C3C434D',

        // Fills
        systemFill: '#78788033',
        secondarySystemFill: '#78788029',
        tertiarySystemFill: '#7676801F',
        quaternarySystemFill: '#74748014',

        // Separators
        separator: '#3C3C4349',
        opaqueSeparator: '#C6C6C8',

        // System Colors
        systemBlue: '#007AFF',
        systemGreen: '#34C759',
        systemRed: '#FF3B30',
        systemOrange: '#FF9500',
        systemYellow: '#FFCC00',
        systemGray: '#8E8E93',
        systemGray2: '#AEAEB2',
        systemGray3: '#C7C7CC',
        systemGray4: '#D1D1D6',
        systemGray5: '#E5E5EA',
        systemGray6: '#F2F2F7',
    },
    dark: {
        // Backgrounds
        systemBackground: '#000000',
        secondarySystemBackground: '#1C1C1E',
        tertiarySystemBackground: '#2C2C2E',
        systemGroupedBackground: '#000000',
        secondarySystemGroupedBackground: '#1C1C1E',

        // Labels
        label: '#FFFFFF',
        secondaryLabel: '#EBEBF5',
        tertiaryLabel: '#EBEBF54D',
        quaternaryLabel: '#EBEBF528',

        // Fills
        systemFill: '#7878805C',
        secondarySystemFill: '#78788052',
        tertiarySystemFill: '#7676803D',
        quaternarySystemFill: '#74748029',

        // Separators
        separator: '#54545899',
        opaqueSeparator: '#38383A',

        // System Colors (adjusted for dark mode)
        systemBlue: '#0A84FF',
        systemGreen: '#30D158',
        systemRed: '#FF453A',
        systemOrange: '#FF9F0A',
        systemYellow: '#FFD60A',
        systemGray: '#8E8E93',
        systemGray2: '#636366',
        systemGray3: '#48484A',
        systemGray4: '#3A3A3C',
        systemGray5: '#2C2C2E',
        systemGray6: '#1C1C1E',
    }
};

// App-specific theme colors built on iOS system colors
export const createThemeColors = (isDark: boolean) => {
    const system = isDark ? iOS.dark : iOS.light;

    return {
        // Brand
        primary: '#E5B84B', // Gold - kept for brand identity
        primaryDark: '#CCA341',
        secondary: isDark ? '#FFFFFF' : '#000000',

        // Backgrounds
        background: system.systemGroupedBackground,
        surface: system.secondarySystemGroupedBackground,
        surfaceSecondary: system.systemGroupedBackground,
        surfaceHighlight: isDark ? system.systemGray5 : system.systemGray6,

        // Text
        text: {
            primary: system.label,
            secondary: isDark ? 'rgba(235, 235, 245, 0.6)' : 'rgba(60, 60, 67, 0.6)',
            tertiary: isDark ? 'rgba(235, 235, 245, 0.3)' : 'rgba(60, 60, 67, 0.3)',
            inverse: isDark ? '#000000' : '#FFFFFF',
        },

        // Status
        status: {
            success: system.systemGreen,
            warning: system.systemOrange,
            danger: system.systemRed,
            info: system.systemBlue,
        },

        // UI Elements
        border: system.opaqueSeparator,
        separator: system.separator,

        // iOS specific
        tint: '#E5B84B', // App tint color
        tabIconDefault: system.systemGray,
        tabIconSelected: '#E5B84B',

        // Raw system access
        system,
    };
};

export type ThemeColors = ReturnType<typeof createThemeColors>;

// Hook to get current theme colors
export const useThemeColors = (): ThemeColors => {
    const colorScheme = useColorScheme();
    return createThemeColors(colorScheme === 'dark');
};

// Static colors for cases where hook can't be used
export const LightColors = createThemeColors(false);
export const DarkColors = createThemeColors(true);
