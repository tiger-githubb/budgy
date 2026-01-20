import { Card } from '@/src/components/ui/Card';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { useStore } from '@/src/store/useStore';
import { COLORS, RADIUS, SPACING } from '@/src/theme';
import { List } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, BackHandler, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

export default function ArchivedListsScreen() {
    const router = useRouter();
    const { lists, settings, unarchiveLists, deleteLists } = useStore();

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const archivedLists = useMemo(() => lists.filter(l => l.isArchived).sort((a, b) => b.createdAt - a.createdAt), [lists]);

    const toggleSelection = (listId: string) => {
        if (selectedIds.includes(listId)) {
            const newIds = selectedIds.filter(id => id !== listId);
            setSelectedIds(newIds);
            if (newIds.length === 0) setIsSelectionMode(false);
        } else {
            setSelectedIds([...selectedIds, listId]);
        }
    };

    const handlePress = (listId: string) => {
        if (isSelectionMode) {
            toggleSelection(listId);
        } else {
            // Navigate to details if not in selection mode
            router.push(`/list/${listId}`);
        }
    };

    const handleLongPress = (listId: string) => {
        setIsSelectionMode(true);
        toggleSelection(listId);
    };

    const exitSelectionMode = () => {
        setIsSelectionMode(false);
        setSelectedIds([]);
    };

    // Handle hardware back button in selection mode
    useEffect(() => {
        const onBackPress = () => {
            if (isSelectionMode) {
                exitSelectionMode();
                return true;
            }
            return false;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => subscription.remove();
    }, [isSelectionMode]);

    const handleBulkRestore = () => {
        unarchiveLists(selectedIds);
        exitSelectionMode();
    };

    const handleBulkDelete = () => {
        Alert.alert("Delete Forever", `Permanently delete ${selectedIds.length} list(s)?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: () => {
                    deleteLists(selectedIds);
                    exitSelectionMode();
                }
            }
        ]);
    };

    const renderItem = ({ item, index }: { item: List, index: number }) => {
        const isSelected = selectedIds.includes(item.id);

        return (
            <Animated.View entering={FadeInDown.delay(index * 50)} layout={Layout.springify()}>
                <Card style={styles.card} onPress={() => handlePress(item.id)}>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => handlePress(item.id)}
                        onLongPress={() => handleLongPress(item.id)}
                    >
                        {/* Visual indicator for selection */}
                        {isSelectionMode && (
                            <View style={[styles.selectionCircle, isSelected && styles.selectedCircle]}>
                                {isSelected && <Ionicons name="checkmark" size={14} color="black" />}
                            </View>
                        )}

                        <View style={[styles.cardHeader, isSelectionMode && { marginLeft: 30 }]}>
                            <Text style={styles.listName}>{item.name}</Text>
                            {/* Individual actions only if NOT in selection mode */}
                            {!isSelectionMode && (
                                <View style={styles.actions}>
                                    <TouchableOpacity onPress={() => unarchiveLists([item.id])} style={styles.actionBtn}>
                                        <Ionicons name="refresh-circle-outline" size={24} color={COLORS.primary} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <View style={[styles.statsRow, isSelectionMode && { marginLeft: 30 }]}>
                            <Text style={styles.value}>
                                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: item.currency || settings.defaultCurrency }).format(item.budget)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </Card>
            </Animated.View>
        );
    };

    return (
        <ScreenWrapper>
            {/* Hide Default Header */}
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                {isSelectionMode ? (
                    <View style={styles.selectionHeader}>
                        <TouchableOpacity onPress={exitSelectionMode}>
                            <Ionicons name="close" size={24} color={COLORS.text.primary} />
                        </TouchableOpacity>
                        <Text style={styles.selectionTitle}>{selectedIds.length} Selected</Text>
                        <View style={{ flexDirection: 'row', gap: SPACING.m }}>
                            <TouchableOpacity onPress={handleBulkRestore}>
                                <Ionicons name="refresh" size={24} color={COLORS.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleBulkDelete}>
                                <Ionicons name="trash-outline" size={24} color={COLORS.status.danger} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Archived Lists</Text>
                        <View style={{ width: 24 }} />
                    </>
                )}
            </View>

            {archivedLists.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No archived lists.</Text>
                </View>
            ) : (
                <View style={styles.listContainer}>
                    <FlatList
                        data={archivedLists}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                </View>
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
        height: 48,
    },
    backButton: {
        padding: SPACING.s,
        marginLeft: -SPACING.s,
    },
    title: {
        fontSize: 20, // Reduced from 24
        fontWeight: '800',
        color: COLORS.text.primary,
        textAlign: 'center',
        flex: 1,
    },
    selectionHeader: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surfaceHighlight,
        padding: SPACING.s,
        borderRadius: RADIUS.m,
        height: 48,
    },
    selectionTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    listContainer: {
        flex: 1,
        backgroundColor: COLORS.surfaceSecondary,
        borderRadius: RADIUS.l,
        padding: SPACING.m,
        // Removed negative margins to match Home Screen width
    },
    card: {
        marginBottom: SPACING.m,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    listName: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text.secondary, // Dimmed for archived
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
    selectionCircle: {
        position: 'absolute',
        left: 0,
        top: '50%',
        marginTop: -10,
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.text.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    selectedCircle: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
});
