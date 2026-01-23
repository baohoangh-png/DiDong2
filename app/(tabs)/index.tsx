import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Platform,
  ScrollView, StyleSheet,
  Text,
  TextInput, TouchableOpacity, View,
  useWindowDimensions
} from 'react-native';

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- FIREBASE ---
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { auth, db } from '../../constants/firebaseConfig';

// --- GIỎ HÀNG ---
import { useCart } from '../../contexts/CartContext';

// ==========================================
// 1. DỮ LIỆU MẪU
// ==========================================
const SAMPLE_PRODUCTS = [
  { id: 'prod_1', name: 'Balo Gaming RGB Pro', price: 2100000, category: 'Gaming', image: 'https://cdn.pixabay.com/photo/2016/11/19/15/32/laptop-1839876_1280.jpg', rating: 4.8, description: 'Chiếc Balo mơ ước của mọi Gamer. Tích hợp dải LED RGB đồng bộ theo nhạc, ngăn chứa Laptop 17.3 inch chống sốc chuẩn quân đội.' },
  { id: 'prod_2', name: 'Balo Du Lịch Phượt 40L', price: 890000, category: 'Travel', image: 'https://cdn.pixabay.com/photo/2016/11/29/09/13/backpack-1868698_1280.jpg', rating: 4.5, description: 'Bạn đồng hành cho những chuyến đi xa. Dung tích cực đại 40L, thiết kế trợ lực cột sống giúp đeo lâu không mỏi.' },
  { id: 'prod_3', name: 'Túi Đeo Chéo Sport', price: 350000, category: 'Crossbody', image: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=2670&auto=format&fit=crop', rating: 4.2, description: 'Nhỏ gọn, thời trang, năng động. Phù hợp để đựng điện thoại, ví tiền, sạc dự phòng khi đi dạo phố.' },
  { id: 'prod_4', name: 'Balo Laptop Văn Phòng', price: 550000, category: 'Laptop', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2500&auto=format&fit=crop', rating: 4.6, description: 'Thiết kế tối giản (Minimalist) dành cho dân công sở. Có cổng sạc USB bên ngoài tiện lợi.' },
  { id: 'prod_5', name: 'Balo Đi Học Canvas', price: 290000, category: 'School', image: 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?q=80&w=2487&auto=format&fit=crop', rating: 4.7, description: 'Phong cách Hàn Quốc trẻ trung. Kích thước vừa vặn giấy A4 và Laptop 14 inch.' },
  { id: 'prod_6', name: 'Túi Tote Vải Mộc', price: 150000, category: 'Canvas', image: 'https://images.unsplash.com/photo-1597484662317-9bd7bdda2907?q=80&w=2574&auto=format&fit=crop', rating: 4.3, description: 'Túi Tote vải Canvas dày dặn, thân thiện với môi trường. Họa tiết in nghệ thuật không bong tróc.' }
];

const BANNERS = [
  { id: '1', title: 'GIẢM SỐC 50%', sub: 'Cho bộ sưu tập Gaming', image: 'https://cdn.pixabay.com/photo/2018/06/05/21/30/headphone-3456381_1280.jpg', color: '#ff006e' },
  { id: '2', title: 'NEW ARRIVAL', sub: 'Balo chống nước thế hệ mới', image: 'https://cdn.pixabay.com/photo/2016/11/19/15/32/laptop-1839876_1280.jpg', color: '#00ff87' },
  { id: '3', title: 'BACK TO SCHOOL', sub: 'Combo Balo + Túi chéo', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2500&auto=format&fit=crop', color: '#00d2ff' },
];

const GlassCard = ({ children, style, intensity = 20 }: any) => {
  const isAndroid = Platform.OS === 'android';
  if (isAndroid) {
    return <View style={[styles.glassFallback, style]}>{children}</View>;
  }
  return <BlurView intensity={intensity} tint="dark" style={[styles.glassContainer, style]}>{children}</BlurView>;
};

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // --- ANIMATED VALUES & AUTO SCROLL ---
  const scrollX = useRef(new Animated.Value(0)).current;
  const bannerRef = useRef<ScrollView>(null); // Ref để điều khiển ScrollView
  const [bannerIndex, setBannerIndex] = useState(0); // Theo dõi trang hiện tại

  // --- TOAST STATE ---
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const toastAnim = useRef(new Animated.Value(0)).current;
  // -----------------------------------

  const { items, addToCart } = useCart();

  const categories = ['Dành cho bạn'];
  const CARD_WIDTH = (width - 40 - 15) / 2;
  const BANNER_WIDTH = width - 40;
  const BANNER_SPACING = 20;
  const SNAP_INTERVAL = BANNER_WIDTH + BANNER_SPACING; // Khoảng cách mỗi lần cuộn (chiều rộng banner + margin phải)

  // --- LOGIC AUTO PLAY ---
  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = bannerIndex + 1;
      if (nextIndex >= BANNERS.length) {
        nextIndex = 0; // Quay về đầu nếu hết danh sách
      }

      // Cuộn tới vị trí tiếp theo
      if (bannerRef.current) {
        bannerRef.current.scrollTo({
          x: nextIndex * (width - 40 + 20) - 0, // Tính toán tọa độ x: index * (width - 40 + margin 20)
          animated: true
        });
      }
      setBannerIndex(nextIndex);
    }, 3000); // 3000ms = 3 giây

    return () => clearInterval(interval); // Dọn dẹp khi thoát màn hình
  }, [bannerIndex, width]);

  // Listener để cập nhật index khi người dùng tự lướt tay
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / (width - 40 + 20));
        // Chỉ cập nhật nếu khác index hiện tại để tránh render nhiều
        if (index !== bannerIndex) {
          // setBannerIndex(index); // (Tạm tắt dòng này để tránh xung đột với AutoPlay, hoặc bật nếu muốn đồng bộ hoàn hảo)
        }
      }
    }
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) setUserProfile(docSnap.data());
      } else {
        setUserProfile(null);
      }
    });
    fetchProducts();
    return () => unsubscribe();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsList: any[] = [];
      querySnapshot.forEach((doc) => {
        productsList.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsList);
      setFilteredProducts(productsList);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSeedData = async () => {
    Alert.alert(
      "Nạp dữ liệu mẫu", "Bạn có muốn xóa dữ liệu cũ và nạp 6 sản phẩm mẫu chuẩn không?",
      [{ text: "Hủy", style: "cancel" }, {
        text: "Nạp ngay", onPress: async () => {
          setLoading(true);
          try {
            for (const product of SAMPLE_PRODUCTS) {
              await setDoc(doc(db, "products", product.id), product);
            }
            Alert.alert("Thành công", "Đã nạp xong! Hãy kéo xuống để xem.");
            fetchProducts();
          } catch (error) { console.error(error); Alert.alert("Lỗi", "Không nạp được dữ liệu."); }
          finally { setLoading(false); }
        }
      }]
    );
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text) {
      const newData = products.filter(item => {
        const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredProducts(newData);
    } else {
      setFilteredProducts(products);
    }
  };

  const showToast = (message: string) => {
    setToastMsg(message);
    setToastVisible(true);
    toastAnim.setValue(0);
    Animated.timing(toastAnim, {
      toValue: 1, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.back(1.5))
    }).start();
    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 0, duration: 300, useNativeDriver: true
      }).start(() => {
        setToastVisible(false);
      });
    }, 2000);
  };

  const handleQuickAdd = (item: any) => {
    if (!currentUser) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.",
        [
          { text: "Để sau", style: "cancel" },
          { text: "Đăng nhập ngay", onPress: () => router.push('/auth') }
        ]
      );
      return;
    }
    addToCart(item);
    showToast(`Đã thêm "${item.name}" vào giỏ`);
  };

  const formatCurrency = (amount: number) => amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  // Component Pagination
  const Pagination = () => {
    return (
      <View style={styles.pagination}>
        {BANNERS.map((_, i) => {
          const inputRange = [(i - 1) * BANNER_WIDTH, i * BANNER_WIDTH, (i + 1) * BANNER_WIDTH];
          const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 25, 8], extrapolate: 'clamp' });
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });
          const backgroundColor = scrollX.interpolate({ inputRange, outputRange: ['#ffffff', '#00ff87', '#ffffff'], extrapolate: 'clamp' });
          return <Animated.View key={i.toString()} style={[styles.dot, { width: dotWidth, opacity, backgroundColor }]} />;
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={StyleSheet.absoluteFill} />
      <View style={[styles.blob, { top: '5%', left: -50, backgroundColor: '#00ff87' }]} />
      <View style={[styles.blob, { top: '30%', right: -60, backgroundColor: '#60efff' }]} />
      <View style={[styles.blob, { bottom: '10%', left: 50, backgroundColor: '#ff006e' }]} />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={handleSeedData} onLongPress={() => Alert.alert("Info", "Bấm 1 lần để nạp data mẫu")}>
              <TextGradient style={styles.logoText}>BHSTORE.</TextGradient>
            </TouchableOpacity>
            <TextGradient style={styles.greetingText}>Hello, {userProfile?.fullName || 'Khách hàng'}</TextGradient>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <GlassCard style={styles.iconButton}>
              <TouchableOpacity onPress={() => router.push('/cart' as any)}>
                <Ionicons name="cart-outline" size={24} color="#fff" />
                {items.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{items.length}</Text></View>}
              </TouchableOpacity>
            </GlassCard>

            {!currentUser && (
              <TouchableOpacity onPress={() => router.push('/auth')} style={styles.loginBtn}>
                <Text style={styles.loginText}>Đăng nhập</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* SEARCH BAR */}
        <GlassCard style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" />
          <TextInput placeholder="Tìm kiếm balo..." placeholderTextColor="rgba(255,255,255,0.4)" style={styles.searchInput} value={searchQuery} onChangeText={handleSearch} />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}><Ionicons name="close-circle" size={20} color="#ff006e" /></TouchableOpacity>
          )}
        </GlassCard>

        {/* MAIN CONTENT */}
        {searchQuery.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Kết quả tìm kiếm ({filteredProducts.length})</Text>
            <View style={[styles.grid, { marginTop: 15 }]}>
              {filteredProducts.map((item) => (
                <GlassCard key={item.id} style={[styles.gridCard, { width: CARD_WIDTH }]}>
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push(`/product/${item.id}` as any)}>
                    {/* ẢNH ĐƯỢC BO GÓC + NỀN TRẮNG */}
                    <Image source={{ uri: item.image }} style={styles.gridImage} resizeMode="contain" />
                    <View>
                      <TextGradient numberOfLines={1} style={styles.gridName}>{item.name}</TextGradient>
                      <TextGradient style={styles.gridPrice}>{formatCurrency(item.price)}</TextGradient>
                    </View>
                  </TouchableOpacity>
                </GlassCard>
              ))}
            </View>
          </View>
        ) : (
          <>
            {/* --- CATEGORY CHỈ CÒN 1 MỤC --- */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {categories.map((cat, index) => (
                <TouchableOpacity key={index}>
                  <GlassCard style={[styles.catChip, index === 0 && styles.activeCat]} intensity={index === 0 ? 60 : 20}>
                    <TextGradient style={[styles.catText, index === 0 && { fontWeight: 'bold', color: '#fff' }]}>{cat}</TextGradient>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* --- TIN NỔI BẬT (BANNER AUTO SCROLL) --- */}
            <View style={{ marginBottom: 25 }}>
              <TextGradient style={[styles.sectionTitle, { marginBottom: 15 }]}>Tin Nổi Bật</TextGradient>

              {/* Thêm ref={bannerRef} và sự kiện onScroll */}
              <Animated.ScrollView
                ref={bannerRef as any}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={{ marginHorizontal: -20 }}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                {BANNERS.map((banner) => (
                  <View key={banner.id} style={{ width: width - 40, marginRight: 20 }}>
                    <GlassCard style={[styles.bannerCard, { borderColor: banner.color }]} intensity={40}>
                      <TouchableOpacity activeOpacity={0.9} style={{ flex: 1 }}>
                        <Image source={{ uri: banner.image }} style={styles.bannerImage} resizeMode="cover" />
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={StyleSheet.absoluteFill} />
                        <View style={styles.bannerContent}>
                          <View style={[styles.tagBadge, { backgroundColor: banner.color }]}><Text style={styles.tagText}>HOT</Text></View>
                          <Text style={[styles.bannerTitle, { textShadowColor: banner.color }]}>{banner.title}</Text>
                          <Text style={styles.bannerSub}>{banner.sub}</Text>
                          <TouchableOpacity style={[styles.shopNowBtn, { backgroundColor: banner.color }]}><Text style={{ fontWeight: 'bold', color: '#000' }}>MUA NGAY</Text></TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    </GlassCard>
                  </View>
                ))}
              </Animated.ScrollView>
              <Pagination />
            </View>

            <TextGradient style={[styles.sectionTitle, { marginBottom: 15 }]}>Khám Phá</TextGradient>
            <View style={styles.grid}>
              {products.map((item) => (
                <GlassCard key={item.id} style={[styles.gridCard, { width: CARD_WIDTH }]}>
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push(`/product/${item.id}` as any)}>
                    <TouchableOpacity style={styles.favoriteBtn}><Ionicons name="heart-outline" size={16} color="#fff" /></TouchableOpacity>

                    {/* ẢNH ĐƯỢC BO GÓC + NỀN TRẮNG */}
                    <Image source={{ uri: item.image }} style={styles.gridImage} resizeMode="contain" />

                    <View style={styles.gridInfo}>
                      <TextGradient numberOfLines={1} style={styles.gridName}>{item.name}</TextGradient>
                      <View style={styles.priceRow}>
                        <TextGradient style={styles.gridPrice}>{formatCurrency(item.price)}</TextGradient>
                        <TouchableOpacity onPress={() => handleQuickAdd(item)}>
                          <Ionicons name="add-circle" size={26} color="#00ff87" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </GlassCard>
              ))}
            </View>
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* TOAST NOTIFICATION */}
      {toastVisible && (
        <Animated.View style={[
          styles.toastContainer,
          {
            opacity: toastAnim,
            transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
          }
        ]}>
          <BlurView intensity={50} tint="dark" style={styles.toastGlass}>
            <Ionicons name="checkmark-circle" size={24} color="#00ff87" style={{ marginRight: 10 }} />
            <Text style={styles.toastText} numberOfLines={1}>{toastMsg}</Text>
          </BlurView>
        </Animated.View>
      )}

    </View>
  );
}

const TextGradient = ({ style, children, numberOfLines }: any) => <Text style={[{ color: '#fff' }, style]} numberOfLines={numberOfLines}>{children}</Text>;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  iconButton: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#ff006e', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  loginBtn: { height: 45, paddingHorizontal: 15, borderRadius: 22.5, backgroundColor: '#00ff87', justifyContent: 'center', alignItems: 'center', shadowColor: "#00ff87", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 },
  loginText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  logoText: { fontSize: 22, fontWeight: '900', letterSpacing: 2, color: '#00ff87' },
  greetingText: { fontSize: 14, opacity: 0.7, marginTop: 4 },

  glassContainer: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', overflow: 'hidden' },
  glassFallback: { backgroundColor: 'rgba(20, 20, 30, 0.7)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 50, marginBottom: 25 },
  searchInput: { flex: 1, marginLeft: 10, color: '#fff', fontSize: 16 },
  catScroll: { marginBottom: 30 },
  catChip: { paddingHorizontal: 20, paddingVertical: 10, marginRight: 12, borderRadius: 15 },
  activeCat: { backgroundColor: 'rgba(0, 255, 135, 0.2)', borderColor: '#00ff87' },
  catText: { fontSize: 13, opacity: 0.9 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  bannerCard: { height: 200, borderRadius: 25, overflow: 'hidden', borderWidth: 1 },
  bannerImage: { width: '100%', height: '100%', position: 'absolute' },
  bannerContent: { flex: 1, justifyContent: 'flex-end', padding: 20, alignItems: 'flex-start' },
  bannerTitle: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 1, marginBottom: 5, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  bannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 15 },
  tagBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 10 },
  tagText: { color: '#000', fontWeight: 'bold', fontSize: 10 },
  shopNowBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 },
  pagination: { flexDirection: 'row', justifyContent: 'center', marginTop: 15, gap: 8 },
  dot: { height: 8, borderRadius: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15 },
  gridCard: { padding: 12, borderRadius: 20, marginBottom: 5 },

  // --- STYLE SỬA ĐỔI: TẠO KHUNG TRẮNG BO TRÒN ---
  gridImage: {
    width: '100%',
    height: 120, // Tăng chiều cao lên 120 cho thoáng
    marginBottom: 10,
    backgroundColor: '#fff', // Nền trắng để che nền ảnh gốc
    borderRadius: 15, // Bo tròn 4 góc
    // resizeMode được set inline trong component (vẫn là contain)
  },
  // ------------------------------------------------

  gridInfo: {},
  gridName: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gridPrice: { fontSize: 14, color: '#00ff87', fontWeight: 'bold' },
  favoriteBtn: { position: 'absolute', top: 10, right: 10, zIndex: 1, opacity: 0.7 },
  blob: { position: 'absolute', width: 200, height: 200, borderRadius: 100, opacity: 0.4, shadowColor: "#fff", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '85%', padding: 30, borderRadius: 30, alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,0,110,0.3)' },

  // --- TOAST STYLES ---
  toastContainer: { position: 'absolute', bottom: 100, alignSelf: 'center', borderRadius: 25, overflow: 'hidden', shadowColor: "#00ff87", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10, zIndex: 999 },
  toastGlass: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: 'rgba(20, 20, 30, 0.9)', borderWidth: 1, borderColor: '#00ff87' },
  toastText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});