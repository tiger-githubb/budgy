import { useThemeColors } from '@/src/theme';
import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'tinted';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    size?: 'small' | 'medium' | 'large';
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
    size = 'medium',
}) => {
    const colors = useThemeColors();

    const getBackgroundColor = () => {
        if (disabled) return colors.surfaceHighlight;
        switch (variant) {
            case 'primary': return colors.primary;
            case 'secondary': return colors.surface;
            case 'danger': return colors.status.danger;
            case 'tinted': return colors.primary + '20';
            case 'outline': return 'transparent';
            case 'ghost': return 'transparent';
            default: return colors.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return colors.text.tertiary;
        switch (variant) {
            case 'primary': return colors.text.inverse;
            case 'secondary': return colors.text.primary;
            case 'danger': return '#FFFFFF';
            case 'tinted': return colors.primary;
            case 'outline': return colors.text.primary;
            case 'ghost': return colors.text.secondary;
            default: return colors.text.inverse;
        }
    };

    const getSizeStyles = (): ViewStyle => {
        switch (size) {
            case 'small': return { paddingVertical: 8, paddingHorizontal: 16, minHeight: 36 };
            case 'large': return { paddingVertical: 18, paddingHorizontal: 32, minHeight: 56 };
            default: return { paddingVertical: 14, paddingHorizontal: 24, minHeight: 50 };
        }
    };

    const borderStyle: ViewStyle = variant === 'outline' ? {
        borderWidth: 1,
        borderColor: colors.border,
    } : {};

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                getSizeStyles(),
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
                    <Text style={[
                        styles.text,
                        { color: getTextColor(), marginLeft: icon ? 8 : 0 },
                        size === 'small' && { fontSize: 15 },
                        size === 'large' && { fontSize: 18 },
                        textStyle
                    ]}>
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
        borderRadius: 14, // iOS rounded rect
    },
    text: {
        fontSize: 17, // iOS body text size
        fontWeight: '600',
        textAlign: 'center',
    },
});
