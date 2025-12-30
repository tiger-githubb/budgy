import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { useStore } from '@/src/store/useStore';
import { SPACING } from '@/src/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

export default function ListFormScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { addList, updateList, lists } = useStore();

    const isEditing = !!params.id;
    const existingList = isEditing ? lists.find(l => l.id === params.id) : null;

    const [name, setName] = useState(existingList?.name || '');
    const [budget, setBudget] = useState(existingList?.budget?.toString() || '');
    const [errors, setErrors] = useState<{ name?: string; budget?: string }>({});

    const validate = () => {
        const newErrors: { name?: string; budget?: string } = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        if (!budget.trim()) newErrors.budget = 'Budget is required';
        else if (isNaN(Number(budget)) || Number(budget) <= 0) newErrors.budget = 'Budget must be greater than 0';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;

        if (isEditing && existingList) {
            updateList(existingList.id, { name, budget: Number(budget) });
        } else {
            addList(name, Number(budget));
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

                        <Input
                            label="Budget Amount"
                            placeholder="0"
                            value={budget}
                            onChangeText={setBudget}
                            keyboardType="numeric"
                            error={errors.budget}
                        />

                        <View style={styles.actions}>
                            <Button
                                title="Cancel"
                                variant="ghost"
                                onPress={() => router.back()}
                                style={{ flex: 1, marginRight: SPACING.s }}
                            />
                            <Button
                                title={isEditing ? "Update Budget" : "Create Budget"}
                                onPress={handleSave}
                                style={{ flex: 1, marginLeft: SPACING.s }}
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
    },
    actions: {
        flexDirection: 'row',
        marginTop: SPACING.xl,
    },
});
