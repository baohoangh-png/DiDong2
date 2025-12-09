import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function DashboardScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();

    const cardBg = colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF';
    const iconBg = colorScheme === 'dark' ? '#2C2C2C' : '#F5F5F5';

    const recentOrders = [
        { id: 'DH001', customer: 'Nguyễn Văn A', total: '1.250.000đ', status: 'Success', time: '10:30' },
        { id: 'DH002', customer: 'Trần Thị B', total: '560.000đ', status: 'Pending', time: '09:15' },
        { id: 'DH003', customer: 'Lê Văn C', total: '2.100.000đ', status: 'Success', time: '08:45' },
    ];

    // Hàm đăng xuất
    const handleLogout = () => {
        router.replace('/'); // Quay về trang Landing Page
    };

    return (
        <ThemedView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <View>
                    <ThemedText style={styles.greeting}>Xin chào, Admin 👋</ThemedText>
                    <ThemedText type="subtitle" style={styles.shopName}>Cửa hàng QLBanHang</ThemedText>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity style={[styles.notificationBtn, { backgroundColor: iconBg }]}>
                        <Ionicons name="notifications-outline" size={24} color="#0a7ea4" />
                        <View style={styles.badge} />
                    </TouchableOpacity>
                    {/* Nút đăng xuất */}
                    <TouchableOpacity onPress={handleLogout} style={[styles.notificationBtn, { backgroundColor: '#FFEBEE' }]}>
                        <Ionicons name="log-out-outline" size={24} color="#D32F2F" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* STATISTICS CARDS */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: '#0a7ea4' }]}>
                        <View style={styles.statIconBox}>
                            <Ionicons name="wallet" size={20} color="#0a7ea4" />
                        </View>
                        <View>
                            <ThemedText style={styles.statLabelLight}>Doanh thu ngày</ThemedText>
                            <ThemedText style={styles.statValueLight}>5.2Tr</ThemedText>
                        </View>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: cardBg }]}>
                        <View style={[styles.statIconBox, { backgroundColor: '#FFF0E6' }]}>
                            <Ionicons name="cart" size={20} color="#FF6B00" />
                        </View>
                        <View>
                            <ThemedText style={styles.statLabel}>Đơn hàng</ThemedText>
                            <ThemedText style={styles.statValue}>12</ThemedText>
                        </View>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: cardBg }]}>
                        <View style={[styles.statIconBox, { backgroundColor: '#FFEEEE' }]}>
                            <Ionicons name="alert-circle" size={20} color="#FF3B30" />
                        </View>
                        <View>
                            <ThemedText style={styles.statLabel}>Sắp hết</ThemedText>
                            <ThemedText style={styles.statValue}>5</ThemedText>
                        </View>
                    </View>
                </View>

                {/* QUICK ACTIONS */}
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Chức năng nhanh</ThemedText>
                <View style={styles.menuGrid}>
                    <MenuButton title="Tạo đơn" icon="add-circle" color="#0a7ea4" bg={cardBg} onPress={() => { }} />
                    <MenuButton title="Sản phẩm" icon="cube" color="#FF6B00" bg={cardBg} onPress={() => { }} />
                    <MenuButton title="Khách hàng" icon="people" color="#34C759" bg={cardBg} onPress={() => { }} />
                    <MenuButton title="Báo cáo" icon="bar-chart" color="#5856D6" bg={cardBg} onPress={() => { }} />
                    <MenuButton title="Kho hàng" icon="layers" color="#FF9500" bg={cardBg} onPress={() => { }} />
                    <MenuButton title="Cài đặt" icon="settings" color="#8E8E93" bg={cardBg} onPress={() => { }} />
                </View>

                {/* RECENT ORDERS */}
                <View style={styles.recentHeader}>
                    <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Giao dịch gần đây</ThemedText>
                    <TouchableOpacity>
                        <ThemedText style={{ color: '#0a7ea4' }}>Xem tất cả</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={styles.listContainer}>
                    {recentOrders.map((item) => (
                        <View key={item.id} style={[styles.orderItem, { backgroundColor: cardBg }]}>
                            <View style={styles.orderLeft}>
                                <View style={[styles.orderIcon, { backgroundColor: item.status === 'Success' ? '#E8F5E9' : '#FFF3E0' }]}>
                                    <Ionicons
                                        name={item.status === 'Success' ? "checkmark-circle" : "time"}
                                        size={20}
                                        color={item.status === 'Success' ? "#2E7D32" : "#EF6C00"}
                                    />
                                </View>
                                <View>
                                    <ThemedText type="defaultSemiBold">{item.customer}</ThemedText>
                                    <ThemedText style={styles.orderId}>{item.id} • {item.time}</ThemedText>
                                </View>
                            </View>
                            <ThemedText type="defaultSemiBold" style={{ color: item.status === 'Success' ? '#2E7D32' : '#EF6C00' }}>
                                {item.total}
                            </ThemedText>
                        </View>
                    ))}
                </View>
                <View style={{ height: 20 }} />
            </ScrollView>
        </ThemedView>
    );
}

const MenuButton = ({ title, icon, color, bg, onPress }: any) => (
    <TouchableOpacity style={[styles.menuBtn, { backgroundColor: bg }]} onPress={onPress}>
        <View style={[styles.menuIconContainer, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={28} color={color} />
        </View>
        <ThemedText style={styles.menuText}>{title}</ThemedText>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        marginBottom: 20,
    },
    greeting: { fontSize: 14, opacity: 0.6 },
    shopName: { fontSize: 20, fontWeight: 'bold' },
    notificationBtn: {
        width: 45, height: 45, borderRadius: 25,
        justifyContent: 'center', alignItems: 'center',
    },
    badge: {
        position: 'absolute', top: 10, right: 12, width: 8, height: 8,
        borderRadius: 4, backgroundColor: 'red', borderWidth: 1, borderColor: '#fff',
    },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, gap: 10 },
    statCard: {
        flex: 1, borderRadius: 16, padding: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
        justifyContent: 'space-between', height: 100,
    },
    statIconBox: {
        width: 32, height: 32, borderRadius: 10, backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    },
    statLabel: { fontSize: 12, opacity: 0.6 },
    statValue: { fontSize: 18, fontWeight: 'bold' },
    statLabelLight: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
    statValueLight: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    sectionTitle: { marginBottom: 15, fontSize: 18 },
    menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 30 },
    menuBtn: {
        width: '31%', aspectRatio: 1, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    menuIconContainer: {
        width: 50, height: 50, borderRadius: 25,
        justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    },
    menuText: { fontSize: 12, fontWeight: '500' },
    recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    listContainer: { gap: 10 },
    orderItem: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 15, borderRadius: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
    },
    orderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    orderIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    orderId: { fontSize: 12, opacity: 0.5 },
});