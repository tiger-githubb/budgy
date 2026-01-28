export const routes = {
    auth: "/auth",

    planning: {
        home: "/(planning)",
        settings: "/(planning)/settings",
        archived: "/archived",
        list: {
            details: (id: string) => `/list/${id}` as const,
            form: "/list/form",
            formEdit: (id: string) => `/list/form?id=${id}` as const,
        },
        item: {
            form: (listId: string) => `/item/form?listId=${listId}` as const,
            formEdit: (listId: string, itemId: string) =>
                `/item/form?listId=${listId}&itemId=${itemId}` as const,
        },
    },

    expenses: {
        home: "/(expenses)",
        account: "/(expenses)/account",
        addExpense: "/add-expense",
        groups: {
            list: "/(expenses)/groups",
            details: (id: string) => `/group/${id}` as const,
            create: "/group/create",
            addExpense: (groupId: string) =>
                `/group/add-expense?groupId=${groupId}` as const,
        },
    },
} as const;

export type AppRoutes = typeof routes;
