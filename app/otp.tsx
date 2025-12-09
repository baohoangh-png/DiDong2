import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform, ScrollView,
    StyleSheet, TextInput, TouchableOpacity,
    View
} from 'react-native';
// Thêm useLocalSearchParams để nhận tham số từ trang trước
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { useColorScheme } from '../hooks/use-color-scheme';

export default function OtpScreen() {
    const [step, setStep] = useState<'INPUT_PHONE' | 'VERIFY_OTP'>('INPUT_PHONE');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [timer, setTimer] = useState(30);

    const router = useRouter();
    // Lấy tham số 'type' truyền từ trang Login
    const { type } = useLocalSearchParams();
    const isForgotPassword = type === 'forgot'; // Kiểm tra xem có phải đang quên mật khẩu không

    const colorScheme = useColorScheme();
    const otpInputRef = useRef<TextInput>(null);

    const inputBgColor = colorScheme === 'dark' ? '#1E1E1E' : '#F0F0F0';
    const inputTextColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';

    // Logic đếm ngược (Đã sửa lỗi cú pháp)
    useEffect(() => {
        let interval: any;
        if (step === 'VERIFY_OTP' && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [step, timer]);

    const handleSendOtp = () => {
        if (phoneNumber.length < 9) {
            Alert.alert('Lỗi', 'Số điện thoại không hợp lệ!');
            return;
        }
        console.log(`Gửi OTP tới ${phoneNumber}`);
        setStep('VERIFY_OTP');
        setTimer(30);
        setTimeout(() => otpInputRef.current?.focus(), 100);
    };

    const handleVerifyOtp = () => {
        if (otpCode.length < 6) {
            Alert.alert('Lỗi', 'Vui lòng nhập đủ 6 số OTP');
            return;
        }

        // Logic xử lý khác nhau tùy vào mục đích
        if (isForgotPassword) {
            Alert.alert('Thành công', 'OTP chính xác! Chuyển đến màn hình đặt lại mật khẩu.');
            // router.push('/reset-password'); // Sau này bạn làm trang đổi mật khẩu thì mở dòng này
        } else {
            Alert.alert('Thành công', 'Đăng nhập thành công!');
            router.replace('/dashboard');
        }
    };

    const handleBack = () => {
        if (step === 'VERIFY_OTP') {
            setStep('INPUT_PHONE');
            setOtpCode('');
        } else {
            router.back();
        }
    };

    const renderOtpBoxes = () => {
        const boxes = [];
        for (let i = 0; i < 6; i++) {
            boxes.push(
                <View
                    key={i}
                    style={[
                        styles.otpBox,
                        { borderColor: otpCode[i] ? '#0a7ea4' : '#ccc' }
                    ]}
                >
                    <ThemedText type="title" style={styles.otpText}>
                        {otpCode[i] || ''}
                    </ThemedText>
                </View>
            );
        }
        return boxes;
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={inputTextColor} />
                </TouchableOpacity>
                {/* Tiêu đề thay đổi dựa trên type */}
                <ThemedText type="subtitle" style={styles.headerTitle}>
                    {isForgotPassword ? 'Lấy lại mật khẩu' : (step === 'INPUT_PHONE' ? 'Đăng nhập SĐT' : 'Xác thực OTP')}
                </ThemedText>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>

                    {step === 'INPUT_PHONE' && (
                        <View style={styles.stepContainer}>
                            <View style={styles.iconContainer}>
                                {/* Đổi icon thành ổ khóa nếu là quên mật khẩu */}
                                <Ionicons
                                    name={isForgotPassword ? "lock-open-outline" : "phone-portrait-outline"}
                                    size={60}
                                    color="#0a7ea4"
                                />
                            </View>

                            <ThemedText style={styles.instructionText}>
                                {isForgotPassword
                                    ? 'Nhập số điện thoại đã đăng ký để nhận mã khôi phục mật khẩu.'
                                    : 'Chúng tôi sẽ gửi mã xác thực đến số điện thoại của bạn.'}
                            </ThemedText>

                            <View style={[styles.phoneInputContainer, { backgroundColor: inputBgColor }]}>
                                <View style={styles.flagContainer}>
                                    <ThemedText style={{ fontSize: 18 }}>🇻🇳 +84</ThemedText>
                                </View>
                                <TextInput
                                    style={[styles.phoneInput, { color: inputTextColor }]}
                                    placeholder="912 345 678"
                                    placeholderTextColor="#888"
                                    keyboardType="number-pad"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    autoFocus
                                />
                            </View>

                            <TouchableOpacity style={styles.primaryButton} onPress={handleSendOtp}>
                                <ThemedText style={styles.buttonText}>
                                    {isForgotPassword ? 'Gửi mã khôi phục' : 'Gửi mã OTP'}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}

                    {step === 'VERIFY_OTP' && (
                        <View style={styles.stepContainer}>
                            <ThemedText style={styles.instructionText}>
                                Mã xác thực đã được gửi đến {'\n'}
                                <ThemedText type="defaultSemiBold">+84 {phoneNumber}</ThemedText>
                            </ThemedText>

                            <View style={styles.otpContainer}>
                                <View style={styles.otpBoxesContainer}>
                                    {renderOtpBoxes()}
                                </View>
                                <TextInput
                                    ref={otpInputRef}
                                    value={otpCode}
                                    onChangeText={(text) => {
                                        if (text.length <= 6) setOtpCode(text);
                                    }}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    style={styles.hiddenInput}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.primaryButton, { opacity: otpCode.length < 6 ? 0.6 : 1 }]}
                                onPress={handleVerifyOtp}
                                disabled={otpCode.length < 6}
                            >
                                <ThemedText style={styles.buttonText}>Xác nhận</ThemedText>
                            </TouchableOpacity>

                            <View style={styles.resendContainer}>
                                {timer > 0 ? (
                                    <ThemedText style={{ color: '#888' }}>
                                        Gửi lại mã sau {timer}s
                                    </ThemedText>
                                ) : (
                                    <TouchableOpacity onPress={handleSendOtp}>
                                        <ThemedText style={{ color: '#0a7ea4', fontWeight: 'bold' }}>
                                            Gửi lại mã mới
                                        </ThemedText>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backButton: { padding: 5 },
    headerTitle: { marginLeft: 15, fontSize: 20 },
    content: { flexGrow: 1, paddingHorizontal: 20 },
    stepContainer: { alignItems: 'center', marginTop: 20 },
    iconContainer: {
        marginBottom: 20,
        padding: 20,
        backgroundColor: 'rgba(10, 126, 164, 0.1)',
        borderRadius: 50,
    },
    instructionText: {
        textAlign: 'center',
        marginBottom: 30,
        fontSize: 16,
        lineHeight: 24,
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 60,
        borderRadius: 12,
        marginBottom: 30,
        paddingHorizontal: 15,
    },
    flagContainer: {
        paddingRight: 15,
        borderRightWidth: 1,
        borderRightColor: '#ccc',
    },
    phoneInput: {
        flex: 1,
        fontSize: 18,
        marginLeft: 15,
        fontWeight: '500',
    },
    otpContainer: {
        width: '100%',
        height: 60,
        marginBottom: 40,
        position: 'relative',
        justifyContent: 'center',
    },
    otpBoxesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    otpBox: {
        width: 45,
        height: 55,
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    otpText: { fontSize: 24, fontWeight: 'bold' },
    hiddenInput: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0,
    },
    primaryButton: {
        backgroundColor: '#0a7ea4',
        width: '100%',
        height: 55,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0a7ea4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    resendContainer: { marginTop: 20 },
});