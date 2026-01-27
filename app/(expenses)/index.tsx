import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { routes } from '@/src/config/routes';
import { usePersonalExpenses } from '@/src/hooks/queries/use-expenses.query';
import { useThemeColors } from '@/src/theme';
import { PersonalExpense } from '@/src/types/expenses.type';
import { formatCurrency, formatDate, groupExpensesByDate } from '@/src/utils/balance';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function ExpensesHome() {
    const router = useRouter();
    const colors = useThemeColors();
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() + 1 };
    });

    const startDate = `${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}-01`;
    const endDate = new Date(selectedMonth.year, selectedMonth.month, 0).toISOString().split('T')[0];

    const { data: expenses, isLoading, refetch, isRefetching } = usePersonalExpenses({
        startDate,
        endDate,
    });

    const sections = useMemo(() => {
        if (!expenses) return [];
        const grouped = groupExpensesByDate(expenses);
        return Array.from(grouped.entries())
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, items]) => ({
                title: formatDate(date),
                date,
                data: items as PersonalExpense[],
                total: items.reduce((sum, e) => sum + Number((e as PersonalExpense).amount), 0),
            }));
    }, [expenses]);

    const monthTotal = useMemo(() => {
        if (!expenses) return 0;
        return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    }, [expenses]);

    const monthName = new Date(selectedMonth.year, selectedMonth.month - 1).toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
    });

    const goToPrevMonth = () => {
        Haptics.selectionAsync();
        setSelectedMonth((prev) => {
            if (prev.month === 1) {
                return { year: prev.year - 1, month: 12 };
            }
            return { ...prev, month: prev.month - 1 };
        });
    };

    const goToNextMonth = () => {
        Haptics.selectionAsync();
        setSelectedMonth((prev) => {
            if (prev.month === 12) {
                return { year: prev.year + 1, month: 1 };
            }
            return { ...prev, month: prev.month + 1 };
        });
    };

    const renderExpenseItem = ({ item, index }: { item: PersonalExpense; index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
            <TouchableOpacity
                style={[styles.expenseItem, { backgroundColor: colors.surface }]}
                activeOpacity={0.7}
                onPress={() => {
                    Haptics.selectionAsync();
                    router.push({
                        pathname: routes.expenses.addExpense,
                        params: { id: item.id }
                    });
                }}
            >
                <View style={[styles.categoryIcon, { backgroundColor: colors.surfaceHighlight }]}>
                    <Text style={styles.emoji}>{item.category?.emoji ?? '📦'}</Text>
                </View>
                <View style={styles.expenseInfo}>
                    <Text style={[styles.expenseTitle, { color: colors.text.primary }]}>{item.title}</Text>
                    <Text style={[styles.expenseCategory, { color: colors.text.tertiary }]}>
                        {item.category?.name ?? 'Autres'}
                    </Text>
                </View>
                <Text style={[styles.expenseAmount, { color: colors.text.primary }]}>
                    -{formatCurrency(Number(item.amount))}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );

    const renderSectionHeader = ({ section }: { section: { title: string; total: number } }) => (
        <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{section.title}</Text>
            <Text style={[styles.sectionTotal, { color: colors.text.secondary }]}>
                {formatCurrency(section.total)}
            </Text>
        </View>
    );

    return (
        <ScreenWrapper>
            <Animated.View entering={FadeInUp.delay(50).springify()}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text.primary }]}>Dépenses</Text>
                </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(100).springify()}>
                <View style={[styles.monthSelector, { backgroundColor: colors.surface }]}>
                    <TouchableOpacity
                        onPress={goToPrevMonth}
                        style={[styles.monthButton, { backgroundColor: colors.surfaceHighlight }]}
                    >
                        <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.monthText, { color: colors.text.primary }]}>{monthName}</Text>
                    <TouchableOpacity
                        onPress={goToNextMonth}
                        style={[styles.monthButton, { backgroundColor: colors.surfaceHighlight }]}
                    >
                        <Ionicons name="chevron-forward" size={20} color={colors.text.primary} />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(150).springify()}>
                <Card style={styles.totalCard}>
                    <View style={styles.totalCardContent}>
                        <View>
                            <Text style={[styles.totalLabel, { color: colors.text.tertiary }]}>Total du mois</Text>
                            <Text style={[styles.totalAmount, { color: colors.text.primary }]}>
                                {formatCurrency(monthTotal)}
                            </Text>
                        </View>
                        <View style={[styles.totalIcon, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="wallet" size={28} color={colors.primary} />
                        </View>
                    </View>
                </Card>
            </Animated.View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : sections.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
                        <Ionicons name="receipt-outline" size={48} color={colors.text.tertiary} />
                    </View>
                    <Text style={[styles.emptyText, { color: colors.text.primary }]}>
                        Aucune dépense ce mois
                    </Text>
                    <Text style={[styles.emptySubtext, { color: colors.text.tertiary }]}>
                        Ajoute ta première dépense
                    </Text>
                    <Button
                        title="Ajouter une dépense"
                        onPress={() => router.push(routes.expenses.addExpense)}
                        style={{ marginTop: 24 }}
                        icon={<Ionicons name="add" size={20} color="#fff" />}
                    />
                </View>
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id}
                    renderItem={renderExpenseItem}
                    renderSectionHeader={renderSectionHeader}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                    }
                    stickySectionHeadersEnabled={false}
                />
            )}

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    router.push(routes.expenses.addExpense);
                }}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 34,
        fontWeight: '700',
        letterSpacing: 0.37,
    },
    monthSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    monthButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    monthText: {
        fontSize: 17,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    totalCard: {
        marginBottom: 20,
    },
    totalCardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 4,
    },
    totalAmount: {
        fontSize: 32,
        fontWeight: '700',
    },
    totalIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyIconContainer: {
        width: 88,
        height: 88,
        borderRadius: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 15,
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: 100,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 4,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    sectionTotal: {
        fontSize: 15,
        fontWeight: '500',
    },
    expenseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 16,
        marginBottom: 8,
    },
    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 22,
    },
    expenseInfo: {
        flex: 1,
        marginLeft: 14,
    },
    expenseTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    expenseCategory: {
        fontSize: 13,
        marginTop: 3,
    },
    expenseAmount: {
        fontSize: 16,
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
});
