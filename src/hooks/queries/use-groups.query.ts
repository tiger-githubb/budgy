import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GroupsService } from "../../services/groups.service";
import {
  CreateGroupExpensePayload,
  CreateGroupPayload,
  UpdateGroupExpensePayload,
} from "../../types/expenses.type";

export const groupKeys = {
  all: ["groups"] as const,
  list: () => [...groupKeys.all, "list"] as const,
  detail: (id: string) => [...groupKeys.all, "detail", id] as const,
  members: (groupId: string) => [...groupKeys.all, "members", groupId] as const,
  expenses: (groupId: string) =>
    [...groupKeys.all, "expenses", groupId] as const,
};

export function useGroups() {
  return useQuery({
    queryKey: groupKeys.list(),
    queryFn: () => GroupsService.getGroups(),
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: groupKeys.detail(id),
    queryFn: () => GroupsService.getGroup(id),
    enabled: !!id,
  });
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: groupKeys.members(groupId),
    queryFn: () => GroupsService.getGroupMembers(groupId),
    enabled: !!groupId,
  });
}

export function useGroupExpenses(groupId: string) {
  return useQuery({
    queryKey: groupKeys.expenses(groupId),
    queryFn: () => GroupsService.getGroupExpenses(groupId),
    enabled: !!groupId,
  });
}

export function useGroupExpense(id?: string) {
  return useQuery({
    queryKey: [...groupKeys.all, "expense", id],
    queryFn: () =>
      id ? GroupsService.getGroupExpense(id) : Promise.resolve(null),
    enabled: !!id,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGroupPayload) =>
      GroupsService.createGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.list() });
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => GroupsService.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.list() });
    },
  });
}

export function useAddGroupMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, email }: { groupId: string; email: string }) =>
      GroupsService.addMember(groupId, email),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) });
    },
  });
}

export function useRemoveGroupMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      GroupsService.removeMember(groupId, userId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) });
    },
  });
}

export function useCreateGroupExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGroupExpensePayload) =>
      GroupsService.createGroupExpense(payload),
    onSuccess: (_, { group_id }) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.expenses(group_id) });
    },
  });
}

export function useUpdateGroupExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateGroupExpensePayload) =>
      GroupsService.updateGroupExpense(payload),
    onSuccess: (data, { group_id }) => {
      // Note: group_id might not be in payload if partial
      // Invalidation strategy: if group_id is not passed, we might need it from response data
      // However, UpdateGroupExpensePayload is Partial<Create...> & {id}.
      // Check if group_id is available. If not, we rely on the response data (data.group_id).
      if (data.group_id) {
        queryClient.invalidateQueries({
          queryKey: groupKeys.expenses(data.group_id),
        });
      } else if (__DEV__) {
        console.warn("Could not invalidate group expenses, group_id missing");
      }
    },
  });
}

export function useDeleteGroupExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, groupId }: { id: string; groupId: string }) =>
      GroupsService.deleteGroupExpense(id),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.expenses(groupId) });
    },
  });
}
