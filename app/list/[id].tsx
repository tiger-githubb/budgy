import { BudgetSummary } from '@/src/components/ui/BudgetSummary';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { SwipeableItem } from '@/src/components/ui/SwipeableItem';
import { calculateListTotals, useStore } from '@/src/store/useStore';
import { COLORS, RADIUS, SPACING } from '@/src/theme';
import { Item } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
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
        // Swipe Left: CANCEL or RESTORE
        if (item.status === 'CANCELLED') {
            // Restore to Planned
            updateItem(list.id, item.id, { status: 'PLANNED' });
        } else {
            // Move to Cancelled
            updateItem(list.id, item.id, { status: 'CANCELLED' });
        }
    };

    const onItemSwipeRight = (item: Item) => {
        // Swipe Right: DELETE
        Alert.alert("Delete Item", "Permanently delete?", [
            { text: "Cancel" },
            { text: "Delete", style: 'destructive', onPress: () => deleteItem(list.id, item.id) }
        ]);
    };

    const toggleStatus = (item: Item) => {
        if (item.status === 'PLANNED') {
            updateItem(list.id, item.id, { status: 'PURCHASED' });
        } else if (item.status === 'PURCHASED') {
            updateItem(list.id, item.id, { status: 'PLANNED' });
        }
    };

    const handleEditItem = (item: Item) => {
        router.push(`/item/form?listId=${list.id}&itemId=${item.id}`);
    };

    const renderItemCard = ({ item, drag, isActive }: { item: Item, drag: () => void, isActive: boolean }) => {
        const isCancelled = item.status === 'CANCELLED';
        const isPurchased = item.status === 'PURCHASED';

        return (
            <ScaleDecorator activeScale={1}>
                <SwipeableItem
                    onSwipeLeft={() => onItemSwipeLeft(item)}
                    onSwipeRight={() => onItemSwipeRight(item)}
                    leftLabel={isCancelled ? "Restore" : "Cancel"}
                    rightLabel="Delete"
                    leftColor={isCancelled ? COLORS.status.info : COLORS.text.tertiary}
                    rightColor={COLORS.status.danger}
                    leftIcon={isCancelled ? "arrow-undo" : "close-circle"}
                    rightIcon="trash"
                >
                    <View style={[
                        styles.itemCard,
                        isPurchased && styles.itemPurchased,
                        isCancelled && styles.itemCancelled,
                        isActive && styles.activeItem
                    ]}>
                        {/* Checkbox / Drag Handle */}
                        <TouchableOpacity
                            onPress={() => toggleStatus(item)}
                            onLongPress={drag}
                            style={styles.checkboxContainer}
                            activeOpacity={0.6}
                        >
                            <View style={[styles.checkbox, isPurchased && styles.checkboxChecked]}>
                                {isPurchased && <Ionicons name="checkmark" size={14} color="white" />}
                            </View>
                        </TouchableOpacity>

                        {/* Editable Body */}
                        <TouchableOpacity
                            style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                            onPress={() => handleEditItem(item)}
                        >
                            <View style={styles.itemInfo}>
                                <Text style={[
                                    styles.itemName,
                                    (isPurchased || isCancelled) && styles.strikeText,
                                    isCancelled && { color: COLORS.text.tertiary }
                                ]}>
                                    {item.name}
                                </Text>
                            </View>
                            <Text style={[
                                styles.itemAmount,
                                (isPurchased || isCancelled) && styles.strikeText
                            ]}>
                                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: list.currency }).format(item.amount)}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </SwipeableItem>
            </ScaleDecorator>
        );
    };

    return (
        <ScreenWrapper>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: list.name,
                    headerTintColor: COLORS.text.primary,
                    headerShadowVisible: false, // Flat look
                    headerStyle: { backgroundColor: COLORS.background },

                    headerRight: () => (
                        <View style={{ flexDirection: 'row', gap: SPACING.s }}>
                            <TouchableOpacity onPress={handleEditList} style={styles.headerBtn}>
                                <Ionicons name="pencil" size={20} color={COLORS.text.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDeleteList} style={styles.headerBtn}>
                                <Ionicons name="trash-outline" size={20} color={COLORS.status.danger} />
                            </TouchableOpacity>
                        </View>
                    )
                }}
            />

            <BudgetSummary
                budget={list.budget}
                plannedTotal={planned}
                remaining={remaining}
                currency={list.currency}
                isOverBudget={isOverBudget}
            />

            <View style={styles.listContainer}>
                <NestableScrollContainer contentContainerStyle={{ paddingBottom: 100 }}>

                    {/* Planned Section */}
                    {/* ... (rest of sections) */}
                    {/* Reuse existing logic but check closing tags */}
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
    headerBtn: {
        padding: SPACING.s,
    },
    listContainer: {
        flex: 1,
        backgroundColor: COLORS.surfaceSecondary, // #f9f9fb
        borderRadius: RADIUS.l,
        padding: SPACING.m,
        marginTop: SPACING.m,
    },
    sectionHeader: {
        marginTop: SPACING.m,
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
        alignItems: 'center', // Fix previous shadow warnings on Android if needed, but keeping simple
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    checkboxContainer: {
        padding: SPACING.s,
        marginRight: SPACING.s,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: COLORS.text.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: COLORS.status.success,
        borderColor: COLORS.status.success,
    },
});
