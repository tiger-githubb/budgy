import { Button } from '@/src/components/ui/Button';
import { FormContainer } from '@/src/components/ui/FormContainer';
import { Input } from '@/src/components/ui/Input';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { useStore } from '@/src/store/useStore';
import { useThemeColors } from '@/src/theme';
import { Currency } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function ListFormScreen() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const router = useRouter();
    const colors = useThemeColors();
    const { lists, settings, addList, updateList } = useStore();

    const isEditing = !!id;
    const existingList = isEditing ? lists.find(l => l.id === id) : null;

    const [name, setName] = useState('');
    const [budget, setBudget] = useState('');
    const [currency, setCurrency] = useState<Currency>(settings.defaultCurrency);

    useEffect(() => {
        if (existingList) {
            setName(existingList.name);
            setBudget(existingList.budget.toString());
            setCurrency(existingList.currency);
        }
    }, [existingList]);

    const currencies: { code: Currency; label: string; symbol: string }[] = [
        { code: 'XOF', label: 'CFA', symbol: 'F' },
        { code: 'EUR', label: 'Euro', symbol: '€' },
        { code: 'USD', label: 'Dollar', symbol: '$' },
    ];

    const handleSubmit = () => {
        if (!name.trim()) {
            Alert.alert('Erreur', 'Ajoute un nom pour le budget');
            return;
        }
        const parsedBudget = parseFloat(budget) || 0;

        if (isEditing && existingList) {
            updateList(existingList.id, { name: name.trim(), budget: parsedBudget, currency });
        } else {
            addList(name.trim(), parsedBudget);
        }
        router.back();
    };

    const footerContent = (
        <Button
            title={isEditing ? 'Enregistrer' : 'Créer le budget'}
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
                    title: isEditing ? 'Modifier le budget' : 'Nouveau budget',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="close" size={24} color={colors.text.primary} />
                        </TouchableOpacity>
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
                            <Ionicons name="wallet" size={48} color={colors.primary} />
                        </View>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
                    <Input
                        label="Nom du budget"
                        placeholder="Ex: Courses, Vacances..."
                        value={name}
                        onChangeText={setName}
                        autoFocus
                    />

                    <Input
                        label="Montant du budget"
                        placeholder="0"
                        value={budget}
                        onChangeText={setBudget}
                        keyboardType="decimal-pad"
                    />

                    <View style={styles.currencySection}>
                        <Text style={[styles.currencyLabel, { color: colors.text.tertiary }]}>Devise</Text>
                        <View style={styles.currencyRow}>
                            {currencies.map((c) => (
                                <TouchableOpacity
                                    key={c.code}
                                    style={[
                                        styles.currencyOption,
                                        { backgroundColor: colors.system.systemGray6 },
                                        currency === c.code && { backgroundColor: colors.primary }
                                    ]}
                                    onPress={() => setCurrency(c.code)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.currencySymbol,
                                        { color: colors.text.secondary },
                                        currency === c.code && { color: colors.text.inverse }
                                    ]}>{c.symbol}</Text>
                                    <Text style={[
                                        styles.currencyName,
                                        { color: colors.text.tertiary },
                                        currency === c.code && { color: colors.text.inverse }
                                    ]}>{c.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
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
    currencySection: {
        marginTop: 8,
    },
    currencyLabel: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginLeft: 4,
    },
    currencyRow: {
        flexDirection: 'row',
        gap: 8,
    },
    currencyOption: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    currencySymbol: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    currencyName: {
        fontSize: 13,
        fontWeight: '500',
    },
});
