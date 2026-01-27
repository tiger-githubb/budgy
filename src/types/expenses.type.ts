export type ExpenseCategory = {
    id: string;
    user_id: string | null;
    name: string;
    emoji: string;
    is_default: boolean;
    order_number?: number;
    created_at: string;
};

export type PersonalExpense = {
    id: string;
    user_id: string;
    title: string;
    amount: number;
    category_id: string | null;
    expense_date: string;
    created_at: string;
    updated_at: string;
    category?: ExpenseCategory | null;
};

export type CreatePersonalExpensePayload = {
    title: string;
    amount: number;
    category_id: string | null;
    expense_date: string;
};

export type UpdatePersonalExpensePayload = Partial<CreatePersonalExpensePayload>;

export type Profile = {
    id: string;
    email: string | null;
    display_name: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
};

export type Group = {
    id: string;
    name: string;
    description: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
};

export type GroupMember = {
    id: string;
    group_id: string;
    user_id: string;
    role: 'admin' | 'member';
    joined_at: string;
    profile?: Profile;
};

export type GroupExpense = {
    id: string;
    group_id: string;
    payer_id: string;
    title: string;
    amount: number;
    category_id: string | null;
    expense_date: string;
    created_at: string;
    updated_at: string;
    payer?: Profile;
    category?: ExpenseCategory | null;
    splits?: GroupExpenseSplit[];
};

export type GroupExpenseSplit = {
    id: string;
    expense_id: string;
    user_id: string;
    share_amount: number;
    profile?: Profile;
};

export type CreateGroupPayload = {
    name: string;
    description?: string;
};

export type CreateGroupExpensePayload = {
    group_id: string;
    title: string;
    amount: number;
    category_id: string | null;
    expense_date: string;
    splits: { user_id: string; share_amount: number }[];
};

export type UpdateGroupExpensePayload = Partial<CreateGroupExpensePayload> & {
    id: string;
    splits?: { user_id: string; share_amount: number }[];

};

export type MemberBalance = {
    user_id: string;
    profile: Profile;
    paid: number;
    owed: number;
    balance: number;
};

export type Debt = {
    from: Profile;
    to: Profile;
    amount: number;
};
