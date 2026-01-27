import { Button } from '@/src/components/ui/Button';
import { FormContainer } from '@/src/components/ui/FormContainer';
import { IconButton } from '@/src/components/ui/IconButton';
import { Input } from '@/src/components/ui/Input';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import {
    useCategories,
    useCreatePersonalExpense,
    useDeletePersonalExpense,
    usePersonalExpense,
    useUpdatePersonalExpense,
} from '@/src/hooks/queries/use-expenses.query';
import { ExpensesService } from '@/src/services/expenses.service';
import { useThemeColors } from '@/src/theme';
import { ExpenseCategory } from '@/src/types/expenses.type';
import { formatDate } from '@/src/utils/balance';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function AddExpenseScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const id = params.id as string | undefined;

    const colors = useThemeColors();
    const { data: categories } = useCategories();

    // Query hooks
    const { data: expense } = usePersonalExpense(id);
    const createExpense = useCreatePersonalExpense();
    const updateExpense = useUpdatePersonalExpense();
    const deleteExpense = useDeletePersonalExpense();

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
    const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    // Fetch suggestions when category changes
    useEffect(() => {
        const loadSuggestions = async () => {
            if (selectedCategory?.id) {
                try {
                    const titles = await ExpensesService.getSuggestedTitles(selectedCategory.id);
                    // Filter out current title if it matches exactly to avoid redundancy
                    setSuggestions(titles.filter(t => t.toLowerCase() !== title.toLowerCase()));
                } catch (error) {
                    console.error('Failed to load suggestions', error);
                }
            } else {
                setSuggestions([]);
            }
        };
        loadSuggestions();
    }, [selectedCategory?.id]);

    // Populate form if editing
    useEffect(() => {
        if (expense) {
            setTitle(expense.title);
            setAmount(String(expense.amount));
            setExpenseDate(expense.expense_date.split('T')[0]);
            // If category matches by ID, set it. Assuming categories are loaded
            if (categories && expense.category) {
                const cat = categories.find(c => c.id === expense.category?.id);
                if (cat) setSelectedCategory(cat);
            }
        }
    }, [expense, categories]);

    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    });

    const isEditing = !!id;

    const handleSubmit = async () => {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            Alert.alert('Erreur', 'Ajoute un montant valide');
            return;
        }

        const finalTitle = title.trim() || selectedCategory?.name || 'Dépense';

        try {
            if (isEditing) {
                await updateExpense.mutateAsync({
                    id,
                    payload: {
                        title: finalTitle,
                        amount: parsedAmount,
                        category_id: selectedCategory?.id ?? null,
                        expense_date: expenseDate,
                    },
                });
            } else {
                await createExpense.mutateAsync({
                    title: finalTitle,
                    amount: parsedAmount,
                    category_id: selectedCategory?.id ?? null,
                    expense_date: expenseDate,
                });
            }
            router.back();
        } catch (error) {
            Alert.alert('Erreur', isEditing ? "Impossible de modifier la dépense" : "Impossible d'ajouter la dépense");
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Supprimer',
            'Veux-tu vraiment supprimer cette dépense ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (id) {
                                await deleteExpense.mutateAsync(id);
                                router.back();
                            }
                        } catch (error) {
                            Alert.alert('Erreur', "Impossible de supprimer la dépense");
                        }
                    },
                },
            ]
        );
    };

    const renderDateItem = ({ item, index }: { item: string; index: number }) => {
        const isSelected = expenseDate === item;
        return (
            <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
                <TouchableOpacity
                    style={[
                        styles.dateChip,
                        {
                            backgroundColor: isSelected ? colors.primary : colors.surface,
                            borderColor: isSelected ? colors.primary : colors.border,
                        },
                    ]}
                    onPress={() => setExpenseDate(item)}
                    activeOpacity={0.7}
                >
                    <Text
                        style={[
                            styles.dateText,
                            { color: isSelected ? '#fff' : colors.text.primary },
                        ]}
                    >
                        {formatDate(item)}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const renderCategoryItem = ({ item, index }: { item: ExpenseCategory; index: number }) => {
        const isSelected = selectedCategory?.id === item.id;
        return (
            <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
                <TouchableOpacity
                    style={[
                        styles.categoryItem,
                        {
                            backgroundColor: isSelected ? colors.primary + '20' : colors.surface,
                            borderColor: isSelected ? colors.primary : 'transparent',
                            borderWidth: isSelected ? 2 : 0,
                        },
                    ]}
                    onPress={() => setSelectedCategory(isSelected ? null : item)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.categoryIconBg, { backgroundColor: colors.surfaceHighlight }]}>
                        <Text style={styles.categoryEmoji}>{item.emoji}</Text>
                    </View>
                    <Text
                        style={[
                            styles.categoryName,
                            { color: isSelected ? colors.primary : colors.text.secondary },
                        ]}
                        numberOfLines={1}
                    >
                        {item.name}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const renderSuggestionItem = ({ item, index }: { item: string; index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
            <TouchableOpacity
                style={[styles.suggestionChip, { backgroundColor: colors.surfaceHighlight }]}
                onPress={() => setTitle(item)}
                activeOpacity={0.7}
            >
                <Text style={[styles.suggestionText, { color: colors.text.primary }]}>{item}</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    const footerContent = (
        <View style={{ gap: 12 }}>
            <Button
                title={isEditing ? "Modifier" : "Ajouter la dépense"}
                onPress={handleSubmit}
                loading={createExpense.isPending || updateExpense.isPending}
                icon={<Ionicons name={isEditing ? "save" : "checkmark"} size={20} color="#fff" />}
            />
            {isEditing && (
                <Button
                    title="Supprimer"
                    variant="outline"
                    onPress={handleDelete}
                    loading={deleteExpense.isPending}
                    textStyle={{ color: colors.status.danger }}
                    style={{ borderColor: colors.status.danger }}
                    icon={<Ionicons name="trash" size={20} color={colors.status.danger} />}
                />
            )}
        </View>
    );

    return (
        <ScreenWrapper edges={['bottom']}>
            <Stack.Screen
                options={{
                    presentation: 'modal',
                    headerShown: true,
                    title: isEditing ? 'Modifier la dépense' : 'Nouvelle dépense',
                    headerLeft: () => (
                        <IconButton name="close" onPress={() => router.back()} />
                    ),
                }}
            />

            <FormContainer footer={footerContent}>
                <Animated.View entering={FadeInDown.delay(50).springify()}>
                    <View style={[styles.amountCard, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.amountLabel, { color: colors.text.tertiary }]}>
                            Montant
                        </Text>
                        <View style={styles.amountInputRow}>
                            <Input
                                placeholder="0"
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="decimal-pad"
                                style={styles.amountInput}
                                containerStyle={styles.amountInputContainer}
                            />
                            <Text style={[styles.currency, { color: colors.text.secondary }]}>
                                XOF
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>
                        Date
                    </Text>
                    <FlatList
                        data={dates}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item}
                        renderItem={renderDateItem}
                        contentContainerStyle={styles.datesList}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>
                        Catégorie
                    </Text>
                    <FlatList
                        data={categories}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        renderItem={renderCategoryItem}
                        contentContainerStyle={styles.categoriesList}
                    />
                </View>

                <View style={styles.section}>
                    {suggestions.length > 0 && (
                        <View style={styles.suggestionsContainer}>
                            <FlatList
                                data={suggestions}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item) => item}
                                renderItem={renderSuggestionItem}
                                contentContainerStyle={styles.suggestionsList}
                            />
                        </View>
                    )}
                    <Input
                        label="Titre (Optionnel)"
                        placeholder={selectedCategory ? selectedCategory.name : "Ex: Restaurant, Transport..."}
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>
            </FormContainer>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    amountCard: {
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 24,
    },
    amountLabel: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    amountInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    amountInputContainer: {
        marginBottom: 0,
        flex: 0,
        minWidth: 120,
    },
    amountInput: {
        fontSize: 40,
        fontWeight: '700',
        textAlign: 'center',
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
    },
    currency: {
        fontSize: 24,
        fontWeight: '600',
        marginLeft: 8,
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
        marginLeft: 4,
    },
    datesList: {
        gap: 8,
    },
    dateChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '500',
    },
    categoriesList: {
        gap: 12,
    },
    categoryItem: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        width: 88,
        gap: 8,
    },
    categoryIconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryEmoji: {
        fontSize: 22,
    },
    categoryName: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
    suggestionsContainer: {
        marginBottom: 12,
    },
    suggestionsList: {
        gap: 8,
    },
    suggestionChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    suggestionText: {
        fontSize: 13,
        fontWeight: '500',
    },
});
