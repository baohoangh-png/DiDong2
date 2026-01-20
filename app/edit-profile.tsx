import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// --- FIREBASE ---
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../constants/firebaseConfig';

// --- BỘ SƯU TẬP AVATAR CYBERPUNK ---
const AVATAR_PRESETS = [
    'https://cdn-icons-png.flaticon.com/512/149/149071.png', // Mặc định
    'https://cdn-icons-png.flaticon.com/512/4140/4140048.png', // Robot Boy
    'https://cdn-icons-png.flaticon.com/512/4140/4140037.png', // Robot Girl
    'https://cdn-icons-png.flaticon.com/512/4140/4140047.png', // Hacker
    'https://cdn-icons-png.flaticon.com/512/3048/3048122.png', // Cool Guy
    'https://cdn-icons-png.flaticon.com/512/4140/4140051.png', // Ninja
];

export default function EditProfileScreen() {
    const router = useRouter();
    const user = auth.currentUser;

    const [name, setName] = useState(user?.displayName || '');
    const [phone, setPhone] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(user?.photoURL || AVATAR_PRESETS[0]);
    const [loading, setLoading] = useState(false);

    // 1. Load thông tin phụ (SĐT) từ Firestore
    useEffect(() => {
        const fetchExtraData = async () => {
            if (user) {
                const docSnap = await getDoc(doc(db, "users", user.uid));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.phone) setPhone(data.phone);
                    if (data.photoURL) setSelectedAvatar(data.photoURL);
                }
            }
        };
        fetchExtraData();
    }, [user]);

    // 2. Lưu thay đổi
    const handleSave = async () => {
        if (!name.trim()) return Alert.alert("Lỗi", "Tên không được để trống.");
        setLoading(true);

        try {
            if (user) {
                // A. Cập nhật Auth (Tên + Avatar)
                await updateProfile(user, {
                    displayName: name,
                    photoURL: selectedAvatar
                });

                // B. Cập nhật Firestore (Để đồng bộ dữ liệu người dùng)
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    fullName: name,
                    phone: phone,
                    photoURL: selectedAvatar,
                    updatedAt: new Date()
                }, { merge: true }); // merge: true để không ghi đè mất dữ liệu cũ

                Alert.alert("Thành công", "Hồ sơ đã được cập nhật!");
                router.back(); // Quay lại trang Profile
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert("Lỗi", "Không thể cập nhật hồ sơ.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={styles.container}>
                <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={StyleSheet.absoluteFill} />

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chỉnh Sửa Hồ Sơ</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={{ padding: 20 }}>

                    {/* 1. CHỌN AVATAR */}
                    <View style={styles.avatarSection}>
                        <View style={styles.currentAvatarBox}>
                            <Image source={{ uri: selectedAvatar }} style={styles.currentAvatar} />
                            <View style={styles.editIconBadge}><Ionicons name="pencil" size={14} color="#000" /></View>
                        </View>
                        <Text style={styles.avatarLabel}>Chọn Avatar đại diện</Text>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                            {AVATAR_PRESETS.map((uri, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setSelectedAvatar(uri)}
                                    style={[styles.avatarOption, selectedAvatar === uri && styles.avatarSelected]}
                                >
                                    <Image source={{ uri }} style={styles.avatarImg} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* 2. FORM NHẬP LIỆU */}
                    <BlurView intensity={20} tint="dark" style={styles.formCard}>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tên hiển thị</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.5)" />
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Nhập tên của bạn"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Số điện thoại</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="call-outline" size={20} color="rgba(255,255,255,0.5)" />
                                <TextInput
                                    style={styles.input}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="Nhập số điện thoại"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email (Không thể đổi)</Text>
                            <View style={[styles.inputContainer, { opacity: 0.5 }]}>
                                <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.5)" />
                                <Text style={[styles.input, { paddingVertical: 12 }]}>{user?.email}</Text>
                            </View>
                        </View>

                    </BlurView>

                    {/* 3. BUTTON SAVE */}
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.saveText}>LƯU THAY ĐỔI</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    backBtn: { padding: 5 },

    // Avatar Styles
    avatarSection: { alignItems: 'center', marginBottom: 30 },
    currentAvatarBox: { position: 'relative', marginBottom: 15 },
    currentAvatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#00ff87' },
    editIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#00ff87', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#000' },
    avatarLabel: { color: 'rgba(255,255,255,0.5)', marginBottom: 15 },
    presetScroll: { flexDirection: 'row', paddingHorizontal: 10 },
    avatarOption: { width: 60, height: 60, borderRadius: 30, marginHorizontal: 8, padding: 2, borderWidth: 2, borderColor: 'transparent' },
    avatarSelected: { borderColor: '#00ff87' },
    avatarImg: { width: '100%', height: '100%', borderRadius: 30 },

    // Form Styles
    formCard: { padding: 20, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    inputGroup: { marginBottom: 20 },
    label: { color: '#00ff87', fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginLeft: 5, textTransform: 'uppercase' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    input: { flex: 1, color: '#fff', marginLeft: 10, fontSize: 16, paddingVertical: 12 },

    // Button
    saveBtn: { backgroundColor: '#00ff87', paddingVertical: 16, borderRadius: 15, alignItems: 'center', marginTop: 30, shadowColor: "#00ff87", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
    saveText: { color: '#000', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});