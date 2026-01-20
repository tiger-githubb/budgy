import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { useStore } from '@/src/store/useStore';
import { useThemeColors } from '@/src/theme';
import { ItemStatus } from '@/src/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

export default function ItemFormScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const colors = useThemeColors();
    const { listId, itemId } = params;
    const { lists, addItem, updateItem, deleteItem } = useStore();

    const list = lists.find(l => l.id === listId);
    const existingItem = list?.items.find(i => i.id === itemId);
    const isEditing = !!existingItem;
    const currency = list?.currency || '€';

    const [name, setName] = useState(existingItem?.name || '');
    const [amountRaw, setAmountRaw] = useState(existingItem?.amount?.toString() || '');
    const [amountDisplay, setAmountDisplay] = useState('');
    const [status, setStatus] = useState<ItemStatus>(existingItem?.status || 'PLANNED');
    const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});

    React.useEffect(() => {
        if (amountRaw) {
            handleAmountChange(amountRaw);
        }
    }, []);

    const formatNumberWithSpaces = (numStr: string) => {
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
            updateItem(list.id, existingItem.id, { name, amount: Number(amountRaw), status: existingItem.status });
        } else {
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
                                <Text style={[styles.currencySuffix, { color: colors.text.tertiary }]}>{currency}</Text>
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
        paddingTop: 24,
    },
    form: {
        flex: 1,
        paddingTop: 32,
        gap: 24,
    },
    actions: {
        marginTop: 16,
    },
    currencySuffix: {
        position: 'absolute',
        right: 16,
        top: 38,
        fontSize: 17,
        fontWeight: '500',
    },
});
