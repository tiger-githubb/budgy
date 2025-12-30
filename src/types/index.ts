export type Currency = 'XOF' | 'USD' | 'EUR';

export type ItemStatus = 'PLANNED' | 'PURCHASED' | 'CANCELLED';

export interface Item {
    id: string;
    name: string;
    amount: number;
    status: ItemStatus;
    listId: string;
    createdAt: number;
    order?: number;
}

export interface List {
    id: string;
    name: string;
    budget: number;
    currency: Currency;
    items: Item[];
    createdAt: number;
    isArchived?: boolean;
    // Computed values can be helper functions, but if we want to cache them:
    // We'll calculate them on the fly to avoid sync issues.
}

export interface Settings {
    defaultCurrency: Currency;
    isOnboarded: boolean;
}
