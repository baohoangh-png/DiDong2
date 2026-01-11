import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';

// --- FIREBASE ---
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../constants/firebaseConfig';

export default function AuthScreen() {
  const router = useRouter();

  // --- CÁC CHẾ ĐỘ MÀN HÌNH ---
  // mode: 'LOGIN' | 'REGISTER' | 'PHONE'
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'PHONE'>('LOGIN');
  const [loading, setLoading] = useState(false);

  // Form State (Email/Pass)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Form State (Phone OTP)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmResult, setConfirmResult] = useState<any>(null); // Lưu kết quả gửi OTP (để xác thực sau)

  // ==========================================
  // 1. XỬ LÝ EMAIL / PASS
  // ==========================================
  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    setLoading(true);
    try {
      if (authMode === 'REGISTER') {
        // --- ĐĂNG KÝ ---
        if (!fullName) {
          Alert.alert("Thiếu tên", "Vui lòng nhập họ tên của bạn.");
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: fullName });
        await saveUserToFirestore(user, fullName);

        Alert.alert("Thành công", "Tài khoản đã được tạo!", [{ text: "OK", onPress: () => router.replace('/(tabs)') }]);
      } else {
        // --- ĐĂNG NHẬP ---
        await signInWithEmailAndPassword(auth, email, password);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 2. XỬ LÝ PHONE OTP (GIẢ LẬP ĐỂ TEST)
  // ==========================================
  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ.");
      return;
    }
    setLoading(true);

    // --- MÔ PHỎNG GỬI OTP ---
    // (Sau này thay đoạn này bằng: auth().signInWithPhoneNumber(phoneNumber))
    setTimeout(() => {
      setLoading(false);
      setConfirmResult(true); // Đánh dấu là đã gửi
      Alert.alert("Đã gửi OTP", "Mã xác thực là: 123456 (Demo)");
    }, 1500);
  };

  const handleVerifyOTP = async () => {
    if (otpCode !== '123456') {
      Alert.alert("Lỗi", "Mã OTP không đúng!");
      return;
    }
    setLoading(true);

    try {
      // --- MÔ PHỎNG ĐĂNG NHẬP THÀNH CÔNG ---
      // Tạo một User ảo hoặc đăng nhập ẩn danh để test logic App
      // Trong thực tế: await confirmResult.confirm(otpCode);

      // Vì đây là giả lập, ta sẽ tạo một user giả trong Firestore nếu chưa có
      // Lưu ý: Đây chỉ là hack để bạn vào được App test giao diện
      const fakeUid = "phone_" + phoneNumber;

      // Kiểm tra xem user này đã tồn tại chưa
      const userDoc = await getDoc(doc(db, "users", fakeUid));

      if (!userDoc.exists()) {
        // Nếu là sđt mới -> Lưu vào Firestore
        await setDoc(doc(db, "users", fakeUid), {
          uid: fakeUid,
          email: phoneNumber + "@phone.com", // Email giả
          fullName: "User " + phoneNumber,
          role: 'user',
          createdAt: new Date().toISOString(),
          authMethod: 'phone'
        });
      }

      // Fake login thành công (Vì ta không thể fake auth.currentUser thực sự nếu không có OTP thật)
      // Tuy nhiên, để App chạy được Cart, ta cần Auth thật.
      // Mẹo: Đăng nhập ẩn danh (Anonymous) để vượt qua rào cản Auth
      const { signInAnonymously } = await import("firebase/auth");
      await signInAnonymously(auth);

      // Cập nhật lại thông tin user ẩn danh này cho khớp
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: "User " + phoneNumber });
        // Ghi đè lại UID thật vào Firestore để đồng bộ
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          uid: auth.currentUser.uid,
          email: "",
          fullName: "User SĐT " + phoneNumber,
          role: 'user',
          phone: phoneNumber
        });
      }

      router.replace('/(tabs)');

    } catch (error: any) {
      console.error(error);
      Alert.alert("Lỗi", "Xác thực thất bại.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm phụ: Lưu User vào Firestore
  const saveUserToFirestore = async (user: any, name: string) => {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      fullName: name,
      role: 'user',
      createdAt: new Date().toISOString(),
      avatar: ''
    });
  };

  const handleAuthError = (error: any) => {
    console.error(error);
    let msg = error.message;
    if (msg.includes('invalid-email')) msg = "Email không hợp lệ.";
    if (msg.includes('user-not-found')) msg = "Tài khoản không tồn tại.";
    if (msg.includes('wrong-password')) msg = "Sai mật khẩu.";
    if (msg.includes('email-already-in-use')) msg = "Email này đã được đăng ký.";
    Alert.alert("Thất bại", msg);
  };

  const handleSocialLogin = (provider: string) => {
    if (provider === 'Phone') {
      setAuthMode('PHONE'); // Chuyển sang giao diện điện thoại
      return;
    }
    Alert.alert("Sắp ra mắt", `Đăng nhập ${provider} đang phát triển.`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={StyleSheet.absoluteFill} />

      {/* Trang trí */}
      <View style={[styles.blob, { top: -50, left: -50, backgroundColor: '#00ff87' }]} />
      <View style={[styles.blob, { bottom: -50, right: -50, backgroundColor: '#ff006e' }]} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>

          {/* LOGO */}
          <View style={{ alignItems: 'center', marginBottom: 30 }}>
            <View style={styles.logoCircle}>
              <Ionicons name={authMode === 'PHONE' ? "call-outline" : "cube-outline"} size={40} color="#00ff87" />
            </View>
            <Text style={styles.logoText}>BHSTORE.</Text>
            <Text style={styles.subText}>
              {authMode === 'PHONE' ? 'Đăng nhập bằng Số điện thoại' : 'Mua sắm theo phong cách tương lai'}
            </Text>
          </View>

          {/* FORM CONTAINER */}
          <BlurView intensity={40} tint="dark" style={styles.glassForm}>
            <Text style={styles.formTitle}>
              {authMode === 'REGISTER' ? "TẠO TÀI KHOẢN" : authMode === 'PHONE' ? "XÁC THỰC OTP" : "ĐĂNG NHẬP"}
            </Text>

            {/* --- GIAO DIỆN PHONE OTP --- */}
            {authMode === 'PHONE' ? (
              <>
                {/* Bước 1: Nhập SĐT */}
                {!confirmResult ? (
                  <View style={styles.inputContainer}>
                    <Ionicons name="call-outline" size={20} color="rgba(255,255,255,0.6)" style={{ marginRight: 10 }} />
                    <TextInput
                      placeholder="Số điện thoại (VD: 098...)"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      style={styles.input}
                      keyboardType="phone-pad"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                    />
                  </View>
                ) : (
                  /* Bước 2: Nhập OTP */
                  <View style={styles.inputContainer}>
                    <Ionicons name="keypad-outline" size={20} color="#00ff87" style={{ marginRight: 10 }} />
                    <TextInput
                      placeholder="Nhập mã OTP (123456)"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      style={[styles.input, { color: '#00ff87', fontWeight: 'bold' }]}
                      keyboardType="number-pad"
                      value={otpCode}
                      onChangeText={setOtpCode}
                    />
                  </View>
                )}

                <TouchableOpacity onPress={confirmResult ? handleVerifyOTP : handleSendOTP} disabled={loading} style={{ marginTop: 10 }}>
                  <LinearGradient colors={['#00ff87', '#00b894']} style={styles.btnGradient}>
                    {loading ? <ActivityIndicator color="#000" /> : (
                      <Text style={styles.btnText}>
                        {confirmResult ? "XÁC NHẬN OTP" : "GỬI MÃ XÁC THỰC"}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Nút quay lại Login thường */}
                <TouchableOpacity onPress={() => { setAuthMode('LOGIN'); setConfirmResult(null); }} style={{ marginTop: 15, alignItems: 'center' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.5)' }}>Quay lại đăng nhập Email</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* --- GIAO DIỆN EMAIL / PASS --- */
              <>
                {authMode === 'REGISTER' && (
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.6)" style={{ marginRight: 10 }} />
                    <TextInput
                      placeholder="Họ và tên"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      style={styles.input}
                      value={fullName}
                      onChangeText={setFullName}
                    />
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.6)" style={{ marginRight: 10 }} />
                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.6)" style={{ marginRight: 10 }} />
                  <TextInput
                    placeholder="Mật khẩu"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    style={styles.input}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>

                <TouchableOpacity onPress={handleEmailAuth} disabled={loading} style={{ marginTop: 10 }}>
                  <LinearGradient colors={['#00ff87', '#00b894']} style={styles.btnGradient}>
                    {loading ? <ActivityIndicator color="#000" /> : (
                      <Text style={styles.btnText}>
                        {authMode === 'REGISTER' ? "ĐĂNG KÝ NGAY" : "ĐĂNG NHẬP"}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.line} />
                  <Text style={{ color: 'rgba(255,255,255,0.5)', marginHorizontal: 10, fontSize: 12 }}>HOẶC ĐĂNG NHẬP QUA</Text>
                  <View style={styles.line} />
                </View>

                {/* Social Buttons */}
                <View style={styles.socialRow}>
                  {/* Nút Phone */}
                  <TouchableOpacity style={[styles.socialBtn, { borderColor: '#00ff87' }]} onPress={() => handleSocialLogin('Phone')}>
                    <Ionicons name="call" size={20} color="#00ff87" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('Google')}>
                    <FontAwesome name="google" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('Facebook')}>
                    <FontAwesome name="facebook" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Switch Mode Login/Register */}
                <View style={styles.footerRow}>
                  <Text style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {authMode === 'REGISTER' ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
                  </Text>
                  <TouchableOpacity onPress={() => setAuthMode(authMode === 'REGISTER' ? 'LOGIN' : 'REGISTER')}>
                    <Text style={{ color: '#00ff87', fontWeight: 'bold' }}>
                      {authMode === 'REGISTER' ? "Đăng nhập" : "Đăng ký ngay"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  blob: {
    position: 'absolute', width: 250, height: 250, borderRadius: 125, opacity: 0.3,
    shadowColor: "#fff", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20
  },

  // Header
  logoCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
    borderWidth: 1, borderColor: '#00ff87'
  },
  logoText: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  subText: { color: 'rgba(255,255,255,0.6)', marginTop: 5 },

  // Glass Form
  glassForm: {
    borderRadius: 25, padding: 25, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: Platform.OS === 'android' ? 'rgba(30, 30, 40, 0.85)' : undefined
  },
  formTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },

  // Inputs
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 15, paddingHorizontal: 15,
    marginBottom: 15, height: 55, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  input: { flex: 1, color: '#fff', fontSize: 16 },

  // Button
  btnGradient: { paddingVertical: 15, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },

  // Social
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 25 },
  socialBtn: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
  },

  // Footer
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 }
});