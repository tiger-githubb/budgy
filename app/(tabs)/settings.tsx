import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { useStore } from '@/src/store/useStore';
import { COLORS, SPACING } from '@/src/theme';
import { Currency } from '@/src/types';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
    const { settings, setCurrency, resetStore } = useStore();

    const currencies: Currency[] = ['XOF', 'USD', 'EUR'];

    const handleReset = () => {
        Alert.alert(
            "Reset App",
            "Are you sure you want to delete all data? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete All",
                    style: "destructive",
                    onPress: () => {
                        resetStore();
                        Alert.alert("Success", "All data has been reset.");
                    }
                }
            ]
        );
    };

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Settings</Text>

                <Text style={styles.sectionTitle}>Default Currency</Text>
                <Card>
                    <View style={styles.currencyContainer}>
                        {currencies.map((curr) => (
                            <Button
                                key={curr}
                                title={curr}
                                variant={settings.defaultCurrency === curr ? 'primary' : 'outline'}
                                onPress={() => setCurrency(curr)}
                                style={styles.currencyButton}
                                textStyle={{ fontSize: 14 }}
                            />
                        ))}
                    </View>
                </Card>

                <Text style={styles.sectionTitle}>Data Management</Text>
                <Card>
                    <Button
                        title="Reset All Data"
                        variant="danger"
                        onPress={handleReset}
                    />
                </Card>

                <Text style={styles.version}>Budgy v1.0.0</Text>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: SPACING.xl,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.text.primary,
        marginBottom: SPACING.l,
        marginTop: SPACING.m,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text.secondary,
        marginBottom: SPACING.s,
        marginTop: SPACING.m,
    },
    currencyContainer: {
        flexDirection: 'row',
        gap: SPACING.s,
        justifyContent: 'space-between',
    },
    currencyButton: {
        flex: 1,
        minHeight: 40,
    },
    version: {
        textAlign: 'center',
        color: COLORS.text.tertiary,
        marginTop: SPACING.xl,
        fontSize: 12,
    },
});
