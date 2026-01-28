import { useThemeColors } from '@/src/theme';
import React, { useState } from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface InputProps extends TextInputProps {
    label?: string;
    containerStyle?: StyleProp<ViewStyle>;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, containerStyle, error, style, ...props }) => {
    const colors = useThemeColors();
    const [isFocused, setIsFocused] = useState(false);
    const focusProgress = useSharedValue(0);

    const handleFocus = () => {
        setIsFocused(true);
        focusProgress.value = withTiming(1, { duration: 200 });
    };

    const handleBlur = () => {
        setIsFocused(false);
        focusProgress.value = withTiming(0, { duration: 200 });
    };

    const animatedInputStyle = useAnimatedStyle(() => ({
        borderColor: interpolateColor(
            focusProgress.value,
            [0, 1],
            [colors.border, colors.primary]
        ),
        borderWidth: focusProgress.value === 0 ? 0 : 1.5,
    }));

    const animatedLabelStyle = useAnimatedStyle(() => ({
        color: interpolateColor(
            focusProgress.value,
            [0, 1],
            [colors.text.secondary, colors.primary]
        ),
    }));

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Animated.Text style={[styles.label, animatedLabelStyle]}>
                    {label}
                </Animated.Text>
            )}
            <AnimatedTextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: colors.system.systemGray6,
                        color: colors.text.primary,
                    },
                    animatedInputStyle,
                    error && { borderColor: colors.status.danger, borderWidth: 1.5 },
                    style
                ]}
                placeholderTextColor={colors.text.tertiary}
                onFocus={handleFocus}
                onBlur={handleBlur}
                {...props}
            />
            {error && (
                <Text style={[styles.errorText, { color: colors.status.danger }]}>
                    {error}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 17,
        fontWeight: '400',
        minHeight: 52,
    },
    errorText: {
        fontSize: 13,
        marginTop: 6,
        marginLeft: 4,
        fontWeight: '500',
    },
});
