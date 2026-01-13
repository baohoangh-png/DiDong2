import { Ionicons } from '@expo/vector-icons'; // Thêm FontAwesome cho icon đẹp
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

// --- FIREBASE ---
import { createUserWithEmailAndPassword as createUser, signOut as firebaseSignOut, signInWithEmailAndPassword as signIn, updateProfile as updateAuthProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../constants/firebaseConfig';

const { width } = Dimensions.get('window');

export default function AuthScreen() {
  const router = useRouter();

  // State quản lý chế độ
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'PHONE'>('LOGIN');

  // Các trường dữ liệu
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  // --- QUAY VỀ TRANG CHỦ ---
  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  // --- RESET FORM KHI ĐỔI CHẾ ĐỘ ---
  const switchMode = (mode: 'LOGIN' | 'REGISTER' | 'PHONE') => {
    setAuthMode(mode);
    setFullName('');
    setEmail('');
    setPassword('');
    setPhoneNumber('');
  };

  // --- 1. XỬ LÝ ĐĂNG NHẬP EMAIL ---
  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Lỗi', 'Vui lòng nhập Email và Mật khẩu');
    setLoading(true);
    try {
      await signIn(auth, email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Đăng nhập thất bại', "Email hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. XỬ LÝ ĐĂNG KÝ EMAIL ---
  const handleRegister = async () => {
    if (!email || !password || !fullName) return Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
    setLoading(true);
    try {
      const userCredential = await createUser(auth, email, password);
      const user = userCredential.user;
      await updateAuthProfile(user, { displayName: fullName });
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        fullName: fullName,
        createdAt: new Date(),
        role: 'user'
      });
      await firebaseSignOut(auth); // Đá ra bắt đăng nhập lại
      Alert.alert("Thành công", "Tài khoản đã tạo. Vui lòng đăng nhập lại.", [{ text: "OK", onPress: () => switchMode('LOGIN') }]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. XỬ LÝ ĐĂNG KÝ SĐT (RÀNG BUỘC 10 SỐ) ---
  const handlePhoneAuth = () => {
    // Validate dữ liệu
    if (!fullName) return Alert.alert("Thiếu thông tin", "Vui lòng nhập Họ và tên.");
    if (!phoneNumber) return Alert.alert("Thiếu thông tin", "Vui lòng nhập Số điện thoại.");

    // REGEX: Chỉ cho phép số, độ dài chính xác 10 ký tự
    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert("Sai định dạng", "Số điện thoại phải bao gồm đúng 10 chữ số (VD: 0912345678).");
      return;
    }

    setLoading(true);
    // Giả lập gửi OTP (Vì Firebase Phone Auth cần cấu hình Native phức tạp)
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Mã OTP đã gửi!",
        `Mã xác thực đã được gửi đến số ${phoneNumber}. (Đây là bản Demo, vui lòng dùng Email để đăng nhập thật).`,
        [{ text: "Đã hiểu", onPress: () => switchMode('LOGIN') }]
      );
    }, 1500);
  };

  // --- NÚT SOCIAL (Giả lập) ---
  const handleSocialLogin = (provider: string) => {
    Alert.alert("Thông báo", `Đăng nhập bằng ${provider} đang được bảo trì. Vui lòng dùng Email.`);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={StyleSheet.absoluteFill} />
        <View style={[styles.blob, { top: -50, left: -50, backgroundColor: '#00ff87' }]} />
        <View style={[styles.blob, { bottom: -50, right: -50, backgroundColor: '#ff006e' }]} />

        {/* NÚT BACK */}
        <TouchableOpacity style={styles.backBtn} onPress={handleGoHome}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>

          {/* LOGO */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}><Ionicons name="cube-outline" size={50} color="#00ff87" /></View>
            <Text style={styles.logoText}>BHSTORE.</Text>
          </View>

          {/* FORM CARD */}
          <BlurView intensity={30} tint="dark" style={styles.formCard}>
            <Text style={styles.title}>
              {authMode === 'LOGIN' && 'Đăng Nhập'}
              {authMode === 'REGISTER' && 'Tạo Tài Khoản'}
              {authMode === 'PHONE' && 'Đăng Nhập SĐT'}
            </Text>

            {/* --- FORM NHẬP LIỆU --- */}

            {/* 1. HỌ TÊN (Chỉ hiện khi Đăng ký hoặc SĐT) */}
            {(authMode === 'REGISTER' || authMode === 'PHONE') && (
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.icon} />
                <TextInput
                  placeholder="Họ và tên đầy đủ" placeholderTextColor="rgba(255,255,255,0.4)"
                  style={styles.input} value={fullName} onChangeText={setFullName}
                />
              </View>
            )}

            {/* 2. EMAIL (Ẩn khi dùng SĐT) */}
            {authMode !== 'PHONE' && (
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.icon} />
                <TextInput
                  placeholder="Email" placeholderTextColor="rgba(255,255,255,0.4)"
                  style={styles.input} value={email} onChangeText={setEmail}
                  autoCapitalize="none" keyboardType="email-address"
                />
              </View>
            )}

            {/* 3. SỐ ĐIỆN THOẠI (Chỉ hiện khi chọn SĐT) */}
            {authMode === 'PHONE' && (
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.icon} />
                <TextInput
                  placeholder="Số điện thoại (10 số)" placeholderTextColor="rgba(255,255,255,0.4)"
                  style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber}
                  keyboardType="numeric" maxLength={10} // Giới hạn nhập tối đa 10 ký tự
                />
              </View>
            )}

            {/* 4. MẬT KHẨU (Ẩn khi dùng SĐT - vì dùng OTP) */}
            {authMode !== 'PHONE' && (
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.icon} />
                <TextInput
                  placeholder="Mật khẩu" placeholderTextColor="rgba(255,255,255,0.4)"
                  style={styles.input} value={password} onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            )}

            {/* --- NÚT CHÍNH --- */}
            <TouchableOpacity
              style={styles.mainBtn}
              onPress={() => {
                if (authMode === 'LOGIN') handleLogin();
                else if (authMode === 'REGISTER') handleRegister();
                else handlePhoneAuth();
              }}
              disabled={loading}
            >
              <LinearGradient
                colors={authMode === 'REGISTER' ? ['#ff006e', '#ff4757'] : ['#00ff87', '#00b894']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGradient}
              >
                {loading ? <ActivityIndicator color="#000" /> : (
                  <Text style={styles.btnText}>
                    {authMode === 'LOGIN' && 'ĐĂNG NHẬP'}
                    {authMode === 'REGISTER' && 'ĐĂNG KÝ NGAY'}
                    {authMode === 'PHONE' && 'GỬI MÃ OTP'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* --- CHUYỂN ĐỔI CHẾ ĐỘ --- */}
            {authMode !== 'PHONE' && (
              <TouchableOpacity onPress={() => switchMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')} style={styles.switchBtn}>
                <Text style={styles.switchText}>
                  {authMode === 'LOGIN' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                  <Text style={{ color: authMode === 'LOGIN' ? '#00ff87' : '#ff006e', fontWeight: 'bold' }}>
                    {authMode === 'LOGIN' ? 'Đăng ký ngay' : 'Đăng nhập'}
                  </Text>
                </Text>
              </TouchableOpacity>
            )}

            {/* Nút quay lại Login nếu đang ở trang Phone */}
            {authMode === 'PHONE' && (
              <TouchableOpacity onPress={() => switchMode('LOGIN')} style={styles.switchBtn}>
                <Text style={{ color: '#fff', textDecorationLine: 'underline' }}>Quay lại đăng nhập Email</Text>
              </TouchableOpacity>
            )}

            {/* --- MẠNG XÃ HỘI & SĐT --- */}
            <View style={styles.dividerBox}>
              <View style={styles.line} /><Text style={styles.orText}>HOẶC TIẾP TỤC VỚI</Text><View style={styles.line} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('Google')}>
                <Ionicons name="logo-google" size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('Facebook')}>
                <Ionicons name="logo-facebook" size={24} color="#fff" />
              </TouchableOpacity>

              {/* Nút chuyển sang chế độ SĐT */}
              <TouchableOpacity
                style={[styles.socialBtn, authMode === 'PHONE' && { borderColor: '#00ff87', backgroundColor: 'rgba(0,255,135,0.1)' }]}
                onPress={() => switchMode('PHONE')}
              >
                <Ionicons name="call" size={24} color={authMode === 'PHONE' ? "#00ff87" : "#fff"} />
              </TouchableOpacity>
            </View>

          </BlurView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  blob: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.2, shadowColor: "#fff", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20 },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },

  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logoCircle: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#00ff87', justifyContent: 'center', alignItems: 'center', marginBottom: 10, backgroundColor: 'rgba(0, 255, 135, 0.1)' },
  logoText: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 2 },

  formCard: { width: '100%', padding: 25, borderRadius: 30, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },

  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 15, marginBottom: 15, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#fff' },

  mainBtn: { borderRadius: 15, marginTop: 5, overflow: 'hidden', shadowColor: "#00ff87", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
  btnGradient: { paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },

  switchBtn: { marginTop: 15, alignItems: 'center' },
  switchText: { color: 'rgba(255,255,255,0.7)' },

  // Social Styles
  dividerBox: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  orText: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginHorizontal: 10, fontWeight: 'bold' },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  socialBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }
});