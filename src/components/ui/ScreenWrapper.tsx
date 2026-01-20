import { COLORS, SPACING } from '@/src/theme';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    backgroundColor?: string;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    style,
    backgroundColor = COLORS.background
}) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
            <StatusBar style="dark" />
            <View style={[styles.content, { paddingBottom: insets.bottom }, style]}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.m,
    },
});
