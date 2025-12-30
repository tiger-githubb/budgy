import { COLORS, SPACING } from '@/src/theme';
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
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
    };

    return (
        <Card style={styles.card} variant="elevated">
            <View style={styles.header}>
                <Text style={styles.label}>Total Budget</Text>
                <Text style={styles.budgetAmount}>{formatMoney(budget)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
                <View style={styles.col}>
                    <Text style={styles.subLabel}>Planned</Text>
                    <Text style={styles.plannedAmount}>{formatMoney(plannedTotal)}</Text>
                </View>

                <View style={[styles.col, { alignItems: 'flex-end' }]}>
                    <Text style={styles.subLabel}>Remaining</Text>
                    <Text
                        style={[
                            styles.remainingAmount,
                            { color: isOverBudget ? COLORS.status.danger : COLORS.status.success }
                        ]}
                    >
                        {formatMoney(remaining)}
                    </Text>
                </View>
            </View>

            {isOverBudget && (
                <View style={styles.warningContainer}>
                    <Text style={styles.warningText}>Over Budget!</Text>
                </View>
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        // Custom style if needed
    },
    header: {
        marginBottom: SPACING.s,
    },
    label: {
        fontSize: 14,
        color: COLORS.text.secondary,
        marginBottom: 4,
    },
    budgetAmount: {
        fontSize: 32,
        fontWeight: '800', // Premium feel
        color: COLORS.text.primary,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.m,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    col: {
        flex: 1,
    },
    subLabel: {
        fontSize: 12,
        color: COLORS.text.tertiary,
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    plannedAmount: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    remainingAmount: {
        fontSize: 18,
        fontWeight: '700',
    },
    warningContainer: {
        marginTop: SPACING.m,
        backgroundColor: COLORS.status.danger + '20', // transparent red
        padding: SPACING.s,
        borderRadius: SPACING.s,
        alignItems: 'center',
    },
    warningText: {
        color: COLORS.status.danger,
        fontWeight: '700',
        fontSize: 14,
    },
});
