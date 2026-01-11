import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, FlatList, Image,
    Modal,
    StyleSheet, Text, TouchableOpacity, View
} from 'react-native';

import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../constants/firebaseConfig';
import { useCart } from '../contexts/CartContext';

export default function CartScreen() {
    const router = useRouter();
    const { items, removeFromCart, totalPrice, clearCart } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // --- STATE CHO POPUP ĐẸP ---
    const [modalVisible, setModalVisible] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);
    // ---------------------------

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) setCurrentUser(user);
            else setCurrentUser(null);
        });
        return () => unsubscribe();
    }, []);

    // 1. Bấm nút "Thanh Toán Ngay" -> Hiện Popup Đẹp
    const handlePreCheckout = () => {
        if (items.length === 0) {
            alert("Giỏ hàng trống!"); // Cái này nhỏ nên kệ
            return;
        }
        if (!currentUser) {
            // Chuyển hướng luôn nếu chưa login
            router.replace('/auth');
            return;
        }
        // Hiện Modal xác nhận
        setModalVisible(true);
    };

    // 2. Xử lý khi bấm "Đồng ý" trong Popup
    const submitOrderToFirebase = async () => {
        setModalVisible(false); // Tắt popup xác nhận
        setIsProcessing(true);  // Hiện loading
        try {
            const orderData = {
                userId: currentUser.uid,
                userEmail: currentUser.email,
                items: items,
                totalAmount: totalPrice,
                status: 'pending',
                createdAt: new Date().toISOString(),
            };

            await addDoc(collection(db, "orders"), orderData);

            // Hiện Popup Thành công
            setSuccessVisible(true);

        } catch (error: any) {
            console.error("Lỗi:", error);
            alert("Lỗi: " + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCloseSuccess = () => {
        setSuccessVisible(false);
        clearCart();
        router.replace('/(tabs)');
    };

    const formatCurrency = (num: number) => num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={StyleSheet.absoluteFill} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Giỏ Hàng ({items.length})</Text>
                <TouchableOpacity onPress={clearCart}>
                    <Text style={{ color: '#ff006e', fontWeight: 'bold' }}>Xóa</Text>
                </TouchableOpacity>
            </View>

            {/* Debug User */}
            <View style={{ backgroundColor: currentUser ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)', padding: 5, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 10 }}>
                    {currentUser ? `User: ${currentUser.email}` : "Chưa đăng nhập"}
                </Text>
            </View>

            {/* List Hàng */}
            {items.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={80} color="rgba(255,255,255,0.3)" />
                    <Text style={styles.emptyText}>Giỏ hàng trống trơn...</Text>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 20, paddingBottom: 150 }}
                    renderItem={({ item }) => (
                        <BlurView intensity={30} tint="dark" style={styles.itemCard}>
                            <Image source={{ uri: item.image }} style={styles.itemImage} />
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                                <Text style={{ color: '#aaa' }}>x{item.quantity}</Text>
                            </View>
                            <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.deleteBtn}>
                                <Ionicons name="trash-outline" size={20} color="#ff006e" />
                            </TouchableOpacity>
                        </BlurView>
                    )}
                />
            )}

            {/* Footer */}
            {items.length > 0 && (
                <BlurView intensity={80} tint="dark" style={styles.footer}>
                    <View style={styles.totalRow}>
                        <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Tổng cộng:</Text>
                        <Text style={styles.totalPrice}>{formatCurrency(totalPrice)}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.checkoutBtn, isProcessing && { opacity: 0.7 }]}
                        onPress={handlePreCheckout} // <-- Gọi hàm mở Popup
                        disabled={isProcessing}
                    >
                        <LinearGradient colors={['#00ff87', '#00b894']} style={styles.gradientBtn}>
                            {isProcessing ? <ActivityIndicator color="#000" /> : (
                                <Text style={styles.checkoutText}>THANH TOÁN NGAY</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </BlurView>
            )}

            {/* ================================================== */}
            {/* 1. MODAL XÁC NHẬN (CONFIRM MODAL) */}
            {/* ================================================== */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <LinearGradient colors={['#24243e', '#0f0c29']} style={styles.modalBg} />

                        <Ionicons name="wallet-outline" size={50} color="#00ff87" style={{ marginBottom: 15 }} />
                        <Text style={styles.modalTitle}>Xác nhận thanh toán</Text>
                        <Text style={styles.modalText}>
                            Bạn có chắc muốn thanh toán đơn hàng trị giá <Text style={{ fontWeight: 'bold', color: '#00ff87' }}>{formatCurrency(totalPrice)}</Text> không?
                        </Text>

                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Hủy bỏ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnConfirm} onPress={submitOrderToFirebase}>
                                <LinearGradient colors={['#00ff87', '#00b894']} style={styles.btnGradient}>
                                    <Text style={{ color: '#000', fontWeight: 'bold' }}>Đồng ý</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ================================================== */}
            {/* 2. MODAL THÀNH CÔNG (SUCCESS MODAL) */}
            {/* ================================================== */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={successVisible}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <LinearGradient colors={['#24243e', '#0f0c29']} style={styles.modalBg} />

                        <Ionicons name="checkmark-circle" size={60} color="#00ff87" style={{ marginBottom: 15 }} />
                        <Text style={styles.modalTitle}>Thành công! 🎉</Text>
                        <Text style={styles.modalText}>
                            Đơn hàng của bạn đã được gửi đi. Chúng tôi sẽ sớm liên hệ lại.
                        </Text>

                        <TouchableOpacity style={[styles.btnConfirm, { width: '100%', marginTop: 20 }]} onPress={handleCloseSuccess}>
                            <LinearGradient colors={['#00ff87', '#00b894']} style={styles.btnGradient}>
                                <Text style={{ color: '#000', fontWeight: 'bold' }}>Về trang chủ</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    itemCard: { flexDirection: 'row', borderRadius: 20, padding: 10, marginBottom: 15, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    itemImage: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#fff' },
    itemInfo: { flex: 1, paddingHorizontal: 15, justifyContent: 'center' },
    itemName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    itemPrice: { color: '#00ff87', fontSize: 14, fontWeight: 'bold' },
    deleteBtn: { justifyContent: 'center', padding: 10 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: 'rgba(255,255,255,0.5)', marginTop: 20 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    totalPrice: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    checkoutBtn: { borderRadius: 15, overflow: 'hidden' },
    gradientBtn: { paddingVertical: 15, alignItems: 'center' },
    checkoutText: { color: '#000', fontWeight: 'bold', fontSize: 16 },

    // --- STYLE CHO MODAL ---
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { width: '85%', padding: 25, borderRadius: 25, alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    modalBg: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 10, textAlign: 'center' },
    modalText: { fontSize: 15, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 22 },
    modalBtnRow: { flexDirection: 'row', marginTop: 25, gap: 15, width: '100%' },
    btnCancel: { flex: 1, padding: 15, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
    btnConfirm: { flex: 1, borderRadius: 15, overflow: 'hidden' },
    btnGradient: { padding: 15, alignItems: 'center', width: '100%' }
});