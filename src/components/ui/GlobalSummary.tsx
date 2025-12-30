import { COLORS, RADIUS, SPACING } from '@/src/theme';
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
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
    };

    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.label}>Total Budget</Text>
                    <Text style={styles.bigValue}>{formatMoney(totalBudget)}</Text>
                </View>
                <View style={styles.iconContainer}>
                    <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
                <View style={styles.statItem}>
                    <Text style={styles.subLabel}>Spent</Text>
                    <Text style={styles.subValue}>
                        {formatMoney(totalSpent)}
                    </Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.subLabel}>Lists</Text>
                    <Text style={styles.subValue}>{activeCount}</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.subLabel}>Status</Text>
                    <Text style={[styles.subValue, { color: percentage > 100 ? COLORS.status.danger : COLORS.primary }]}>
                        {percentage > 100 ? 'Over' : 'Good'}
                    </Text>
                </View>
            </View>

            {/* Decorative progress line */}
            <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: percentage > 100 ? COLORS.status.danger : COLORS.primary }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: SPACING.l,
        borderRadius: RADIUS.l, // More rounded 24px
        backgroundColor: COLORS.secondary, // Black background
        marginBottom: SPACING.l,
        // Add subtle shadow for depth if needed, but we are waiting on flat design.
        // However, a hero card can have a gentle shadow.
        // Let's keep it flat but high contrast.
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.m,
    },
    label: {
        fontSize: 14,
        color: COLORS.text.tertiary, // Grey
        textTransform: 'uppercase',
        fontWeight: '600',
        marginBottom: 4,
    },
    bigValue: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.primary, // Gold
        letterSpacing: -1,
    },
    iconContainer: {
        padding: 10,
        backgroundColor: 'rgba(229, 184, 75, 0.15)', // Transparent Gold
        borderRadius: RADIUS.full,
    },
    divider: {
        height: 1,
        backgroundColor: '#27272A', // Zinc 800
        marginBottom: SPACING.m,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.m,
    },
    statItem: {
        // flex: 1,
    },
    subLabel: {
        fontSize: 12,
        color: COLORS.text.tertiary,
        marginBottom: 2,
    },
    subValue: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text.inverse, // White
    },
    progressBg: {
        height: 4,
        backgroundColor: '#27272A',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
});
