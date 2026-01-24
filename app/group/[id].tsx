import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { useAddGroupMember, useGroup, useGroupExpenses, useGroupMembers } from '@/src/hooks/queries/use-groups.query';
import { useAuthStore } from '@/src/store/auth.store';
import { useThemeColors } from '@/src/theme';
import { GroupExpense, GroupMember, MemberBalance } from '@/src/types/expenses.type';
import { calculateDebts, calculateMemberBalances, formatCurrency } from '@/src/utils/balance';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

const Avatar = ({ url, name, size = 40, style }: { url?: string | null; name?: string | null; size?: number; style?: any }) => {
    const colors = useThemeColors();

    if (url) {
        return (
            <Image
                source={{ uri: url }}
                style={[
                    { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surfaceHighlight },
                    style
                ]}
            />
        );
    }

    return (
        <View style={[
            { width: size, height: size, borderRadius: size / 2, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary + '20' },
            style
        ]}>
            <Text style={{ fontSize: size * 0.4, fontWeight: '600', color: colors.primary }}>
                {name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
        </View>
    );
};

type TabKey = 'expenses' | 'members' | 'balances';

const TAB_CONFIG: { key: TabKey; label: string; icon: string }[] = [
    { key: 'expenses', label: 'Dépenses', icon: 'receipt-outline' },
    { key: 'members', label: 'Membres', icon: 'people-outline' },
    { key: 'balances', label: 'Soldes', icon: 'wallet-outline' },
];

export default function GroupDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const colors = useThemeColors();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<TabKey>('expenses');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

    const tabProgress = useSharedValue(0);

    const { data: group, isLoading: groupLoading } = useGroup(id);
    const { data: members, refetch: refetchMembers, isRefetching: membersRefreshing } = useGroupMembers(id);
    const { data: expenses, refetch: refetchExpenses, isRefetching: expensesRefreshing } = useGroupExpenses(id);
    const addMember = useAddGroupMember();

    const handleTabChange = (tab: TabKey) => {
        const index = TAB_CONFIG.findIndex(t => t.key === tab);
        tabProgress.value = withSpring(index, { damping: 15 });
        setActiveTab(tab);
    };

    const tabIndicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: tabProgress.value * (100 + 8) }],
    }));

    const balances = useMemo(() => {
        if (!members || !expenses) return [];
        return calculateMemberBalances(expenses, members);
    }, [members, expenses]);

    const debts = useMemo(() => {
        if (!balances.length) return [];
        return calculateDebts(balances);
    }, [balances]);

    const handleInvite = async () => {
        if (!inviteEmail.trim()) {
            Alert.alert('Erreur', 'Ajoute une adresse email');
            return;
        }

        try {
            await addMember.mutateAsync({ groupId: id, email: inviteEmail.trim() });
            setInviteEmail('');
            setShowInviteModal(false);
            refetchMembers();
        } catch (error: any) {
            Alert.alert('Erreur', error.message || "Impossible d'ajouter ce membre");
        }
    };

    const renderExpenseItem = ({ item, index }: { item: GroupExpense; index: number }) => {
        const payer = members?.find(m => m.user_id === item.payer_id);

        return (
            <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
                <Card>
                    <View style={styles.expenseRow}>
                        <Avatar url={payer?.profile?.avatar_url} name={payer?.profile?.display_name} size={40} />
                        <View style={styles.expenseInfo}>
                            <Text style={[styles.expenseTitle, { color: colors.text.primary }]}>{item.title}</Text>
                            <Text style={[styles.expenseSubtitle, { color: colors.text.tertiary }]}>
                                Payé par {payer?.profile?.display_name ?? 'Inconnu'}
                            </Text>
                        </View>
                        <Text style={[styles.expenseAmount, { color: colors.primary }]}>
                            {formatCurrency(Number(item.amount), 'XOF')}
                        </Text>
                    </View>
                </Card>
            </Animated.View>
        );
    };

    const renderMemberItem = ({ item, index }: { item: GroupMember; index: number }) => {
        const isOwner = item.role === 'admin';
        const isMe = item.user_id === user?.id;

        return (
            <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
                <Card>
                    <View style={styles.memberRow}>
                        <Avatar url={item.profile?.avatar_url} name={item.profile?.display_name} size={44} />
                        <View style={styles.memberInfo}>
                            <Text style={[styles.memberName, { color: colors.text.primary }]}>
                                {item.profile?.display_name ?? 'Inconnu'}
                                {isMe && <Text style={{ color: colors.text.tertiary }}> (moi)</Text>}
                            </Text>
                            <Text style={[styles.memberEmail, { color: colors.text.tertiary }]}>
                                {item.profile?.email}
                            </Text>
                        </View>
                        {isOwner && (
                            <View style={[styles.ownerBadge, { backgroundColor: colors.primary + '20' }]}>
                                <Ionicons name="star" size={12} color={colors.primary} />
                                <Text style={[styles.ownerText, { color: colors.primary }]}>Admin</Text>
                            </View>
                        )}
                    </View>
                </Card>
            </Animated.View>
        );
    };

    const renderBalanceItem = ({ item, index }: { item: MemberBalance; index: number }) => {
        const isPositive = item.balance >= 0;
        const member = members?.find(m => m.user_id === item.user_id);

        return (
            <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
                <Card>
                    <View style={styles.balanceRow}>
                        <Avatar url={member?.profile?.avatar_url} name={member?.profile?.display_name} size={44} />
                        <View style={styles.balanceInfo}>
                            <Text style={[styles.balanceName, { color: colors.text.primary }]}>
                                {member?.profile?.display_name ?? 'Inconnu'}
                            </Text>
                            <Text style={[styles.balanceSubtitle, { color: colors.text.tertiary }]}>
                                {isPositive ? 'Doit recevoir' : 'Doit payer'}
                            </Text>
                        </View>
                        <Text style={[
                            styles.balanceAmount,
                            { color: isPositive ? colors.status.success : colors.status.danger }
                        ]}>
                            {isPositive ? '+' : ''}{formatCurrency(item.balance, 'XOF')}
                        </Text>
                    </View>
                </Card>
            </Animated.View>
        );
    };

    if (groupLoading) {
        return (
            <ScreenWrapper>
                <Stack.Screen options={{ headerShown: true, title: '', headerBackTitle: '' }} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </ScreenWrapper>
        );
    }

    if (!group) {
        return (
            <ScreenWrapper>
                <Stack.Screen options={{ headerShown: true, title: 'Groupe', headerBackTitle: '' }} />
                <View style={styles.loadingContainer}>
                    <Text style={{ color: colors.text.primary }}>Groupe non trouvé</Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: group.name,
                    headerBackTitle: '', // Hides the "Back" text, keeps the arrow
                    headerTintColor: colors.text.primary,
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: colors.background },
                }}
            />

            <Animated.View entering={FadeInUp.springify()} style={styles.tabsContainer}>
                <View style={[styles.tabsWrapper, { backgroundColor: colors.surfaceHighlight }]}>
                    <Animated.View
                        style={[
                            styles.tabIndicator,
                            { backgroundColor: colors.surface },
                            tabIndicatorStyle,
                        ]}
                    />
                    {TAB_CONFIG.map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => handleTabChange(tab.key)}
                            style={styles.tab}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={tab.icon as any}
                                size={18}
                                color={activeTab === tab.key ? colors.primary : colors.text.tertiary}
                            />
                            <Text style={[
                                styles.tabLabel,
                                { color: activeTab === tab.key ? colors.primary : colors.text.tertiary }
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Animated.View>

            {activeTab === 'expenses' && (
                <View style={styles.listContainer}>
                    {!expenses?.length ? (
                        <View style={styles.emptyState}>
                            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceHighlight }]}>
                                <Ionicons name="receipt-outline" size={40} color={colors.text.tertiary} />
                            </View>
                            <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>
                                Aucune dépense
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={expenses}
                            keyExtractor={(item) => item.id}
                            renderItem={renderExpenseItem}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl refreshing={expensesRefreshing} onRefresh={refetchExpenses} />
                            }
                        />
                    )}
                </View>
            )}

            {activeTab === 'members' && (
                <View style={styles.listContainer}>
                    <View style={styles.membersHeader}>
                        <Button
                            title="Inviter"
                            onPress={() => setShowInviteModal(true)}
                            size="small"
                            icon={<Ionicons name="person-add" size={16} color="#fff" />}
                        />
                    </View>
                    <FlatList
                        data={members}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMemberItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={membersRefreshing} onRefresh={refetchMembers} />
                        }
                    />
                </View>
            )}

            {activeTab === 'balances' && (
                <View style={styles.listContainer}>
                    <View style={styles.debtsSection}>
                        <Text style={[styles.debtsSectionTitle, { color: colors.text.secondary }]}>
                            Résumé des dettes
                        </Text>
                        {debts.length === 0 ? (
                            <Text style={[styles.noDebts, { color: colors.text.tertiary }]}>
                                Tout le monde est à jour !
                            </Text>
                        ) : (
                            debts.map((debt, i) => {
                                return (
                                    <View key={i} style={[styles.debtRow, { backgroundColor: colors.surface }]}>
                                        <Text style={[styles.debtText, { color: colors.text.primary }]}>
                                            {debt.from.display_name} → {debt.to.display_name}
                                        </Text>
                                        <Text style={[styles.debtAmount, { color: colors.status.danger }]}>
                                            {formatCurrency(debt.amount, 'XOF')}
                                        </Text>
                                    </View>
                                );
                            })
                        )}
                    </View>

                    <View style={{ marginTop: 24 }}>
                        <Text style={[styles.debtsSectionTitle, { color: colors.text.secondary }]}>
                            Détails par membre
                        </Text>
                        <FlatList
                            data={balances}
                            keyExtractor={(item) => item.user_id}
                            renderItem={renderBalanceItem}
                            scrollEnabled={false}
                        />
                    </View>
                </View>
            )}

            {activeTab === 'expenses' && (
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: colors.primary }]}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        router.push({ pathname: '/group/add-expense', params: { groupId: id } });
                    }}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>
            )}

            <Modal
                visible={showInviteModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowInviteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                                Inviter un membre
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowInviteModal(false)}
                                style={[styles.modalCloseButton, { backgroundColor: colors.surfaceHighlight }]}
                            >
                                <Ionicons name="close" size={20} color={colors.text.primary} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[
                                styles.emailInput,
                                { backgroundColor: colors.surface, color: colors.text.primary, borderColor: colors.border }
                            ]}
                            placeholder="Email du membre"
                            placeholderTextColor={colors.text.tertiary}
                            value={inviteEmail}
                            onChangeText={setInviteEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Button
                            title="Inviter"
                            onPress={handleInvite}
                            loading={addMember.isPending}
                            icon={<Ionicons name="send" size={18} color="#fff" />}
                        />
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabsContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    tabsWrapper: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
        position: 'relative',
    },
    tabIndicator: {
        position: 'absolute',
        width: 100,
        height: '100%',
        borderRadius: 10,
        left: 4,
        top: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 6,
        zIndex: 1,
    },
    tabLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    listContent: {
        paddingBottom: 100,
        gap: 12,
    },
    expenseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    expenseInfo: {
        flex: 1,
    },
    expenseTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    expenseSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    expenseAmount: {
        fontSize: 16,
        fontWeight: '700',
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
    },
    memberEmail: {
        fontSize: 13,
        marginTop: 2,
    },
    ownerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    ownerText: {
        fontSize: 11,
        fontWeight: '600',
    },
    membersHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 16,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    balanceInfo: {
        flex: 1,
    },
    balanceName: {
        fontSize: 16,
        fontWeight: '600',
    },
    balanceSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    balanceAmount: {
        fontSize: 16,
        fontWeight: '700',
    },
    debtsSection: {
        marginTop: 8,
    },
    debtsSectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    debtRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        marginBottom: 8,
    },
    debtText: {
        fontSize: 15,
        fontWeight: '500',
    },
    debtAmount: {
        fontSize: 15,
        fontWeight: '700',
    },
    noDebts: {
        fontSize: 15,
        fontStyle: 'italic',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '500',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    modalCloseButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emailInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
    },
});
