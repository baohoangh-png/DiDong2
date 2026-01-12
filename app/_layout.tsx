import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

// --- THƯ VIỆN ĐỒ HỌA ---
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// -----------------------

import { useColorScheme } from '@/hooks/use-color-scheme';
import { CartProvider } from '../contexts/CartContext';

// Ngăn màn hình splash mặc định của Expo tự tắt
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // State quản lý Splash Screen
  const [isAppReady, setIsAppReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current; // Độ mờ
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Độ phóng to

  useEffect(() => {
    // Hàm chạy hiệu ứng Splash
    const prepareApp = async () => {
      try {
        // Ẩn splash native mặc định ngay lập tức để hiện splash custom của mình
        await SplashScreen.hideAsync();

        // Chạy hiệu ứng
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(1500),
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            })
          ])
        ]).start(() => {
          // Kết thúc hiệu ứng -> Vào App
          setIsAppReady(true);
        });
      } catch (e) {
        console.warn(e);
      }
    };

    prepareApp();
  }, []);

  // 1. GIAO DIỆN SPLASH SCREEN (Cyberpunk Style)
  if (!isAppReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={StyleSheet.absoluteFill} />

        <View style={[styles.blob, { top: -50, left: -50, backgroundColor: '#00ff87' }]} />
        <View style={[styles.blob, { bottom: -50, right: -50, backgroundColor: '#ff006e' }]} />

        <Animated.View style={[
          styles.splashContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}>
          <View style={styles.logoCircle}>
            <Ionicons name="cube-outline" size={60} color="#00ff87" />
          </View>
          <Text style={styles.logoText}>BHSTORE.</Text>
          <Text style={styles.subText}>Future of Shopping</Text>
        </Animated.View>

        <View style={{ position: 'absolute', bottom: 50, alignSelf: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, letterSpacing: 2 }}>LOADING...</Text>
        </View>
      </View>
    );
  }

  // 2. KHI APP ĐÃ SẴN SÀNG -> VÀO MÀN HÌNH CHÍNH
  return (
    <CartProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="cart" options={{ presentation: 'modal' }} />
          <Stack.Screen name="auth" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  blob: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.2,
    shadowColor: "#fff", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20
  },
  logoCircle: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2, borderColor: '#00ff87',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20, backgroundColor: 'rgba(0, 255, 135, 0.1)',
    shadowColor: "#00ff87", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20
  },
  logoText: { fontSize: 42, fontWeight: '900', color: '#fff', letterSpacing: 3 },
  subText: { color: '#00d2ff', marginTop: 5, letterSpacing: 1, fontWeight: '600' }
});