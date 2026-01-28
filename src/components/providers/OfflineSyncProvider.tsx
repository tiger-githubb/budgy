import { ExpensesService } from "@/src/services/expenses.service";
import { useOfflineStore } from "@/src/store/offline.store";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useRef } from "react";

export function OfflineSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { queue, removeFromQueue } = useOfflineStore();
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && queue.length > 0) {
        syncOfflineExpenses();
      }
    });

    return () => unsubscribe();
  }, [queue.length]);

  // Trigger on mount or queue change if connected
  useEffect(() => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected && queue.length > 0) {
        syncOfflineExpenses();
      }
    });
  }, [queue.length]);

  const syncOfflineExpenses = async () => {
    if (queue.length === 0 || isSyncingRef.current) return;

    isSyncingRef.current = true;
    console.log(`Syncing ${queue.length} offline expenses...`);

    // Create a copy to iterate safely
    const currentQueue = [...queue];

    for (const expense of currentQueue) {
      try {
        // Remove tempId and timestamp before sending
        const { tempId, timestamp, ...payload } = expense;

        await ExpensesService.createPersonalExpense(payload);

        removeFromQueue(tempId);
        console.log(`Synced expense: ${payload.title}`);
      } catch (error) {
        console.error(`Failed to sync expense ${expense.title}:`, error);
        // Keep in queue to retry later
      }
    }

    isSyncingRef.current = false;

    // Check if new items were added during sync, if so, trigger again?
    // For simplicity, we assume the listeners will catch next changes or next net info event.
  };

  return <>{children}</>;
}
