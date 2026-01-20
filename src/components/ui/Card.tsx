import { useThemeColors } from '@/src/theme';
import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

interface CardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
    variant?: 'elevated' | 'flat' | 'insetGrouped';
    selected?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    onPress,
    variant = 'insetGrouped',
    selected = false
}) => {
    const colors = useThemeColors();

    const getCardStyle = (): ViewStyle => {
        const base: ViewStyle = {
            backgroundColor: colors.surface,
            borderRadius: 12, // iOS standard
        };

        if (selected) {
            return {
                ...base,
                borderWidth: 2,
                borderColor: colors.primary,
            };
        }

        return base;
    };

    const Content = (
        <View style={[styles.card, getCardStyle(), style]}>
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
        marginBottom: 12,
    },
    card: {
        padding: 16,
    },
});
