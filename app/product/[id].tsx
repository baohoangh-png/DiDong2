import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal // <-- Thêm Modal
    ,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// --- FIREBASE ---
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../constants/firebaseConfig';

// --- GIỎ HÀNG ---
import { useCart } from '../../contexts/CartContext';

const { width, height } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // State cho Popup "Thêm thành công"
    const [modalVisible, setModalVisible] = useState(false);

    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                if (typeof id === 'string') {
                    const docRef = doc(db, "products", id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setProduct(docSnap.data());
                    } else {
                        // Alert thì vẫn dùng tạm ở đây cho lỗi logic
                        alert("Không tìm thấy sản phẩm!");
                        router.back();
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductDetail();
    }, [id]);

    // --- HÀM THÊM VÀO GIỎ MỚI ---
    const handleAddToCart = () => {
        if (!product) return;

        // 1. Thêm vào Context
        addToCart({
            id: id as string,
            ...product
        });

        // 2. Hiện Popup đẹp thay vì Alert
        setModalVisible(true);
    };

    const handleGoToCart = () => {
        setModalVisible(false);
        router.push('/cart' as any);
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#00ff87" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* 1. NỀN GRADIENT */}
            <LinearGradient
                colors={['#0f0c29', '#302b63', '#24243e']}
                style={StyleSheet.absoluteFill}
            />

            {/* Blob trang trí */}
            <View style={[styles.blob, { top: 100, right: -50, backgroundColor: '#00ff87' }]} />
            <View style={[styles.blob, { top: height / 2, left: -50, backgroundColor: '#ff006e' }]} />

            {/* 2. ẢNH SẢN PHẨM (Lớn) */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: product?.image }}
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>

            {/* Nút Back */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            {/* 3. TẤM KÍNH CHI TIẾT */}
            <BlurView intensity={80} tint="dark" style={styles.glassSheet}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                    <View style={styles.headerRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.categoryText}>{product?.category?.toUpperCase() || 'SẢN PHẨM'}</Text>
                            <Text style={styles.productName}>{product?.name}</Text>
                        </View>
                        <View style={styles.ratingBox}>
                            <Ionicons name="star" size={14} color="#FFD700" />
                            <Text style={styles.ratingText}>{product?.rating || 5.0}</Text>
                        </View>
                    </View>

                    <Text style={styles.priceText}>
                        {product?.price?.toLocaleString('vi-VN')} ₫
                    </Text>

                    <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
                    <Text style={styles.descriptionText}>
                        Sản phẩm này được thiết kế với phong cách tương lai, sử dụng vật liệu cao cấp chống nước và bền bỉ.
                        Phù hợp cho cả công việc và những chuyến đi xa.
                    </Text>

                    <Text style={styles.sectionTitle}>Màu sắc</Text>
                    <View style={styles.colorRow}>
                        {['#000000', '#ffffff', '#00ff87', '#ff006e'].map((color, index) => (
                            <View key={index} style={[styles.colorDot, { backgroundColor: color }, index === 2 && styles.activeColor]} />
                        ))}
                    </View>

                </ScrollView>

                {/* 4. THANH MUA HÀNG */}
                <View style={styles.bottomAction}>
                    <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
                        <LinearGradient
                            colors={['#00ff87', '#00b894']}
                            style={styles.gradientBtn}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="cart" size={20} color="#000" />
                            <Text style={styles.btnText}>THÊM VÀO GIỎ</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.favBtn}>
                        <Ionicons name="heart-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </BlurView>

            {/* ================================================== */}
            {/* 5. POPUP THÔNG BÁO THÊM GIỎ HÀNG (MODAL MỚI) */}
            {/* ================================================== */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    {/* Hộp thoại Glass */}
                    <View style={styles.modalContent}>
                        {/* Nền Gradient mờ cho Modal */}
                        <LinearGradient colors={['#24243e', '#0f0c29']} style={StyleSheet.absoluteFill} />

                        {/* Icon Check Xanh */}
                        <View style={styles.successIconCircle}>
                            <Ionicons name="checkmark" size={40} color="#00ff87" />
                        </View>

                        <Text style={styles.modalTitle}>Đã thêm vào giỏ!</Text>
                        <Text style={styles.modalText}>
                            Sản phẩm <Text style={{ color: '#00ff87', fontWeight: 'bold' }}>{product?.name}</Text> đã nằm gọn trong giỏ của bạn.
                        </Text>

                        {/* 2 Nút hành động */}
                        <View style={styles.modalBtnColumn}>
                            {/* Nút 1: Đi tới giỏ hàng */}
                            <TouchableOpacity style={styles.btnGoCart} onPress={handleGoToCart}>
                                <LinearGradient colors={['#00ff87', '#00b894']} style={styles.btnGradientFull}>
                                    <Text style={styles.btnTextDark}>Đến giỏ hàng ngay</Text>
                                    <Ionicons name="arrow-forward" size={18} color="#000" />
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Nút 2: Mua tiếp (Màu tối) */}
                            <TouchableOpacity style={styles.btnContinue} onPress={() => setModalVisible(false)}>
                                <Text style={styles.btnTextLight}>Tiếp tục xem hàng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    blob: {
        position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.3,
        shadowColor: "#fff", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20
    },
    backBtn: {
        position: 'absolute', top: 50, left: 20, zIndex: 10,
        width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center'
    },
    // Ảnh
    imageContainer: { height: height * 0.45, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
    image: { width: width * 0.9, height: '100%' },
    // Glass Sheet
    glassSheet: {
        flex: 1, borderTopLeftRadius: 30, borderTopRightRadius: 30,
        overflow: 'hidden', padding: 25,
        backgroundColor: Platform.OS === 'android' ? 'rgba(20, 20, 30, 0.95)' : undefined
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    categoryText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: 1, marginBottom: 5 },
    productName: { color: '#fff', fontSize: 26, fontWeight: 'bold', width: '90%' },
    ratingBox: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, alignItems: 'center', gap: 4 },
    ratingText: { color: '#FFD700', fontWeight: 'bold', fontSize: 12 },
    priceText: { color: '#00ff87', fontSize: 24, fontWeight: '900', marginBottom: 20 },
    sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 10, marginTop: 10 },
    descriptionText: { color: 'rgba(255,255,255,0.7)', lineHeight: 22, fontSize: 14 },
    colorRow: { flexDirection: 'row', gap: 15, marginBottom: 20 },
    colorDot: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
    activeColor: { borderColor: '#00ff87', borderWidth: 3 },
    bottomAction: {
        position: 'absolute', bottom: 20, left: 20, right: 20,
        flexDirection: 'row', gap: 15, alignItems: 'center'
    },
    cartBtn: { flex: 1, borderRadius: 15, overflow: 'hidden', shadowColor: "#00ff87", shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
    gradientBtn: { flexDirection: 'row', paddingVertical: 15, justifyContent: 'center', alignItems: 'center', gap: 10 },
    btnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    favBtn: {
        width: 54, height: 54, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
    },

    // --- MODAL STYLES ---
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: {
        width: '85%', padding: 30, borderRadius: 30, alignItems: 'center', overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    successIconCircle: {
        width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(0, 255, 135, 0.1)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
        borderWidth: 1, borderColor: '#00ff87'
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
    modalText: { fontSize: 15, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 22, marginBottom: 25 },
    modalBtnColumn: { width: '100%', gap: 12 },
    btnGoCart: { borderRadius: 15, overflow: 'hidden', width: '100%' },
    btnGradientFull: { paddingVertical: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    btnContinue: { paddingVertical: 15, alignItems: 'center', borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    btnTextDark: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    btnTextLight: { color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: 15 }
});