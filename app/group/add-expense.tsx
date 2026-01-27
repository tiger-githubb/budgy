import { Button } from "@/src/components/ui/Button";
import { FormContainer } from "@/src/components/ui/FormContainer";
import { IconButton } from "@/src/components/ui/IconButton";
import { Input } from "@/src/components/ui/Input";
import { ScreenWrapper } from "@/src/components/ui/ScreenWrapper";
import { useCategories } from "@/src/hooks/queries/use-expenses.query";
import {
  useCreateGroupExpense,
  useDeleteGroupExpense,
  useGroupExpense,
  useGroupMembers,
  useUpdateGroupExpense,
} from "@/src/hooks/queries/use-groups.query";
import { useAuthStore } from "@/src/store/auth.store";
import { useThemeColors } from "@/src/theme";
import { ExpenseCategory, GroupMember } from "@/src/types/expenses.type";
import { formatDate } from "@/src/utils/balance";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function AddGroupExpenseScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuthStore();
  const { data: members } = useGroupMembers(groupId);
  const { data: categories } = useCategories();
  const createExpense = useCreateGroupExpense();
  const updateExpense = useUpdateGroupExpense();
  const deleteExpense = useDeleteGroupExpense();

  // Check for expenseId if we are editing
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const isEditing = !!expenseId;
  const { data: existingExpense } = useGroupExpense(expenseId);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseCategory | null>(null);
  const [expenseDate, setExpenseDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    if (existingExpense && categories && members) {
      setTitle(existingExpense.title);
      setAmount(existingExpense.amount.toString());
      setExpenseDate(existingExpense.expense_date.split("T")[0]);

      const cat = categories.find((c) => c.id === existingExpense.category_id);
      if (cat) setSelectedCategory(cat);

      // Assuming single beneficiary for now based on "I paid for X"
      if (existingExpense.splits && existingExpense.splits.length > 0) {
        // Find the split that is NOT the payer (which is me usually, but check data structure)
        // Actually, the splits array contains who *owes* money.
        // In "I paid for X", user is payer, X is in splits.
        // If I paid, splits has 1 entry: the beneficiary.
        const split = existingExpense.splits[0];
        if (split) setSelectedBeneficiary(split.user_id);
      }
    }
  }, [existingExpense, categories, members]);

  const parsedAmount = parseFloat(amount) || 0;

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  });

  const handleSubmit = async () => {
    if (parsedAmount <= 0) {
      Alert.alert("Erreur", "Ajoute un montant valide");
      return;
    }
    if (!selectedBeneficiary) {
      Alert.alert("Erreur", "Sélectionne pour qui tu as payé");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Erreur", "Sélectionne une catégorie");
      return;
    }

    const finalTitle = title.trim() || selectedCategory.name;

    try {
      const splits = [
        {
          user_id: selectedBeneficiary,
          share_amount: parsedAmount,
        },
      ];

      if (isEditing && expenseId) {
        await updateExpense.mutateAsync({
          id: expenseId,
          group_id: groupId, // Helpful for invalidation
          title: finalTitle,
          amount: parsedAmount,
          category_id: selectedCategory.id,
          expense_date: expenseDate,
          splits,
        });
      } else {
        await createExpense.mutateAsync({
          group_id: groupId,
          title: finalTitle,
          amount: parsedAmount,
          category_id: selectedCategory.id,
          expense_date: expenseDate,
          splits,
        });
      }
      router.back();
    } catch (error: any) {
      console.error("Error saving group expense:", error);
      Alert.alert(
        "Erreur",
        error.message || "Impossible d'enregistrer la dépense",
      );
    }
  };

  const handleDelete = async () => {
    if (!expenseId) return;

    Alert.alert(
      "Supprimer la dépense",
      "Es-tu sûr de vouloir supprimer cette dépense ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExpense.mutateAsync({ id: expenseId, groupId });
              router.back();
            } catch (error: any) {
              Alert.alert("Erreur", "Impossible de supprimer la dépense");
            }
          },
        },
      ],
    );
  };

  const renderDateItem = ({ item, index }: { item: string; index: number }) => {
    const isSelected = expenseDate === item;
    return (
      <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
        <TouchableOpacity
          style={[
            styles.dateChip,
            {
              backgroundColor: isSelected ? colors.primary : colors.surface,
              borderColor: isSelected ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setExpenseDate(item)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.dateText,
              { color: isSelected ? "#fff" : colors.text.primary },
            ]}
          >
            {formatDate(item)}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCategoryItem = ({
    item,
    index,
  }: {
    item: ExpenseCategory;
    index: number;
  }) => {
    const isSelected = selectedCategory?.id === item.id;
    return (
      <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
        <TouchableOpacity
          style={[
            styles.categoryItem,
            {
              backgroundColor: isSelected
                ? colors.primary + "20"
                : colors.surface,
              borderColor: isSelected ? colors.primary : "transparent",
              borderWidth: isSelected ? 2 : 0,
            },
          ]}
          onPress={() => setSelectedCategory(isSelected ? null : item)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.categoryIconBg,
              { backgroundColor: colors.surfaceHighlight },
            ]}
          >
            <Text style={styles.categoryEmoji}>{item.emoji}</Text>
          </View>
          <Text
            style={[
              styles.categoryName,
              { color: isSelected ? colors.primary : colors.text.secondary },
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
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
    const isSelected = selectedBeneficiary === item.user_id;
    const isMe = item.user_id === user?.id;

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
        <TouchableOpacity
          style={[
            styles.memberItem,
            {
              backgroundColor: isSelected
                ? colors.primary + "15"
                : colors.surface,
              borderColor: isSelected ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setSelectedBeneficiary(item.user_id)}
          activeOpacity={0.7}
        >
          <View style={styles.memberLeft}>
            <View
              style={[
                styles.radio,
                {
                  borderColor: isSelected
                    ? colors.primary
                    : colors.text.tertiary,
                },
              ]}
            >
              {isSelected && (
                <View
                  style={[
                    styles.radioInner,
                    { backgroundColor: colors.primary },
                  ]}
                />
              )}
            </View>
            <View
              style={[
                styles.memberAvatar,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Text style={[styles.memberInitial, { color: colors.primary }]}>
                {item.profile?.display_name?.charAt(0).toUpperCase() ?? "?"}
              </Text>
            </View>
            <Text style={[styles.memberName, { color: colors.text.primary }]}>
              {item.profile?.display_name ?? "Inconnu"}
              {isMe && (
                <Text style={{ color: colors.text.tertiary }}> (moi)</Text>
              )}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const footerContent = (
    <View style={{ gap: 12 }}>
      <Button
        title={isEditing ? "Modifier" : "Ajouter la dépense"}
        onPress={handleSubmit}
        loading={createExpense.isPending || updateExpense.isPending}
        icon={
          <Ionicons
            name={isEditing ? "save" : "checkmark"}
            size={20}
            color="#fff"
          />
        }
      />
      {isEditing && (
        <Button
          title="Supprimer"
          variant="outline"
          onPress={handleDelete}
          loading={deleteExpense.isPending}
          textStyle={{ color: colors.status.danger }}
          style={{ borderColor: colors.status.danger }}
          icon={
            <Ionicons name="trash" size={20} color={colors.status.danger} />
          }
        />
      )}
    </View>
  );

  return (
    <ScreenWrapper edges={["bottom"]}>
      <Stack.Screen
        options={{
          presentation: "modal",
          headerShown: true,
          title: isEditing ? "Modifier la dépense" : "Nouvelle dépense",
          headerLeft: () => (
            <IconButton name="close" onPress={() => router.back()} />
          ),
        }}
      />

      <FormContainer footer={footerContent}>
        <Animated.View entering={FadeInDown.delay(50).springify()}>
          <View
            style={[styles.amountCard, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.amountLabel, { color: colors.text.tertiary }]}>
              Montant total
            </Text>
            <View style={styles.amountInputRow}>
              <Input
                placeholder="0"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                style={styles.amountInput}
                containerStyle={styles.amountInputContainer}
              />
              <Text style={[styles.currency, { color: colors.text.secondary }]}>
                XOF
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>
            Date
          </Text>
          <FlatList
            data={dates}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            renderItem={renderDateItem}
            contentContainerStyle={styles.datesList}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>
            Catégorie
          </Text>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={renderCategoryItem}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        <View style={styles.section}>
          <Input
            label="Titre (Optionnel)"
            placeholder={
              selectedCategory ? selectedCategory.name : "Ex: Courses..."
            }
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>
            Pour qui ?
          </Text>
          <View style={styles.membersList}>
            {members?.map((member, index) => (
              <View key={member.id}>
                {renderMemberItem({ item: member, index })}
              </View>
            ))}
          </View>
        </View>
      </FormContainer>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  amountCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  amountInputContainer: {
    marginBottom: 0,
    flex: 0,
    minWidth: 120,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: "700",
    textAlign: "center",
    backgroundColor: "transparent",
    paddingHorizontal: 0,
  },
  currency: {
    fontSize: 24,
    fontWeight: "600",
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  datesList: {
    gap: 8,
  },
  dateChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "500",
  },
  categoriesList: {
    gap: 12,
  },
  categoryItem: {
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    width: 88,
    gap: 8,
  },
  categoryIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  membersList: {
    gap: 8,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  memberLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  memberInitial: {
    fontSize: 16,
    fontWeight: "600",
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
  },
});
