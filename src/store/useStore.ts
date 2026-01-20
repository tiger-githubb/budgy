import { Currency, Item, ItemStatus, List, Settings } from '@/src/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface StoreState {
    lists: List[];
    settings: Settings;

    // Actions
    addList: (name: string, budget: number) => void;
    updateList: (id: string, updates: Partial<List>) => void;
    deleteList: (id: string) => void;

    // Bulk / Archive Actions
    archiveLists: (ids: string[]) => void;
    unarchiveLists: (ids: string[]) => void;
    deleteLists: (ids: string[]) => void;
    reorderItems: (listId: string, items: Item[]) => void;

    addItem: (listId: string, name: string, amount: number, status?: ItemStatus) => void;
    updateItem: (listId: string, itemId: string, updates: Partial<Item>) => void;
    deleteItem: (listId: string, itemId: string) => void;

    setCurrency: (currency: Currency) => void;
    setSettings: (settings: Settings) => void;
    resetStore: () => void;

    // Data Management
    importData: (data: { lists: List[]; settings: Settings }) => void;
}

export const useStore = create<StoreState>()(
    persist(
        (set, get) => ({
            lists: [],
            settings: {
                defaultCurrency: 'USD',
                isOnboarded: false,
            },

            addList: (name, budget) => {
                const { settings } = get();
                const newList: List = {
                    id: uuidv4(),
                    name,
                    budget,
                    currency: settings.defaultCurrency,
                    items: [],
                    createdAt: Date.now(),
                    isArchived: false,
                };
                set((state) => ({ lists: [newList, ...state.lists] }));
            },

            updateList: (id, updates) => {
                set((state) => ({
                    lists: state.lists.map((l) => (l.id === id ? { ...l, ...updates } : l)),
                }));
            },

            deleteList: (id) => {
                set((state) => ({
                    lists: state.lists.filter((l) => l.id !== id),
                }));
            },

            archiveLists: (ids) => {
                set((state) => ({
                    lists: state.lists.map(l => ids.includes(l.id) ? { ...l, isArchived: true } : l)
                }));
            },

            unarchiveLists: (ids) => {
                set((state) => ({
                    lists: state.lists.map(l => ids.includes(l.id) ? { ...l, isArchived: false } : l)
                }));
            },

            deleteLists: (ids) => {
                set((state) => ({
                    lists: state.lists.filter(l => !ids.includes(l.id))
                }));
            },

            addItem: (listId, name, amount, status = 'PLANNED') => {
                set((state) => {
                    const listIndex = state.lists.findIndex(l => l.id === listId);
                    if (listIndex === -1) return {};

                    const currentItems = state.lists[listIndex].items;
                    const maxOrder = currentItems.reduce((max, i) => Math.max(max, i.order || 0), -1);

                    const newItem: Item = {
                        id: uuidv4(),
                        name,
                        amount,
                        status,
                        listId,
                        createdAt: Date.now(),
                        order: maxOrder + 1,
                    };

                    const newLists = [...state.lists];
                    newLists[listIndex].items = [newItem, ...currentItems];

                    return { lists: newLists };
                });
            },

            reorderItems: (listId: string, reorderedItems: Item[]) => {
                set((state) => ({
                    lists: state.lists.map(l => {
                        if (l.id !== listId) return l;

                        // Create a map of reordered items for quick lookup
                        const reorderedMap = new Map(reorderedItems.map((item, index) => [item.id, index]));

                        // Separate items not in the reordered list
                        const otherItems = l.items.filter(i => !reorderedMap.has(i.id));

                        // Create updated reordered items with new indices
                        const updatedSubset = reorderedItems.map((item, index) => ({
                            ...item,
                            order: index
                        }));

                        // Combine: Keep others first (or last?) -> Draggable list usually handles the whole list or a section.
                        // Assuming reorderedItems contains ONLY the items in the section being reordered.
                        // We should replace the items that were moved with their new versions,
                        // BUT preserving their relative position vs other sections might be tricky if we just concat.
                        // Ideally we update the orders of the moved items.

                        // Simpler approach for now conforming to previous logic:
                        // Just merge them back. "otherItems" are likely perfectly fine to stay as is.
                        return { ...l, items: [...otherItems, ...updatedSubset] };
                    })
                }));
            },

            updateItem: (listId, itemId, updates) => {
                set((state) => ({
                    lists: state.lists.map((l) => {
                        if (l.id !== listId) return l;
                        return {
                            ...l,
                            items: l.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
                        };
                    }),
                }));
            },

            deleteItem: (listId, itemId) => {
                set((state) => ({
                    lists: state.lists.map((l) => {
                        if (l.id !== listId) return l;
                        return {
                            ...l,
                            items: l.items.filter((i) => i.id !== itemId),
                        };
                    }),
                }));
            },

            setCurrency: (currency) => {
                set((state) => ({
                    settings: { ...state.settings, defaultCurrency: currency },
                }));
            },

            setSettings: (settings) => {
                set(() => ({ settings }));
            },

            resetStore: () => set({ lists: [], settings: { defaultCurrency: 'USD', isOnboarded: false } }),

            importData: (data) => set(() => ({
                lists: data.lists,
                settings: data.settings,
            })),
        }),
        {
            name: 'budgy-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

// Helper to calculate list totals
export const calculateListTotals = (list: List) => {
    const planned = list.items
        .filter(i => i.status !== 'CANCELLED')
        .reduce((acc, i) => acc + i.amount, 0);

    // Spent only counts purchased items
    const spent = list.items
        .filter(i => i.status === 'PURCHASED')
        .reduce((acc, i) => acc + i.amount, 0);

    const remaining = list.budget - planned;
    const isOverBudget = remaining < 0;
    return { planned, spent, remaining, isOverBudget };
};

// Helper for Global Totals (Active lists only)
export const calculateGlobalTotals = (lists: List[]) => {
    const activeLists = lists.filter(l => !l.isArchived);

    const totalBudget = activeLists.reduce((acc, l) => acc + l.budget, 0);
    const totalSpent = activeLists.reduce((acc, l) => {
        const listStats = calculateListTotals(l);
        return acc + listStats.spent;
    }, 0);

    return { totalBudget, totalSpent };
};

