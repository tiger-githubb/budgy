import { Button } from '@/src/components/ui/Button';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { supabase } from '@/src/lib/supabase';
import { useAppModeStore } from '@/src/store/app-mode.store';
import { useAuthStore } from '@/src/store/auth.store';
import { useThemeColors } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
    const colors = useThemeColors();
    const { setAppMode } = useAppModeStore();
    const { initialize } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualUrl, setManualUrl] = useState('');

    const extractAndSetSession = async (url: string) => {
        const hashIndex = url.indexOf('#');
        if (hashIndex === -1) return false;

        const hashPart = url.substring(hashIndex + 1);
        const params = new URLSearchParams(hashPart);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });
            if (!error) {
                await initialize();
                return true;
            }
        }
        return false;
    };

    useEffect(() => {
        const handleDeepLink = async (event: { url: string }) => {
            const success = await extractAndSetSession(event.url);
            if (success) {
                setShowManualInput(false);
            }
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);
        Linking.getInitialURL().then((url) => {
            if (url) handleDeepLink({ url });
        });

        return () => subscription.remove();
    }, []);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            const redirectUrl = Linking.createURL('auth/callback');

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                },
            });

            if (error) throw error;

            if (data?.url) {
                const result = await WebBrowser.openAuthSessionAsync(
                    data.url,
                    redirectUrl
                );

                if (result.type === 'success' && result.url) {
                    const success = await extractAndSetSession(result.url);
                    if (!success) {
                        setShowManualInput(true);
                    }
                } else if (result.type === 'cancel' || result.type === 'dismiss') {
                    const { data: sessionData } = await supabase.auth.getSession();
                    if (!sessionData.session) {
                        setShowManualInput(true);
                    }
                }
            }
        } catch (error) {
            console.error('Google Sign-In error:', error);
            Alert.alert('Erreur', "Impossible de se connecter avec Google");
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualSubmit = async () => {
        if (!manualUrl.trim()) return;
        setIsLoading(true);
        try {
            const success = await extractAndSetSession(manualUrl.trim());
            if (success) {
                setShowManualInput(false);
                setManualUrl('');
            } else {
                Alert.alert('Erreur', 'URL invalide ou tokens expirés');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de traiter cette URL');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setAppMode('planning');
    };

    if (showManualInput) {
        return (
            <ScreenWrapper>
                <View style={styles.container}>
                    <TouchableOpacity style={styles.backButton} onPress={() => setShowManualInput(false)}>
                        <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
                    </TouchableOpacity>

                    <View style={styles.manualContent}>
                        <Text style={[styles.title, { color: colors.text.primary }]}>
                            Connexion manuelle
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                            Colle l'URL complète de la page où tu as été redirigé (commence par http://localhost...)
                        </Text>

                        <TextInput
                            style={[styles.urlInput, {
                                backgroundColor: colors.surface,
                                color: colors.text.primary,
                                borderColor: colors.border
                            }]}
                            placeholder="http://localhost:3000/#access_token=..."
                            placeholderTextColor={colors.text.tertiary}
                            value={manualUrl}
                            onChangeText={setManualUrl}
                            multiline
                            numberOfLines={4}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <Button
                            title="Valider"
                            onPress={handleManualSubmit}
                            loading={isLoading}
                        />
                    </View>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>

                <View style={styles.content}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                        <Ionicons name="wallet-outline" size={64} color={colors.primary} />
                    </View>

                    <Text style={[styles.title, { color: colors.text.primary }]}>
                        Mode Dépenses
                    </Text>

                    <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                        Connecte-toi pour suivre tes dépenses personnelles et de groupe.
                    </Text>

                    <View style={styles.features}>
                        {[
                            { icon: 'receipt-outline', text: 'Journal de dépenses quotidien' },
                            { icon: 'people-outline', text: 'Partage de frais en groupe' },
                            { icon: 'calculator-outline', text: 'Calcul automatique des dettes' },
                        ].map((feature, index) => (
                            <View key={index} style={styles.featureRow}>
                                <Ionicons name={feature.icon as any} size={20} color={colors.primary} />
                                <Text style={[styles.featureText, { color: colors.text.secondary }]}>
                                    {feature.text}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Continuer avec Google"
                        onPress={handleGoogleSignIn}
                        loading={isLoading}
                        icon={<Ionicons name="logo-google" size={20} color="#fff" />}
                        style={styles.googleButton}
                    />

                    <Text style={[styles.disclaimer, { color: colors.text.tertiary }]}>
                        En continuant, tu acceptes nos conditions d'utilisation.
                    </Text>
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    manualContent: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 32,
        gap: 16,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    features: {
        gap: 16,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureText: {
        fontSize: 15,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 32,
        gap: 16,
    },
    googleButton: {
        backgroundColor: '#4285F4',
    },
    disclaimer: {
        fontSize: 12,
        textAlign: 'center',
    },
    urlInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        minHeight: 120,
        textAlignVertical: 'top',
    },
});
