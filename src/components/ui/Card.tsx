import { useThemeColors } from '@/src/theme';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface CardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
    selected?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const Card: React.FC<CardProps> = ({ children, style, onPress, selected }) => {
    const colors = useThemeColors();
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.98, { damping: 15, stiffness: 200 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    };

    const handlePress = () => {
        if (onPress) {
            Haptics.selectionAsync();
            onPress();
        }
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedTouchable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={onPress ? 0.9 : 1}
            disabled={!onPress}
            style={[
                styles.card,
                {
                    backgroundColor: colors.surface,
                },
                selected && {
                    borderColor: colors.primary,
                    borderWidth: 2,
                },
                animatedStyle,
                style,
            ]}
        >
            {children}
        </AnimatedTouchable>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 18,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
});
