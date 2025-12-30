import { COLORS, RADIUS, SPACING } from '@/src/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

interface InputProps extends TextInputProps {
    label?: string;
    containerStyle?: StyleProp<ViewStyle>;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, containerStyle, error, style, ...props }) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    error ? styles.inputError : null,
                    style
                ]}
                placeholderTextColor={COLORS.text.tertiary}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.m,
    },
    label: {
        fontSize: 14,
        color: COLORS.text.primary, // Higher contrast
        marginBottom: SPACING.xs,
        fontWeight: '600',
    },
    input: {
        backgroundColor: COLORS.surface, // Or just transparent
        borderWidth: 1, // Visible border
        borderColor: COLORS.border,
        borderRadius: RADIUS.m,
        padding: SPACING.m,
        fontSize: 16,
        color: COLORS.text.primary,
        fontWeight: '500',
    },
    inputError: {
        borderColor: COLORS.status.danger,
        borderWidth: 1.5,
    },
    errorText: {
        color: COLORS.status.danger,
        fontSize: 12,
        marginTop: SPACING.xs,
        fontWeight: '600',
    },
});
