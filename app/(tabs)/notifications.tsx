import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// 1. DỮ LIỆU GIẢ LẬP (MOCK DATA)
// Sau này bạn có thể thay bằng dữ liệu lấy từ Firebase
const INITIAL_NOTIFICATIONS = [
    {
        id: '1',
        type: 'order',
        title: 'Đặt hàng thành công 📦',
        message: 'Đơn hàng #ORD-8821 của bạn đã được xác nhận và đang chờ đóng gói.',
        time: '2 phút trước',
        read: false
    },
    {
        id: '2',
        type: 'promo',
        title: 'Săn Sale Giờ Vàng 🔥',
        message: 'Nhập mã BHSTORE50 để được giảm ngay 50% cho Balo Laptop.',
        time: '30 phút trước',
        read: false
    },
    {
        id: '3',
        type: 'system',
        title: 'Chào mừng đến BHSTORE',
        message: 'Cảm ơn bạn đã cài đặt ứng dụng. Hãy khám phá bộ sưu tập mới nhất nhé!',
        time: '1 ngày trước',
        read: true
    },
    {
        id: '4',
        type: 'order',
        title: 'Giao hàng thành công',
        message: 'Đơn hàng #ORD-7712 đã được giao đến bạn. Hãy đánh giá 5 sao nhé!',
        time: '3 ngày trước',
        read: true
    },
];

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

    // Hàm chọn Icon theo loại thông báo
    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return { name: 'cube-outline', color: '#00d2ff' };
            case 'promo': return { name: 'pricetag-outline', color: '#ff9f43' };
            case 'system': return { name: 'notifications-outline', color: '#00ff87' };
            default: return { name: 'information-circle-outline', color: '#fff' };
        }
    };

    // Hàm xóa tất cả thông báo
    const handleClearAll = () => {
        setNotifications([]);
    };

    // Hàm đánh dấu đã đọc (khi bấm vào)
    const handleRead = (id: string) => {
        setNotifications(prev => prev.map(item =>
            item.id === id ? { ...item, read: true } : item
        ));
    };

    return (
        <View style={styles.container}>
            {/* Nền Gradient */}
            <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={StyleSheet.absoluteFill} />

            {/* Trang trí Blob */}
            <View style={[styles.blob, { top: 100, left: -50, backgroundColor: '#00ff87' }]} />
            <View style={[styles.blob, { bottom: 200, right: -50, backgroundColor: '#ff006e' }]} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Thông Báo</Text>
                    <Text style={styles.headerSub}>Cập nhật mới nhất từ BHSTORE</Text>
                </View>
                {notifications.length > 0 && (
                    <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
                        <Ionicons name="checkmark-done-outline" size={20} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Danh sách thông báo */}
            {notifications.length === 0 ? (
                // Giao diện Trống (Empty State)
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <Ionicons name="notifications-off-outline" size={50} color="rgba(255,255,255,0.3)" />
                    </View>
                    <Text style={styles.emptyText}>Hiện chưa có thông báo nào</Text>
                    <Text style={styles.emptySubText}>Bạn sẽ nhận được tin tức khi có đơn hàng hoặc khuyến mãi mới.</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    renderItem={({ item }) => {
                        const iconData = getIcon(item.type);
                        return (
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => handleRead(item.id)}
                                style={{ marginBottom: 15 }}
                            >
                                <BlurView intensity={30} tint="dark" style={[styles.notiCard, !item.read && styles.unreadBorder]}>
                                    {/* Cột Icon */}
                                    <View style={[styles.iconBox, { backgroundColor: iconData.color + '20' }]}>
                                        <Ionicons name={iconData.name as any} size={24} color={iconData.color} />
                                    </View>

                                    {/* Cột Nội dung */}
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <Text style={[styles.notiTitle, !item.read && { color: '#fff', fontWeight: 'bold' }]}>
                                                {item.title}
                                            </Text>
                                            <Text style={styles.notiTime}>{item.time}</Text>
                                        </View>
                                        <Text style={styles.notiMsg} numberOfLines={2}>
                                            {item.message}
                                        </Text>
                                    </View>

                                    {/* Dấu chấm đỏ chưa đọc */}
                                    {!item.read && <View style={styles.dot} />}
                                </BlurView>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    blob: {
        position: 'absolute', width: 250, height: 250, borderRadius: 125, opacity: 0.2,
        shadowColor: "#fff", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20
    },

    // Header
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 60, paddingHorizontal: 20, marginBottom: 10
    },
    headerTitle: { fontSize: 30, fontWeight: '900', color: '#fff', letterSpacing: 1 },
    headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
    clearBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },

    // Card Thông báo
    notiCard: {
        flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20,
        overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
    },
    unreadBorder: { borderColor: 'rgba(0, 255, 135, 0.4)', backgroundColor: 'rgba(255,255,255,0.08)' },

    iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    notiTitle: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '600', flex: 1 },
    notiTime: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginLeft: 10 },
    notiMsg: { color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 18 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff006e', position: 'absolute', top: 15, right: 15 },

    // Empty State
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyIconCircle: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    emptyText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    emptySubText: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 20 }
});