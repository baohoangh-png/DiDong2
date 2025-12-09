import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>

      {/* HERO SECTION */}
      <ThemedView style={styles.heroContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="storefront" size={50} color="#fff" />
        </View>
        <ThemedText type="title" style={styles.appTitle}>QLBanHang</ThemedText>
        <ThemedText style={styles.slogan}>
          Giải pháp quản lý cửa hàng toàn diện
        </ThemedText>
      </ThemedView>

      {/* FEATURES */}
      <ThemedView style={styles.featuresContainer}>
        <FeatureItem
          icon="stats-chart"
          title="Thống kê doanh thu"
          desc="Theo dõi lợi nhuận chi tiết theo ngày/tháng."
        />
        <FeatureItem
          icon="cube"
          title="Quản lý kho hàng"
          desc="Kiểm soát số lượng tồn kho chính xác."
        />
        <FeatureItem
          icon="people"
          title="Quản lý nhân viên"
          desc="Phân quyền và theo dõi ca làm việc."
        />
      </ThemedView>

      {/* START BUTTON */}
      <ThemedView style={styles.actionContainer}>
        <Link href="/auth" asChild>
          <TouchableOpacity style={styles.primaryButton}>
            <ThemedText style={styles.buttonText}>Bắt đầu ngay</ThemedText>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </Link>

        <ThemedText style={styles.footerText}>
          Phiên bản 1.0.0
        </ThemedText>
      </ThemedView>

    </ParallaxScrollView>
  );
}

function FeatureItem({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconBox}>
        <Ionicons name={icon} size={24} color="#0a7ea4" />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        <ThemedText style={styles.featureDesc}>{desc}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  reactLogo: { height: 178, width: 290, bottom: 0, left: 0, position: 'absolute' },
  heroContainer: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  iconCircle: {
    backgroundColor: '#0a7ea4', width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 5, elevation: 5,
  },
  appTitle: { fontSize: 32, fontWeight: 'bold' },
  slogan: { textAlign: 'center', marginTop: 5, opacity: 0.7, fontSize: 16 },
  featuresContainer: { gap: 20, marginBottom: 30, paddingHorizontal: 10 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  featureIconBox: {
    width: 50, height: 50, borderRadius: 12, backgroundColor: 'rgba(10, 126, 164, 0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  featureDesc: { fontSize: 13, opacity: 0.6, marginTop: 2 },
  actionContainer: { alignItems: 'center', marginBottom: 20 },
  primaryButton: {
    backgroundColor: '#0a7ea4', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 40,
    borderRadius: 30, width: '100%',
    shadowColor: '#0a7ea4', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footerText: { marginTop: 20, fontSize: 12, opacity: 0.4 },
});