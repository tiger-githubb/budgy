import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { useStore } from '@/src/store/useStore';
import { SPACING } from '@/src/theme';
import { ItemStatus } from '@/src/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

export default function ItemFormScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { listId, itemId } = params;
    const { lists, addItem, updateItem, deleteItem } = useStore();

    const list = lists.find(l => l.id === listId);
    const existingItem = list?.items.find(i => i.id === itemId);
    const isEditing = !!existingItem;

    const [name, setName] = useState(existingItem?.name || '');
    const [amount, setAmount] = useState(existingItem?.amount?.toString() || '');
    const [status, setStatus] = useState<ItemStatus>(existingItem?.status || 'PLANNED');
    const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});

    const validate = () => {
        const newErrors: { name?: string; amount?: string } = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        if (!amount.trim()) newErrors.amount = 'Amount is required';
        else if (isNaN(Number(amount)) || Number(amount) <= 0) newErrors.amount = 'Amount must be greater than 0';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate() || !list) return;

        if (isEditing && existingItem) {
            updateItem(list.id, existingItem.id, { name, amount: Number(amount), status });
        } else {
            addItem(list.id, name, Number(amount), status);
        }
        router.back();
    };

    const handleDelete = () => {
        if (!list || !existingItem) return;
        Alert.alert("Delete Item", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: () => {
                    deleteItem(list.id, existingItem.id);
                    router.back();
                }
            }
        ]);
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
                            label="Item Name"
                            placeholder="e.g., Milk"
                            value={name}
                            onChangeText={setName}
                            error={errors.name}
                            autoFocus={!isEditing}
                        />

                        <Input
                            label="Amount"
                            placeholder="0"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            error={errors.amount}
                        />

                        {isEditing && (
                            <View style={styles.statusButtons}>
                                {(['PLANNED', 'PURCHASED', 'CANCELLED'] as const).map(s => (
                                    <Button
                                        key={s}
                                        title={s}
                                        variant={status === s ? 'primary' : 'outline'}
                                        onPress={() => setStatus(s)}
                                        style={{ flex: 1, marginHorizontal: 2 }}
                                        textStyle={{ fontSize: 10 }}
                                    />
                                ))}
                            </View>
                        )}

                        <View style={styles.actions}>
                            <Button
                                title="Cancel"
                                variant="ghost"
                                onPress={() => router.back()}
                                style={{ flex: 1, marginRight: SPACING.s }}
                            />
                            <Button
                                title={isEditing ? "Update Item" : "Add Item"}
                                onPress={handleSave}
                                style={{ flex: 1, marginLeft: SPACING.s }}
                            />
                        </View>

                        {isEditing && (
                            <Button
                                title="Delete Item"
                                variant="danger"
                                onPress={handleDelete}
                                style={{ marginTop: SPACING.m }}
                            />
                        )}
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
    statusButtons: {
        flexDirection: 'row',
        marginBottom: SPACING.m,
    },
    actions: {
        flexDirection: 'row',
        marginTop: SPACING.l,
    },
});
