import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

// 1. IMPORT CART PROVIDER
import { CartProvider } from '../contexts/CartContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Đã xóa phần load font gây lỗi (SpaceMono)

  return (
    // 2. BỌC TOÀN BỘ APP TRONG CART PROVIDER
    <CartProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Định nghĩa các màn hình */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="product/[id]" options={{ headerShown: false }} />

          {/* Màn hình Cart dạng Modal (trượt từ dưới lên) */}
          <Stack.Screen name="cart" options={{ presentation: 'modal', headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </CartProvider>
  );
}