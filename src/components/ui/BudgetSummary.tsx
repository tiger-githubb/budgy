import { useThemeColors } from '@/src/theme';
import { Currency } from '@/src/types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';

interface BudgetSummaryProps {
    budget: number;
    plannedTotal: number;
    remaining: number;
    currency: Currency;
    isOverBudget: boolean;
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({
    budget,
    plannedTotal,
    remaining,
    currency,
    isOverBudget,
}) => {
    const colors = useThemeColors();

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
    };

    return (
        <Card style={styles.card}>
            <View style={styles.header}>
                <Text style={[styles.label, { color: colors.text.secondary }]}>Total Budget</Text>
                <Text style={[styles.budgetAmount, { color: colors.text.primary }]}>{formatMoney(budget)}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.row}>
                <View style={styles.col}>
                    <Text style={[styles.subLabel, { color: colors.text.tertiary }]}>Planned</Text>
                    <Text style={[styles.plannedAmount, { color: colors.text.primary }]}>{formatMoney(plannedTotal)}</Text>
                </View>

                <View style={[styles.col, { alignItems: 'flex-end' }]}>
                    <Text style={[styles.subLabel, { color: colors.text.tertiary }]}>Remaining</Text>
                    <Text
                        style={[
                            styles.remainingAmount,
                            { color: isOverBudget ? colors.status.danger : colors.status.success }
                        ]}
                    >
                        {formatMoney(remaining)}
                    </Text>
                </View>
            </View>

            {isOverBudget && (
                <View style={[styles.warningContainer, { backgroundColor: colors.status.danger + '20' }]}>
                    <Text style={[styles.warningText, { color: colors.status.danger }]}>Over Budget!</Text>
                </View>
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {},
    header: {
        marginBottom: 8,
    },
    label: {
        fontSize: 13,
        marginBottom: 4,
        fontWeight: '500',
    },
    budgetAmount: {
        fontSize: 34,
        fontWeight: '700',
        letterSpacing: 0.37, // iOS large title
    },
    divider: {
        height: 1,
        marginVertical: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    col: {
        flex: 1,
    },
    subLabel: {
        fontSize: 11,
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '600',
    },
    plannedAmount: {
        fontSize: 17,
        fontWeight: '600',
    },
    remainingAmount: {
        fontSize: 17,
        fontWeight: '700',
    },
    warningContainer: {
        marginTop: 16,
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    warningText: {
        fontWeight: '600',
        fontSize: 14,
    },
});
