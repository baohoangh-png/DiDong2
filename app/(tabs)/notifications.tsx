import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// --- FIREBASE ---
import { addDoc, collection, doc, getDocs, onSnapshot, query, serverTimestamp, updateDoc, where, writeBatch } from 'firebase/firestore';
import { auth, db } from '../../constants/firebaseConfig';

export default function NotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Lắng nghe thông báo theo thời gian thực (Real-time)
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        // CÁCH SỬA LỖI XOAY MÃI:
        // Chỉ dùng where, bỏ orderBy ở đây để tránh lỗi Missing Index của Firebase
        const q = query(
            collection(db, "notifications"),
            where("userId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list: any[] = [];
            snapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() });
            });

            // Tự sắp xếp ở phía Client (App) thay vì bắt Server làm
            // Tin mới nhất (createdAt lớn nhất) sẽ lên đầu
            list.sort((a, b) => {
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
            });

            setNotifications(list);
            setLoading(false);
        }, (error) => {
            // Nếu có lỗi, in ra console và tắt loading để không bị treo
            console.error("Lỗi lấy thông báo:", error);
            Alert.alert("Lỗi", "Không thể tải thông báo: " + error.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Hàm đánh dấu đã đọc khi bấm vào
    const handleRead = async (item: any) => {
        if (!item.isRead) {
            try {
                const notiRef = doc(db, "notifications", item.id);
                await updateDoc(notiRef, { isRead: true });
            } catch (e) {
                console.error(e);
            }
        }
        // Logic điều hướng
        if (item.type === 'order') {
            router.push('/order-history' as any);
        }
    };

    // Hàm đánh dấu ĐÃ ĐỌC TẤT CẢ
    const markAllAsRead = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const batch = writeBatch(db);
            const unreadQuery = query(
                collection(db, "notifications"),
                where("userId", "==", user.uid),
                where("isRead", "==", false)
            );

            const snapshot = await getDocs(unreadQuery);
            snapshot.forEach((doc) => {
                batch.update(doc.ref, { isRead: true });
            });

            await batch.commit();
            Alert.alert("Thành công", "Đã đánh dấu tất cả là đã đọc.");
        } catch (error) {
            console.error(error);
        }
    };

    // Hàm tạo thông báo mẫu
    const seedFakeNotis = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const fakeData = [
            {
                userId: user.uid,
                title: 'Săn Sale Giờ Vàng 🔥',
                message: 'Nhập mã BHSTORE50 để được giảm ngay 50% cho Balo Laptop.',
                type: 'promo',
                isRead: false,
                createdAt: serverTimestamp()
            },
            {
                userId: user.uid,
                title: 'Chào mừng đến BHSTORE',
                message: 'Cảm ơn bạn đã cài đặt ứng dụng. Hãy khám phá bộ sưu tập mới nhất nhé!',
                type: 'system',
                isRead: true,
                createdAt: serverTimestamp()
            }
        ];

        try {
            for (const data of fakeData) {
                await addDoc(collection(db, "notifications"), data);
            }
        } catch (e) {
            Alert.alert("Lỗi", "Không tạo được thông báo mẫu.");
        }
    };

    // Hàm tính thời gian tương đối
    const getRelativeTime = (timestamp: any) => {
        if (!timestamp) return 'Vừa xong';
        const now = new Date();
        const date = new Date(timestamp.seconds * 1000);
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        return `${Math.floor(diff / 86400)} ngày trước`;
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return { name: 'cube-outline', color: '#00d2ff' };
            case 'promo': return { name: 'pricetag-outline', color: '#ff9f43' };
            default: return { name: 'notifications-outline', color: '#00ff87' };
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={StyleSheet.absoluteFill} />

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thông Báo</Text>
                <TouchableOpacity onPress={markAllAsRead}>
                    <Ionicons name="checkmark-done-circle-outline" size={26} color="#00ff87" />
                </TouchableOpacity>
            </View>

            {/* CONTENT */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#00ff87" />
                </View>
            ) : notifications.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="notifications-off-outline" size={80} color="rgba(255,255,255,0.2)" />
                    <Text style={styles.emptyText}>Chưa có thông báo nào</Text>

                    <TouchableOpacity style={styles.seedBtn} onPress={seedFakeNotis}>
                        <Text style={{ color: '#000', fontWeight: 'bold' }}>Tạo thông báo mẫu</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    renderItem={({ item }) => {
                        const iconData = getIcon(item.type);
                        return (
                            <TouchableOpacity onPress={() => handleRead(item)}>
                                <BlurView intensity={20} tint="dark" style={[styles.notiCard, !item.isRead && styles.unreadCard]}>
                                    {/* Icon bên trái */}
                                    <View style={[styles.iconBox, { backgroundColor: iconData.color + '20' }]}>
                                        <Ionicons name={iconData.name as any} size={24} color={iconData.color} />
                                    </View>

                                    {/* Nội dung */}
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <View style={styles.rowTitle}>
                                            <Text style={[styles.notiTitle, !item.isRead && { color: '#fff', fontWeight: '900' }]}>{item.title}</Text>
                                            {!item.isRead && <View style={styles.redDot} />}
                                        </View>
                                        <Text style={styles.notiMessage} numberOfLines={2}>{item.message}</Text>
                                        <Text style={styles.notiTime}>{getRelativeTime(item.createdAt)}</Text>
                                    </View>
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.3)' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    backBtn: { padding: 5 },
    emptyText: { color: 'rgba(255,255,255,0.5)', marginTop: 20 },
    seedBtn: { marginTop: 20, backgroundColor: '#00ff87', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },

    notiCard: { flexDirection: 'row', padding: 15, marginBottom: 15, borderRadius: 20, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.03)', borderLeftWidth: 3, borderLeftColor: 'transparent' },
    unreadCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderLeftColor: '#ff006e' },

    iconBox: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },

    rowTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    notiTitle: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '600', flex: 1 },
    redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff006e', marginLeft: 5 },

    notiMessage: { color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 20, marginBottom: 8 },
    notiTime: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontStyle: 'italic' }
});