import { supabase } from '../lib/supabase';
import {
    CreatePersonalExpensePayload,
    ExpenseCategory,
    PersonalExpense,
    UpdatePersonalExpensePayload,
} from '../types/expenses.type';

export const ExpensesService = {
    async getCategories(): Promise<ExpenseCategory[]> {
        const { data, error } = await supabase
            .from('expense_categories')
            .select('*')
            .order('name');

        if (error) throw error;
        return data ?? [];
    },

    async getPersonalExpenses(filters?: {
        startDate?: string;
        endDate?: string;
    }): Promise<PersonalExpense[]> {
        let query = supabase
            .from('personal_expenses')
            .select(`
        *,
        category:expense_categories(*)
      `)
            .order('expense_date', { ascending: false });

        if (filters?.startDate) {
            query = query.gte('expense_date', filters.startDate);
        }
        if (filters?.endDate) {
            query = query.lte('expense_date', filters.endDate);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data ?? [];
    },
    async getPersonalExpense(id: string): Promise<PersonalExpense> {
        const { data, error } = await supabase
            .from('personal_expenses')
            .select(`
        *,
        category:expense_categories(*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async getPersonalExpensesByMonth(year: number, month: number): Promise<PersonalExpense[]> {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];

        return this.getPersonalExpenses({ startDate, endDate });
    },

    async createPersonalExpense(payload: CreatePersonalExpensePayload): Promise<PersonalExpense> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('personal_expenses')
            .insert({
                ...payload,
                user_id: user.id,
            })
            .select(`
        *,
        category:expense_categories(*)
      `)
            .single();

        if (error) throw error;
        return data;
    },

    async updatePersonalExpense(
        id: string,
        payload: UpdatePersonalExpensePayload
    ): Promise<PersonalExpense> {
        const { data, error } = await supabase
            .from('personal_expenses')
            .update({
                ...payload,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select(`
        *,
        category:expense_categories(*)
      `)
            .single();

        if (error) throw error;
        return data;
    },

    async deletePersonalExpense(id: string): Promise<void> {
        const { error } = await supabase
            .from('personal_expenses')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getExpenseTotalsByPeriod(
        startDate: string,
        endDate: string
    ): Promise<{ total: number; byCategory: Record<string, number> }> {
        const expenses = await this.getPersonalExpenses({ startDate, endDate });

        const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const byCategory: Record<string, number> = {};

        expenses.forEach((e) => {
            const catName = e.category?.name ?? 'Autres';
            byCategory[catName] = (byCategory[catName] ?? 0) + Number(e.amount);
        });

        return { total, byCategory };
    },
};
