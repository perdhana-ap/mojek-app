import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../src/theme';
import CustomText from '../src/components/CustomText';

export default function VerificationPendingScreen() {
  // Menangkap data role, nama, dan nomor HP dari halaman Register
  const params = useLocalSearchParams();
  const { role, name, phone } = params;
  
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckStatus = async () => {
    setIsChecking(true);

    // Simulasi mengecek ke Server/Admin (Jeda 2 detik)
    setTimeout(async () => {
      setIsChecking(false);
      alert("Hore! Akun Anda telah disetujui oleh Admin.");

      // 1. Simpan sesi login seolah-olah user langsung masuk
      const userData = { 
        name: name || 'Pengguna', 
        role: role || 'CUSTOMER', 
        phone: phone 
      };
      await AsyncStorage.setItem('mojek_user', JSON.stringify(userData));

      // 2. Arahkan ke dashboard yang sesuai dengan Role yang didaftarkan
      if (role === 'MERCHANT') {
        router.replace('/merchant_dashboard');
      } else if (role === 'DRIVER') {
        router.replace('/driver_dashboard');
      } else {
        router.replace('/dashboard');
      }
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        
        {/* Ikon Animasi Menunggu */}
        <View style={styles.iconCircle}>
          <Ionicons name={"time-outline" as any} size={80} color="#F39C12" />
        </View>

        <CustomText size="heading" weight="bold" style={{ textAlign: 'center', marginBottom: 12 }}>
          Menunggu Verifikasi
        </CustomText>
        
        <CustomText color="textLight" style={{ textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 }}>
          Halo <CustomText weight="bold">{name}</CustomText>, kami telah mengirimkan data Anda ke Admin via WhatsApp. 
          {"\n\n"}
          Saat ini akun Anda sedang dalam proses peninjauan. Mohon tunggu balasan dari Admin kami.
        </CustomText>

        {/* Kotak Info Role yang didaftarkan */}
        <View style={styles.infoCard}>
          <CustomText size="small" color="textLight">Mendaftar Sebagai:</CustomText>
          <CustomText weight="bold" size="large" color="primary">{role}</CustomText>
        </View>

      </View>

      {/* Tombol Cek Status */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.checkBtn} 
          onPress={handleCheckStatus}
          disabled={isChecking}
        >
          {isChecking ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <CustomText color="surface" weight="bold" size="medium" style={{ textAlign: 'center' }}>
              Cek Status Verifikasi
            </CustomText>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/')}>
          <CustomText color="textLight" weight="bold" style={{ textAlign: 'center' }}>
            Kembali ke Halaman Awal
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.layout.spacing.lg },
  
  iconCircle: {
    width: 150, height: 150, borderRadius: 75, backgroundColor: '#FDF2E9',
    alignItems: 'center', justifyContent: 'center', marginBottom: 32,
    borderWidth: 4, borderColor: '#FAD7A1'
  },
  
  infoCard: {
    marginTop: 32, padding: 16, backgroundColor: theme.colors.surface, 
    borderRadius: 16, width: '100%', alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed'
  },

  footer: { padding: theme.layout.spacing.lg, paddingBottom: 40 },
  checkBtn: { 
    backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 16, 
    justifyContent: 'center', alignItems: 'center', marginBottom: 16
  },
  backBtn: { paddingVertical: 12 }
});