import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// --- CONTEXT GIỎ HÀNG ---
import { useCart } from '../contexts/CartContext';

const { width } = Dimensions.get('window');

export default function CartScreen() {
    const router = useRouter();

    // Lấy dữ liệu và hàm từ Context
    const { items, removeFromCart, clearCart } = useCart();

    // --- 1. TÍNH TỔNG TIỀN ---
    // Ép kiểu any cho item để tránh lỗi TypeScript khi truy cập thuộc tính
    const totalPrice = items.reduce((sum, item: any) => {
        return sum + (item.price * (item.quantity || 1));
    }, 0);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    // --- 2. XỬ LÝ THANH TOÁN ---
    const handleCheckout = () => {
        if (items.length === 0) {
            Alert.alert("Giỏ hàng trống", "Vui lòng thêm sản phẩm trước khi thanh toán.");
            return;
        }

        Alert.alert(
            "Xác nhận thanh toán",
            `Tổng số tiền của bạn là:\n${formatCurrency(totalPrice)}\n\nBạn có muốn chốt đơn không?`,
            [
                { text: "Để sau", style: "cancel" },
                {
                    text: "Chốt đơn ngay",
                    onPress: () => {
                        // Giả lập thanh toán thành công
                        clearCart(); // Xóa sạch giỏ
                        Alert.alert("Thành công! 🎉", "Cảm ơn bạn đã mua hàng tại BHSTORE.", [
                            { text: "OK", onPress: () => router.back() }
                        ]);
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Nền Gradient */}
            <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={StyleSheet.absoluteFill} />

            {/* Trang trí nền */}
            <View style={[styles.blob, { top: -50, right: -50, backgroundColor: '#00ff87' }]} />
            <View style={[styles.blob, { bottom: 100, left: -50, backgroundColor: '#ff006e' }]} />

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Giỏ Hàng ({items.length})</Text>
                {items.length > 0 && (
                    <TouchableOpacity onPress={clearCart}>
                        <Text style={styles.clearText}>Xóa hết</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* DANH SÁCH SẢN PHẨM */}
            {items.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={80} color="rgba(255,255,255,0.2)" />
                    <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống</Text>
                    <TouchableOpacity style={styles.shopNowBtn} onPress={() => router.back()}>
                        <Text style={{ color: '#000', fontWeight: 'bold' }}>Đi mua sắm ngay</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={items}
                    // Ép kiểu item thành any ở keyExtractor luôn cho chắc
                    keyExtractor={(item: any, index) => item.id + index}
                    contentContainerStyle={{ padding: 20, paddingBottom: 150 }}

                    // 👇 SỬA LỖI Ở ĐÂY: Thêm : { item: any } để TypeScript không bắt bẻ nữa
                    renderItem={({ item }: { item: any }) => (
                        <BlurView intensity={20} tint="dark" style={styles.cartItem}>
                            <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />

                            <View style={styles.itemInfo}>
                                {/* Giờ bạn có thể gọi .category thoải mái */}
                                <Text style={styles.itemCategory}>{item.category || 'SẢN PHẨM'}</Text>
                                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                            </View>

                            <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
                                <Ionicons name="trash-outline" size={20} color="#ff006e" />
                            </TouchableOpacity>
                        </BlurView>
                    )}
                />
            )}

            {/* --- 3. FOOTER THANH TOÁN (Luôn hiện ở dưới cùng) --- */}
            {items.length > 0 && (
                <BlurView intensity={80} tint="dark" style={styles.footer}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Tổng cộng:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(totalPrice)}</Text>
                    </View>

                    <TouchableOpacity onPress={handleCheckout} activeOpacity={0.8}>
                        <LinearGradient
                            colors={['#00ff87', '#00b894']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.checkoutBtn}
                        >
                            <Text style={styles.checkoutText}>THANH TOÁN NGAY</Text>
                            <Ionicons name="arrow-forward" size={20} color="#000" />
                        </LinearGradient>
                    </TouchableOpacity>
                </BlurView>
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
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(0,0,0,0.3)'
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    backBtn: { padding: 5 },
    clearText: { color: '#ff006e', fontSize: 14, fontWeight: '600' },

    // Empty State
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: 'rgba(255,255,255,0.5)', marginTop: 20, fontSize: 16 },
    shopNowBtn: {
        marginTop: 20, paddingHorizontal: 25, paddingVertical: 12,
        backgroundColor: '#00ff87', borderRadius: 20,
        shadowColor: "#00ff87", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10
    },

    // Cart Item Style
    cartItem: {
        flexDirection: 'row', alignItems: 'center',
        padding: 15, marginBottom: 15, borderRadius: 20, overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    itemImage: { width: 70, height: 70, borderRadius: 15, marginRight: 15, backgroundColor: '#fff' },
    itemInfo: { flex: 1, gap: 4 },
    itemCategory: { color: 'rgba(255,255,255,0.5)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
    itemName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    itemPrice: { color: '#00ff87', fontSize: 15, fontWeight: 'bold' },
    removeBtn: {
        width: 35, height: 35, borderRadius: 17.5, backgroundColor: 'rgba(255,0,110,0.1)',
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,0,110,0.3)'
    },

    // Footer Checkout Style
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 25, paddingBottom: 40,
        borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden',
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)'
    },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    totalLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 16 },
    totalValue: { color: '#fff', fontSize: 24, fontWeight: '900', textShadowColor: '#00ff87', textShadowRadius: 10 },

    checkoutBtn: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
        paddingVertical: 16, borderRadius: 20,
        shadowColor: "#00ff87", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10,
        elevation: 5
    },
    checkoutText: { color: '#000', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 }
});