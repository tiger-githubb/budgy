import { AppMode, useAppModeStore } from '@/src/store/app-mode.store';
import { useThemeColors } from '@/src/theme';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const modes: { key: AppMode; label: string; icon: string }[] = [
    { key: 'planning', label: 'Planning', icon: '📋' },
    { key: 'expenses', label: 'Dépenses', icon: '💰' },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function ModeSwitcher() {
    const colors = useThemeColors();
    const { appMode, setAppMode } = useAppModeStore();
    const progress = useSharedValue(appMode === 'planning' ? 0 : 1);
    const pressScale = useSharedValue(1);

    const handlePress = (mode: AppMode) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        progress.value = withSpring(mode === 'planning' ? 0 : 1, {
            damping: 18,
            stiffness: 180,
            mass: 0.8,
        });
        setAppMode(mode);
    };

    const handlePressIn = () => {
        pressScale.value = withTiming(0.98, { duration: 100 });
    };

    const handlePressOut = () => {
        pressScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    };

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: interpolate(progress.value, [0, 1], [0, 1]) * (155 / 2) },
        ],
        width: '50%',
    }));

    const containerScale = useAnimatedStyle(() => ({
        transform: [{ scale: pressScale.value }],
    }));

    const planningTextStyle = useAnimatedStyle(() => ({
        color: interpolateColor(
            progress.value,
            [0, 1],
            [colors.text.primary, colors.text.tertiary]
        ),
    }));

    const expensesTextStyle = useAnimatedStyle(() => ({
        color: interpolateColor(
            progress.value,
            [0, 1],
            [colors.text.tertiary, colors.text.primary]
        ),
    }));

    const planningIconStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 0.5, 1], [1, 0.5, 0.6]),
        transform: [
            { scale: interpolate(progress.value, [0, 1], [1.1, 0.9]) },
        ],
    }));

    const expensesIconStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 0.5, 1], [0.6, 0.5, 1]),
        transform: [
            { scale: interpolate(progress.value, [0, 1], [0.9, 1.1]) },
        ],
    }));

    return (
        <Animated.View
            style={[
                styles.container,
                { backgroundColor: colors.surfaceHighlight },
                containerScale,
            ]}
        >
            <Animated.View
                style={[
                    styles.indicator,
                    { backgroundColor: colors.surface },
                    indicatorStyle,
                ]}
            />
            {modes.map((mode, index) => (
                <AnimatedTouchable
                    key={mode.key}
                    style={styles.button}
                    onPress={() => handlePress(mode.key)}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={1}
                >
                    <Animated.Text
                        style={[
                            styles.icon,
                            index === 0 ? planningIconStyle : expensesIconStyle,
                        ]}
                    >
                        {mode.icon}
                    </Animated.Text>
                    <Animated.Text
                        style={[
                            styles.label,
                            index === 0 ? planningTextStyle : expensesTextStyle,
                        ]}
                    >
                        {mode.label}
                    </Animated.Text>
                </AnimatedTouchable>
            ))}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 4,
        width: '100%',
        maxWidth: 320,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    indicator: {
        position: 'absolute',
        height: '100%',
        borderRadius: 12,
        top: 4,
        left: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        zIndex: 1,
    },
    icon: {
        fontSize: 18,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: -0.2,
    },
});
