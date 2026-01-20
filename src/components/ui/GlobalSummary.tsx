import { useThemeColors } from '@/src/theme';
import { Currency } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface GlobalSummaryProps {
    totalBudget: number;
    totalSpent: number;
    currency: Currency;
    activeCount: number;
}

export const GlobalSummary: React.FC<GlobalSummaryProps> = ({
    totalBudget,
    totalSpent,
    currency,
    activeCount,
}) => {
    const colors = useThemeColors();

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
    };

    const remaining = totalBudget - totalSpent;
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const isOverBudget = remaining < 0;

    // Dynamic dark card colors
    const cardBg = colors.system.secondarySystemBackground;
    const dividerColor = colors.system.opaqueSeparator;

    return (
        <View style={[styles.container, { backgroundColor: cardBg }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.label, { color: colors.text.tertiary }]}>Total Budget</Text>
                    <Text style={[styles.bigValue, { color: colors.primary }]}>{formatMoney(totalBudget)}</Text>
                </View>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="wallet-outline" size={24} color={colors.primary} />
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            <View style={styles.row}>
                <View style={[styles.statItem, { flex: 1 }]}>
                    <Text style={[styles.subLabel, { color: colors.text.tertiary }]}>Spent</Text>
                    <Text style={[styles.subValue, { color: colors.text.primary }]}>
                        {formatMoney(totalSpent)}
                    </Text>
                </View>

                <View style={[styles.verticalDivider, { backgroundColor: dividerColor }]} />

                <View style={[styles.statItem, { flex: 1, alignItems: 'flex-end' }]}>
                    <Text style={[styles.subLabel, { color: colors.text.tertiary }]}>Remaining</Text>
                    <Text style={[
                        styles.subValue,
                        { color: isOverBudget ? colors.status.danger : colors.status.success }
                    ]}>
                        {formatMoney(remaining)}
                    </Text>
                </View>
            </View>

            {/* Progress bar */}
            <View style={[styles.progressBg, { backgroundColor: colors.system.systemGray5 }]}>
                <View style={[
                    styles.progressFill,
                    {
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: percentage > 100 ? colors.status.danger : colors.primary
                    }
                ]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        textTransform: 'uppercase',
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    bigValue: {
        fontSize: 34,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    iconContainer: {
        padding: 12,
        borderRadius: 50,
    },
    divider: {
        height: 1,
        marginBottom: 16,
    },
    verticalDivider: {
        width: 1,
        marginHorizontal: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statItem: {},
    subLabel: {
        fontSize: 11,
        marginBottom: 2,
        fontWeight: '500',
    },
    subValue: {
        fontSize: 17,
        fontWeight: '600',
    },
    progressBg: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
});
