import { BudgetSummary } from '@/src/components/ui/BudgetSummary';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { SwipeableItem } from '@/src/components/ui/SwipeableItem';
import { calculateListTotals, useStore } from '@/src/store/useStore';
import { useThemeColors } from '@/src/theme';
import { Item } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NestableDraggableFlatList, NestableScrollContainer } from 'react-native-draggable-flatlist';

export default function ListDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const colors = useThemeColors();
    const { lists, deleteList, updateItem, deleteItem, reorderItems } = useStore();

    const list = lists.find((l) => l.id === id);

    if (!list) {
        return null;
    }

    const { planned, remaining, isOverBudget } = calculateListTotals(list);

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
        Alert.alert('Supprimer', 'Voulez-vous vraiment supprimer ce budget ?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer',
                style: 'destructive',
                onPress: () => {
                    deleteList(list.id);
                    router.replace('/(planning)');
                },
            },
        ]);
    };

    const handleEditList = () => {
        router.push({ pathname: '/list/form', params: { id: list.id } });
    };

    const handleAddItem = () => {
        router.push({ pathname: '/item/form', params: { listId: list.id } });
    };

    const onItemSwipeLeft = (item: Item) => {
        if (item.status === 'CANCELLED') {
            updateItem(list.id, item.id, { status: 'PLANNED' });
        } else {
            updateItem(list.id, item.id, { status: 'CANCELLED' });
        }
    };

    const onItemSwipeRight = (item: Item) => {
        Alert.alert("Supprimer", "Supprimer définitivement ?", [
            { text: "Annuler" },
            { text: "Supprimer", style: 'destructive', onPress: () => deleteItem(list.id, item.id) }
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
        router.push({ pathname: '/item/form', params: { listId: list.id, itemId: item.id } });
    };

    const renderItemCard = ({ item, drag, isActive }: { item: Item, drag: () => void, isActive: boolean }) => {
        const isCancelled = item.status === 'CANCELLED';
        const isPurchased = item.status === 'PURCHASED';

        return (
            <SwipeableItem
                onSwipeLeft={() => onItemSwipeLeft(item)}
                onSwipeRight={() => onItemSwipeRight(item)}
                leftLabel={isCancelled ? "Restaurer" : "Annuler"}
                rightLabel="Supprimer"
                leftColor={isCancelled ? colors.status.info : colors.text.tertiary}
                rightColor={colors.status.danger}
                leftIcon={isCancelled ? "arrow-undo" : "close-circle"}
                rightIcon="trash"
            >
                <View style={[
                    styles.itemCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    isPurchased && { backgroundColor: colors.status.success + '10', borderColor: 'transparent' },
                    isCancelled && { backgroundColor: colors.system.systemGray6, borderColor: 'transparent', opacity: 0.8 },
                    isActive && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
                ]}>
                    <TouchableOpacity
                        onPress={() => toggleStatus(item)}
                        onLongPress={drag}
                        style={styles.checkboxContainer}
                        activeOpacity={0.6}
                    >
                        <View style={[
                            styles.checkbox,
                            { borderColor: colors.text.tertiary },
                            isPurchased && { backgroundColor: colors.status.success, borderColor: colors.status.success }
                        ]}>
                            {isPurchased && <Ionicons name="checkmark" size={14} color="white" />}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => handleEditItem(item)}
                    >
                        <View style={styles.itemInfo}>
                            <Text style={[
                                styles.itemName,
                                { color: colors.text.primary },
                                (isPurchased || isCancelled) && styles.strikeText,
                                isCancelled && { color: colors.text.tertiary }
                            ]}>
                                {item.name}
                            </Text>
                        </View>
                        <Text style={[
                            styles.itemAmount,
                            { color: colors.text.primary },
                            (isPurchased || isCancelled) && [styles.strikeText, { color: colors.text.tertiary }]
                        ]}>
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: list.currency }).format(item.amount)}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SwipeableItem>
        );
    };

    return (
        <ScreenWrapper>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: typeof list.name === 'string' ? list.name : 'Budget',
                    headerBackTitle: '', // Hides the "Back" text, keeps the arrow
                    headerTintColor: colors.text.primary,
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: colors.background },
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity onPress={handleEditList} style={styles.headerBtn}>
                                <Ionicons name="pencil" size={20} color={colors.text.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDeleteList} style={styles.headerBtn}>
                                <Ionicons name="trash-outline" size={20} color={colors.status.danger} />
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

            <View style={[styles.listContainer, { backgroundColor: colors.background }]}>
                <NestableScrollContainer contentContainerStyle={{ paddingBottom: 100 }}>

                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>À acheter ({plannedItems.length})</Text>
                        {!plannedItems.length && <Text style={[styles.emptyFiles, { color: colors.text.tertiary }]}>Rien de prévu.</Text>}
                    </View>
                    <NestableDraggableFlatList
                        data={plannedItems}
                        renderItem={renderItemCard}
                        keyExtractor={(item) => item.id}
                        onDragEnd={({ data }) => reorderItems(list.id, data)}
                    />

                    {(purchasedItems.length > 0) && (
                        <>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.status.success }]}>Acheté ({purchasedItems.length})</Text>
                            </View>
                            <NestableDraggableFlatList
                                data={purchasedItems}
                                renderItem={renderItemCard}
                                keyExtractor={(item) => item.id}
                                onDragEnd={({ data }) => reorderItems(list.id, data)}
                            />
                        </>
                    )}

                    {(cancelledItems.length > 0) && (
                        <>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.text.tertiary }]}>Annulé ({cancelledItems.length})</Text>
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
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={handleAddItem}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={28} color={colors.text.inverse} />
            </TouchableOpacity>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    headerBtn: {
        padding: 8,
    },
    listContainer: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
    },
    sectionHeader: {
        marginTop: 16,
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    emptyFiles: {
        fontSize: 13,
        marginTop: 4,
        fontStyle: 'italic',
    },
    itemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        minHeight: 56,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 17,
        fontWeight: '500',
    },
    itemAmount: {
        fontSize: 17,
        fontWeight: '600',
    },
    strikeText: {
        textDecorationLine: 'line-through',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    checkboxContainer: {
        padding: 8,
        marginRight: 8,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
