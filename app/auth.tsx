import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image, KeyboardAvoidingView,
  Platform, ScrollView,
  StyleSheet, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';

// 1. IMPORT CÁC HÀM TỪ FIREBASE
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Hàm setDoc dùng để lưu dữ liệu
import { auth, db } from '../constants/firebaseConfig'; // Đảm bảo đường dẫn đúng
// ------------------------------

export default function AuthScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    // Kiểm tra nhập liệu
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập Email và Mật khẩu!');
      return;
    }

    setLoading(true); // Bật vòng quay loading

    try {
      if (isRegister) {
        // ==========================
        // QUY TRÌNH ĐĂNG KÝ (Lưu dữ liệu vào Firebase)
        // ==========================

        if (!fullName) {
          Alert.alert('Lỗi', 'Vui lòng nhập Họ tên!');
          setLoading(false); return;
        }

        // BƯỚC 1: Tạo tài khoản bên Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Cập nhật tên hiển thị trên Auth (cho tiện)
        await updateProfile(user, { displayName: fullName });

        // BƯỚC 2: TRUYỀN DỮ LIỆU VÀO FIRESTORE DATABASE
        // Ta dùng user.uid làm tên document để dễ quản lý sau này
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,            // Lưu lại ID
          email: user.email,        // Lưu email
          fullName: fullName,       // Lưu họ tên người dùng nhập
          role: 'user',             // Mặc định là user thường (sau này có thể sửa thành 'admin')
          createdAt: new Date().toISOString(), // Lưu thời gian tạo
          avatar: '',               // Để trống để sau này cập nhật ảnh
        });

        Alert.alert("Thành công", "Đăng ký và lưu dữ liệu thành công!", [
          { text: "Vào Dashboard", onPress: () => router.replace('/dashboard') }
        ]);

      } else {
        // ==========================
        // QUY TRÌNH ĐĂNG NHẬP
        // ==========================
        await signInWithEmailAndPassword(auth, email, password);

        // Đăng nhập xong chuyển trang
        router.replace('/dashboard');
      }
    } catch (error: any) {
      console.error(error);
      let msg = error.message;
      if (error.code === 'auth/email-already-in-use') msg = 'Email này đã có người dùng!';
      if (error.code === 'auth/invalid-credential') msg = 'Sai Email hoặc Mật khẩu!';
      Alert.alert('Thất bại', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <Image source={require('@/assets/images/react-logo.png')} style={{ width: 80, height: 80 }} resizeMode="contain" />
            <ThemedText type="title">{isRegister ? 'Tạo Tài Khoản Mới' : 'Đăng Nhập'}</ThemedText>
          </View>

          {isRegister && (
            <TextInput
              style={styles.input} placeholder="Họ và tên đầy đủ" placeholderTextColor="#888"
              value={fullName} onChangeText={setFullName}
            />
          )}

          <TextInput
            style={styles.input} placeholder="Email" placeholderTextColor="#888"
            value={email} onChangeText={setEmail} autoCapitalize="none"
          />

          <TextInput
            style={styles.input} placeholder="Mật khẩu" placeholderTextColor="#888"
            value={password} onChangeText={setPassword} secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleAuth}>
            <ThemedText style={styles.buttonText}>
              {isRegister ? 'ĐĂNG KÝ NGAY' : 'ĐĂNG NHẬP'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsRegister(!isRegister)} style={{ marginTop: 20 }}>
            <ThemedText style={{ color: '#0a7ea4', textAlign: 'center' }}>
              {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
            </ThemedText>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60 },
  input: {
    height: 50, borderRadius: 8, paddingHorizontal: 15, marginBottom: 15,
    backgroundColor: '#f0f0f0', color: '#000'
  },
  button: {
    backgroundColor: '#0a7ea4', height: 50, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', marginTop: 10
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  loadingOverlay: {
    position: 'absolute', width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999,
    justifyContent: 'center', alignItems: 'center'
  }
});