import { AppMode, useAppModeStore } from '@/src/store/app-mode.store';
import { useThemeColors } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface ModeSwitchButtonProps {
    onPress: (targetMode: AppMode) => void;
}

export function ModeSwitchButton({ onPress }: ModeSwitchButtonProps) {
    const colors = useThemeColors();
    const { appMode } = useAppModeStore();
    const scale = useSharedValue(1);

    const targetMode = appMode === 'planning' ? 'expenses' : 'planning';
    const icon = appMode === 'planning' ? '💰' : '📋';
    const label = appMode === 'planning' ? 'Dépenses' : 'Planning';

    const handlePressIn = () => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    };

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress(targetMode);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={animatedStyle}>
            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                <View style={styles.content}>
                    <Text style={styles.icon}>{icon}</Text>
                    <View style={styles.textContainer}>
                        <Text style={[styles.label, { color: colors.text.secondary }]}>
                            Basculer vers
                        </Text>
                        <Text style={[styles.mode, { color: colors.text.primary }]}>
                            {label}
                        </Text>
                    </View>
                </View>
                <View style={[styles.arrow, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="arrow-forward" size={18} color={colors.primary} />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    icon: {
        fontSize: 32,
    },
    textContainer: {
        gap: 2,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
    },
    mode: {
        fontSize: 18,
        fontWeight: '600',
    },
    arrow: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
