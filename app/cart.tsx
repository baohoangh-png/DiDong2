import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// --- FIREBASE IMPORTS ---
import { addDoc, collection, getDocs, limit, query, serverTimestamp, where } from 'firebase/firestore';
import { auth, db } from '../constants/firebaseConfig';

// --- CONTEXT GIỎ HÀNG ---
import { useCart } from '../contexts/CartContext';

const { width } = Dimensions.get('window');

// --- DANH SÁCH PHƯƠNG THỨC THANH TOÁN (Đã sửa link ảnh MoMo ổn định hơn) ---
const PAYMENT_METHODS = [
    { id: 'momo', name: 'Ví MoMo', icon: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png', color: '#d82d8b' },
    { id: 'zalopay', name: 'ZaloPay', icon: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png', color: '#0068ff' },
    { id: 'mbbank', name: 'MB Bank', icon: 'https://cdn.haitrieu.com/wp-content/uploads/2022/02/Logo-MB-Bank-MBB.png', color: '#142888' },
    { id: 'cod', name: 'Tiền mặt (COD)', icon: 'https://cdn-icons-png.flaticon.com/512/5163/5163814.png', color: '#2ecc71' },
];

export default function CartScreen() {
    const router = useRouter();
    const { items, removeFromCart, clearCart } = useCart();
    const currentUser = auth.currentUser;

    // --- STATE QUẢN LÝ ---
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [processingState, setProcessingState] = useState<'IDLE' | 'SCANNING' | 'PROCESSING' | 'SUCCESS'>('IDLE');

    // --- STATE ĐỊA CHỈ GIAO HÀNG ---
    const [deliveryAddress, setDeliveryAddress] = useState<any>(null);

    // Tính tổng tiền
    const totalPrice = items.reduce((sum, item: any) => sum + (item.price * (item.quantity || 1)), 0);
    const formatCurrency = (amount: number) => amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    // --- TỰ ĐỘNG LẤY ĐỊA CHỈ MẶC ĐỊNH ---
    useEffect(() => {
        if (showPaymentModal && currentUser) {
            fetchDefaultAddress();
        }
    }, [showPaymentModal]);

    const fetchDefaultAddress = async () => {
        try {
            // Ưu tiên lấy địa chỉ mặc định
            const q = query(collection(db, "addresses"), where("userId", "==", currentUser?.uid), where("isDefault", "==", true), limit(1));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                setDeliveryAddress(snapshot.docs[0].data());
            } else {
                // Nếu không có, lấy địa chỉ bất kỳ
                const q2 = query(collection(db, "addresses"), where("userId", "==", currentUser?.uid), limit(1));
                const snap2 = await getDocs(q2);
                if (!snap2.empty) setDeliveryAddress(snap2.docs[0].data());
                else setDeliveryAddress(null);
            }
        } catch (error) {
            console.error("Lỗi lấy địa chỉ:", error);
        }
    };

    // 1. Mở bảng chọn phương thức
    const handleCheckoutPress = () => {
        if (items.length === 0) return Alert.alert("Giỏ hàng trống", "Vui lòng thêm sản phẩm.");
        setShowPaymentModal(true);
        setProcessingState('IDLE');
        setSelectedMethod(null);
    };

    // 2. Xử lý logic thanh toán
    const submitOrderToFirebase = async () => {
        // Kiểm tra địa chỉ
        if (!deliveryAddress) {
            Alert.alert("Thiếu địa chỉ", "Vui lòng thêm địa chỉ nhận hàng trước khi thanh toán.", [
                { text: "Để sau", style: 'cancel' },
                {
                    text: "Thêm ngay", onPress: () => {
                        setShowPaymentModal(false);
                        router.push('/address' as any);
                    }
                }
            ]);
            return;
        }

        setProcessingState('PROCESSING');

        try {
            // A. Chuẩn bị dữ liệu đơn hàng
            const orderData = {
                userId: currentUser?.uid || 'guest',
                customerName: deliveryAddress.name || currentUser?.displayName,
                customerPhone: deliveryAddress.phone || 'N/A',
                shippingAddress: deliveryAddress.address,
                products: items,
                totalAmount: totalPrice,
                paymentMethod: selectedMethod,
                status: 'pending',
                createdAt: serverTimestamp(),
                paymentNote: `BHSTORE ${Date.now().toString().slice(-6)}`
            };

            // B. Gửi lên Firebase
            const orderRef = await addDoc(collection(db, "orders"), orderData);

            // C. Tạo thông báo tự động
            const notificationData = {
                userId: currentUser?.uid || 'guest',
                title: 'Đặt hàng thành công 📦',
                message: `Đơn hàng #${orderRef.id.slice(-6).toUpperCase()} của bạn đã được ghi nhận.`,
                type: 'order',
                isRead: false,
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, "notifications"), notificationData);

            // D. Hoàn tất
            finishOrder();

        } catch (error) {
            console.error("Lỗi lưu đơn hàng:", error);
            Alert.alert("Lỗi", "Không thể tạo đơn hàng. Vui lòng thử lại.");
            setProcessingState('IDLE');
        }
    };

    const handleCODCheckout = () => {
        if (!selectedMethod) return Alert.alert("Lỗi", "Vui lòng chọn phương thức.");
        submitOrderToFirebase();
    };

    const handleOnlineCheckout = () => {
        if (!deliveryAddress) {
            Alert.alert("Thiếu địa chỉ", "Vui lòng thêm địa chỉ nhận hàng.", [
                {
                    text: "Thêm ngay", onPress: () => {
                        setShowPaymentModal(false);
                        router.push('/address' as any);
                    }
                }
            ]);
            return;
        }
        setProcessingState('SCANNING');
    };

    // 3. Hoàn tất đơn hàng
    const finishOrder = () => {
        setProcessingState('SUCCESS');
        clearCart();
        setTimeout(() => {
            setShowPaymentModal(false);
            router.back();
            Alert.alert("Đơn hàng đã gửi! 🚀", "Shop sẽ sớm liên hệ giao hàng.");
        }, 2500);
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={StyleSheet.absoluteFill} />
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
                    keyExtractor={(item: any, index) => item.id + index}
                    contentContainerStyle={{ padding: 20, paddingBottom: 150 }}
                    renderItem={({ item }: { item: any }) => (
                        <BlurView intensity={20} tint="dark" style={styles.cartItem}>
                            <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
                            <View style={styles.itemInfo}>
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

            {/* FOOTER TỔNG TIỀN */}
            {items.length > 0 && (
                <BlurView intensity={80} tint="dark" style={styles.footer}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Tổng cộng:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(totalPrice)}</Text>
                    </View>
                    <TouchableOpacity onPress={handleCheckoutPress} activeOpacity={0.8}>
                        <LinearGradient
                            colors={['#00ff87', '#00b894']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.checkoutBtn}
                        >
                            <Text style={styles.checkoutText}>THANH TOÁN NGAY</Text>
                            <Ionicons name="arrow-forward" size={20} color="#000" />
                        </LinearGradient>
                    </TouchableOpacity>
                </BlurView>
            )}

            {/* --- MODAL THANH TOÁN --- */}
            <Modal visible={showPaymentModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <BlurView intensity={95} tint="dark" style={styles.paymentContainer}>

                        {/* HEADER MODAL */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Thanh Toán</Text>
                            {processingState === 'IDLE' && (
                                <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                                    <Ionicons name="close-circle" size={28} color="rgba(255,255,255,0.5)" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* 1. CHỌN PHƯƠNG THỨC */}
                        {processingState === 'IDLE' && (
                            <View style={{ width: '100%' }}>

                                {/* KHU VỰC HIỂN THỊ ĐỊA CHỈ */}
                                <View style={styles.addressBox}>
                                    <View style={styles.addressHeader}>
                                        <Ionicons name="location" size={18} color="#00ff87" />
                                        <Text style={styles.addressTitle}>Địa chỉ nhận hàng</Text>
                                    </View>
                                    {deliveryAddress ? (
                                        <View>
                                            <Text style={styles.addrName}>{deliveryAddress.name} | {deliveryAddress.phone}</Text>
                                            <Text style={styles.addrText} numberOfLines={2}>{deliveryAddress.address}</Text>
                                            <TouchableOpacity onPress={() => { setShowPaymentModal(false); router.push('/address' as any); }}>
                                                <Text style={styles.changeText}>Thay đổi &gt;</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.addAddrBtn}
                                            onPress={() => { setShowPaymentModal(false); router.push('/address' as any); }}
                                        >
                                            <Ionicons name="add-circle-outline" size={20} color="#fff" />
                                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Thêm địa chỉ giao hàng</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <Text style={styles.amountLabel}>Số tiền thanh toán</Text>
                                <Text style={styles.bigTotal}>{formatCurrency(totalPrice)}</Text>

                                <Text style={styles.methodTitle}>Chọn phương thức:</Text>
                                {PAYMENT_METHODS.map((method) => (
                                    <TouchableOpacity
                                        key={method.id}
                                        style={[styles.methodItem, selectedMethod === method.id && styles.methodSelected]}
                                        onPress={() => setSelectedMethod(method.id)}
                                    >
                                        <Image source={{ uri: method.icon }} style={styles.methodIcon} resizeMode="contain" />
                                        <Text style={styles.methodName}>{method.name}</Text>
                                        {selectedMethod === method.id && <Ionicons name="checkmark-circle" size={24} color="#00ff87" />}
                                    </TouchableOpacity>
                                ))}

                                <TouchableOpacity
                                    style={[styles.payNowBtn, (!selectedMethod || !deliveryAddress) && { opacity: 0.5 }]}
                                    onPress={() => {
                                        if (selectedMethod === 'cod') handleCODCheckout();
                                        else handleOnlineCheckout();
                                    }}
                                    disabled={!selectedMethod}
                                >
                                    <Text style={styles.payBtnText}>TIẾP TỤC</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* 2. QUÉT QR & XÁC NHẬN */}
                        {processingState === 'SCANNING' && (
                            <View style={styles.centerView}>
                                <Text style={styles.processingText}>Quét mã để thanh toán</Text>

                                <View style={styles.customerInfoBox}>
                                    <Text style={styles.customerLabel}>Người thanh toán:</Text>
                                    <Text style={styles.customerValue}>{deliveryAddress?.name || currentUser?.displayName}</Text>
                                    <View style={styles.divider} />
                                    <Text style={styles.customerLabel}>Số tiền:</Text>
                                    <Text style={[styles.customerValue, { color: '#00ff87' }]}>{formatCurrency(totalPrice)}</Text>
                                    <View style={styles.divider} />
                                    <Text style={styles.customerLabel}>Nội dung CK:</Text>
                                    <Text style={styles.transferMemo}>BHSTORE {Date.now().toString().slice(-6)}</Text>
                                </View>

                                <View style={styles.qrBox}>
                                    {/* SỬA ĐƯỜNG DẪN ẢNH CHUẨN XÁC */}
                                    <Image
                                        source={
                                            selectedMethod === 'momo' ? require('../assets/images/image_5.png') :
                                                selectedMethod === 'zalopay' ? require('../assets/images/image_4.png') :
                                                    require('../assets/images/image_3.png')
                                        }
                                        style={{ width: '100%', height: '100%' }}
                                        resizeMode="contain"
                                    />
                                </View>

                                <TouchableOpacity style={styles.confirmTransferBtn} onPress={submitOrderToFirebase}>
                                    <LinearGradient colors={['#00ff87', '#00b894']} style={styles.confirmGradient}>
                                        <Ionicons name="checkmark-circle-outline" size={24} color="#000" />
                                        <Text style={styles.confirmText}>TÔI ĐÃ CHUYỂN TIỀN</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                            </View>
                        )}

                        {/* 3. ĐANG XỬ LÝ */}
                        {processingState === 'PROCESSING' && (
                            <View style={styles.centerView}>
                                <ActivityIndicator size="large" color="#00ff87" />
                                <Text style={[styles.processingText, { marginTop: 20 }]}>Đang tạo đơn hàng...</Text>
                                <Text style={styles.subText}>Dữ liệu đang được gửi về hệ thống</Text>
                            </View>
                        )}

                        {/* 4. THÀNH CÔNG */}
                        {processingState === 'SUCCESS' && (
                            <View style={styles.centerView}>
                                <View style={styles.successCircle}>
                                    <Ionicons name="checkmark" size={60} color="#fff" />
                                </View>
                                <Text style={styles.successTitle}>Đặt hàng thành công!</Text>
                                <Text style={styles.successSub}>Đơn hàng đã được lưu vào hệ thống.</Text>
                            </View>
                        )}

                    </BlurView>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    blob: { position: 'absolute', width: 250, height: 250, borderRadius: 125, opacity: 0.2, shadowColor: "#fff", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20 },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.3)' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    backBtn: { padding: 5 },
    clearText: { color: '#ff006e', fontSize: 14, fontWeight: '600' },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: 'rgba(255,255,255,0.5)', marginTop: 20, fontSize: 16 },
    shopNowBtn: { marginTop: 20, paddingHorizontal: 25, paddingVertical: 12, backgroundColor: '#00ff87', borderRadius: 20 },

    cartItem: { flexDirection: 'row', alignItems: 'center', padding: 15, marginBottom: 15, borderRadius: 20, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    itemImage: { width: 70, height: 70, borderRadius: 15, marginRight: 15, backgroundColor: '#fff' },
    itemInfo: { flex: 1, gap: 4 },
    itemCategory: { color: 'rgba(255,255,255,0.5)', fontSize: 10, textTransform: 'uppercase' },
    itemName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    itemPrice: { color: '#00ff87', fontSize: 15, fontWeight: 'bold' },
    removeBtn: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: 'rgba(255,0,110,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,0,110,0.3)' },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 25, paddingBottom: 40, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    totalLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 16 },
    totalValue: { color: '#fff', fontSize: 24, fontWeight: '900', textShadowColor: '#00ff87', textShadowRadius: 10 },
    checkoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, paddingVertical: 16, borderRadius: 20 },
    checkoutText: { color: '#000', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },

    // --- PAYMENT MODAL STYLES ---
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.8)' },
    paymentContainer: { height: '90%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10, alignItems: 'center' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },

    // ADDRESS BOX
    addressBox: { width: '100%', padding: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    addressHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    addressTitle: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
    addrName: { color: '#fff', fontWeight: 'bold', marginBottom: 4 },
    addrText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 18 },
    changeText: { color: '#00ff87', fontSize: 12, marginTop: 8, fontWeight: 'bold' },
    addAddrBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },

    amountLabel: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontSize: 14 },
    bigTotal: { color: '#00ff87', fontSize: 36, fontWeight: '900', textAlign: 'center', marginBottom: 20, textShadowColor: '#00ff87', textShadowRadius: 15 },

    methodTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
    methodItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    methodSelected: { borderColor: '#00ff87', backgroundColor: 'rgba(0, 255, 135, 0.1)' },
    methodIcon: { width: 30, height: 30, marginRight: 15 },
    methodName: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600' },

    payNowBtn: { marginTop: 20, backgroundColor: '#00ff87', paddingVertical: 18, borderRadius: 20, alignItems: 'center', shadowColor: "#00ff87", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10 },
    payBtnText: { color: '#000', fontWeight: 'bold', fontSize: 18 },

    // --- CUSTOMER INFO & QR STYLES ---
    centerView: { flex: 1, alignItems: 'center', width: '100%' },
    processingText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },

    customerInfoBox: { width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    customerLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 2 },
    customerValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 10 },
    transferMemo: { color: '#00ff87', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },

    qrBox: { width: 220, height: 220, backgroundColor: '#fff', padding: 10, borderRadius: 20, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 20 },

    confirmTransferBtn: { width: '100%', borderRadius: 15, overflow: 'hidden', shadowColor: "#00ff87", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
    confirmGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, paddingVertical: 16 },
    confirmText: { color: '#000', fontWeight: 'bold', fontSize: 16 },

    subText: { color: 'rgba(255,255,255,0.5)', marginTop: 10 },
    successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#00ff87', justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: "#00ff87", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 20 },
    successTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
    successSub: { color: 'rgba(255,255,255,0.7)', fontSize: 16 }
});