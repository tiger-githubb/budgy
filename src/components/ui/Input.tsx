import { useThemeColors } from '@/src/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

interface InputProps extends TextInputProps {
    label?: string;
    containerStyle?: StyleProp<ViewStyle>;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, containerStyle, error, style, ...props }) => {
    const colors = useThemeColors();

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, { color: colors.text.secondary }]}>
                    {label}
                </Text>
            )}
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: colors.system.systemGray6,
                        color: colors.text.primary,
                    },
                    error && { borderColor: colors.status.danger, borderWidth: 1 },
                    style
                ]}
                placeholderTextColor={colors.text.tertiary}
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
        fontWeight: '500',
        marginBottom: 6,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        borderRadius: 10, // iOS rounded rect for text fields
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 17,
        fontWeight: '400',
        minHeight: 50, // iOS standard height
    },
    errorText: {
        fontSize: 13,
        marginTop: 4,
        marginLeft: 4,
        fontWeight: '500',
    },
});
