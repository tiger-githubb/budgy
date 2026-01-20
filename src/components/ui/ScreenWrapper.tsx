import { useThemeColors } from '@/src/theme';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    style,
    edges = ['top']
}) => {
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: colors.background,
                paddingTop: edges.includes('top') ? insets.top : 0,
                paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
            }
        ]}>
            <StatusBar style="auto" />
            <View style={[styles.content, style]}>
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
        paddingHorizontal: 16,
    },
});
