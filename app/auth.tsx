import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image, KeyboardAvoidingView,
  Modal,
  Platform, ScrollView,
  StyleSheet, TextInput, TouchableOpacity,
  View
} from 'react-native';


import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { useColorScheme } from '../hooks/use-color-scheme';

export default function AuthScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State cho Popup Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'loading'>('success');

  const router = useRouter();
  const colorScheme = useColorScheme();

  const inputBgColor = colorScheme === 'dark' ? '#1E1E1E' : '#F0F0F0';
  const inputTextColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  const placeholderColor = colorScheme === 'dark' ? '#888' : '#666';

  // Hàm hiển thị Popup thành công và chuyển trang
  const showSuccessAndRedirect = (msg: string) => {
    setModalType('success');
    setModalMessage(msg);
    setModalVisible(true);

    // Đợi 1.5 giây để người dùng đọc thông báo rồi mới chuyển trang
    setTimeout(() => {
      setModalVisible(false);
      router.replace('/dashboard');
    }, 1500);
  };

  const handleAuth = () => {
    if (isRegister) {
      // Logic Đăng ký
      if (!fullName || !email || !password || !confirmPassword) {
        Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin!');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Lỗi', 'Mật khẩu nhập lại không khớp!');
        return;
      }

      // Giả lập gọi API đăng ký...
      showSuccessAndRedirect('Đăng ký tài khoản thành công!');

    } else {
      // Logic Đăng nhập
      // Giả lập gọi API đăng nhập...
      if (!email || !password) {
        Alert.alert('Thông báo', 'Vui lòng nhập Email và Mật khẩu!');
        return;
      }

      showSuccessAndRedirect('Đăng nhập thành công!');
    }
  };

  const handleSocialLogin = (platform: string) => {
    // Demo tính năng login social
    Alert.alert('Thông báo', `Tính năng đăng nhập bằng ${platform} đang phát triển.`);
  };

  const handleForgotPassword = () => {
    router.push('/otp?type=forgot');
  };

  return (
    <ThemedView style={styles.container}>

      {/* --- MODAL POPUP THÔNG BÁO --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colorScheme === 'dark' ? '#2C2C2C' : '#fff' }]}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </View>
            <ThemedText type="subtitle" style={styles.modalTitle}>Thành Công!</ThemedText>
            <ThemedText style={styles.modalText}>{modalMessage}</ThemedText>
          </View>
        </View>
      </Modal>
      {/* ----------------------------- */}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* HEADER */}
          <View style={styles.headerContainer}>
            <Image
              source={require('@/assets/images/react-logo.png')}
              style={styles.logo}
            />
            <ThemedText type="title" style={styles.title}>
              {isRegister ? 'Tạo tài khoản' : 'Chào mừng trở lại!'}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {isRegister ? 'Điền thông tin để tham gia' : 'Đăng nhập để tiếp tục quản lý'}
            </ThemedText>
          </View>

          {/* FORM */}
          <View style={styles.formContainer}>

            {isRegister && (
              <View style={styles.inputGroup}>
                <ThemedText type="defaultSemiBold">Họ và tên</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBgColor, color: inputTextColor }]}
                  placeholder="Nguyễn Văn A"
                  placeholderTextColor={placeholderColor}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold">Email</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: inputBgColor, color: inputTextColor }]}
                placeholder="example@email.com"
                placeholderTextColor={placeholderColor}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold">Mật khẩu</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: inputBgColor, color: inputTextColor }]}
                placeholder="••••••••"
                placeholderTextColor={placeholderColor}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {isRegister && (
              <View style={styles.inputGroup}>
                <ThemedText type="defaultSemiBold">Nhập lại mật khẩu</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBgColor, color: inputTextColor }]}
                  placeholder="••••••••"
                  placeholderTextColor={placeholderColor}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            )}

            {!isRegister && (
              <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotContainer}>
                <ThemedText style={styles.forgotText}>Quên mật khẩu?</ThemedText>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.button} onPress={handleAuth}>
              <ThemedText style={styles.buttonText}>
                {isRegister ? 'Đăng Ký' : 'Đăng Nhập'}
              </ThemedText>
            </TouchableOpacity>

            {/* SOCIAL LOGIN */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <ThemedText style={styles.dividerText}>Hoặc tiếp tục với</ThemedText>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={[styles.socialButton, { backgroundColor: '#DB4437' }]}
                onPress={() => handleSocialLogin('Google')}
              >
                <Ionicons name="logo-google" size={20} color="#fff" style={{ marginRight: 8 }} />
                <ThemedText style={styles.socialButtonText}>Google</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, { backgroundColor: '#4267B2' }]}
                onPress={() => handleSocialLogin('Facebook')}
              >
                <Ionicons name="logo-facebook" size={20} color="#fff" style={{ marginRight: 8 }} />
                <ThemedText style={styles.socialButtonText}>Facebook</ThemedText>
              </TouchableOpacity>
            </View>

            {/* OTP LINK */}
            <View style={{ marginTop: 20, alignItems: 'center' }}>
              <Link href="/otp" asChild>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
                  <Ionicons name="phone-portrait-outline" size={20} color="#0a7ea4" style={{ marginRight: 8 }} />
                  <ThemedText type="defaultSemiBold" style={{ color: '#0a7ea4' }}>
                    Đăng nhập bằng số điện thoại
                  </ThemedText>
                </TouchableOpacity>
              </Link>
            </View>

            <View style={styles.footer}>
              <ThemedText>{isRegister ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}</ThemedText>
              <TouchableOpacity onPress={() => {
                setIsRegister(!isRegister);
                setConfirmPassword('');
                setPassword('');
              }}>
                <ThemedText type="defaultSemiBold" style={styles.linkText}>
                  {isRegister ? 'Đăng nhập ngay' : 'Đăng ký ngay'}
                </ThemedText>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingTop: 40 },
  headerContainer: { alignItems: 'center', marginBottom: 30 },
  logo: { height: 80, width: 80, marginBottom: 15, resizeMode: 'contain' },
  title: { fontSize: 28, textAlign: 'center', marginBottom: 5 },
  subtitle: { textAlign: 'center', opacity: 0.7 },
  formContainer: { width: '100%' },
  inputGroup: { marginBottom: 15 },
  input: {
    height: 50, borderRadius: 12, paddingHorizontal: 15,
    marginTop: 6, borderWidth: 1, borderColor: 'transparent',
  },
  forgotContainer: { alignSelf: 'flex-end', marginBottom: 10, marginTop: -5 },
  forgotText: { color: '#0a7ea4', fontSize: 14, fontWeight: '600' },
  button: {
    backgroundColor: '#0a7ea4', height: 50, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginTop: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#ccc', opacity: 0.5 },
  dividerText: { marginHorizontal: 10, fontSize: 12, opacity: 0.6 },
  socialContainer: { flexDirection: 'row', gap: 15, marginBottom: 10 },
  socialButton: {
    flex: 1, height: 45, borderRadius: 10, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2, shadowRadius: 2, elevation: 2,
  },
  socialButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, marginBottom: 20 },
  linkText: { color: '#0a7ea4' },

  // --- STYLE CHO MODAL ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Nền đen mờ
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconCircle: {
    width: 60,
    height: 60,
    backgroundColor: '#34C759', // Màu xanh lá thành công
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.8,
  }
});