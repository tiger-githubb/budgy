import { Button } from '@/src/components/ui/Button';
import { FormContainer } from '@/src/components/ui/FormContainer';
import { IconButton } from '@/src/components/ui/IconButton';
import { Input } from '@/src/components/ui/Input';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { useStore } from '@/src/store/useStore';
import { useThemeColors } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function ItemFormScreen() {
    const { listId, itemId } = useLocalSearchParams<{ listId: string; itemId?: string }>();
    const router = useRouter();
    const colors = useThemeColors();
    const { lists, addItem, updateItem } = useStore();

    const list = lists.find(l => l.id === listId);
    const isEditing = !!itemId;
    const existingItem = isEditing && list ? list.items.find(i => i.id === itemId) : null;

    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');

    useEffect(() => {
        if (existingItem) {
            setName(existingItem.name);
            setAmount(existingItem.amount.toString());
        }
    }, [existingItem]);

    const handleSubmit = () => {
        if (!name.trim()) {
            Alert.alert('Erreur', 'Ajoute un nom pour l\'élément');
            return;
        }
        const parsedAmount = parseFloat(amount) || 0;

        if (isEditing && existingItem && list) {
            updateItem(list.id, existingItem.id, { name: name.trim(), amount: parsedAmount });
        } else if (list) {
            addItem(list.id, name.trim(), parsedAmount);
        }
        router.back();
    };

    if (!list) {
        return null;
    }

    const footerContent = (
        <Button
            title={isEditing ? 'Enregistrer' : 'Ajouter'}
            onPress={handleSubmit}
            icon={<Ionicons name={isEditing ? 'checkmark' : 'add'} size={20} color="#fff" />}
        />
    );

    return (
        <ScreenWrapper edges={['bottom']}>
            <Stack.Screen
                options={{
                    presentation: 'modal',
                    headerShown: true,
                    title: isEditing ? 'Modifier l\'élément' : 'Nouvel élément',
                    headerLeft: () => (
                        <IconButton name="close" onPress={() => router.back()} />
                    ),
                }}
            />

            <FormContainer footer={footerContent}>
                <Animated.View
                    entering={FadeInUp.delay(100).springify()}
                    style={styles.illustrationContainer}
                >
                    <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                        <View style={[styles.iconInner, { backgroundColor: colors.primary + '25' }]}>
                            <Ionicons name="cart" size={48} color={colors.primary} />
                        </View>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
                    <Input
                        label="Nom"
                        placeholder="Ex: Pain, Lait..."
                        value={name}
                        onChangeText={setName}
                        autoFocus
                    />

                    <Input
                        label="Montant"
                        placeholder="0"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="decimal-pad"
                    />
                </Animated.View>
            </FormContainer>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    illustrationContainer: {
        alignItems: 'center',
        marginBottom: 32,
        paddingTop: 16,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconInner: {
        width: 88,
        height: 88,
        borderRadius: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    form: {
        gap: 16,
    },
});
