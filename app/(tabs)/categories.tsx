import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// --- FIREBASE ---
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../constants/firebaseConfig';

const { width } = Dimensions.get('window');

// 1. DANH SÁCH DANH MỤC CỐ ĐỊNH (Bạn có thể sửa lại theo ý muốn)
// Lưu ý: 'id' phải trùng với trường 'category' bạn đã lưu trong Firebase (Tech, Travel, Laptop...)
const CATEGORIES = [
    { id: 'Travel', name: 'Du Lịch & Phượt', icon: 'airplane-outline', color: '#ff9f43' },
    { id: 'Laptop', name: 'Laptop & Công Sở', icon: 'briefcase-outline', color: '#00d2ff' },
    { id: 'School', name: 'Đi Học (Teen)', icon: 'school-outline', color: '#ff6b6b' },
    { id: 'Gaming', name: 'Gaming & Tech', icon: 'game-controller-outline', color: '#9b59b6' },
    { id: 'Crossbody', name: 'Túi Đeo Chéo', icon: 'bag-handle-outline', color: '#1dd1a1' },
    { id: 'Canvas', name: 'Túi Tote / Vải', icon: 'leaf-outline', color: '#feca57' },
];

export default function ExploreScreen() {
    const router = useRouter();

    // State quản lý
    const [selectedCategory, setSelectedCategory] = useState<any>(null); // Danh mục đang chọn
    const [products, setProducts] = useState<any[]>([]); // List sản phẩm của danh mục đó
    const [loading, setLoading] = useState(false);

    // --- HÀM LẤY SẢN PHẨM THEO DANH MỤC ---
    const fetchProductsByCategory = async (catId: string) => {
        setLoading(true);
        try {
            // Query tìm sản phẩm có category == catId
            const q = query(collection(db, "products"), where("category", "==", catId));
            const querySnapshot = await getDocs(q);

            const list: any[] = [];
            querySnapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() });
            });
            setProducts(list);
        } catch (error) {
            console.error("Lỗi lấy danh mục:", error);
        } finally {
            setLoading(false);
        }
    };

    // Khi bấm chọn danh mục
    const handleSelectCategory = (category: any) => {
        setSelectedCategory(category);
        fetchProductsByCategory(category.id);
    };

    // Quay lại danh sách danh mục
    const handleBack = () => {
        setSelectedCategory(null);
        setProducts([]);
    };

    const formatCurrency = (num: number) => num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    // --- GIAO DIỆN 1: LƯỚI DANH MỤC (HIỆN KHI CHƯA CHỌN GÌ) ---
    const renderCategoryGrid = () => (
        <FlatList
            data={CATEGORIES}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.catCardContainer}
                    onPress={() => handleSelectCategory(item)}
                    activeOpacity={0.8}
                >
                    <BlurView intensity={30} tint="dark" style={styles.catCardGlass}>
                        <View style={[styles.iconCircle, { borderColor: item.color }]}>
                            <Ionicons name={item.icon as any} size={32} color={item.color} />
                        </View>
                        <Text style={styles.catName}>{item.name}</Text>
                        <Text style={styles.catSub}>Khám phá ngay</Text>
                    </BlurView>
                </TouchableOpacity>
            )}
        />
    );

    // --- GIAO DIỆN 2: DANH SÁCH SẢN PHẨM (HIỆN KHI ĐÃ CHỌN) ---
    const renderProductList = () => (
        <View style={{ flex: 1 }}>
            {/* Header nhỏ để quay lại */}
            <View style={styles.subHeader}>
                <TouchableOpacity onPress={handleBack} style={styles.smallBackBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.subHeaderTitle}>{selectedCategory?.name}</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#00ff87" style={{ marginTop: 50 }} />
            ) : products.length === 0 ? (
                <View style={styles.emptyView}>
                    <Ionicons name="sad-outline" size={60} color="rgba(255,255,255,0.3)" />
                    <Text style={styles.emptyText}>Chưa có sản phẩm nào ở đây cả.</Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    renderItem={({ item }) => (
                        <BlurView intensity={20} tint="dark" style={styles.prodCard}>
                            <TouchableOpacity
                                style={{ flex: 1, alignItems: 'center' }}
                                onPress={() => router.push(`/product/${item.id}` as any)}
                            >
                                <Image source={{ uri: item.image }} style={styles.prodImage} resizeMode="contain" />
                                <Text numberOfLines={1} style={styles.prodName}>{item.name}</Text>
                                <Text style={styles.prodPrice}>{formatCurrency(item.price)}</Text>
                            </TouchableOpacity>
                        </BlurView>
                    )}
                />
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={StyleSheet.absoluteFill} />

            {/* Blob trang trí */}
            <View style={[styles.blob, { top: 50, right: -50, backgroundColor: '#00ff87' }]} />
            <View style={[styles.blob, { bottom: 100, left: -50, backgroundColor: '#ff006e' }]} />

            {/* Header Chính */}
            {!selectedCategory && (
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Danh Mục</Text>
                    <Text style={styles.headerSub}>Tìm kiếm phong cách của bạn</Text>
                </View>
            )}

            {/* Logic chuyển đổi giao diện */}
            {selectedCategory ? renderProductList() : renderCategoryGrid()}

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    blob: {
        position: 'absolute', width: 250, height: 250, borderRadius: 125, opacity: 0.2,
        shadowColor: "#fff", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20
    },

    // Header Chính
    header: { paddingTop: 60, paddingHorizontal: 20, marginBottom: 10 },
    headerTitle: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 1 },
    headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 5 },

    // Card Danh Mục
    catCardContainer: { width: (width - 45) / 2, height: 160, marginBottom: 15, borderRadius: 20, overflow: 'hidden' },
    catCardGlass: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    iconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
    catName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    catSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },

    // Giao diện Sub (Product List)
    subHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 20, marginBottom: 10 },
    smallBackBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    subHeaderTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

    emptyView: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { color: 'rgba(255,255,255,0.5)', marginTop: 15 },

    // Card Sản phẩm nhỏ
    prodCard: { width: (width - 45) / 2, padding: 15, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
    prodImage: { width: '100%', height: 100, marginBottom: 10 },
    prodName: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
    prodPrice: { color: '#00ff87', fontSize: 14, fontWeight: 'bold' }
});