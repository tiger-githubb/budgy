import { useThemeColors } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

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
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={[
                styles.container,
                containerSizeStyle,
                getContainerStyle(),
                style
            ]}
        >
            <Ionicons 
                name={name} 
                size={isCloseVariant ? 20 : size} 
                color={iconColor} 
            />
        </TouchableOpacity>
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
