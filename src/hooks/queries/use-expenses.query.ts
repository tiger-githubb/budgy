import { NotificationsService } from "@/src/services/notifications.service";
import { useOfflineStore } from "@/src/store/offline.store";
import NetInfo from "@react-native-community/netinfo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { ExpensesService } from "../../services/expenses.service";
import {
    CreatePersonalExpensePayload,
    PersonalExpense,
    UpdatePersonalExpensePayload,
} from "../../types/expenses.type";

export const expenseKeys = {
  all: ["expenses"] as const,
  categories: () => [...expenseKeys.all, "categories"] as const,
  personal: () => [...expenseKeys.all, "personal"] as const,
  personalByMonth: (year: number, month: number) =>
    [...expenseKeys.personal(), year, month] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: expenseKeys.categories(),
    queryFn: () => ExpensesService.getCategories(),
  });
}

export function usePersonalExpenses(filters?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: [...expenseKeys.personal(), filters],
    queryFn: () => ExpensesService.getPersonalExpenses(filters),
  });
}

export function usePersonalExpensesByMonth(year: number, month: number) {
  return useQuery({
    queryKey: expenseKeys.personalByMonth(year, month),
    queryFn: () => ExpensesService.getPersonalExpensesByMonth(year, month),
  });
}

export function usePersonalExpense(id?: string) {
  return useQuery({
    queryKey: [...expenseKeys.personal(), id],
    queryFn: () =>
      id ? ExpensesService.getPersonalExpense(id) : Promise.resolve(null),
    enabled: !!id,
  });
}

export function useCreatePersonalExpense() {
  const queryClient = useQueryClient();
  const { addToQueue } = useOfflineStore();

  return useMutation({
    mutationFn: async (payload: CreatePersonalExpensePayload) => {
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        addToQueue(payload);
        // Return a fake response or specific signal
        return {} as PersonalExpense;
      }
      return ExpensesService.createPersonalExpense(payload);
    },
    onSuccess: (_, variables, context) => {
      // If it was an offline addition (we can check if result is empty or handle specific logic)
      // But simply invalidating queries is fine, though offline data won't show up in standard lists
      // unless we merge local queue with fetched data (advanced).
      // For now, let's just let it succeed.
      queryClient.invalidateQueries({ queryKey: expenseKeys.personal() });

      // Reset notifications to stop nagging for today
      NotificationsService.handleExpenseAdded();

      // Optionally check if we are offline to show a toast
      NetInfo.fetch().then((state) => {
        if (!state.isConnected) {
          Alert.alert(
            "Hors ligne",
            "Dépense sauvegardée localement. Elle sera synchronisée une fois la connexion rétablie.",
          );
        }
      });
    },
  });
}

export function useUpdatePersonalExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePersonalExpensePayload;
    }) => ExpensesService.updatePersonalExpense(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.personal() });
    },
  });
}

export function useDeletePersonalExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ExpensesService.deletePersonalExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.personal() });
    },
  });
}
