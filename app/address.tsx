import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// --- FIREBASE ---
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore';
import { auth, db } from '../constants/firebaseConfig';

export default function AddressScreen() {
    const router = useRouter();
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [addressLine, setAddressLine] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    // 1. Lấy danh sách địa chỉ từ Firebase
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, "addresses"), where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list: any[] = [];
            snapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() });
            });
            setAddresses(list);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 2. Hàm thêm địa chỉ mới
    const handleAddAddress = async () => {
        if (!name || !phone || !addressLine) {
            Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ Tên, SĐT và Địa chỉ.");
            return;
        }

        const user = auth.currentUser;
        if (!user) return;

        try {
            setLoading(true);
            await addDoc(collection(db, "addresses"), {
                userId: user.uid,
                name,
                phone,
                address: addressLine,
                isDefault: addresses.length === 0 ? true : isDefault, // Nếu là cái đầu tiên thì auto là mặc định
                createdAt: serverTimestamp()
            });

            // Reset form và đóng modal
            setName('');
            setPhone('');
            setAddressLine('');
            setModalVisible(false);
            setLoading(false);
            Alert.alert("Thành công", "Đã thêm địa chỉ mới.");
        } catch (error) {
            console.error(error);
            setLoading(false);
            Alert.alert("Lỗi", "Không thể lưu địa chỉ.");
        }
    };

    // 3. Hàm xóa địa chỉ
    const handleDelete = (id: string) => {
        Alert.alert("Xác nhận", "Bạn có chắc muốn xóa địa chỉ này?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa", style: "destructive", onPress: async () => {
                    await deleteDoc(doc(db, "addresses", id));
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={StyleSheet.absoluteFill} />

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sổ Địa Chỉ</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
                    <Ionicons name="add" size={28} color="#000" />
                </TouchableOpacity>
            </View>

            {/* CONTENT */}
            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#00ff87" /></View>
            ) : addresses.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="location-outline" size={80} color="rgba(255,255,255,0.2)" />
                    <Text style={styles.emptyText}>Chưa có địa chỉ nào được lưu</Text>
                    <TouchableOpacity style={styles.mainBtn} onPress={() => setModalVisible(true)}>
                        <Text style={styles.btnText}>Thêm địa chỉ mới</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={addresses}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 20 }}
                    renderItem={({ item }) => (
                        <BlurView intensity={20} tint="dark" style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.name}>{item.name}</Text>
                                {item.isDefault && <View style={styles.badge}><Text style={styles.badgeText}>Mặc định</Text></View>}
                            </View>
                            <Text style={styles.phone}>{item.phone}</Text>
                            <Text style={styles.address}>{item.address}</Text>

                            <View style={styles.actions}>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
                                    <Ionicons name="trash-outline" size={18} color="#ff006e" />
                                    <Text style={{ color: '#ff006e', marginLeft: 5 }}>Xóa</Text>
                                </TouchableOpacity>
                                {/* Bạn có thể thêm nút "Sửa" ở đây nếu muốn */}
                            </View>
                        </BlurView>
                    )}
                />
            )}

            {/* MODAL THÊM ĐỊA CHỈ */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <BlurView intensity={90} tint="dark" style={styles.modalContent}>
                        <View style={styles.modalHeaderRow}>
                            <Text style={styles.modalTitle}>Thêm Địa Chỉ Mới</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close-circle" size={28} color="rgba(255,255,255,0.5)" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Họ và tên người nhận</Text>
                            <TextInput style={styles.input} placeholder="VD: Nguyễn Văn A" placeholderTextColor="#666" value={name} onChangeText={setName} />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Số điện thoại</Text>
                            <TextInput style={styles.input} placeholder="VD: 0912..." placeholderTextColor="#666" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Địa chỉ nhận hàng (Số nhà, Phường/Xã, Quận/Huyện)</Text>
                            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM" placeholderTextColor="#666" multiline value={addressLine} onChangeText={setAddressLine} />
                        </View>

                        <TouchableOpacity style={styles.saveBtn} onPress={handleAddAddress}>
                            <Text style={styles.saveText}>LƯU ĐỊA CHỈ</Text>
                        </TouchableOpacity>
                    </BlurView>
                </KeyboardAvoidingView>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.3)' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    backBtn: { padding: 5 },
    addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#00ff87', justifyContent: 'center', alignItems: 'center' },

    emptyText: { color: 'rgba(255,255,255,0.5)', marginTop: 20, fontSize: 16 },
    mainBtn: { marginTop: 20, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#00ff87' },
    btnText: { color: '#00ff87', fontWeight: 'bold' },

    card: { padding: 20, marginBottom: 15, borderRadius: 20, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    name: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    badge: { backgroundColor: '#00ff87', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
    badgeText: { color: '#000', fontSize: 10, fontWeight: 'bold' },
    phone: { color: 'rgba(255,255,255,0.8)', marginBottom: 5 },
    address: { color: 'rgba(255,255,255,0.6)', lineHeight: 20 },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
    actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 5 },

    // MODAL
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.8)' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    inputGroup: { marginBottom: 15 },
    label: { color: 'rgba(255,255,255,0.6)', marginBottom: 8, fontSize: 14 },
    input: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 15, color: '#fff', fontSize: 16 },
    saveBtn: { backgroundColor: '#00ff87', paddingVertical: 16, borderRadius: 15, alignItems: 'center', marginTop: 10 },
    saveText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});