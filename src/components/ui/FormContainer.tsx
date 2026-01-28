import { useThemeColors } from '@/src/theme';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleProp,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FormContainerProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    footer?: React.ReactNode;
    showsScrollIndicator?: boolean;
}

export const FormContainer: React.FC<FormContainerProps> = ({
    children,
    style,
    contentContainerStyle,
    footer,
    showsScrollIndicator = false,
}) => {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();

    const handleDismissKeyboard = () => {
        Keyboard.dismiss();
        Haptics.selectionAsync();
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, style]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <TouchableWithoutFeedback onPress={handleDismissKeyboard} accessible={false}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: footer ? 16 : insets.bottom + 16 },
                        contentContainerStyle,
                    ]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={showsScrollIndicator}
                    bounces={true}
                    alwaysBounceVertical={false}
                >
                    {children}
                </ScrollView>
            </TouchableWithoutFeedback>
            {footer && (
                <View
                    style={[
                        styles.footer,
                        {
                            backgroundColor: colors.background,
                            paddingBottom: insets.bottom || 16,
                        },
                    ]}
                >
                    {footer}
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 8,
    },
    footer: {
        paddingTop: 16,
        paddingHorizontal: 0,
    },
});
