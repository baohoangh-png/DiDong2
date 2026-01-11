import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions, Image,
  Platform,
  ScrollView, StyleSheet,
  Text,
  TextInput, TouchableOpacity, View
} from 'react-native';

// --- THƯ VIỆN ĐỒ HỌA ---
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
// -----------------------

// --- FIREBASE ---
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../../constants/firebaseConfig';
// ----------------

// --- GIỎ HÀNG (MỚI THÊM) ---
import { useCart } from '../../contexts/CartContext';
// ---------------------------

const { width } = Dimensions.get('window');

// Component "Tấm Kính" tái sử dụng
const GlassCard = ({ children, style, intensity = 20 }: any) => {
  const isAndroid = Platform.OS === 'android';
  if (isAndroid) {
    return (
      <View style={[styles.glassFallback, style]}>
        {children}
      </View>
    );
  }
  return (
    <BlurView intensity={intensity} tint="dark" style={[styles.glassContainer, style]}>
      {children}
    </BlurView>
  );
};

export default function DashboardScreen() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. LẤY SỐ LƯỢNG TỪ GIỎ HÀNG
  const { items } = useCart();

  const categories = ['Dành cho bạn', 'Mới về', 'Trending', 'Giá sốc'];

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsList: any[] = [];
      querySnapshot.forEach((doc) => {
        productsList.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsList);
    } catch (error) {
      console.error(error);
    }
  };

  const seedProductsWithLinks = async () => {
    // ... (Giữ nguyên code cũ)
    Alert.alert("Admin", "Đã nạp sản phẩm mẫu!");
    fetchProducts();
  };

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const docSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (docSnap.exists()) setUserProfile(docSnap.data());
      }
      await fetchProducts();
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace('/auth');
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  const handleBiometricBuy = () => {
    Alert.alert("Thanh toán nhanh", "Xác thực vân tay/FaceID để mua ngay?", [
      { text: "Hủy", style: "cancel" },
      { text: "Quét FaceID", onPress: () => Alert.alert("Thành công", "Đơn hàng đang được xử lý!") }
    ]);
  };

  const formatCurrency = (amount: number) => amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  return (
    <View style={styles.container}>
      {/* BACKGROUND */}
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={styles.background}
      />

      {/* TRANG TRÍ */}
      <View style={[styles.blob, { top: 50, left: -50, backgroundColor: '#00ff87' }]} />
      <View style={[styles.blob, { top: 200, right: -60, backgroundColor: '#60efff' }]} />
      <View style={[styles.blob, { bottom: 100, left: 50, backgroundColor: '#ff006e' }]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* 2. HEADER ĐÃ CẬP NHẬT: Thêm nút Giỏ hàng */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={seedProductsWithLinks}>
              <TextGradient style={styles.logoText}>BHSTORE.</TextGradient>
            </TouchableOpacity>
            <TextGradient style={styles.greetingText}>
              Hello, {userProfile?.fullName || 'Khách hàng'}
            </TextGradient>
          </View>

          {/* Cụm icon bên phải */}
          <View style={{ flexDirection: 'row', gap: 12 }}>

            {/* ICON GIỎ HÀNG (MỚI) */}
            <GlassCard style={styles.iconButton}>
              <TouchableOpacity onPress={() => router.push('/cart' as any)}>
                <Ionicons name="cart-outline" size={24} color="#fff" />
                {items.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{items.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </GlassCard>

            {/* Icon Đăng xuất */}
            <GlassCard style={styles.iconButton}>
              <TouchableOpacity onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color="#ff006e" />
              </TouchableOpacity>
            </GlassCard>

          </View>
        </View>

        {/* SEARCH */}
        <GlassCard style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" />
          <TextInput
            placeholder="Tìm kiếm phong cách riêng..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={styles.searchInput}
          />
          <TouchableOpacity>
            <Ionicons name="mic-outline" size={20} color="#00ff87" />
          </TouchableOpacity>
        </GlassCard>

        {/* CATEGORIES */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((cat, index) => (
            <TouchableOpacity key={index}>
              <GlassCard style={[styles.catChip, index === 0 && styles.activeCat]} intensity={index === 0 ? 60 : 20}>
                <TextGradient style={[styles.catText, index === 0 && { fontWeight: 'bold', color: '#fff' }]}>
                  {cat}
                </TextGradient>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FEATURED */}
        <View style={styles.sectionHeader}>
          <TextGradient style={styles.sectionTitle}>Nổi Bật Hôm Nay</TextGradient>
        </View>

        {products.length > 0 && (
          <GlassCard style={styles.featuredCard} intensity={30}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(`/product/${products[0].id}` as any)}
              style={{ flex: 1 }}
            >
              <Image source={{ uri: products[0].image }} style={styles.featuredImage} resizeMode="contain" />
              <View style={styles.featuredInfo}>
                <View>
                  <TextGradient style={styles.featuredName}>{products[0].name}</TextGradient>
                  <TextGradient style={styles.featuredPrice}>{formatCurrency(products[0].price)}</TextGradient>
                </View>
                <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometricBuy}>
                  <Ionicons name="finger-print" size={28} color="#00ff87" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* GRID */}
        <View style={styles.sectionHeader}>
          <TextGradient style={styles.sectionTitle}>Khám Phá</TextGradient>
        </View>

        <View style={styles.grid}>
          {products.slice(1).map((item) => (
            <GlassCard key={item.id} style={styles.gridCard}>
              <TouchableOpacity
                style={{ flex: 1 }}
                activeOpacity={0.8}
                onPress={() => router.push(`/product/${item.id}` as any)}
              >
                <TouchableOpacity style={styles.favoriteBtn}>
                  <Ionicons name="heart-outline" size={16} color="#fff" />
                </TouchableOpacity>

                <Image source={{ uri: item.image }} style={styles.gridImage} resizeMode="contain" />

                <View style={styles.gridInfo}>
                  <TextGradient numberOfLines={1} style={styles.gridName}>{item.name}</TextGradient>
                  <View style={styles.priceRow}>
                    <TextGradient style={styles.gridPrice}>{formatCurrency(item.price)}</TextGradient>
                    <TouchableOpacity onPress={handleBiometricBuy}>
                      <Ionicons name="add-circle" size={26} color="#00ff87" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </GlassCard>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

// Component Text an toàn
const TextGradient = ({ style, children, numberOfLines }: any) => (
  <Text
    style={[{ color: '#fff' }, style]}
    numberOfLines={numberOfLines}
  >
    {children}
  </Text>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  blob: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100, opacity: 0.4,
    shadowColor: "#fff", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 20
  },
  scrollContent: { padding: 20, paddingTop: 60 },

  // Header Styles Mới
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  iconButton: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },

  // Badge số lượng
  badge: {
    position: 'absolute', top: -5, right: -5,
    backgroundColor: '#ff006e', borderRadius: 10, width: 18, height: 18,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#fff'
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  logoText: { fontSize: 22, fontWeight: '900', letterSpacing: 2, color: '#00ff87' },
  greetingText: { fontSize: 14, opacity: 0.7, marginTop: 4 },

  // Các style cũ giữ nguyên
  glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', overflow: 'hidden',
  },
  glassFallback: {
    backgroundColor: 'rgba(20, 20, 30, 0.7)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 50, marginBottom: 25 },
  searchInput: { flex: 1, marginLeft: 10, color: '#fff', fontSize: 16 },
  catScroll: { marginBottom: 30 },
  catChip: { paddingHorizontal: 20, paddingVertical: 10, marginRight: 12, borderRadius: 15 },
  activeCat: { backgroundColor: 'rgba(0, 255, 135, 0.2)', borderColor: '#00ff87' },
  catText: { fontSize: 13, opacity: 0.9 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  featuredCard: { padding: 20, marginBottom: 30, borderRadius: 25 },
  featuredImage: { width: '100%', height: 180, marginBottom: 15 },
  featuredInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featuredName: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  featuredPrice: { fontSize: 16, color: '#00ff87', fontWeight: 'bold' },
  biometricBtn: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#00ff87'
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15 },
  gridCard: { width: (width - 55) / 2, padding: 12, borderRadius: 20, marginBottom: 5 },
  gridImage: { width: '100%', height: 100, marginBottom: 10 },
  gridInfo: {},
  gridName: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gridPrice: { fontSize: 14, color: '#00ff87', fontWeight: 'bold' },
  favoriteBtn: { position: 'absolute', top: 10, right: 10, zIndex: 1, opacity: 0.7 },
});