import { supabase } from '../lib/supabase';
import {
    CreateGroupExpensePayload,
    CreateGroupPayload,
    Group,
    GroupExpense,
    GroupMember,
    Profile,
} from '../types/expenses.type';

export const GroupsService = {
    async getGroups(): Promise<Group[]> {
        const { data, error } = await supabase
            .from('groups')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data ?? [];
    },

    async getGroup(id: string): Promise<Group> {
        const { data, error } = await supabase
            .from('groups')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async createGroup(payload: CreateGroupPayload): Promise<Group> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        console.log('Creating group with user:', user.id);

        const { data, error } = await supabase
            .from('groups')
            .insert({
                name: payload.name,
                description: payload.description ?? null,
                created_by: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error('Group insert error:', error);
            throw error;
        }

        console.log('Group created:', data.id);

        const { error: memberError } = await supabase.from('group_members').insert({
            group_id: data.id,
            user_id: user.id,
            role: 'admin',
        });

        if (memberError) {
            console.error('Member insert error:', memberError);
        }

        return data;
    },

    async deleteGroup(id: string): Promise<void> {
        const { error } = await supabase.from('groups').delete().eq('id', id);
        if (error) throw error;
    },

    async getGroupMembers(groupId: string): Promise<GroupMember[]> {
        const { data, error } = await supabase
            .from('group_members')
            .select(`
        *,
        profile:profiles(*)
      `)
            .eq('group_id', groupId);

        if (error) throw error;
        return data ?? [];
    },

    async addMember(groupId: string, email: string): Promise<GroupMember> {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

        if (profileError || !profile) {
            throw new Error('Utilisateur non trouvé');
        }

        const { data, error } = await supabase
            .from('group_members')
            .insert({
                group_id: groupId,
                user_id: profile.id,
                role: 'member',
            })
            .select(`
        *,
        profile:profiles(*)
      `)
            .single();

        if (error) throw error;
        return data;
    },

    async removeMember(groupId: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from('group_members')
            .delete()
            .eq('group_id', groupId)
            .eq('user_id', userId);

        if (error) throw error;
    },

    async getGroupExpenses(groupId: string): Promise<GroupExpense[]> {
        const { data, error } = await supabase
            .from('group_expenses')
            .select(`
        *,
        payer:profiles!payer_id(*),
        category:expense_categories(*),
        splits:group_expense_splits(
          *,
          profile:profiles(*)
        )
      `)
            .eq('group_id', groupId)
            .order('expense_date', { ascending: false });

        if (error) throw error;
        return data ?? [];
    },

    async createGroupExpense(payload: CreateGroupExpensePayload): Promise<GroupExpense> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: expense, error: expenseError } = await supabase
            .from('group_expenses')
            .insert({
                group_id: payload.group_id,
                payer_id: user.id,
                title: payload.title,
                amount: payload.amount,
                category_id: payload.category_id,
                expense_date: payload.expense_date,
            })
            .select()
            .single();

        if (expenseError) throw expenseError;

        const splits = payload.splits.map((s) => ({
            expense_id: expense.id,
            user_id: s.user_id,
            share_amount: s.share_amount,
        }));

        const { error: splitsError } = await supabase
            .from('group_expense_splits')
            .insert(splits);

        if (splitsError) throw splitsError;

        return expense;
    },

    async deleteGroupExpense(id: string): Promise<void> {
        const { error } = await supabase.from('group_expenses').delete().eq('id', id);
        if (error) throw error;
    },

    async searchUsers(query: string): Promise<Profile[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .ilike('email', `%${query}%`)
            .limit(10);

        if (error) throw error;
        return data ?? [];
    },
};
