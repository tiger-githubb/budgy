import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { useStore } from '@/src/store/useStore';
import { COLORS, RADIUS, SPACING } from '@/src/theme';
import { Currency } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
    const { settings, setSettings, lists, importData, resetStore } = useStore();

    const currencies: { code: Currency; label: string; symbol: string }[] = [
        { code: 'XOF', label: 'CFA', symbol: 'F' },
        { code: 'EUR', label: 'Euro', symbol: '€' },
        { code: 'USD', label: 'Dollar', symbol: '$' },
    ];

    const handleExport = async () => {
        try {
            const data = { version: 1, timestamp: Date.now(), settings, lists };
            const json = JSON.stringify(data, null, 2);
            const fileUri = (FileSystem.documentDirectory || '') + 'budgy_backup.json';
            await FileSystem.writeAsStringAsync(fileUri, json, { encoding: 'utf8' });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/json',
                    dialogTitle: 'Export Budgy Data'
                });
            } else {
                Alert.alert("Exported", "File saved successfully.");
            }
        } catch (error) {
            Alert.alert("Error", "Export failed.");
        }
    };

    const handleImport = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
            });
            if (result.canceled) return;

            const fileUri = result.assets[0].uri;
            const fileContent = await FileSystem.readAsStringAsync(fileUri, { encoding: 'utf8' });
            const data = JSON.parse(fileContent);

            if (!data.lists || !data.settings) {
                Alert.alert("Error", "Invalid backup file.");
                return;
            }

            Alert.alert("Import", "Replace all current data?", [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Import",
                    style: "destructive",
                    onPress: () => {
                        importData({ lists: data.lists, settings: data.settings });
                        Alert.alert("Success", "Data imported.");
                    }
                }
            ]);
        } catch (error) {
            Alert.alert("Error", "Import failed.");
        }
    };

    const handleReset = () => {
        Alert.alert("Reset", "Delete all data permanently?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete All",
                style: "destructive",
                onPress: () => {
                    resetStore();
                    Alert.alert("Done", "App reset complete.");
                }
            }
        ]);
    };

    return (
        <ScreenWrapper style={styles.container}>
            <Text style={styles.title}>Settings</Text>

            {/* Currency Selection */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Currency</Text>
                <View style={styles.card}>
                    <View style={styles.currencyRow}>
                        {currencies.map((c) => (
                            <TouchableOpacity
                                key={c.code}
                                style={[
                                    styles.currencyOption,
                                    settings.defaultCurrency === c.code && styles.currencyOptionActive
                                ]}
                                onPress={() => setSettings({ ...settings, defaultCurrency: c.code })}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.currencySymbol,
                                    settings.defaultCurrency === c.code && styles.currencySymbolActive
                                ]}>{c.symbol}</Text>
                                <Text style={[
                                    styles.currencyLabel,
                                    settings.defaultCurrency === c.code && styles.currencyLabelActive
                                ]}>{c.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Data Management */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Data</Text>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.menuItem} onPress={handleExport} activeOpacity={0.6}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '20' }]}>
                                <Ionicons name="cloud-upload-outline" size={18} color={COLORS.primary} />
                            </View>
                            <Text style={styles.menuItemText}>Export Backup</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.text.tertiary} />
                    </TouchableOpacity>

                    <View style={styles.separator} />

                    <TouchableOpacity style={styles.menuItem} onPress={handleImport} activeOpacity={0.6}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.iconCircle, { backgroundColor: COLORS.status.success + '20' }]}>
                                <Ionicons name="cloud-download-outline" size={18} color={COLORS.status.success} />
                            </View>
                            <Text style={styles.menuItemText}>Import Backup</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.text.tertiary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Danger Zone */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Reset</Text>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.menuItem} onPress={handleReset} activeOpacity={0.6}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.iconCircle, { backgroundColor: COLORS.status.danger + '20' }]}>
                                <Ionicons name="trash-outline" size={18} color={COLORS.status.danger} />
                            </View>
                            <Text style={[styles.menuItemText, { color: COLORS.status.danger }]}>Delete All Data</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.text.tertiary} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ flex: 1 }} />
            <Text style={styles.footer}>Budgy v1.0.0</Text>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: SPACING.m,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text.primary,
        marginBottom: SPACING.xl,
        letterSpacing: -0.5,
    },
    section: {
        marginBottom: SPACING.l,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.text.tertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: SPACING.s,
        marginLeft: SPACING.xs,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.l,
        overflow: 'hidden',
    },
    currencyRow: {
        flexDirection: 'row',
        padding: SPACING.s,
        gap: SPACING.s,
    },
    currencyOption: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: SPACING.m,
        borderRadius: RADIUS.m,
        backgroundColor: COLORS.background,
    },
    currencyOptionActive: {
        backgroundColor: COLORS.primary,
    },
    currencySymbol: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.text.secondary,
        marginBottom: 4,
    },
    currencySymbolActive: {
        color: COLORS.text.inverse,
    },
    currencyLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.text.tertiary,
    },
    currencyLabelActive: {
        color: COLORS.text.inverse,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.m,
        paddingHorizontal: SPACING.m,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.m,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.text.primary,
    },
    separator: {
        height: 1,
        backgroundColor: COLORS.border,
        marginLeft: SPACING.m + 36 + SPACING.m,
    },
    footer: {
        textAlign: 'center',
        fontSize: 12,
        color: COLORS.text.tertiary,
        marginBottom: SPACING.m,
    },
});
