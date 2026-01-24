import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExpensesService } from '../../services/expenses.service';
import {
    CreatePersonalExpensePayload,
    UpdatePersonalExpensePayload,
} from '../../types/expenses.type';

export const expenseKeys = {
    all: ['expenses'] as const,
    categories: () => [...expenseKeys.all, 'categories'] as const,
    personal: () => [...expenseKeys.all, 'personal'] as const,
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

export function useCreatePersonalExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreatePersonalExpensePayload) =>
            ExpensesService.createPersonalExpense(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: expenseKeys.personal() });
        },
    });
}

export function useUpdatePersonalExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdatePersonalExpensePayload }) =>
            ExpensesService.updatePersonalExpense(id, payload),
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
