import { ModeSwitchButton } from '@/src/components/ui/ModeSwitchButton';
import { ModeTransition } from '@/src/components/ui/ModeTransition';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { AppMode, useAppModeStore } from '@/src/store/app-mode.store';
import { useStore } from '@/src/store/useStore';
import { useThemeColors } from '@/src/theme';
import { Currency } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
    const colors = useThemeColors();
    const { settings, setSettings, lists, importData, resetStore } = useStore();
    const { setAppMode } = useAppModeStore();

    const [isTransitioning, setIsTransitioning] = useState(false);
    const [targetMode, setTargetMode] = useState<AppMode | null>(null);

    const currencies: { code: Currency; label: string; symbol: string }[] = [
        { code: 'XOF', label: 'CFA', symbol: 'F' },
        { code: 'EUR', label: 'Euro', symbol: '€' },
        { code: 'USD', label: 'Dollar', symbol: '$' },
    ];

    const handleModeSwitch = (mode: AppMode) => {
        setTargetMode(mode);
        setIsTransitioning(true);
    };

    const handleTransitionComplete = () => {
        if (targetMode) {
            setAppMode(targetMode);
        }
        setIsTransitioning(false);
        setTargetMode(null);
    };

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
        <>
            <ScreenWrapper style={styles.container}>
                <Text style={[styles.title, { color: colors.text.primary }]}>Settings</Text>

                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text.tertiary }]}>Mode</Text>
                    <ModeSwitchButton onPress={handleModeSwitch} />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text.tertiary }]}>Currency</Text>
                    <View style={[styles.card, { backgroundColor: colors.surface }]}>
                        <View style={styles.currencyRow}>
                            {currencies.map((c) => (
                                <TouchableOpacity
                                    key={c.code}
                                    style={[
                                        styles.currencyOption,
                                        { backgroundColor: colors.system.systemGray6 },
                                        settings.defaultCurrency === c.code && { backgroundColor: colors.primary }
                                    ]}
                                    onPress={() => setSettings({ ...settings, defaultCurrency: c.code })}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.currencySymbol,
                                        { color: colors.text.secondary },
                                        settings.defaultCurrency === c.code && { color: colors.text.inverse }
                                    ]}>{c.symbol}</Text>
                                    <Text style={[
                                        styles.currencyLabel,
                                        { color: colors.text.tertiary },
                                        settings.defaultCurrency === c.code && { color: colors.text.inverse }
                                    ]}>{c.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text.tertiary }]}>Data</Text>
                    <View style={[styles.card, { backgroundColor: colors.surface }]}>
                        <TouchableOpacity style={styles.menuItem} onPress={handleExport} activeOpacity={0.6}>
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
                                    <Ionicons name="cloud-upload-outline" size={18} color={colors.primary} />
                                </View>
                                <Text style={[styles.menuItemText, { color: colors.text.primary }]}>Export Backup</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
                        </TouchableOpacity>

                        <View style={[styles.separator, { backgroundColor: colors.border }]} />

                        <TouchableOpacity style={styles.menuItem} onPress={handleImport} activeOpacity={0.6}>
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.iconCircle, { backgroundColor: colors.status.success + '20' }]}>
                                    <Ionicons name="cloud-download-outline" size={18} color={colors.status.success} />
                                </View>
                                <Text style={[styles.menuItemText, { color: colors.text.primary }]}>Import Backup</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text.tertiary }]}>Reset</Text>
                    <View style={[styles.card, { backgroundColor: colors.surface }]}>
                        <TouchableOpacity style={styles.menuItem} onPress={handleReset} activeOpacity={0.6}>
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.iconCircle, { backgroundColor: colors.status.danger + '20' }]}>
                                    <Ionicons name="trash-outline" size={18} color={colors.status.danger} />
                                </View>
                                <Text style={[styles.menuItemText, { color: colors.status.danger }]}>Delete All Data</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ flex: 1 }} />
                <Text style={[styles.footer, { color: colors.text.tertiary }]}>Budgy v1.0.0</Text>
            </ScreenWrapper>

            <ModeTransition
                visible={isTransitioning}
                targetMode={targetMode}
                onComplete={handleTransitionComplete}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    title: {
        fontSize: 34,
        fontWeight: '700',
        marginBottom: 32,
        letterSpacing: 0.37,
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginLeft: 4,
    },
    card: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    currencyRow: {
        flexDirection: 'row',
        padding: 8,
        gap: 8,
    },
    currencyOption: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 10,
    },
    currencySymbol: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    currencyLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 17,
        fontWeight: '400',
    },
    separator: {
        height: 1,
        marginLeft: 62,
    },
    footer: {
        textAlign: 'center',
        fontSize: 13,
        marginBottom: 16,
    },
});
