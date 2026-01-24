import { useThemeColors } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function ExpensesLayout() {
    const colors = useThemeColors();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.text.tertiary,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopColor: colors.border,
                },
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.text.primary,
                headerShadowVisible: false,
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dépenses',
                    tabBarIcon: ({ color }) => <Ionicons name="receipt-outline" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="groups"
                options={{
                    title: 'Groupes',
                    tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: 'Compte',
                    tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
