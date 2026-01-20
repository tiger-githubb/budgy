import { useThemeColors } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

interface SwipeableItemProps {
    children: React.ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    leftLabel?: string;
    rightLabel?: string;
    leftColor?: string;
    rightColor?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    enabled?: boolean;
}

export const SwipeableItem: React.FC<SwipeableItemProps> = ({
    children,
    onSwipeLeft,
    onSwipeRight,
    leftLabel = 'Action',
    rightLabel = 'Action',
    leftColor,
    rightColor,
    leftIcon = 'cart',
    rightIcon = 'close-circle',
    enabled = true
}) => {
    const colors = useThemeColors();

    const resolvedLeftColor = leftColor || colors.status.success;
    const resolvedRightColor = rightColor || colors.status.danger;

    const renderLeftActions = () => {
        if (!onSwipeLeft) return null;
        return (
            <View style={[styles.actionContainer, { backgroundColor: resolvedLeftColor, justifyContent: 'flex-start' }]}>
                <Ionicons name={leftIcon} size={22} color="white" style={{ marginLeft: 20 }} />
                <Text style={[styles.actionText, { marginLeft: 8 }]}>{leftLabel}</Text>
            </View>
        );
    };

    const renderRightActions = () => {
        if (!onSwipeRight) return null;
        return (
            <View style={[styles.actionContainer, { backgroundColor: resolvedRightColor, justifyContent: 'flex-end' }]}>
                <Text style={[styles.actionText, { marginRight: 8 }]}>{rightLabel}</Text>
                <Ionicons name={rightIcon} size={22} color="white" style={{ marginRight: 20 }} />
            </View>
        );
    };

    return (
        <Swipeable
            renderLeftActions={onSwipeLeft ? renderLeftActions : undefined}
            renderRightActions={onSwipeRight ? renderRightActions : undefined}
            onSwipeableLeftOpen={onSwipeLeft}
            onSwipeableRightOpen={onSwipeRight}
            enabled={enabled}
            containerStyle={styles.container}
            friction={2}
            overshootFriction={8}
        >
            {children}
        </Swipeable>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 2,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    actionContainer: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        height: '100%',
    },
    actionText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 15,
    }
});
