import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { useStore } from '@/src/store/useStore';
import { COLORS, SPACING } from '@/src/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

export default function ListFormScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { addList, updateList, lists, settings } = useStore();

    const isEditing = !!params.id;
    const existingList = isEditing ? lists.find(l => l.id === params.id) : null;
    const currency = existingList?.currency || settings.defaultCurrency;

    const [name, setName] = useState(existingList?.name || '');
    // Store raw number for calculation, formatted string for display
    const [budgetRaw, setBudgetRaw] = useState(existingList?.budget?.toString() || '');
    const [budgetDisplay, setBudgetDisplay] = useState('');
    const [errors, setErrors] = useState<{ name?: string; budget?: string }>({});

    useEffect(() => {
        if (budgetRaw) {
            handleBudgetChange(budgetRaw);
        }
    }, []);

    const formatNumberWithSpaces = (numStr: string) => {
        // Remove non-numeric chars
        const cleaned = numStr.replace(/[^0-9]/g, '');
        if (!cleaned) return '';
        // Format with space every 3 digits
        return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    const handleBudgetChange = (text: string) => {
        // Remove spaces to get raw value
        const raw = text.replace(/\s/g, '');
        if (!isNaN(Number(raw))) {
            setBudgetRaw(raw);
            setBudgetDisplay(formatNumberWithSpaces(raw));
        } else if (text === '') {
            setBudgetRaw('');
            setBudgetDisplay('');
        }
    };

    const validate = () => {
        const newErrors: { name?: string; budget?: string } = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        if (!budgetRaw.trim()) newErrors.budget = 'Budget is required';
        else if (isNaN(Number(budgetRaw)) || Number(budgetRaw) <= 0) newErrors.budget = 'Budget must be greater than 0';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;

        if (isEditing && existingList) {
            updateList(existingList.id, { name, budget: Number(budgetRaw) });
        } else {
            addList(name, Number(budgetRaw));
        }
        router.back();
    };

    return (
        <ScreenWrapper style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View style={styles.form}>
                        <Input
                            label="List Name"
                            placeholder="e.g., Weekly Groceries"
                            value={name}
                            onChangeText={setName}
                            error={errors.name}
                            autoFocus={!isEditing}
                        />

                        <View>
                            <Input
                                label="Budget Amount"
                                placeholder="0"
                                value={budgetDisplay}
                                onChangeText={handleBudgetChange}
                                keyboardType="numeric"
                                error={errors.budget}
                            />
                            {budgetDisplay ? (
                                <Text style={styles.currencySuffix}>{currency}</Text>
                            ) : null}
                        </View>

                        <View style={styles.actions}>
                            <Button
                                title={isEditing ? "Update Budget" : "Create Budget"}
                                onPress={handleSave}
                                style={{ width: '100%' }}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: SPACING.l,
    },
    form: {
        flex: 1,
        paddingTop: SPACING.xl,
        gap: SPACING.l,
    },
    actions: {
        marginTop: SPACING.xl,
    },
    currencySuffix: {
        position: 'absolute',
        right: SPACING.m,
        top: 38, // Adjust based on Input height/label
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.tertiary,
    },
});
