import { useQuery } from "@tanstack/react-query";
import { ExpensesService } from "../../services/expenses.service";

export const suggestionKeys = {
  all: ["suggestions"] as const,
  byCategory: (categoryId: string) =>
    [...suggestionKeys.all, categoryId] as const,
};

export function useExpenseSuggestions(categoryId?: string) {
  return useQuery({
    queryKey: suggestionKeys.byCategory(categoryId || ""),
    queryFn: () =>
      categoryId
        ? ExpensesService.getSuggestedTitles(categoryId)
        : Promise.resolve([]),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (suggestions rarely change drastically)
    gcTime: 1000 * 60 * 60 * 48, // Keep in cache for 48 hours
  });
}
