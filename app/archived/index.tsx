import { Card } from '@/src/components/ui/Card';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { useStore } from '@/src/store/useStore';
import { useThemeColors } from '@/src/theme';
import { List } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, BackHandler, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

export default function ArchivedListsScreen() {
    const router = useRouter();
    const colors = useThemeColors();
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
        Alert.alert("Supprimer", `Supprimer définitivement ${selectedIds.length} liste(s) ?`, [
            { text: "Annuler", style: "cancel" },
            {
                text: "Supprimer", style: "destructive", onPress: () => {
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
                <Card style={styles.card} onPress={() => handlePress(item.id)} selected={isSelected}>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => handlePress(item.id)}
                        onLongPress={() => handleLongPress(item.id)}
                    >
                        {isSelectionMode && (
                            <View style={[
                                styles.selectionCircle,
                                { borderColor: colors.text.tertiary },
                                isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
                            ]}>
                                {isSelected && <Ionicons name="checkmark" size={14} color={colors.text.inverse} />}
                            </View>
                        )}

                        <View style={[styles.cardHeader, isSelectionMode && { marginLeft: 30 }]}>
                            <Text style={[styles.listName, { color: colors.text.secondary }]}>{item.name}</Text>
                            {!isSelectionMode && (
                                <View style={styles.actions}>
                                    <TouchableOpacity onPress={() => unarchiveLists([item.id])} style={styles.actionBtn}>
                                        <Ionicons name="refresh-circle-outline" size={24} color={colors.primary} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <View style={[styles.statsRow, isSelectionMode && { marginLeft: 30 }]}>
                            <Text style={[styles.value, { color: colors.text.tertiary }]}>
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
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Archives',
                    headerBackTitle: '',
                    headerTintColor: colors.text.primary,
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: colors.background },
                }}
            />

            {isSelectionMode && (
                <View style={[styles.selectionHeader, { backgroundColor: colors.surfaceHighlight }]}>
                    <TouchableOpacity onPress={exitSelectionMode}>
                        <Ionicons name="close" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.selectionTitle, { color: colors.text.primary }]}>{selectedIds.length} sélectionné(s)</Text>
                    <View style={{ flexDirection: 'row', gap: 16 }}>
                        <TouchableOpacity onPress={handleBulkRestore}>
                            <Ionicons name="refresh" size={24} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleBulkDelete}>
                            <Ionicons name="trash-outline" size={24} color={colors.status.danger} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {archivedLists.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>Aucune liste archivée.</Text>
                </View>
            ) : (
                <View style={[styles.listContainer, { backgroundColor: colors.background }]}>
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
    selectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 8,
        borderRadius: 12,
        height: 48,
        marginBottom: 16,
    },
    selectionTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    listContainer: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
    },
    card: {
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    listName: {
        fontSize: 17,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
    },
    actionBtn: {
        padding: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    value: {
        fontSize: 17,
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 17,
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
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
});
