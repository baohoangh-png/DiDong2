import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur'; // Hiệu ứng kính
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

export default function TabLayout() {
  const isAndroid = Platform.OS === 'android';

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Ẩn header mặc định
        tabBarActiveTintColor: '#00ff87', // Màu icon khi chọn (Xanh Neon)
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)', // Màu icon khi chưa chọn
        tabBarStyle: {
          position: 'absolute', // Nổi lên trên nội dung
          bottom: 0,
          left: 0,
          right: 0,
          height: 80, // Chiều cao thanh tab
          elevation: 0,
          borderTopWidth: 0,
          backgroundColor: isAndroid ? 'rgba(20, 20, 30, 0.9)' : 'transparent', // Android không hỗ trợ Blur nền tab tốt nên dùng màu tối
          paddingTop: 10,
        },
        // Hiệu ứng kính mờ cho thanh Tab (Chỉ iOS)
        tabBarBackground: () => (
          isAndroid ? null : (
            <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />
          )
        ),
      }}>

      {/* 1. TAB HOME (Trang chủ) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* 2. TAB DANH MỤC */}
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Danh mục',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* 3. TAB THÔNG BÁO */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* 4. TAB TÔI (Profile) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Tôi',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}