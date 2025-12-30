import { COLORS, RADIUS, SPACING } from '@/src/theme';
import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

interface CardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
    variant?: 'elevated' | 'flat' | 'outlined';
    selected?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, variant = 'outlined', selected = false }) => {
    const baseStyle = [
        styles.card,
        selected && styles.selected
    ];

    const Content = (
        <View style={[baseStyle, style]}>
            {children}
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.touchable}>
                {Content}
            </TouchableOpacity>
        );
    }

    return Content;
};

const styles = StyleSheet.create({
    touchable: {
        marginBottom: SPACING.m,
    },
    card: {
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border, // Now strictly using the subtle border color
        // marginBottom handled by wrapper or parent
    },
    selected: {
        borderColor: COLORS.primary,
        backgroundColor: '#FFFBEB', // Very light gold tint
        borderWidth: 1.5,
    },
});
