import { useThemeColors } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, StyleSheet, ViewStyle } from 'react-native';

interface IconButtonProps {
    name: keyof typeof Ionicons.glyphMap;
    size?: number;
    color?: string;
    onPress?: () => void;
    style?: ViewStyle;
    variant?: 'ghost' | 'filled' | 'outline' | 'close';
}

export const IconButton: React.FC<IconButtonProps> = ({
    name,
    size = 24,
    color,
    onPress,
    style,
    variant = 'ghost'
}) => {
    const colors = useThemeColors();
    const iconColor = color || colors.text.primary;

    const getContainerStyle = () => {
        switch (variant) {
            case 'filled':
                return { backgroundColor: colors.surfaceHighlight };
            case 'outline':
                return { borderWidth: 1, borderColor: colors.border };
            case 'close':
                // Specific style for modal close buttons: smaller, circular background
                return {
                    backgroundColor: colors.surfaceHighlight,
                    width: 32,
                    height: 32,
                    borderRadius: 16
                };
            default:
                return {};
        }
    };

    // If 'close' variant, override default container size if not specified in style
    const isCloseVariant = variant === 'close';
    const containerSizeStyle = isCloseVariant ? {} : styles.defaultSize;

    return (
        <Pressable
            onPress={onPress}
            android_ripple={{ borderless: true, color: colors.text.primary + '20', radius: 20 }}
            style={({ pressed }) => [
                styles.container,
                containerSizeStyle,
                getContainerStyle(),
                style,
                pressed && Platform.OS !== 'android' && { opacity: 0.7 }
            ]}
        >
            <Ionicons
                name={name}
                size={isCloseVariant ? 20 : size}
                color={iconColor}
            />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    defaultSize: {
        width: 40,
        height: 40,
        borderRadius: 20,
    }
});
