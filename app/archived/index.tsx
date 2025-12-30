import { Card } from '@/src/components/ui/Card';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { calculateListTotals, useStore } from '@/src/store/useStore';
import { COLORS, SPACING } from '@/src/theme';
import { List } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

export default function ArchivedListsScreen() {
    const router = useRouter();
    const { lists, settings, unarchiveLists, deleteLists } = useStore();

    const archivedLists = useMemo(() => lists.filter(l => l.isArchived).sort((a, b) => b.createdAt - a.createdAt), [lists]);

    const handleUnarchive = (id: string) => {
        unarchiveLists([id]);
    };

    const handleDelete = (id: string) => {
        Alert.alert("Delete Forever", "This cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteLists([id]) }
        ]);
    };

    const renderItem = ({ item, index }: { item: List, index: number }) => {
        const { remaining } = calculateListTotals(item);

        return (
            <Animated.View entering={FadeInDown.delay(index * 50)} layout={Layout.springify()}>
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.listName}>{item.name}</Text>
                        <View style={styles.actions}>
                            <TouchableOpacity onPress={() => handleUnarchive(item.id)} style={styles.actionBtn}>
                                <Ionicons name="arrow-undo" size={20} color={COLORS.text.secondary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                                <Ionicons name="trash" size={20} color={COLORS.status.danger} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <Text style={styles.value}>
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: item.currency || settings.defaultCurrency }).format(item.budget)}
                        </Text>
                        <Text style={[styles.value, { color: COLORS.text.tertiary }]}>
                            Archived
                        </Text>
                    </View>
                </Card>
            </Animated.View>
        );
    };

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Archived Lists</Text>
                <View style={{ width: 24 }} />
            </View>

            {archivedLists.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No archived lists.</Text>
                </View>
            ) : (
                <FlatList
                    data={archivedLists}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            )}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: SPACING.l,
    },
    backButton: {
        padding: SPACING.s,
        marginLeft: -SPACING.s,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text.primary,
    },
    card: {
        marginBottom: SPACING.m,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    listName: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text.tertiary, // Dimmed for archived
        textDecorationLine: 'line-through',
    },
    actions: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    actionBtn: {
        padding: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.tertiary,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.text.tertiary,
    },
});
