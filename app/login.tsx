import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../src/theme';
import { apiPost } from '../src/api';
import CustomText from '../src/components/CustomText';
import CustomInput from '../src/components/CustomInput';
import CustomButton from '../src/components/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !pin) {
      Alert.alert("Error", "Nomor WA dan PIN tidak boleh kosong.");
      return;
    }
    if (pin.length < 6) {
      Alert.alert("Error", "PIN harus 6 digit.");
      return;
    }

    setIsLoading(true);
    
    // Siapkan data yang akan dikirim ke backend
    const payload = {
      phone: phone,
      pin: pin
    };

    // Tembak API auth/login
    const response = await apiPost('auth/login', payload);
    
    setIsLoading(false);

    if (response.success) {
      // PERBAIKAN: Cari data user di response.data.user, jika tidak ada cari di response.data
      const user = response.data?.user || response.data || response;

      // Cegah crash jika data benar-benar kosong dari server
      if (!user) {
        Alert.alert("Gagal", "Data pengguna tidak ditemukan dari server.");
        return;
      }

      // 2. Simpan seluruh objek data user ke memori lokal HP (AsyncStorage)
      await AsyncStorage.setItem('mojek_user', JSON.stringify(user));

      // 3. LOGIKA PINTAR: Arahkan dashboard berdasarkan ROLE akun dari database
      const userRole = user.role ? String(user.role).toUpperCase() : 'CUSTOMER';

      if (userRole === 'ADMIN') {
        router.replace('/admin_dashboard'); // Tambahkan baris ini
      } else if (userRole === 'DRIVER') {
        router.replace('/driver_dashboard');
      } else if (userRole === 'MERCHANT') {
        router.replace('/merchant_dashboard');
      } else {
        router.replace('/dashboard');
      }

    } else {
      // Menampilkan pesan error kegagalan dari server jika PIN/Nomor salah
      Alert.alert("Gagal Masuk", response.message || "Nomor WA atau PIN salah.");
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.header}>
        <CustomText size="heading" weight="bold" color="primary">Selamat Datang</CustomText>
        <CustomText size="medium" color="textLight" style={{ marginTop: 8 }}>
          Masuk untuk melanjutkan layanan Anda.
        </CustomText>
      </View>

      <View style={styles.form}>
        <CustomInput 
          label="Nomor WhatsApp" 
          placeholder="Contoh: 081234567890" 
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <CustomInput 
          label="PIN Keamanan (6 Digit)" 
          placeholder="Masukkan 6 digit PIN" 
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          secureTextEntry={true} 
          maxLength={6}          
        />

        {/* TAMBAHKAN KODE INI UNTUK TOMBOL LUPA PIN */}
        <TouchableOpacity onPress={() => router.push('/forgot_password')}>
          <CustomText size="small" color="primary" weight="bold" style={{ textAlign: 'right', marginTop: -8 }}>
            Lupa PIN Keamanan?
          </CustomText>
        </TouchableOpacity>

        <CustomButton 
          title="Masuk" 
          onPress={handleLogin} 
          isLoading={isLoading}
          style={{ marginTop: 24 }}
        />

        <CustomButton 
          title="Kembali" 
          type="outline"
          onPress={() => router.back()} 
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.layout.spacing.lg,
    paddingTop: 90, // Mendorong konten dari atas agar tidak menabrak status bar, tapi tidak terlalu ke tengah
  },
  header: {
    marginBottom: 40,
  },
  form: {
    gap: 5,
  },
});