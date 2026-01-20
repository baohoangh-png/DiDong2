import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// --- FIREBASE ---
import { deleteUser, updatePassword, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../constants/firebaseConfig';

export default function SettingsScreen() {
    const router = useRouter();
    const [user, setUser] = useState(auth.currentUser);

    // State cho các Toggle
    const [isNotiEnabled, setIsNotiEnabled] = useState(true);
    const [isDarkTheme, setIsDarkTheme] = useState(true);

    // State cho Modal Chỉnh sửa
    const [modalVisible, setModalVisible] = useState(false);
    const [editType, setEditType] = useState<'name' | 'password' | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    // Mở Modal
    const openEditModal = (type: 'name' | 'password') => {
        setEditType(type);
        setInputValue(type === 'name' ? user?.displayName || '' : '');
        setModalVisible(true);
    };

    // Xử lý Lưu thay đổi
    const handleSave = async () => {
        if (!inputValue.trim()) return Alert.alert("Lỗi", "Không được để trống.");
        setLoading(true);

        try {
            if (editType === 'name' && user) {
                // 1. Cập nhật tên
                await updateProfile(user, { displayName: inputValue });
                // Cập nhật cả trong Firestore (nếu có lưu)
                await updateDoc(doc(db, "users", user.uid), { fullName: inputValue });

                Alert.alert("Thành công", "Đã cập nhật tên hiển thị.");
            } else if (editType === 'password' && user) {
                // 2. Cập nhật mật khẩu
                await updatePassword(user, inputValue);
                Alert.alert("Thành công", "Đã đổi mật khẩu. Vui lòng đăng nhập lại.");
                router.replace('/auth');
            }

            setModalVisible(false);
            setUser(auth.currentUser); // Refresh state
        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/requires-recent-login') {
                Alert.alert("Bảo mật", "Bạn cần đăng nhập lại để thực hiện hành động này.");
                router.replace('/auth');
            } else {
                Alert.alert("Lỗi", "Không thể cập nhật: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // Xử lý Xóa tài khoản
    const handleDeleteAccount = () => {
        Alert.alert("Cảnh báo nguy hiểm ⚠️", "Hành động này sẽ xóa vĩnh viễn tài khoản của bạn và không thể khôi phục. Bạn chắc chứ?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "XÓA VĨNH VIỄN", style: "destructive", onPress: async () => {
                    try {
                        if (user) await deleteUser(user);
                        router.replace('/auth');
                    } catch (error: any) {
                        Alert.alert("Lỗi", "Cần đăng nhập lại để xóa tài khoản.");
                        router.replace('/auth');
                    }
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
                <Text style={styles.headerTitle}>Cài Đặt</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>

                {/* PHẦN 1: THÔNG TIN TÀI KHOẢN */}
                <Text style={styles.sectionTitle}>Tài khoản</Text>
                <BlurView intensity={20} tint="dark" style={styles.card}>

                    {/* Email (Read only) */}
                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.6)" />
                            <Text style={styles.rowLabel}>Email</Text>
                        </View>
                        <Text style={styles.rowValue}>{user?.email}</Text>
                    </View>
                    <View style={styles.divider} />

                    {/* Tên hiển thị */}
                    <TouchableOpacity style={styles.row} onPress={() => openEditModal('name')}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.6)" />
                            <Text style={styles.rowLabel}>Tên hiển thị</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.rowValueHighlight}>{user?.displayName}</Text>
                            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" style={{ marginLeft: 5 }} />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider} />

                    {/* Đổi mật khẩu */}
                    <TouchableOpacity style={styles.row} onPress={() => openEditModal('password')}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.6)" />
                            <Text style={styles.rowLabel}>Đổi mật khẩu</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>

                </BlurView>

                {/* PHẦN 2: CẤU HÌNH APP */}
                <Text style={styles.sectionTitle}>Ứng dụng</Text>
                <BlurView intensity={20} tint="dark" style={styles.card}>

                    {/* Thông báo */}
                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="notifications-outline" size={20} color="rgba(255,255,255,0.6)" />
                            <Text style={styles.rowLabel}>Thông báo đẩy</Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#767577", true: "rgba(0, 255, 135, 0.5)" }}
                            thumbColor={isNotiEnabled ? "#00ff87" : "#f4f3f4"}
                            onValueChange={() => setIsNotiEnabled(!isNotiEnabled)}
                            value={isNotiEnabled}
                        />
                    </View>
                    <View style={styles.divider} />

                    {/* Ngôn ngữ */}
                    <TouchableOpacity style={styles.row}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="globe-outline" size={20} color="rgba(255,255,255,0.6)" />
                            <Text style={styles.rowLabel}>Ngôn ngữ</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.rowValue}>Tiếng Việt</Text>
                            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" style={{ marginLeft: 5 }} />
                        </View>
                    </TouchableOpacity>

                </BlurView>

                {/* PHẦN 3: NGUY HIỂM */}
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
                    <Text style={styles.deleteText}>Xóa tài khoản vĩnh viễn</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.0.0 (Build 2024)</Text>

            </ScrollView>

            {/* MODAL EDIT */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <BlurView intensity={95} tint="dark" style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editType === 'name' ? 'Đổi Tên Hiển Thị' : 'Đổi Mật Khẩu Mới'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="rgba(255,255,255,0.5)" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.input}
                            value={inputValue}
                            onChangeText={setInputValue}
                            placeholder={editType === 'name' ? "Nhập tên mới..." : "Nhập mật khẩu mới..."}
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            secureTextEntry={editType === 'password'}
                            autoFocus
                        />

                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                            <Text style={styles.saveText}>{loading ? "Đang lưu..." : "Lưu thay đổi"}</Text>
                        </TouchableOpacity>
                    </BlurView>
                </KeyboardAvoidingView>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.3)' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    backBtn: { padding: 5 },

    sectionTitle: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 10, marginTop: 10, marginLeft: 10, textTransform: 'uppercase', letterSpacing: 1 },

    card: { borderRadius: 20, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    rowLabel: { color: '#fff', fontSize: 16 },
    rowValue: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
    rowValueHighlight: { color: '#00ff87', fontSize: 14, fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 50 },

    deleteBtn: { marginTop: 10, alignItems: 'center', padding: 15, borderRadius: 15, backgroundColor: 'rgba(255,0,110,0.1)', borderWidth: 1, borderColor: 'rgba(255,0,110,0.3)' },
    deleteText: { color: '#ff006e', fontWeight: 'bold' },
    versionText: { textAlign: 'center', color: 'rgba(255,255,255,0.2)', marginTop: 20, fontSize: 12 },

    // MODAL
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    input: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 15, color: '#fff', fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    saveBtn: { backgroundColor: '#00ff87', paddingVertical: 15, borderRadius: 15, alignItems: 'center' },
    saveText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});