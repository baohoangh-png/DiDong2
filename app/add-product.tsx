import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Thư viện chọn ảnh
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    TextInput, TouchableOpacity,
    View
} from 'react-native';

// --- FIREBASE ---
import { addDoc, collection } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../constants/firebaseConfig';
// ----------------

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';

export default function AddProductScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Laptop'); // Mặc định
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // 1. Hàm chọn ảnh từ điện thoại
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Cắt ảnh vuông cho đẹp
            quality: 0.5,   // Giảm chất lượng chút cho nhẹ
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    // 2. Hàm upload ảnh lên Firebase Storage
    const uploadImageAsync = async (uri: string) => {
        // Cần chuyển URI thành Blob để Firebase hiểu
        const response = await fetch(uri);
        const blob = await response.blob();

        // Tạo tên file ngẫu nhiên dựa trên thời gian
        const filename = `products/${new Date().getTime()}.jpg`;
        const storageRef = ref(storage, filename);

        // Upload
        await uploadBytes(storageRef, blob);

        // Lấy đường dẫn tải về (URL)
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    };

    // 3. Hàm Lưu sản phẩm
    const handleSaveProduct = async () => {
        if (!name || !price || !imageUri) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên, giá và chọn ảnh!');
            return;
        }

        setUploading(true);

        try {
            // B1: Upload ảnh lấy Link
            const imageUrl = await uploadImageAsync(imageUri);

            // B2: Lưu thông tin vào Firestore
            await addDoc(collection(db, 'products'), {
                name: name,
                price: parseFloat(price),
                category: category,
                image: imageUrl, // Lưu link ảnh thật vừa upload
                rating: 5.0,     // Mặc định 5 sao cho hàng mới
                createdAt: new Date().toISOString()
            });

            Alert.alert("Thành công", "Đã thêm sản phẩm mới!", [
                { text: "OK", onPress: () => router.back() }
            ]);

        } catch (error) {
            console.error(error);
            Alert.alert("Lỗi", "Không thể lưu sản phẩm.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <ThemedText type="title" style={{ marginBottom: 20, textAlign: 'center' }}>Thêm Balo Mới</ThemedText>

                {/* CHỌN ẢNH */}
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    ) : (
                        <View style={{ alignItems: 'center' }}>
                            <Ionicons name="camera-outline" size={40} color="#888" />
                            <ThemedText style={{ color: '#888' }}>Bấm để chọn ảnh</ThemedText>
                        </View>
                    )}
                </TouchableOpacity>

                {/* NHẬP TÊN */}
                <ThemedText style={styles.label}>Tên sản phẩm</ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="Ví dụ: Balo Gaming..."
                    placeholderTextColor="#999"
                    value={name} onChangeText={setName}
                />

                {/* NHẬP GIÁ */}
                <ThemedText style={styles.label}>Giá bán (VNĐ)</ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="Ví dụ: 500000"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={price} onChangeText={setPrice}
                />

                {/* CHỌN DANH MỤC (Đơn giản hóa bằng nút bấm) */}
                <ThemedText style={styles.label}>Danh mục</ThemedText>
                <View style={styles.categoryRow}>
                    {['Laptop', 'Du lịch', 'Thời trang', 'Đi học'].map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.catChip, category === cat && styles.catChipActive]}
                            onPress={() => setCategory(cat)}
                        >
                            <ThemedText style={{ color: category === cat ? '#fff' : '#000' }}>{cat}</ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* NÚT LƯU */}
                <TouchableOpacity
                    style={[styles.saveBtn, uploading && { opacity: 0.7 }]}
                    onPress={handleSaveProduct}
                    disabled={uploading}
                >
                    {uploading ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.saveBtnText}>LƯU SẢN PHẨM</ThemedText>}
                </TouchableOpacity>

            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    imagePicker: {
        width: '100%', height: 200, backgroundColor: '#f0f0f0', borderRadius: 15,
        justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed'
    },
    previewImage: { width: '100%', height: '100%', borderRadius: 15 },
    label: { fontWeight: 'bold', marginBottom: 5, marginTop: 10 },
    input: {
        backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
        padding: 12, fontSize: 16, color: '#000'
    },
    categoryRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 5 },
    catChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e0e0e0' },
    catChipActive: { backgroundColor: '#0a7ea4' },
    saveBtn: {
        backgroundColor: '#0a7ea4', padding: 15, borderRadius: 10,
        alignItems: 'center', marginTop: 30
    },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});