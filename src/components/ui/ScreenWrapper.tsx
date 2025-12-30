import { COLORS, SPACING } from '@/src/theme';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, SafeAreaView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, style }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={[styles.content, style]}>
                {children}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === 'android' ? 30 : 0, // Simple fix for Android status bar
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.m,
    },
});
