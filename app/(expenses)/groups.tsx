import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { routes } from '@/src/config/routes';
import { useGroups } from '@/src/hooks/queries/use-groups.query';
import { useThemeColors } from '@/src/theme';
import { Group } from '@/src/types/expenses.type';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function GroupsScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const { data: groups, isLoading, refetch, isRefetching } = useGroups();

    const renderGroupItem = ({ item, index }: { item: Group; index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
            <Card onPress={() => router.push(routes.expenses.groups.details(item.id))}>
                <View style={styles.groupContent}>
                    <View style={[styles.groupIcon, { backgroundColor: colors.primary + '15' }]}>
                        <Ionicons name="people" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.groupInfo}>
                        <Text style={[styles.groupName, { color: colors.text.primary }]}>{item.name}</Text>
                        {item.description && (
                            <Text
                                style={[styles.groupDescription, { color: colors.text.tertiary }]}
                                numberOfLines={1}
                            >
                                {item.description}
                            </Text>
                        )}
                    </View>
                    <View style={[styles.chevronContainer, { backgroundColor: colors.surfaceHighlight }]}>
                        <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
                    </View>
                </View>
            </Card>
        </Animated.View>
    );

    return (
        <ScreenWrapper>
            <Animated.View entering={FadeInUp.delay(50).springify()}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Groupes</Text>
                    <Button
                        title=""
                        onPress={() => router.push(routes.expenses.groups.create)}
                        size="small"
                        style={styles.addButton}
                        icon={<Ionicons name="add" size={22} color="#fff" />}
                    />
                </View>
            </Animated.View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : !groups || groups.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
                        <Ionicons name="people-outline" size={48} color={colors.text.tertiary} />
                    </View>
                    <Text style={[styles.emptyText, { color: colors.text.primary }]}>
                        Aucun groupe
                    </Text>
                    <Text style={[styles.emptySubtext, { color: colors.text.tertiary }]}>
                        Crée un groupe pour partager des dépenses avec tes amis
                    </Text>
                    <Button
                        title="Créer un groupe"
                        onPress={() => router.push(routes.expenses.groups.create)}
                        style={{ marginTop: 24 }}
                        icon={<Ionicons name="people" size={20} color="#fff" />}
                    />
                </View>
            ) : (
                <FlatList
                    data={groups}
                    keyExtractor={(item) => item.id}
                    renderItem={renderGroupItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                    }
                />
            )}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingTop: 8,
        height: 48,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '700',
        letterSpacing: 0.37,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        paddingHorizontal: 0,
        minHeight: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyIconContainer: {
        width: 88,
        height: 88,
        borderRadius: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    listContent: {
        gap: 12,
        paddingBottom: 32,
    },
    groupContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    groupIcon: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    groupInfo: {
        flex: 1,
        marginLeft: 14,
    },
    groupName: {
        fontSize: 17,
        fontWeight: '600',
    },
    groupDescription: {
        fontSize: 14,
        marginTop: 3,
    },
    chevronContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
