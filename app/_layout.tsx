import { OfflineSyncProvider } from "@/src/components/providers/OfflineSyncProvider";
import { ModeTransition } from "@/src/components/ui/ModeTransition";
import { AuthProvider } from "@/src/providers/auth.provider";
import { QueryProvider } from "@/src/providers/query.provider";
import { AppMode, useAppModeStore } from "@/src/store/app-mode.store";
import { useAuthStore } from "@/src/store/auth.store";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { ExpensesService } from "@/src/services/expenses.service";
import { NotificationsService } from "@/src/services/notifications.service";

function RootNavigator() {
  const segments = useSegments();
  const router = useRouter();
  const { appMode, setAppMode } = useAppModeStore();
  const { user, isInitialized } = useAuthStore();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetMode, setTargetMode] = useState<AppMode | null>(null);
  const [pendingMode, setPendingMode] = useState<AppMode | null>(null);

  // Initialize Notifications
  useEffect(() => {
    const initNotifications = async () => {
      const hasPermission = await NotificationsService.requestPermissions();
      if (hasPermission && user) {
        // Check if user has expenses today
        const now = new Date();
        const startOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        ).toISOString();
        const endOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
        ).toISOString();

        try {
          // We shouldn't use hooks here, direct service call is better for this one-off check
          // However, ExpensesService.getPersonalExpenses returns all by default or filtered?
          // Let's rely on checking if we can find any expense for today.
          // Or simply: Schedule "From Now" aggressively. If handleExpenseAdded was called recently, logic holds?
          // No, persistence of "Has Expense Today" is not in local storage explicitly.
          // We must query API (or cache).

          // Optimized: Just schedule/check. The service logic "checkAndScheduleIfNeeded" expects a boolean.
          // Let's try to fetch lite data.
          const expenses = await ExpensesService.getPersonalExpenses({
            startDate: startOfDay,
            endDate: endOfDay,
          });
          const hasToday = expenses && expenses.length > 0;

          await NotificationsService.checkAndScheduleIfNeeded(hasToday);
        } catch (e) {
          console.error("Failed to check daily expenses for notifications", e);
        }
      }
    };

    if (user) {
      initNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (pendingMode && !isTransitioning) {
      setTargetMode(pendingMode);
      setIsTransitioning(true);
      setPendingMode(null);
    }
  }, [pendingMode, isTransitioning]);

  const handleTransitionComplete = () => {
    if (targetMode) {
      setAppMode(targetMode);
    }
    setIsTransitioning(false);
    setTargetMode(null);
  };

  useEffect(() => {
    if (!isInitialized || isTransitioning) return;

    const inExpensesGroup =
      segments[0] === "(expenses)" ||
      segments[0] === "add-expense" ||
      segments[0] === "group";
    const inAuthScreen = segments[0] === "auth";

    if (appMode === "expenses") {
      if (!user && !inAuthScreen) {
        router.replace("/auth");
      } else if (user && (inAuthScreen || !inExpensesGroup)) {
        router.replace("/(expenses)");
      }
    } else {
      if (inExpensesGroup || inAuthScreen) {
        router.replace("/(planning)");
      }
    }
  }, [appMode, user, isInitialized, segments, isTransitioning]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(planning)" />
        <Stack.Screen name="(expenses)" />
        <Stack.Screen
          name="auth"
          options={{ presentation: "fullScreenModal" }}
        />

        <Stack.Screen name="list/[id]" options={{ headerShown: true }} />
        <Stack.Screen
          name="list/form"
          options={{ presentation: "modal", headerShown: true }}
        />
        <Stack.Screen
          name="item/form"
          options={{ presentation: "modal", headerShown: true }}
        />
        <Stack.Screen name="archived/index" options={{ headerShown: true }} />

        <Stack.Screen name="group/[id]" options={{ headerShown: true }} />
        <Stack.Screen
          name="group/create"
          options={{ presentation: "modal", headerShown: true }}
        />
        <Stack.Screen
          name="group/add-expense"
          options={{ presentation: "modal", headerShown: true }}
        />
        <Stack.Screen
          name="add-expense/index"
          options={{ presentation: "modal", headerShown: true }}
        />
      </Stack>
      <ModeTransition
        visible={isTransitioning}
        targetMode={targetMode}
        onComplete={handleTransitionComplete}
      />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <AuthProvider>
          <OfflineSyncProvider>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <RootNavigator />
              <StatusBar style="auto" />
            </ThemeProvider>
          </OfflineSyncProvider>
        </AuthProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
