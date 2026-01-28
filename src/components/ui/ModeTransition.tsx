import { AppMode } from '@/src/store/app-mode.store';
import { useThemeColors } from '@/src/theme';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface ModeTransitionProps {
    visible: boolean;
    targetMode: AppMode | null;
    onComplete: () => void;
}

export function ModeTransition({ visible, targetMode, onComplete }: ModeTransitionProps) {
    const colors = useThemeColors();
    const progress = useSharedValue(0);
    const iconRotation = useSharedValue(0);
    const iconScale = useSharedValue(1);
    const [currentIcon, setCurrentIcon] = useState(targetMode === 'planning' ? '📋' : '💰');

    useEffect(() => {
        if (visible && targetMode) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setCurrentIcon(targetMode === 'planning' ? '💰' : '📋');

            progress.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });

            iconRotation.value = withSequence(
                withTiming(180, { duration: 600, easing: Easing.inOut(Easing.cubic) }),
                withTiming(360, { duration: 600, easing: Easing.inOut(Easing.cubic) })
            );

            iconScale.value = withSequence(
                withTiming(1.3, { duration: 400, easing: Easing.out(Easing.back()) }),
                withTiming(0.8, { duration: 200 }),
                withTiming(1.2, { duration: 300 })
            );

            setTimeout(() => {
                setCurrentIcon(targetMode === 'planning' ? '📋' : '💰');
            }, 800);

            setTimeout(() => {
                progress.value = withTiming(0, { duration: 400, easing: Easing.in(Easing.cubic) }, () => {
                    runOnJS(onComplete)();
                });
            }, 1800);
        }
    }, [visible, targetMode]);

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        transform: [{ scale: interpolate(progress.value, [0, 1], [1.1, 1]) }],
    }));

    const iconContainerStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${iconRotation.value}deg` },
            { scale: iconScale.value },
        ],
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0.3, 0.6], [0, 1]),
        transform: [{ translateY: interpolate(progress.value, [0.3, 0.6], [20, 0]) }],
    }));

    if (!visible) return null;

    const label = targetMode === 'planning' ? 'Mode Planning' : 'Mode Dépenses';
    const subtitle = targetMode === 'planning'
        ? 'Gérer vos budgets'
        : 'Suivre vos dépenses';

    return (
        <Animated.View style={[styles.container, { backgroundColor: colors.background }, overlayStyle]}>
            <View style={styles.content}>
                <Animated.View style={[styles.iconContainer, iconContainerStyle]}>
                    <View style={[styles.iconBackground, { backgroundColor: colors.primary + '20' }]}>
                        <View style={[styles.iconInner, { backgroundColor: colors.primary + '30' }]}>
                            <Text style={styles.icon}>{currentIcon}</Text>
                        </View>
                    </View>
                </Animated.View>

                <Animated.View style={textStyle}>
                    <Text style={[styles.label, { color: colors.text.primary }]}>{label}</Text>
                    <Text style={[styles.subtitle, { color: colors.text.tertiary }]}>{subtitle}</Text>
                </Animated.View>

                <View style={styles.dotsContainer}>
                    {[0, 1, 2].map((i) => (
                        <LoadingDot key={i} index={i} color={colors.primary} />
                    ))}
                </View>
            </View>
        </Animated.View>
    );
}

function LoadingDot({ index, color }: { index: number; color: string }) {
    const scale = useSharedValue(0.6);

    useEffect(() => {
        scale.value = withDelay(
            index * 150,
            withSequence(
                withTiming(1, { duration: 300 }),
                withTiming(0.6, { duration: 300 }),
                withTiming(1, { duration: 300 }),
                withTiming(0.6, { duration: 300 })
            )
        );
    }, []);

    const dotStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: interpolate(scale.value, [0.6, 1], [0.4, 1]),
    }));

    return (
        <Animated.View style={[styles.dot, { backgroundColor: color }, dotStyle]} />
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        gap: 24,
    },
    iconContainer: {
        marginBottom: 16,
    },
    iconBackground: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconInner: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 48,
    },
    label: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        marginTop: 8,
        textAlign: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 24,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});
