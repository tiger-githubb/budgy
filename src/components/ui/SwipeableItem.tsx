import { COLORS, RADIUS, SPACING } from '@/src/theme';
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
    enabled?: boolean;
}

export const SwipeableItem: React.FC<SwipeableItemProps> = ({
    children,
    onSwipeLeft,
    onSwipeRight,
    leftLabel = 'Action',
    rightLabel = 'Action',
    leftColor = COLORS.status.success,
    rightColor = COLORS.status.danger,
    enabled = true
}) => {

    const renderLeftActions = (progress: any, dragX: any) => {
        if (!onSwipeLeft) return null;
        return (
            <View style={[styles.actionContainer, { backgroundColor: leftColor, justifyContent: 'flex-start' }]}>
                <Ionicons name="cart" size={24} color="white" style={{ marginLeft: 20 }} />
                <Text style={[styles.actionText, { marginLeft: 10 }]}>{leftLabel}</Text>
            </View>
        );
    };

    const renderRightActions = (progress: any, dragX: any) => {
        if (!onSwipeRight) return null;
        return (
            <View style={[styles.actionContainer, { backgroundColor: rightColor, justifyContent: 'flex-end' }]}>
                <Text style={[styles.actionText, { marginRight: 10 }]}>{rightLabel}</Text>
                <Ionicons name="close-circle" size={24} color="white" style={{ marginRight: 20 }} />
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
        >
            {children}
        </Swipeable>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.m,
        borderRadius: RADIUS.m,
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
        fontWeight: '700',
        fontSize: 14,
        textTransform: 'uppercase',
    }
});
