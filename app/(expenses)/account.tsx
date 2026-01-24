import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { ModeSwitchButton } from '@/src/components/ui/ModeSwitchButton';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { AppMode, useAppModeStore } from '@/src/store/app-mode.store';
import { useAuthStore } from '@/src/store/auth.store';
import { useThemeColors } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { ModeTransition } from '@/src/components/ui/ModeTransition';

export default function AccountScreen() {
    const colors = useThemeColors();
    const { user, signOut, isLoading } = useAuthStore();
    const { setAppMode } = useAppModeStore();

    const [isTransitioning, setIsTransitioning] = useState(false);
    const [targetMode, setTargetMode] = useState<AppMode | null>(null);

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

    const handleSignOut = () => {
        Alert.alert(
            'Déconnexion',
            'Es-tu sûr de vouloir te déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Déconnexion', style: 'destructive', onPress: signOut },
            ]
        );
    };

    return (
        <>
            <ScreenWrapper>
                <Animated.View entering={FadeInUp.delay(50).springify()}>
                    <Text style={[styles.title, { color: colors.text.primary }]}>Compte</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(100).springify()}>
                    <Card style={styles.profileCard}>
                        <View style={styles.profileContent}>
                            {user?.user_metadata?.avatar_url ? (
                                <Image
                                    source={{ uri: user.user_metadata.avatar_url }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                                    <Ionicons name="person" size={36} color={colors.primary} />
                                </View>
                            )}
                            <View style={styles.profileInfo}>
                                <Text style={[styles.profileName, { color: colors.text.primary }]}>
                                    {user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? 'Utilisateur'}
                                </Text>
                                <Text style={[styles.profileEmail, { color: colors.text.tertiary }]}>
                                    {user?.email}
                                </Text>
                            </View>
                        </View>
                    </Card>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).springify()}>
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
                            Changer de mode
                        </Text>
                        <ModeSwitchButton onPress={handleModeSwitch} />
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300).springify()}>
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Actions</Text>
                        <Button
                            title="Se déconnecter"
                            onPress={handleSignOut}
                            variant="danger"
                            loading={isLoading}
                            icon={<Ionicons name="log-out-outline" size={20} color="#fff" />}
                        />
                    </View>
                </Animated.View>

                <View style={styles.footer}>
                    <Text style={[styles.version, { color: colors.text.tertiary }]}>
                        Budgy v1.0.0 • Mode Dépenses
                    </Text>
                </View>
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
    title: {
        fontSize: 34,
        fontWeight: '700',
        marginBottom: 24,
        letterSpacing: 0.37,
    },
    profileCard: {
        marginBottom: 24,
    },
    profileContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
    },
    avatarPlaceholder: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInfo: {
        marginLeft: 16,
        flex: 1,
    },
    profileName: {
        fontSize: 22,
        fontWeight: '600',
    },
    profileEmail: {
        fontSize: 15,
        marginTop: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
        marginLeft: 4,
    },
    footer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 32,
    },
    version: {
        fontSize: 13,
    },
});
