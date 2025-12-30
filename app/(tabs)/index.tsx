import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { GlobalSummary } from '@/src/components/ui/GlobalSummary';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { calculateGlobalTotals, calculateListTotals, useStore } from '@/src/store/useStore';
import { COLORS, RADIUS, SPACING } from '@/src/theme';
import { List } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

export default function HomeScreen() {
  const router = useRouter();
  const { lists, settings, archiveLists, deleteLists } = useStore();

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter out archived lists for the main view
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

  const handleBulkArchive = () => {
    Alert.alert("Archive", `Archive ${selectedIds.length} list(s)?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Archive", onPress: () => {
          archiveLists(selectedIds);
          setIsSelectionMode(false);
          setSelectedIds([]);
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
          setIsSelectionMode(false);
          setSelectedIds([]);
        }
      }
    ]);
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const renderItem = ({ item, index }: { item: List, index: number }) => {
    const { remaining, isOverBudget } = calculateListTotals(item);
    const isSelected = selectedIds.includes(item.id);

    return (
      <Animated.View entering={FadeInDown.delay(index * 50)} layout={Layout.springify()}>
        <Card
          onPress={() => handlePress(item.id)}
        >
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
              {isOverBudget && <View style={styles.badge}><Text style={styles.badgeText}>!</Text></View>}
            </View>

            <View style={[styles.statsRow, isSelectionMode && { marginLeft: 30 }]}>
              <View>
                <Text style={styles.label}>Budget</Text>
                <Text style={styles.value}>
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: item.currency || settings.defaultCurrency }).format(item.budget)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.label}>Remaining</Text>
                <Text style={[styles.value, { color: isOverBudget ? COLORS.status.danger : COLORS.status.success }]}>
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: item.currency || settings.defaultCurrency }).format(remaining)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Card>
      </Animated.View>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        {isSelectionMode ? (
          <View style={styles.selectionHeader}>
            <TouchableOpacity onPress={exitSelectionMode}>
              <Ionicons name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.selectionTitle}>{selectedIds.length} Selected</Text>
            <View style={{ flexDirection: 'row', gap: SPACING.m }}>
              <TouchableOpacity onPress={handleBulkArchive}>
                <Ionicons name="archive-outline" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBulkDelete}>
                <Ionicons name="trash-outline" size={24} color={COLORS.status.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.topBar}>
            <Text style={styles.appTitle}>Budgy</Text>
            <Button
              title="New"
              onPress={handleCreate}
              style={styles.createButton}
              variant="primary"
              icon={<Ionicons name="add" size={20} color={COLORS.text.primary} />}
            />
          </View>
        )}
      </View>

      {!isSelectionMode && (
        <View style={{ marginBottom: SPACING.l }}>
          <GlobalSummary
            totalBudget={totalBudget}
            totalSpent={totalSpent}
            currency={settings.defaultCurrency}
            activeCount={activeLists.length}
          />
        </View>
      )}

      {!isSelectionMode && activeLists.length > 0 && (
        <Text style={styles.sectionTitle}>My Budgets</Text>
      )}

      {activeLists.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No active budgets.</Text>
          <Button title="Create Budget" onPress={handleCreate} style={{ marginTop: SPACING.l }} />
        </View>
      ) : (
        <FlatList
          data={activeLists}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {!isSelectionMode && (
        <View style={styles.footerLink}>
          <TouchableOpacity onPress={() => router.push('/archived')}>
            <Text style={styles.linkText}>View Archived Lists</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: SPACING.m,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text.secondary, // Subtle "Budgy" branding or primary
    letterSpacing: -1,
  },
  createButton: {
    paddingHorizontal: SPACING.m,
    paddingVertical: 0,
    height: 40,
    minHeight: 40,
    borderRadius: RADIUS.full,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800', // Bold section title
    color: COLORS.text.primary,
    marginBottom: SPACING.m,
    letterSpacing: -0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.m,
  },
  listName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  badge: {
    backgroundColor: COLORS.status.danger,
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
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
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
  footerLink: {
    position: 'absolute',
    bottom: SPACING.l,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.text.tertiary,
    textDecorationLine: 'underline',
    fontWeight: '500',
    fontSize: 13,
  },
});
