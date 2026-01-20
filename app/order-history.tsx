import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router'; // Import thêm useLocalSearchParams
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// --- FIREBASE ---
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../constants/firebaseConfig';

export default function OrderHistoryScreen() {
    const router = useRouter();
    // Lấy tham số lọc từ trang Profile truyền sang (ví dụ: 'pending')
    const { filter } = useLocalSearchParams();

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // State quản lý tab hiện tại (Mặc định là 'all' nếu không có filter)
    const [activeTab, setActiveTab] = useState<string>((filter as string) || 'all');

    useEffect(() => {
        fetchOrders();
    }, [activeTab]); // Chạy lại khi đổi tab

    const fetchOrders = async () => {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            // Query cơ bản: Lấy đơn của user
            let q = query(collection(db, "orders"), where("userId", "==", user.uid));

            // Nếu không phải tab 'all', thì thêm điều kiện lọc theo status
            if (activeTab !== 'all') {
                q = query(q, where("status", "==", activeTab));
            }

            const querySnapshot = await getDocs(q);
            const list: any[] = [];
            querySnapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() });
            });

            // Sắp xếp client-side (Mới nhất lên đầu)
            list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

            setOrders(list);
        } catch (error) {
            console.error("Lỗi lấy đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return '#00ff87'; // Hoàn thành
            case 'shipping': return '#ff9f43'; // Đang giao
            case 'processing': return '#00d2ff'; // Chờ lấy hàng
            case 'cancelled': return '#ff006e'; // Hủy
            default: return '#f1c40f'; // Pending (Chờ xác nhận)
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'success': return 'Hoàn thành';
            case 'shipping': return 'Đang giao';
            case 'processing': return 'Chờ lấy hàng';
            case 'cancelled': return 'Đã hủy';
            default: return 'Chờ xác nhận';
        }
    };

    // Component Tab Filter nhỏ ở trên
    const FilterTab = ({ label, value }: { label: string, value: string }) => (
        <TouchableOpacity
            style={[styles.tabItem, activeTab === value && styles.tabActive]}
            onPress={() => setActiveTab(value)}
        >
            <Text style={[styles.tabText, activeTab === value && { color: '#000', fontWeight: 'bold' }]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={StyleSheet.absoluteFill} />

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* FILTER TABS */}
            <View style={{ height: 50 }}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 15, alignItems: 'center' }}
                    data={[
                        { label: 'Tất cả', value: 'all' },
                        { label: 'Chờ xác nhận', value: 'pending' },
                        { label: 'Chờ lấy hàng', value: 'processing' },
                        { label: 'Đang giao', value: 'shipping' },
                        { label: 'Hoàn thành', value: 'success' },
                    ]}
                    renderItem={({ item }) => <FilterTab label={item.label} value={item.value} />}
                />
            </View>

            {/* LIST ORDERS */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#00ff87" />
                </View>
            ) : orders.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="document-text-outline" size={80} color="rgba(255,255,255,0.2)" />
                    <Text style={styles.emptyText}>Không tìm thấy đơn hàng nào</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 20, paddingTop: 10 }}
                    renderItem={({ item }) => (
                        <BlurView intensity={20} tint="dark" style={styles.orderCard}>
                            {/* Header Card: Mã đơn + Trạng thái */}
                            <View style={styles.cardHeader}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <MaterialCommunityIcons name="cube-send" size={20} color="#fff" />
                                    <Text style={styles.orderId}> ...{item.id.slice(-6).toUpperCase()}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20', borderColor: getStatusColor(item.status) }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                                        {getStatusText(item.status)}
                                    </Text>
                                </View>
                            </View>

                            {/* Nội dung đơn */}
                            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                            <View style={styles.divider} />

                            {item.products?.map((prod: any, index: number) => (
                                <View key={index} style={styles.productRow}>
                                    <Text style={styles.prodName} numberOfLines={1}>x{prod.quantity || 1} {prod.name}</Text>
                                </View>
                            ))}

                            <View style={styles.divider} />

                            {/* Tổng tiền */}
                            <View style={styles.cardFooter}>
                                <Text style={styles.totalLabel}>Tổng tiền:</Text>
                                <Text style={styles.totalPrice}>{formatCurrency(item.totalAmount)}</Text>
                            </View>

                            {item.paymentNote && (
                                <Text style={styles.paymentNote}>Nội dung CK: {item.paymentNote}</Text>
                            )}
                        </BlurView>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 10, backgroundColor: 'rgba(0,0,0,0.3)' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    backBtn: { padding: 5 },
    emptyText: { color: 'rgba(255,255,255,0.5)', marginTop: 20 },

    // TABS
    tabItem: { marginRight: 10, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    tabActive: { backgroundColor: '#00ff87', borderColor: '#00ff87' },
    tabText: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },

    orderCard: { marginBottom: 15, borderRadius: 15, padding: 15, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    orderId: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    dateText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 10 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 10 },
    productRow: { marginBottom: 5 },
    prodName: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { color: 'rgba(255,255,255,0.6)' },
    totalPrice: { color: '#00ff87', fontSize: 18, fontWeight: 'bold' },
    paymentNote: { marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }
});