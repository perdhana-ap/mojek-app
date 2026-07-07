import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Linking, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import CustomText from '../src/components/CustomText';
import CustomInput from '../src/components/CustomInput';
import CustomButton from '../src/components/CustomButton';

export default function ForgotPasswordScreen() {
  const [phone, setPhone] = useState('');
  
  // Nomor WA Admin MOJEK (Pastikan sama dengan yang ada di halaman Register)
  const adminWhatsAppNumber = "6281234567890"; 

  const handleResetRequest = () => {
    if (!phone) {
      Alert.alert('Gagal', 'Masukkan nomor WhatsApp Anda terlebih dahulu.');
      return;
    }

    // Format Pesan untuk Admin
    const message = `Halo Admin MOJEK, saya lupa PIN keamanan untuk akun saya dengan nomor terdaftar: *${phone}*.\n\nMohon bantuannya untuk melakukan verifikasi dan mereset PIN saya. Terima kasih!`;
    const waUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message)}`;

    // Buka WhatsApp
    Linking.openURL(waUrl).catch(() => {
      Alert.alert("Info", "Pastikan aplikasi WhatsApp terinstal di HP Anda.");
    });

    // Tampilkan notifikasi dan kembalikan user ke halaman Login
    Alert.alert(
      'Permintaan Terkirim!',
      'Silakan lanjutkan percakapan di WhatsApp. Admin kami akan segera memverifikasi data Anda dan memberikan instruksi selanjutnya.',
      [{ text: 'Kembali ke Login', onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name={"arrow-back" as any} size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <CustomText size="large" weight="bold" style={styles.headerTitle}>Lupa PIN</CustomText>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        
        {/* IKON ILUSTRASI */}
        <View style={styles.iconWrapper}>
          <Ionicons name={"lock-closed" as any} size={60} color={theme.colors.primary} />
        </View>
        
        <CustomText size="large" weight="bold" style={{ textAlign: 'center', marginBottom: 12 }}>
          Lupa PIN Keamanan?
        </CustomText>
        <CustomText color="textLight" style={{ textAlign: 'center', marginBottom: 32, lineHeight: 22 }}>
          Jangan khawatir. Masukkan nomor WhatsApp yang terdaftar pada akun Anda, dan kami akan membantu mereset PIN Anda melalui Admin.
        </CustomText>

        {/* INPUT NOMOR */}
        <CustomInput 
          label="Nomor WhatsApp Terdaftar" 
          placeholder="Contoh: 081234567890" 
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        {/* TOMBOL AKSI */}
        <CustomButton 
          title="Minta Reset PIN via WA" 
          onPress={handleResetRequest} 
          style={{ marginTop: 24 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: theme.layout.spacing.lg, paddingBottom: 16,
    backgroundColor: theme.colors.background,
  },
  backBtn: { padding: 8, backgroundColor: theme.colors.surface, borderRadius: 20, elevation: 1 },
  headerTitle: { flex: 1, textAlign: 'center' },
  
  content: { padding: theme.layout.spacing.lg, marginTop: 20 },
  
  iconWrapper: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.primary + '15',
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 24
  }
});