import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions, Image, ScrollView, StyleSheet,
    TextInput, TouchableOpacity, View
} from 'react-native';

// --- KẾT NỐI FIREBASE ---
import { addDoc, collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../constants/firebaseConfig';
// ------------------------

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { useColorScheme } from '../hooks/use-color-scheme';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const [userProfile, setUserProfile] = useState<any>(null);

    // State lưu danh sách sản phẩm thật lấy từ Firebase
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const bgInput = colorScheme === 'dark' ? '#2C2C2C' : '#F5F5F5';
    const cardBg = colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF';
    const textColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';

    const categories = ['Tất cả', 'Laptop', 'Du lịch', 'Thời trang', 'Đi học'];

    // --- HÀM 1: LẤY SẢN PHẨM TỪ FIREBASE VỀ ---
    const fetchProducts = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            const productsList: any[] = [];
            querySnapshot.forEach((doc) => {
                productsList.push({ id: doc.id, ...doc.data() });
            });
            setProducts(productsList);
        } catch (error) {
            console.error("Lỗi lấy sản phẩm:", error);
        }
    };

    // --- HÀM 2: NẠP SẢN PHẨM MẪU (Dùng Link ảnh có sẵn) ---
    // Đây là công cụ Admin để bạn nạp hàng nhanh
    const seedProductsWithLinks = async () => {
        const sampleProducts = [
            { name: 'Balo Laptop Chống Nước', price: 550000, rating: 4.8, category: 'Laptop', image: 'https://cdn-icons-png.flaticon.com/512/2852/2852506.png' },
            { name: 'Balo Du Lịch Phượt', price: 890000, rating: 5.0, category: 'Du lịch', image: 'https://cdn-icons-png.flaticon.com/512/2954/2954886.png' },
            { name: 'Balo Học Sinh Cute', price: 320000, rating: 4.5, category: 'Đi học', image: 'https://cdn-icons-png.flaticon.com/512/2852/2852506.png' },
            { name: 'Túi Đeo Chéo Sport', price: 150000, rating: 4.2, category: 'Thời trang', image: 'https://cdn-icons-png.flaticon.com/512/11549/11549742.png' },
            { name: 'Vali Kéo Du Lịch', price: 1200000, rating: 4.9, category: 'Du lịch', image: 'https://cdn-icons-png.flaticon.com/512/2954/2954911.png' },
            { name: 'Balo Gaming RGB', price: 2100000, rating: 5.0, category: 'Laptop', image: 'https://cdn-icons-png.flaticon.com/512/10608/10608298.png' },
        ];

        try {
            Alert.alert("Đang nạp dữ liệu", "Đang thêm sản phẩm vào Firebase...");
            const productsRef = collection(db, 'products');

            for (const product of sampleProducts) {
                await addDoc(productsRef, {
                    ...product,
                    createdAt: new Date().toISOString()
                });
            }
            Alert.alert("Thành công", "Đã thêm 6 sản phẩm mẫu! App sẽ tự tải lại.");
            fetchProducts(); // Tải lại danh sách ngay lập tức
        } catch (error) {
            console.error("Lỗi:", error);
        }
    };

    // --- HÀM 3: LẤY THÔNG TIN USER ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Lấy User
                const currentUser = auth.currentUser;
                if (currentUser) {
                    const docSnap = await getDoc(doc(db, "users", currentUser.uid));
                    if (docSnap.exists()) setUserProfile(docSnap.data());
                }
                // Lấy Sản phẩm luôn
                await fetchProducts();
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    const handleLogout = () => {
        auth.signOut().then(() => router.replace('/'));
    };

    return (
        <ThemedView style={styles.container}>
            {/* 1. HEADER */}
            <View style={[styles.headerContainer, { backgroundColor: cardBg }]}>
                <View style={styles.topRow}>
                    <View>
                        <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>Chào bạn,</ThemedText>
                        <ThemedText type="subtitle" style={{ color: '#0a7ea4' }}>
                            {userProfile?.fullName || 'Khách hàng'}
                        </ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 15 }}>

                        {/* --- NÚT NẠP DỮ LIỆU (ẨN - Chỉ dùng để nạp hàng lúc đầu) --- */}
                        <TouchableOpacity onPress={seedProductsWithLinks}>
                            <Ionicons name="cloud-download-outline" size={24} color="#FF6B00" />
                        </TouchableOpacity>
                        {/* -------------------------------------------------------- */}

                        <TouchableOpacity onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={24} color={textColor} />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Ionicons name="cart-outline" size={24} color={textColor} />
                            <View style={styles.badge}><ThemedText style={styles.badgeText}>0</ThemedText></View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Thanh tìm kiếm */}
                <View style={[styles.searchBar, { backgroundColor: bgInput }]}>
                    <Ionicons name="search" size={20} color="#888" />
                    <TextInput
                        placeholder="Tìm kiếm balo, túi xách..."
                        placeholderTextColor="#888"
                        style={[styles.searchInput, { color: textColor }]}
                    />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 2. BANNER */}
                <View style={styles.bannerContainer}>
                    <View style={styles.banner}>
                        <View style={styles.bannerTextContainer}>
                            <ThemedText style={styles.bannerTitle}>SALE 50%</ThemedText>
                            <ThemedText style={styles.bannerSubtitle}>Mùa tựu trường</ThemedText>
                            <TouchableOpacity style={styles.bannerBtn}>
                                <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Xem ngay</ThemedText>
                            </TouchableOpacity>
                        </View>
                        <Image
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2954/2954886.png' }}
                            style={styles.bannerImage}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* 3. DANH MỤC */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
                    {categories.map((cat, index) => (
                        <TouchableOpacity key={index} style={[styles.categoryPill, index === 0 && styles.activeCategory]}>
                            <ThemedText style={[styles.categoryText, index === 0 && { color: '#fff' }]}>{cat}</ThemedText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* 4. DANH SÁCH SẢN PHẨM (Lấy từ Firebase) */}
                <View style={styles.sectionHeader}>
                    <ThemedText type="subtitle">Sản phẩm mới về</ThemedText>
                </View>

                {/* Kiểm tra loading */}
                {loading ? (
                    <ActivityIndicator size="large" color="#0a7ea4" style={{ marginTop: 20 }} />
                ) : (
                    <View style={styles.productGrid}>
                        {products.length === 0 ? (
                            <ThemedText style={{ textAlign: 'center', width: '100%', marginTop: 20, color: '#888' }}>
                                Chưa có sản phẩm nào. Bấm vào đám mây màu cam để nạp dữ liệu!
                            </ThemedText>
                        ) : (
                            products.map((item) => (
                                <TouchableOpacity key={item.id} style={[styles.productCard, { backgroundColor: cardBg }]}>
                                    <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="contain" />
                                    <View style={styles.productInfo}>
                                        <ThemedText numberOfLines={1} style={styles.productName}>{item.name}</ThemedText>
                                        <View style={styles.ratingRow}>
                                            <Ionicons name="star" size={12} color="#FFD700" />
                                            <ThemedText style={styles.ratingText}>{item.rating}</ThemedText>
                                        </View>
                                        <View style={styles.priceRow}>
                                            <ThemedText style={styles.priceText}>{formatCurrency(item.price)}</ThemedText>
                                            <TouchableOpacity style={styles.addBtn}>
                                                <Ionicons name="add" size={16} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerContainer: { padding: 20, paddingTop: 50, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    badge: { position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 10, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 45, borderRadius: 12 },
    searchInput: { flex: 1, marginLeft: 10 },
    scrollContent: { padding: 20 },

    // Banner
    bannerContainer: { marginBottom: 20 },
    banner: { backgroundColor: '#E3F2FD', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 150 },
    bannerTextContainer: { flex: 1 },
    bannerTitle: { fontSize: 24, fontWeight: '900', color: '#0a7ea4' },
    bannerSubtitle: { fontSize: 14, color: '#555', marginBottom: 10 },
    bannerBtn: { backgroundColor: '#0a7ea4', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
    bannerImage: { width: 120, height: 120 },

    // Categories
    categoryList: { marginBottom: 20 },
    categoryPill: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 10 },
    activeCategory: { backgroundColor: '#0a7ea4' },
    categoryText: { fontWeight: '600', fontSize: 13 },

    // Products
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15 },
    productCard: { width: (width - 55) / 2, borderRadius: 15, padding: 10, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
    productImage: { width: '100%', height: 100, marginBottom: 10 },
    productInfo: { gap: 4 },
    productName: { fontSize: 13, fontWeight: '600' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontSize: 10, opacity: 0.6 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
    priceText: { fontSize: 14, fontWeight: 'bold', color: '#0a7ea4' },
    addBtn: { backgroundColor: '#0a7ea4', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }
});