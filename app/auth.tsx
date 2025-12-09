import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Import thêm bộ icon

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { useColorScheme } from '../hooks/use-color-scheme';

export default function AuthScreen() {
  const [isRegister, setIsRegister] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const router = useRouter();
  const colorScheme = useColorScheme();

  const inputBgColor = colorScheme === 'dark' ? '#1E1E1E' : '#F0F0F0';
  const inputTextColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  const placeholderColor = colorScheme === 'dark' ? '#888' : '#666';

  const handleAuth = () => {
    if (isRegister) {
      if (!fullName || !email || !password || !confirmPassword) {
        Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin!');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Lỗi', 'Mật khẩu nhập lại không khớp!');
        return;
      }
      Alert.alert('Thành công', `Chào mừng ${fullName}! Tài khoản đã được tạo.`);
    } else {
      router.replace('/(tabs)'); 
    }
  };

  // Hàm xử lý giả lập cho Google/Facebook
  const handleSocialLogin = (platform: string) => {
    Alert.alert('Thông báo', `Tính năng đăng nhập bằng ${platform} đang được phát triển!`);
  };

  return (
    <ThemedView style={styles.container}>
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

          {/* MAIN FORM */}
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

            <TouchableOpacity style={styles.button} onPress={handleAuth}>
              <ThemedText style={styles.buttonText}>
                {isRegister ? 'Đăng Ký' : 'Đăng Nhập'}
              </ThemedText>
            </TouchableOpacity>

            {/* --- PHẦN MỚI: SOCIAL LOGIN --- */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <ThemedText style={styles.dividerText}>Hoặc tiếp tục với</ThemedText>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialContainer}>
              {/* Nút Google */}
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: '#DB4437' }]} // Màu đỏ Google
                onPress={() => handleSocialLogin('Google')}
              >
                <Ionicons name="logo-google" size={20} color="#fff" style={{ marginRight: 8 }} />
                <ThemedText style={styles.socialButtonText}>Google</ThemedText>
              </TouchableOpacity>

              {/* Nút Facebook */}
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: '#4267B2' }]} // Màu xanh Facebook
                onPress={() => handleSocialLogin('Facebook')}
              >
                <Ionicons name="logo-facebook" size={20} color="#fff" style={{ marginRight: 8 }} />
                <ThemedText style={styles.socialButtonText}>Facebook</ThemedText>
              </TouchableOpacity>
            </View>
            {/* ----------------------------- */}

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
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    height: 80,
    width: 80,
    marginBottom: 15,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  button: {
    backgroundColor: '#0a7ea4',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Style cho phần Social
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc', // Màu đường kẻ
    opacity: 0.5,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    opacity: 0.6,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 15, // Khoảng cách giữa 2 nút
    marginBottom: 10,
  },
  socialButton: {
    flex: 1, // Chia đều chiều rộng
    height: 45,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  socialButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  linkText: {
    color: '#0a7ea4',
  },
});