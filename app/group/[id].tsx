import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { IconButton } from "@/src/components/ui/IconButton";
import { ScreenWrapper } from "@/src/components/ui/ScreenWrapper";
import {
  useAddGroupMember,
  useGroup,
  useGroupExpenses,
  useGroupMembers,
} from "@/src/hooks/queries/use-groups.query";
import { useAuthStore } from "@/src/store/auth.store";
import { useThemeColors } from "@/src/theme";
import {
  GroupExpense,
  GroupMember,
  MemberBalance,
} from "@/src/types/expenses.type";
import {
  calculateDebts,
  calculateMemberBalances,
  formatCurrency,
} from "@/src/utils/balance";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const Avatar = ({
  url,
  name,
  size = 40,
  style,
}: {
  url?: string | null;
  name?: string | null;
  size?: number;
  style?: any;
}) => {
  const colors = useThemeColors();

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.surfaceHighlight,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.primary + "20",
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: size * 0.4,
          fontWeight: "600",
          color: colors.primary,
        }}
      >
        {name?.charAt(0).toUpperCase() ?? "?"}
      </Text>
    </View>
  );
};

type TabKey = "expenses" | "members" | "balances";

// Simplified iOS-style Segmented Control for tabs
const SegmentedControl = ({
  values,
  selectedIndex,
  onChange,
}: {
  values: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}) => {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.segmentedControl,
        { backgroundColor: colors.surfaceHighlight },
      ]}
    >
      {values.map((value, index) => {
        const isSelected = selectedIndex === index;
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.segment,
              isSelected && {
                backgroundColor: colors.surface,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 2,
                shadowOffset: { width: 0, height: 1 },
              },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(index);
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentText,
                {
                  color: isSelected
                    ? colors.text.primary
                    : colors.text.secondary,
                  fontWeight: isSelected ? "600" : "500",
                },
              ]}
            >
              {value}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuthStore();

  // 0: Expenses, 1: Members, 2: Balances
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [activeMemberFilter, setActiveMemberFilter] = useState<string | null>(
    null,
  );

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const { data: group, isLoading: groupLoading } = useGroup(id);
  const {
    data: members,
    refetch: refetchMembers,
    isRefetching: membersRefreshing,
  } = useGroupMembers(id);
  const {
    data: expenses,
    refetch: refetchExpenses,
    isRefetching: expensesRefreshing,
  } = useGroupExpenses(id);
  const addMember = useAddGroupMember();

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    if (!activeMemberFilter) return expenses;
    // Filter expenses where the payer is the selected member
    // OR where the selected member is one of the splits (beneficiaries)
    return expenses.filter((e) => {
      const isPayer = e.payer_id === activeMemberFilter;
      const isBeneficiary = e.splits?.some(
        (s) => s.user_id === activeMemberFilter,
      );
      return isPayer || isBeneficiary;
    });
  }, [expenses, activeMemberFilter]);

  const balances = useMemo(() => {
    if (!members || !expenses) return [];
    return calculateMemberBalances(expenses, members);
  }, [members, expenses]);

  const debts = useMemo(() => {
    if (!balances.length) return [];
    return calculateDebts(balances);
  }, [balances]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert("Erreur", "Ajoute une adresse email");
      return;
    }

    try {
      await addMember.mutateAsync({ groupId: id, email: inviteEmail.trim() });
      setInviteEmail("");
      setShowInviteModal(false);
      refetchMembers();
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Impossible d'ajouter ce membre");
    }
  };

  const handleAddExpense = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: "/group/add-expense", params: { groupId: id } });
  };

  const renderExpenseItem = ({
    item,
    index,
  }: {
    item: GroupExpense;
    index: number;
  }) => {
    const payer = members?.find((m) => m.user_id === item.payer_id);

    return (
      <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            Haptics.selectionAsync();
            router.push({
              pathname: "/group/add-expense",
              params: { groupId: id, expenseId: item.id },
            });
          }}
        >
          <Card style={{ marginHorizontal: 4 }}>
            <View style={styles.expenseRow}>
              <Avatar
                url={payer?.profile?.avatar_url}
                name={payer?.profile?.display_name}
                size={40}
              />
              <View style={styles.expenseInfo}>
                <Text
                  style={[styles.expenseTitle, { color: colors.text.primary }]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.expenseSubtitle,
                    { color: colors.text.tertiary },
                  ]}
                >
                  Payé par {payer?.profile?.display_name ?? "Inconnu"}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.expenseAmount, { color: colors.primary }]}>
                  {formatCurrency(Number(item.amount), "XOF")}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.text.tertiary}
                  style={{ marginTop: 4 }}
                />
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderMemberItem = ({
    item,
    index,
  }: {
    item: GroupMember;
    index: number;
  }) => {
    const isOwner = item.role === "admin";
    const isMe = item.user_id === user?.id;

    return (
      <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            Haptics.selectionAsync();
            setActiveMemberFilter(item.user_id);
            setSelectedTabIndex(0); // Switch to expenses tab
          }}
        >
          <Card style={{ marginBottom: 8, marginHorizontal: 4 }}>
            <View style={styles.memberRow}>
              <Avatar
                url={item.profile?.avatar_url}
                name={item.profile?.display_name}
                size={48}
              />
              <View style={styles.memberInfo}>
                <Text
                  style={[styles.memberName, { color: colors.text.primary }]}
                >
                  {item.profile?.display_name ?? "Inconnu"}
                  {isMe && (
                    <Text style={{ color: colors.text.tertiary }}> (moi)</Text>
                  )}
                </Text>
                <Text
                  style={[styles.memberEmail, { color: colors.text.tertiary }]}
                >
                  {item.profile?.email}
                </Text>
              </View>
              {isOwner && (
                <View
                  style={[
                    styles.ownerBadge,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                >
                  <Ionicons name="star" size={12} color={colors.primary} />
                  <Text style={[styles.ownerText, { color: colors.primary }]}>
                    Admin
                  </Text>
                </View>
              )}
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text.tertiary}
                style={{ marginLeft: 8 }}
              />
            </View>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderBalanceItem = ({
    item,
    index,
  }: {
    item: MemberBalance;
    index: number;
  }) => {
    const isPositive = item.balance >= 0;
    const member = members?.find((m) => m.user_id === item.user_id);

    return (
      <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
        <Card style={{ marginBottom: 8, marginHorizontal: 4 }}>
          <View style={styles.balanceRow}>
            <Avatar
              url={member?.profile?.avatar_url}
              name={member?.profile?.display_name}
              size={44}
            />
            <View style={styles.balanceInfo}>
              <Text
                style={[styles.balanceName, { color: colors.text.primary }]}
              >
                {member?.profile?.display_name ?? "Inconnu"}
              </Text>
              <Text
                style={[
                  styles.balanceSubtitle,
                  { color: colors.text.tertiary },
                ]}
              >
                {isPositive ? "Doit recevoir" : "Doit payer"}
              </Text>
            </View>
            <Text
              style={[
                styles.balanceAmount,
                {
                  color: isPositive
                    ? colors.status.success
                    : colors.status.danger,
                },
              ]}
            >
              {isPositive ? "+" : ""}
              {formatCurrency(item.balance, "XOF")}
            </Text>
          </View>
        </Card>
      </Animated.View>
    );
  };

  if (groupLoading) {
    return (
      <ScreenWrapper>
        <Stack.Screen
          options={{ headerShown: true, title: "", headerBackTitle: "" }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!group) {
    return (
      <ScreenWrapper>
        <Stack.Screen
          options={{ headerShown: true, title: "Groupe", headerBackTitle: "" }}
        />
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.text.primary }}>Groupe non trouvé</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper edges={["top"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: group.name,
          // @ts-ignore
          headerBackTitleVisible: false,
          headerTintColor: colors.text.primary,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerRight: () => (
            <IconButton
              name="person-add-outline"
              onPress={() => setShowInviteModal(true)}
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
          ),
        }}
      />

      <View style={styles.headerContainer}>
        <SegmentedControl
          values={["Dépenses", "Membres", "Soldes"]}
          selectedIndex={selectedTabIndex}
          onChange={setSelectedTabIndex}
        />
      </View>

      <View style={styles.contentContainer}>
        {selectedTabIndex === 0 && (
          <>
            {activeMemberFilter && (
              <View style={styles.filterBanner}>
                <Text
                  style={[styles.filterText, { color: colors.text.secondary }]}
                >
                  Filtre:{" "}
                  <Text
                    style={{ fontWeight: "600", color: colors.text.primary }}
                  >
                    {
                      members?.find((m) => m.user_id === activeMemberFilter)
                        ?.profile?.display_name
                    }
                  </Text>
                </Text>
                <TouchableOpacity onPress={() => setActiveMemberFilter(null)}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.text.tertiary}
                  />
                </TouchableOpacity>
              </View>
            )}
            <FlatList
              data={filteredExpenses}
              keyExtractor={(item) => item.id}
              renderItem={renderExpenseItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <View
                    style={[
                      styles.emptyIcon,
                      { backgroundColor: colors.surfaceHighlight },
                    ]}
                  >
                    <Ionicons
                      name="receipt-outline"
                      size={40}
                      color={colors.text.tertiary}
                    />
                  </View>
                  <Text
                    style={[styles.emptyText, { color: colors.text.tertiary }]}
                  >
                    Aucune dépense trouvée
                  </Text>
                </View>
              }
              refreshControl={
                <RefreshControl
                  refreshing={expensesRefreshing}
                  onRefresh={refetchExpenses}
                />
              }
            />
          </>
        )}

        {selectedTabIndex === 1 && (
          <FlatList
            data={members}
            keyExtractor={(item) => item.id}
            renderItem={renderMemberItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            refreshControl={
              <RefreshControl
                refreshing={membersRefreshing}
                onRefresh={refetchMembers}
              />
            }
          />
        )}

        {selectedTabIndex === 2 && (
          <View style={{ flex: 1, paddingHorizontal: 16 }}>
            <FlatList
              data={balances}
              keyExtractor={(item) => item.user_id}
              renderItem={renderBalanceItem}
              contentContainerStyle={[
                styles.listContent,
                { paddingHorizontal: 0 },
              ]}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <>
                  <View style={styles.debtsSection}>
                    <Text
                      style={[
                        styles.debtsSectionTitle,
                        { color: colors.text.secondary },
                      ]}
                    >
                      Qui doit quoi à qui ?
                    </Text>
                    {debts.length === 0 ? (
                      <View
                        style={[
                          styles.debtRow,
                          {
                            backgroundColor: colors.surface,
                            justifyContent: "center",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.noDebts,
                            { color: colors.text.tertiary },
                          ]}
                        >
                          Tout le monde est à jour !
                        </Text>
                      </View>
                    ) : (
                      debts.map((debt, i) => (
                        <Animated.View
                          key={i}
                          entering={FadeInUp.delay(i * 50).springify()}
                        >
                          <View
                            style={[
                              styles.debtRow,
                              { backgroundColor: colors.surface },
                            ]}
                          >
                            <Text
                              style={[
                                styles.debtText,
                                { color: colors.text.primary },
                              ]}
                            >
                              {debt.from.display_name} → {debt.to.display_name}
                            </Text>
                            <Text
                              style={[
                                styles.debtAmount,
                                { color: colors.status.danger },
                              ]}
                            >
                              {formatCurrency(debt.amount, "XOF")}
                            </Text>
                          </View>
                        </Animated.View>
                      ))
                    )}
                  </View>
                  <Text
                    style={[
                      styles.debtsSectionTitle,
                      {
                        color: colors.text.secondary,
                        marginTop: 24,
                        marginBottom: 8,
                      },
                    ]}
                  >
                    Soldes individuels
                  </Text>
                </>
              }
            />
          </View>
        )}
      </View>

      {selectedTabIndex === 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={handleAddExpense}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      <Modal
        visible={showInviteModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                Inviter un membre
              </Text>
              <IconButton
                name="close"
                variant="close"
                onPress={() => setShowInviteModal(false)}
              />
            </View>

            <TextInput
              style={[
                styles.emailInput,
                {
                  backgroundColor: colors.surface,
                  color: colors.text.primary,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Email du membre"
              placeholderTextColor={colors.text.tertiary}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Button
              title="Inviter"
              onPress={handleInvite}
              loading={addMember.isPending}
              icon={<Ionicons name="send" size={18} color="#fff" />}
            />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  segmentedControl: {
    flexDirection: "row",
    borderRadius: 8, // Standard iOS radius
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  segmentText: {
    fontSize: 13,
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 12,
    paddingTop: 8,
  },
  filterBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 8,
  },
  filterText: {
    fontSize: 13,
  },
  expenseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  expenseSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
  },
  memberEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  ownerBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ownerText: {
    fontSize: 11,
    fontWeight: "600",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceName: {
    fontSize: 16,
    fontWeight: "600",
  },
  balanceSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  debtsSection: {
    marginBottom: 8,
  },
  debtsSectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  debtRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  debtText: {
    fontSize: 15,
    fontWeight: "500",
  },
  debtAmount: {
    fontSize: 15,
    fontWeight: "700",
  },
  noDebts: {
    fontSize: 15,
    fontStyle: "italic",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  emailInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
});
