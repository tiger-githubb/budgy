import { BudgetSummary } from '@/src/components/ui/BudgetSummary';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { SwipeableItem } from '@/src/components/ui/SwipeableItem';
import { calculateListTotals, useStore } from '@/src/store/useStore';
import { COLORS, RADIUS, SPACING } from '@/src/theme';
import { Item } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NestableDraggableFlatList, NestableScrollContainer, ScaleDecorator } from 'react-native-draggable-flatlist';

export default function ListDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { lists, deleteList, updateList, addItem, updateItem, deleteItem, reorderItems, settings } = useStore();

    const list = lists.find((l) => l.id === id);

    if (!list) {
        return (
            <ScreenWrapper>
                <Text>List not found</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ color: COLORS.primary, marginTop: 20 }}>Go Back</Text>
                </TouchableOpacity>
            </ScreenWrapper>
        );
    }

    const { planned, spent, remaining, isOverBudget } = calculateListTotals(list);

    // Group items
    const plannedItems = useMemo(() =>
        list.items.filter(i => i.status === 'PLANNED').sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        [list.items]);

    const purchasedItems = useMemo(() =>
        list.items.filter(i => i.status === 'PURCHASED').sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        [list.items]);

    const cancelledItems = useMemo(() =>
        list.items.filter(i => i.status === 'CANCELLED').sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        [list.items]);

    const handleDeleteList = () => {
        Alert.alert('Delete List', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    deleteList(list.id);
                    router.back();
                },
            },
        ]);
    };

    const handleEditList = () => {
        router.push(`/list/form?id=${list.id}`);
    };

    const handleAddItem = () => {
        router.push(`/item/form?listId=${list.id}`);
    };

    const onItemSwipeLeft = (item: Item) => {
        // Cancel
        if (item.status !== 'CANCELLED') {
            updateItem(list.id, item.id, { status: 'CANCELLED' });
        } else {
            // If already cancelled, maybe delete? User said "No confirmation necessary" for cancel.
            // Let's assume swipe left on cancelled does nothing or deletes?
            // "pour cancel un elements je veux qu'on le slide vers la gauche"
            // "pour les canced un swip a droite pour les ramener"
            // Let's allow Delete on Cancelled items via Swipe Left?
            Alert.alert("Delete Item", "Permanently delete?", [
                { text: "Cancel" },
                { text: "Delete", style: 'destructive', onPress: () => deleteItem(list.id, item.id) }
            ]);
        }
    };

    const onItemSwipeRight = (item: Item) => {
        // Purchase or Restore
        if (item.status === 'PLANNED') {
            updateItem(list.id, item.id, { status: 'PURCHASED' });
        } else if (item.status === 'PURCHASED') {
            updateItem(list.id, item.id, { status: 'PLANNED' }); // Undo purchase
        } else if (item.status === 'CANCELLED') {
            updateItem(list.id, item.id, { status: 'PLANNED' }); // Restore
        }
    };

    const renderItemCard = ({ item, drag, isActive }: { item: Item, drag: () => void, isActive: boolean }) => {
        // Determine interactions based on status
        const isCancelled = item.status === 'CANCELLED';
        const isPurchased = item.status === 'PURCHASED';

        return (
            <ScaleDecorator>
                <TouchableOpacity
                    onLongPress={drag}
                    disabled={isActive}
                    activeOpacity={1}
                >
                    <SwipeableItem
                        onSwipeLeft={() => onItemSwipeLeft(item)}
                        onSwipeRight={() => onItemSwipeRight(item)}
                        leftLabel={isCancelled ? "Delete" : "Cancel"}
                        rightLabel={isPurchased ? "Undo" : (isCancelled ? "Restore" : "Buy")}
                        leftColor={isCancelled ? COLORS.status.danger : COLORS.text.tertiary} // Grey for cancel, Red for delete
                        rightColor={isPurchased ? COLORS.status.warning : COLORS.status.success}
                    >
                        <View style={[
                            styles.itemCard,
                            isPurchased && styles.itemPurchased,
                            isCancelled && styles.itemCancelled,
                            isActive && styles.activeItem
                        ]}>
                            <View style={styles.itemInfo}>
                                <Text style={[
                                    styles.itemName,
                                    (isPurchased || isCancelled) && styles.strikeText,
                                    isCancelled && { color: COLORS.text.tertiary }
                                ]}>
                                    {item.name}
                                </Text>
                                {/* Short date or details? */}
                            </View>
                            <Text style={[
                                styles.itemAmount,
                                (isPurchased || isCancelled) && styles.strikeText
                            ]}>
                                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: list.currency }).format(item.amount)}
                            </Text>
                        </View>
                    </SwipeableItem>
                </TouchableOpacity>
            </ScaleDecorator>
        );
    };

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={1}>{list.name}</Text>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={handleEditList} style={styles.headerBtn}>
                        <Ionicons name="pencil" size={20} color={COLORS.text.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDeleteList} style={styles.headerBtn}>
                        <Ionicons name="trash-outline" size={20} color={COLORS.status.danger} />
                    </TouchableOpacity>
                </View>
            </View>

            <BudgetSummary
                budget={list.budget}
                plannedTotal={planned}
                remaining={remaining}
                currency={list.currency}
                isOverBudget={isOverBudget}
            />

            <View style={{ flex: 1 }}>
                <NestableScrollContainer contentContainerStyle={{ paddingBottom: 100 }}>

                    {/* Planned Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>To Buy ({plannedItems.length})</Text>
                        {!plannedItems.length && <Text style={styles.emptyFiles}>Nothing planned.</Text>}
                    </View>
                    <NestableDraggableFlatList
                        data={plannedItems}
                        renderItem={renderItemCard}
                        keyExtractor={(item) => item.id}
                        onDragEnd={({ data }) => reorderItems(list.id, data)}
                    />

                    {/* Purchased Section */}
                    {(purchasedItems.length > 0) && (
                        <>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: COLORS.status.success }]}>Purchased ({purchasedItems.length})</Text>
                            </View>
                            <NestableDraggableFlatList
                                data={purchasedItems}
                                renderItem={renderItemCard}
                                keyExtractor={(item) => item.id}
                                onDragEnd={({ data }) => reorderItems(list.id, data)}
                            />
                        </>
                    )}

                    {/* Cancelled Section */}
                    {(cancelledItems.length > 0) && (
                        <>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: COLORS.text.tertiary }]}>Cancelled ({cancelledItems.length})</Text>
                            </View>
                            <NestableDraggableFlatList
                                data={cancelledItems}
                                renderItem={renderItemCard}
                                keyExtractor={(item) => item.id}
                                onDragEnd={({ data }) => reorderItems(list.id, data)}
                            />
                        </>
                    )}

                </NestableScrollContainer>
            </View>

            <TouchableOpacity
                style={styles.fab}
                onPress={handleAddItem}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={32} color={COLORS.text.inverse} />
            </TouchableOpacity>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    headerBtn: {
        padding: SPACING.s,
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        color: COLORS.text.primary,
    },
    sectionHeader: {
        marginTop: SPACING.l,
        marginBottom: SPACING.s,
        paddingHorizontal: SPACING.xs,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    emptyFiles: {
        fontSize: 12,
        color: COLORS.text.tertiary,
        marginTop: 4,
        fontStyle: 'italic',
    },
    itemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.m,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.m,
        borderWidth: 1,
        borderColor: COLORS.border,
        minHeight: 60,
    },
    activeItem: {
        borderColor: COLORS.primary,
        backgroundColor: '#FFFBEB',
    },
    itemPurchased: {
        backgroundColor: '#F0FDF4', // Very light green
        borderColor: 'transparent',
    },
    itemCancelled: {
        backgroundColor: '#F4F4F5', // Grey
        borderColor: 'transparent',
        opacity: 0.8,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    itemAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    strikeText: {
        textDecorationLine: 'line-through',
        color: COLORS.text.tertiary,
    },
    fab: {
        position: 'absolute',
        bottom: SPACING.l,
        right: SPACING.l,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary, // Gold
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // Keep shadow for FAB as it floats
    },
});
