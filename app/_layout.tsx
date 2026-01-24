import { ModeTransition } from '@/src/components/ui/ModeTransition';
import { AuthProvider } from '@/src/providers/auth.provider';
import { QueryProvider } from '@/src/providers/query.provider';
import { AppMode, useAppModeStore } from '@/src/store/app-mode.store';
import { useAuthStore } from '@/src/store/auth.store';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

function RootNavigator() {
  const segments = useSegments();
  const router = useRouter();
  const { appMode, setAppMode } = useAppModeStore();
  const { user, isInitialized } = useAuthStore();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetMode, setTargetMode] = useState<AppMode | null>(null);
  const [pendingMode, setPendingMode] = useState<AppMode | null>(null);

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

    const inExpensesGroup = segments[0] === '(expenses)';
    const inAuthScreen = segments[0] === 'auth';

    if (appMode === 'expenses') {
      if (!user && !inAuthScreen) {
        router.replace('/auth');
      } else if (user && (inAuthScreen || !inExpensesGroup)) {
        router.replace('/(expenses)');
      }
    } else {
      if (inExpensesGroup || inAuthScreen) {
        router.replace('/(planning)');
      }
    }
  }, [appMode, user, isInitialized, segments, isTransitioning]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(planning)" />
        <Stack.Screen name="(expenses)" />
        <Stack.Screen name="auth" options={{ presentation: 'fullScreenModal' }} />

        <Stack.Screen name="list/[id]" options={{ headerShown: true }} />
        <Stack.Screen name="list/form" options={{ presentation: 'modal', headerShown: true }} />
        <Stack.Screen name="item/form" options={{ presentation: 'modal', headerShown: true }} />
        <Stack.Screen name="archived/index" options={{ headerShown: true }} />

        <Stack.Screen name="group/[id]" options={{ headerShown: true }} />
        <Stack.Screen name="group/create" options={{ presentation: 'modal', headerShown: true }} />
        <Stack.Screen name="group/add-expense" options={{ presentation: 'modal', headerShown: true }} />
        <Stack.Screen name="add-expense/index" options={{ presentation: 'modal', headerShown: true }} />
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
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RootNavigator />
            <StatusBar style="auto" />
          </ThemeProvider>
        </AuthProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
