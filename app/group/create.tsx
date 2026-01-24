import { Button } from '@/src/components/ui/Button';
import { FormContainer } from '@/src/components/ui/FormContainer';
import { Input } from '@/src/components/ui/Input';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { useCreateGroup } from '@/src/hooks/queries/use-groups.query';
import { useThemeColors } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function CreateGroupScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const createGroup = useCreateGroup();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert('Erreur', 'Ajoute un nom pour le groupe');
            return;
        }

        try {
            await createGroup.mutateAsync({
                name: name.trim(),
                description: description.trim() || undefined,
            });
            router.back();
        } catch (error: any) {
            console.error('Group creation error:', error);
            Alert.alert(
                'Erreur',
                error?.message || 'Impossible de créer le groupe'
            );
        }
    };

    const footerContent = (
        <Button
            title="Créer le groupe"
            onPress={handleCreate}
            loading={createGroup.isPending}
            icon={<Ionicons name="people" size={20} color="#fff" />}
        />
    );

    return (
        <ScreenWrapper edges={['bottom']}>
            <Stack.Screen
                options={{
                    presentation: 'modal',
                    headerShown: true,
                    title: 'Nouveau groupe',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="close" size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <FormContainer footer={footerContent}>
                <Animated.View
                    entering={FadeInUp.delay(100).springify()}
                    style={styles.illustrationContainer}
                >
                    <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                        <View style={[styles.iconInner, { backgroundColor: colors.primary + '25' }]}>
                            <Ionicons name="people" size={48} color={colors.primary} />
                        </View>
                    </View>
                </Animated.View>

                <Animated.View
                    entering={FadeInDown.delay(200).springify()}
                    style={styles.form}
                >
                    <Input
                        label="Nom du groupe"
                        placeholder="Ex: Colocation, Vacances..."
                        value={name}
                        onChangeText={setName}
                        autoFocus
                    />

                    <Input
                        label="Description (optionnel)"
                        placeholder="Une courte description..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                        style={{ minHeight: 80, textAlignVertical: 'top', paddingTop: 14 }}
                    />
                </Animated.View>
            </FormContainer>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    illustrationContainer: {
        alignItems: 'center',
        marginBottom: 32,
        paddingTop: 16,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconInner: {
        width: 88,
        height: 88,
        borderRadius: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    form: {
        gap: 8,
    },
});
