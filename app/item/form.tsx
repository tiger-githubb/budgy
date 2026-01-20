import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { useStore } from '@/src/store/useStore';
import { COLORS, SPACING } from '@/src/theme';
import { ItemStatus } from '@/src/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

export default function ItemFormScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { listId, itemId } = params;
    const { lists, addItem, updateItem, deleteItem } = useStore();

    const list = lists.find(l => l.id === listId);
    const existingItem = list?.items.find(i => i.id === itemId);
    const isEditing = !!existingItem;
    const currency = list?.currency || '€'; // Fallback

    const [name, setName] = useState(existingItem?.name || '');
    // Raw value for calculation, formatted for display
    const [amountRaw, setAmountRaw] = useState(existingItem?.amount?.toString() || '');
    const [amountDisplay, setAmountDisplay] = useState('');
    const [status, setStatus] = useState<ItemStatus>(existingItem?.status || 'PLANNED');
    const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});

    // Init formatted value
    React.useEffect(() => {
        if (amountRaw) {
            handleAmountChange(amountRaw);
        }
    }, []);

    const formatNumberWithSpaces = (numStr: string) => {
        const cleaned = numStr.replace(/[^0-9.]/g, ''); // Allow decimal point if needed, but user seems to use integers mostly. Sticking to simple integers for consistency with current code unless decimals requested? The list form used integer logic `replace(/[^0-9]/g, '')`. I'll stick to that for consistency.
        const integerCleaned = numStr.replace(/[^0-9]/g, '');
        if (!integerCleaned) return '';
        return integerCleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    const handleAmountChange = (text: string) => {
        const raw = text.replace(/\s/g, '');
        if (!isNaN(Number(raw))) {
            setAmountRaw(raw);
            setAmountDisplay(formatNumberWithSpaces(raw));
        } else if (text === '') {
            setAmountRaw('');
            setAmountDisplay('');
        }
    };

    const validate = () => {
        const newErrors: { name?: string; amount?: string } = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        if (!amountRaw.trim()) newErrors.amount = 'Amount is required';
        else if (isNaN(Number(amountRaw)) || Number(amountRaw) <= 0) newErrors.amount = 'Amount must be greater than 0';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate() || !list) return;

        if (isEditing && existingItem) {
            // Keep existing status if editing
            updateItem(list.id, existingItem.id, { name, amount: Number(amountRaw), status: existingItem.status });
        } else {
            // Default to PLANNED for new items
            addItem(list.id, name, Number(amountRaw), 'PLANNED');
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
                            label="Item Name"
                            placeholder="e.g., Milk"
                            value={name}
                            onChangeText={setName}
                            error={errors.name}
                            autoFocus={!isEditing}
                        />

                        <View>
                            <Input
                                label="Amount"
                                placeholder="0"
                                value={amountDisplay}
                                onChangeText={handleAmountChange}
                                keyboardType="numeric"
                                error={errors.amount}
                            />
                            {amountDisplay ? (
                                <Text style={styles.currencySuffix}>{currency}</Text>
                            ) : null}
                        </View>

                        <View style={styles.actions}>
                            <Button
                                title={isEditing ? "Update Item" : "Add Item"}
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
        marginTop: SPACING.m,
    },
    currencySuffix: {
        position: 'absolute',
        right: SPACING.m,
        top: 38,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.tertiary,
    },
});
