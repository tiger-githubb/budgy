import { Debt, GroupExpense, GroupMember, MemberBalance } from '../types/expenses.type';

export function calculateMemberBalances(
    expenses: GroupExpense[],
    members: GroupMember[]
): MemberBalance[] {
    const balances = new Map<string, MemberBalance>();

    members.forEach((m) => {
        balances.set(m.user_id, {
            user_id: m.user_id,
            profile: m.profile!,
            paid: 0,
            owed: 0,
            balance: 0,
        });
    });

    expenses.forEach((expense) => {
        const payerBalance = balances.get(expense.payer_id);
        if (payerBalance) {
            payerBalance.paid += Number(expense.amount);
        }

        expense.splits?.forEach((split) => {
            const memberBalance = balances.get(split.user_id);
            if (memberBalance) {
                memberBalance.owed += Number(split.share_amount);
            }
        });
    });

    balances.forEach((b) => {
        b.balance = b.paid - b.owed;
    });

    return Array.from(balances.values());
}

export function calculateDebts(balances: MemberBalance[]): Debt[] {
    const debtors = balances.filter((b) => b.balance < 0).map((b) => ({ ...b }));
    const creditors = balances.filter((b) => b.balance > 0).map((b) => ({ ...b }));

    const debts: Debt[] = [];

    debtors.sort((a, b) => a.balance - b.balance);
    creditors.sort((a, b) => b.balance - a.balance);

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        const debtAmount = Math.abs(debtor.balance);
        const creditAmount = creditor.balance;

        const transferAmount = Math.min(debtAmount, creditAmount);

        if (transferAmount > 0.01) {
            debts.push({
                from: debtor.profile,
                to: creditor.profile,
                amount: Math.round(transferAmount * 100) / 100,
            });
        }

        debtor.balance += transferAmount;
        creditor.balance -= transferAmount;

        if (Math.abs(debtor.balance) < 0.01) i++;
        if (creditor.balance < 0.01) j++;
    }

    return debts;
}

export function formatCurrency(amount: number, currency = 'XOF'): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function groupExpensesByDate(
    expenses: { expense_date: string }[]
): Map<string, typeof expenses> {
    const grouped = new Map<string, typeof expenses>();

    expenses.forEach((expense) => {
        const date = expense.expense_date;
        if (!grouped.has(date)) {
            grouped.set(date, []);
        }
        grouped.get(date)!.push(expense);
    });

    return grouped;
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === today.toISOString().split('T')[0]) {
        return "Aujourd'hui";
    }
    if (dateString === yesterday.toISOString().split('T')[0]) {
        return 'Hier';
    }

    return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
}
