import { COLORS, RADIUS, SPACING } from '@/src/theme';
import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    style,
    textStyle,
    disabled = false,
    loading = false,
    icon,
}) => {
    const getBackgroundColor = () => {
        if (disabled) return COLORS.surfaceHighlight;
        switch (variant) {
            case 'primary': return COLORS.primary;
            case 'secondary': return COLORS.secondary;
            case 'danger': return COLORS.status.danger;
            case 'outline': return 'transparent';
            case 'ghost': return 'transparent';
            default: return COLORS.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return COLORS.text.tertiary;
        switch (variant) {
            case 'primary': return COLORS.text.primary; // Black on Acid Green
            case 'secondary': return COLORS.text.primary; // Black on Gold
            case 'danger': return 'white';
            case 'outline': return COLORS.text.primary;
            case 'ghost': return COLORS.text.secondary;
            default: return COLORS.text.primary;
        }
    };

    const borderStyle: ViewStyle = variant === 'outline' ? {
        borderWidth: 1.5, // Slightly bolder border for outline
        borderColor: COLORS.text.primary, // Black border
    } : {};

    // For primary, maybe add a subtle border too for the "neo-brutalism" pop?
    // Let's keep it simple flat for now.

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                { backgroundColor: getBackgroundColor() },
                borderStyle,
                style,
            ]}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <>
                    {icon}
                    <Text style={[styles.text, { color: getTextColor(), marginLeft: icon ? SPACING.s : 0 }, textStyle]}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.m,
        paddingHorizontal: SPACING.l,
        borderRadius: RADIUS.l,  // Modern pill shape
        minHeight: 52, // Slightly taller click target
    },
    text: {
        fontSize: 16,
        fontWeight: '700', // Bolder text
        textAlign: 'center',
    },
});
