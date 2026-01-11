import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// --- FIREBASE ---
import { signOut } from 'firebase/auth';
import { auth } from '../../constants/firebaseConfig';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    // Lấy thông tin User hiện tại
    useEffect(() => {
        const currUser = auth.currentUser;
        if (currUser) {
            setUser({
                name: currUser.displayName || 'Khách hàng thân thiết',
                email: currUser.email,
                avatar: currUser.photoURL || 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png' // Avatar mặc định
            });
        }
    }, []);

    const handleLogout = async () => {
        Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Đồng ý",
                onPress: async () => {
                    await signOut(auth);
                    router.replace('/auth');
                }
            }
        ]);
    };

    const menuItems = [
        { icon: 'location-outline', title: 'Sổ địa chỉ', sub: 'Quản lý địa chỉ nhận hàng' },
        { icon: 'card-outline', title: 'Phương thức thanh toán', sub: 'Visa, Momo, Apple Pay' },
        { icon: 'ticket-outline', title: 'Kho Voucher', sub: 'Mã giảm giá của bạn' },
        { icon: 'headset-outline', title: 'Trung tâm hỗ trợ', sub: 'Tư vấn 24/7' },
        { icon: 'settings-outline', title: 'Cài đặt tài khoản', sub: 'Bảo mật, Ngôn ngữ' },
    ];

    return (
        <View style={styles.container}>
            {/* Nền Gradient */}
            <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={StyleSheet.absoluteFill} />

            {/* Blob trang trí */}
            <View style={[styles.blob, { top: -50, right: -50, backgroundColor: '#00ff87' }]} />
            <View style={[styles.blob, { top: 300, left: -100, backgroundColor: '#ff006e' }]} />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* 1. HEADER USER INFO */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: user?.avatar }} style={styles.avatar} />
                        <View style={styles.editIcon}>
                            <Ionicons name="camera" size={14} color="#000" />
                        </View>
                    </View>
                    <View style={{ marginLeft: 20, flex: 1 }}>
                        <Text style={styles.userName}>{user?.name}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                        <TouchableOpacity style={styles.editProfileBtn}>
                            <Text style={styles.editProfileText}>Chỉnh sửa hồ sơ</Text>
                            <Ionicons name="chevron-forward" size={14} color="#00ff87" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 2. ORDER DASHBOARD (QUAN TRỌNG) */}
                <BlurView intensity={30} tint="dark" style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                        <Text style={styles.sectionTitle}>Đơn mua của tôi</Text>
                        <TouchableOpacity onPress={() => alert('Xem lịch sử')}>
                            <Text style={styles.seeAll}>Xem lịch sử &gt;</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.statusRow}>
                        <TouchableOpacity style={styles.statusItem}>
                            <View style={styles.iconBox}>
                                <MaterialCommunityIcons name="wallet-outline" size={24} color="#00ff87" />
                                <View style={styles.badge}><Text style={styles.badgeText}>1</Text></View>
                            </View>
                            <Text style={styles.statusText}>Chờ xác nhận</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.statusItem}>
                            <View style={styles.iconBox}>
                                <MaterialCommunityIcons name="package-variant-closed" size={24} color="#00d2ff" />
                            </View>
                            <Text style={styles.statusText}>Chờ lấy hàng</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.statusItem}>
                            <View style={styles.iconBox}>
                                <MaterialCommunityIcons name="truck-delivery-outline" size={24} color="#ff9f43" />
                                <View style={styles.badge}><Text style={styles.badgeText}>2</Text></View>
                            </View>
                            <Text style={styles.statusText}>Đang giao</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.statusItem}>
                            <View style={styles.iconBox}>
                                <MaterialCommunityIcons name="star-circle-outline" size={24} color="#ff6b6b" />
                            </View>
                            <Text style={styles.statusText}>Đánh giá</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>

                {/* 3. MENU LIST */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.menuItem}>
                            <BlurView intensity={20} tint="dark" style={styles.menuItemGlass}>
                                <View style={[styles.menuIconBox, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                                    <Ionicons name={item.icon as any} size={22} color="#fff" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 15 }}>
                                    <Text style={styles.menuTitle}>{item.title}</Text>
                                    <Text style={styles.menuSub}>{item.sub}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
                            </BlurView>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 4. LOGOUT BUTTON */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#ff006e" />
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Phiên bản 1.0.0 (BHStore)</Text>

            </ScrollView>
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
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 70, paddingHorizontal: 20, marginBottom: 30 },
    avatarContainer: { position: 'relative' },
    avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#00ff87' },
    editIcon: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: '#00ff87', width: 24, height: 24, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#000'
    },
    userName: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
    userEmail: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 8 },
    editProfileBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 255, 135, 0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start' },
    editProfileText: { color: '#00ff87', fontSize: 12, marginRight: 5, fontWeight: '600' },

    // Order Dashboard
    orderCard: { marginHorizontal: 20, padding: 20, borderRadius: 25, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 25 },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    seeAll: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statusItem: { alignItems: 'center', width: '22%' },
    iconBox: { marginBottom: 8, position: 'relative' },
    statusText: { color: 'rgba(255,255,255,0.8)', fontSize: 11, textAlign: 'center' },
    badge: {
        position: 'absolute', top: -5, right: -8,
        backgroundColor: '#ff006e', minWidth: 16, height: 16, borderRadius: 8,
        justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#24243e'
    },
    badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },

    // Menu List
    menuContainer: { paddingHorizontal: 20 },
    menuItem: { marginBottom: 15, borderRadius: 20, overflow: 'hidden' },
    menuItemGlass: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: 'rgba(255,255,255,0.03)' },
    menuIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    menuTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 2 },
    menuSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },

    // Logout
    logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 20, padding: 15, marginHorizontal: 20, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,0,110,0.3)', backgroundColor: 'rgba(255,0,110,0.1)' },
    logoutText: { color: '#ff006e', fontWeight: 'bold', marginLeft: 10 },
    versionText: { textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12 }
});