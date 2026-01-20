import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { GlobalSummary } from '@/src/components/ui/GlobalSummary';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { calculateGlobalTotals, calculateListTotals, useStore } from '@/src/store/useStore';
import { useThemeColors } from '@/src/theme';
import { List } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, BackHandler, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { lists, settings, archiveLists, deleteLists } = useStore();

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const activeLists = useMemo(() => lists.filter(l => !l.isArchived).sort((a, b) => b.createdAt - a.createdAt), [lists]);

  const { totalBudget, totalSpent } = calculateGlobalTotals(activeLists);

  const handleCreate = () => {
    router.push('/list/form');
  };

  const toggleSelection = (listId: string) => {
    if (selectedIds.includes(listId)) {
      const newIds = selectedIds.filter(id => id !== listId);
      setSelectedIds(newIds);
      if (newIds.length === 0) setIsSelectionMode(false);
    } else {
      setSelectedIds([...selectedIds, listId]);
    }
  };

  const handleLongPress = (listId: string) => {
    setIsSelectionMode(true);
    toggleSelection(listId);
  };

  const handlePress = (listId: string) => {
    if (isSelectionMode) {
      toggleSelection(listId);
    } else {
      router.push(`/list/${listId}`);
    }
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

  const handleBulkArchive = () => {
    Alert.alert("Archive", `Archive ${selectedIds.length} list(s)?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Archive", onPress: () => {
          archiveLists(selectedIds);
          exitSelectionMode();
        }
      }
    ]);
  };

  const handleBulkDelete = () => {
    Alert.alert("Delete", `Permanently delete ${selectedIds.length} list(s)?`, [
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
    const { remaining, isOverBudget } = calculateListTotals(item);
    const isSelected = selectedIds.includes(item.id);

    return (
      <Animated.View entering={FadeInDown.delay(index * 50)} layout={Layout.springify()}>
        <Card onPress={() => handlePress(item.id)} selected={isSelected}>
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
              <Text style={[styles.listName, { color: colors.text.primary }]}>{item.name}</Text>
              {isOverBudget && (
                <View style={[styles.badge, { backgroundColor: colors.status.danger }]}>
                  <Text style={styles.badgeText}>!</Text>
                </View>
              )}
            </View>

            <View style={[styles.statsRow, isSelectionMode && { marginLeft: 30 }]}>
              <View>
                <Text style={[styles.label, { color: colors.text.tertiary }]}>Budget</Text>
                <Text style={[styles.value, { color: colors.text.primary }]}>
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: item.currency || settings.defaultCurrency }).format(item.budget)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.label, { color: colors.text.tertiary }]}>Remaining</Text>
                <Text style={[styles.value, { color: isOverBudget ? colors.status.danger : colors.status.success }]}>
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: item.currency || settings.defaultCurrency }).format(remaining)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Card>
      </Animated.View>
    );
  };

  const ListFooter = () => (
    <View style={styles.footerContainer}>
      <TouchableOpacity
        style={[styles.archiveButton, { backgroundColor: colors.system.systemGray5 }]}
        onPress={() => router.push('/archived')}
      >
        <Text style={[styles.archiveButtonText, { color: colors.text.secondary }]}>View Archived Lists</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        {isSelectionMode ? (
          <View style={[styles.selectionHeader, { backgroundColor: colors.surfaceHighlight }]}>
            <TouchableOpacity onPress={exitSelectionMode}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.selectionTitle, { color: colors.text.primary }]}>{selectedIds.length} Selected</Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity onPress={handleBulkArchive}>
                <Ionicons name="archive-outline" size={24} color={colors.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBulkDelete}>
                <Ionicons name="trash-outline" size={24} color={colors.status.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.topBar}>
            <Text style={[styles.appTitle, { color: colors.text.primary }]}>Budgy</Text>
            <Button
              title="New"
              onPress={handleCreate}
              style={styles.createButton}
              size="small"
              icon={<Ionicons name="add" size={18} color={colors.text.inverse} />}
            />
          </View>
        )}
      </View>

      {!isSelectionMode && (
        <View style={{ marginBottom: 8 }}>
          <GlobalSummary
            totalBudget={totalBudget}
            totalSpent={totalSpent}
            currency={settings.defaultCurrency}
            activeCount={activeLists.length}
          />
        </View>
      )}

      <View style={[styles.listsContainer, { backgroundColor: colors.background }]}>
        {!isSelectionMode && activeLists.length > 0 && (
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>My Budgets</Text>
        )}

        {activeLists.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="file-tray-outline" size={48} color={colors.text.tertiary} />
            </View>
            <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>No active budgets.</Text>
            <Button title="Create Budget" onPress={handleCreate} style={{ marginTop: 24 }} />
            <ListFooter />
          </View>
        ) : (
          <FlatList
            data={activeLists}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={ListFooter}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.37,
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    height: 36,
    minHeight: 36,
    borderRadius: 18,
  },
  selectionHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 12,
    height: 48,
  },
  selectionTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  listsContainer: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.38,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  listName: {
    fontSize: 17,
    fontWeight: '600',
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 11,
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 17,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '500',
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
  footerContainer: {
    marginTop: 32,
    marginBottom: 32,
    alignItems: 'center',
  },
  archiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: 4,
  },
  archiveButtonText: {
    fontWeight: '600',
    fontSize: 15,
  },
});
