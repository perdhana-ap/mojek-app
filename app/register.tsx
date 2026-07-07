import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, StatusBar, Linking, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // PERBAIKAN: Impor AsyncStorage untuk simpan sesi Customer
import { theme } from '../src/theme';
import { apiPost } from '../src/api';
import CustomText from '../src/components/CustomText';

export default function RegisterScreen() {
  const [role, setRole] = useState('CUSTOMER'); 
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState(''); 
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Nomor WA Admin MOJEK
  const adminWhatsAppNumber = "6281231535251"; 

  const handleRegister = async () => {
    // 1. Validasi Sederhana
    if (!name || !phone || !address || !pin) {
      Alert.alert('Gagal', 'Nama, Nomor WA, Alamat, dan PIN wajib diisi!');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert('Gagal', 'PIN dan Konfirmasi PIN tidak cocok!');
      return;
    }

    setIsLoading(true);

    // 2. Siapkan Data untuk dikirim ke Google Apps Script
    const payload = {
      name: name,
      phone: phone,
      pin: pin,
      role: role,
      email: email,
      address: address 
    };

    // 3. Tembak API auth/register
    const response = await apiPost('auth/register', payload);
    setIsLoading(false);

    // 4. LOGIKA PERCABANGAN BERDASARKAN ROLE
    if (response.success) {
      
      if (role === 'CUSTOMER') {
        // KONDISI A: JIKA PELANGGAN (Langsung Aktif & Masuk Aplikasi)
        const userData = { 
          name: name, 
          role: 'CUSTOMER', 
          phone: phone,
          balance: 0 
        };
        // Simpan data ke memori HP agar aplikasi mendeteksi user sudah login
        await AsyncStorage.setItem('mojek_user', JSON.stringify(userData));
        
        Alert.alert(
          'Pendaftaran Berhasil!',
          'Selamat datang di MOJEK! Akun Pelanggan Anda telah aktif dan siap digunakan.',
          [{ text: 'Mulai Jelajah', onPress: () => router.replace('/dashboard') }]
        );

      } else {
        // KONDISI B: JIKA DRIVER ATAU MERCHANT (Wajib Verifikasi WA Admin)
        const message = `Halo Admin MOJEK, saya ingin memverifikasi pendaftaran akun baru saya:\n\n*Role:* ${role}\n*Nama:* ${name}\n*No. WA:* ${phone}\n*Alamat:* ${address}\n\nMohon bantuannya untuk mengaktifkan akun saya. Terima kasih!`;
        const waUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message)}`;

        Linking.openURL(waUrl).catch(() => {
          Alert.alert("Info", "Akun berhasil dibuat, namun gagal membuka WhatsApp. Pastikan WA terinstal.");
        });

        // Diarahkan ke ruang tunggu konfirmasi Admin
        router.replace({
          pathname: '/verification_pending',
          params: { role, name, phone }
        });
      }

    } else {
      // Menampilkan pesan error dari Google Apps Script (misal: "Nomor HP sudah terdaftar")
      Alert.alert("Pendaftaran Gagal", response.message || "Terjadi kesalahan pada server.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <CustomText size="large" weight="bold" style={styles.headerTitle}>Daftar Akun Baru</CustomText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* PILIH ROLE */}
        <CustomText weight="bold" size="medium" style={{ marginBottom: 12 }}>Mendaftar Sebagai:</CustomText>
        <View style={styles.roleContainer}>
          <TouchableOpacity style={[styles.roleCard, role === 'CUSTOMER' && styles.roleCardActive]} onPress={() => setRole('CUSTOMER')}>
            <Ionicons name="person" size={24} color={role === 'CUSTOMER' ? theme.colors.primary : theme.colors.textLight} />
            <CustomText size="small" weight="bold" color={role === 'CUSTOMER' ? 'primary' : 'textLight'} style={{ marginTop: 8 }}>Pelanggan</CustomText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roleCard, role === 'DRIVER' && styles.roleCardActive]} onPress={() => setRole('DRIVER')}>
            <Ionicons name="bicycle" size={24} color={role === 'DRIVER' ? theme.colors.primary : theme.colors.textLight} />
            <CustomText size="small" weight="bold" color={role === 'DRIVER' ? 'primary' : 'textLight'} style={{ marginTop: 8 }}>Driver</CustomText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roleCard, role === 'MERCHANT' && styles.roleCardActive]} onPress={() => setRole('MERCHANT')}>
            <Ionicons name="storefront" size={24} color={role === 'MERCHANT' ? theme.colors.primary : theme.colors.textLight} />
            <CustomText size="small" weight="bold" color={role === 'MERCHANT' ? 'primary' : 'textLight'} style={{ marginTop: 8 }}>Toko</CustomText>
          </TouchableOpacity>
        </View>

        {/* INFO ROLE DYNAMIC */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
          <CustomText size="small" style={{ flex: 1, marginLeft: 8, color: theme.colors.textLight }}>
            {role === 'CUSTOMER' && "Pesan makanan favoritmu dengan mudah dan cepat tanpa verifikasi ribet."}
            {role === 'DRIVER' && "Antar pesanan dan dapatkan penghasilan tambahan setelah diverifikasi Admin."}
            {role === 'MERCHANT' && "Jangkau lebih banyak pelanggan dan kembangkan bisnismu setelah toko Anda disetujui."}
          </CustomText>
        </View>

        {/* FORMULIR PENDAFTARAN */}
        <CustomText weight="bold" size="medium" style={{ marginTop: 24, marginBottom: 16 }}>Data Diri</CustomText>
        
        <View style={styles.inputGroup}>
          <CustomText weight="bold" style={styles.label}>Nama Lengkap / Toko <CustomText color="danger">*</CustomText></CustomText>
          <TextInput style={styles.input} placeholder={role === 'MERCHANT' ? "Contoh: Ayam Geprek Bensu" : "Contoh: Budi Santoso"} value={name} onChangeText={setName} placeholderTextColor={theme.colors.textLight} />
        </View>

        <View style={styles.inputGroup}>
          <CustomText weight="bold" style={styles.label}>Nomor WhatsApp <CustomText color="danger">*</CustomText></CustomText>
          <TextInput style={styles.input} placeholder="Contoh: 081234567890" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={theme.colors.textLight} />
        </View>

        <View style={styles.inputGroup}>
          <CustomText weight="bold" style={styles.label}>Alamat Lengkap Domisili / Toko <CustomText color="danger">*</CustomText></CustomText>
          <TextInput 
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
            placeholder="Contoh: Jl. Merdeka No.45, RT 01/RW 02, Kediri" 
            value={address} 
            onChangeText={setAddress} 
            multiline={true}
            numberOfLines={3}
            placeholderTextColor={theme.colors.textLight} 
          />
        </View>

        <View style={styles.inputGroup}>
          <CustomText weight="bold" style={styles.label}>Email (Opsional)</CustomText>
          <TextInput style={styles.input} placeholder="Contoh: budi@gmail.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={theme.colors.textLight} />
        </View>

        <View style={styles.inputGroup}>
          <CustomText weight="bold" style={styles.label}>Buat PIN (6 Angka) <CustomText color="danger">*</CustomText></CustomText>
          <View style={styles.passwordContainer}>
            <TextInput style={styles.passwordInput} placeholder="Masukkan 6 angka rahasia" value={pin} onChangeText={setPin} keyboardType="number-pad" maxLength={6} secureTextEntry={!showPin} placeholderTextColor={theme.colors.textLight} />
            <TouchableOpacity onPress={() => setShowPin(!showPin)} style={styles.eyeBtn}>
              <Ionicons name={showPin ? "eye-off" : "eye"} size={20} color={theme.colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <CustomText weight="bold" style={styles.label}>Konfirmasi PIN <CustomText color="danger">*</CustomText></CustomText>
          <TextInput style={styles.input} placeholder="Masukkan ulang PIN" value={confirmPin} onChangeText={setConfirmPin} keyboardType="number-pad" maxLength={6} secureTextEntry={!showPin} placeholderTextColor={theme.colors.textLight} />
        </View>

      </ScrollView>

      {/* FOOTER ACTION BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <CustomText color="surface" weight="bold" size="medium" style={{ textAlign: 'center' }}>
              {role === 'CUSTOMER' ? "Daftar Sekarang" : "Daftar & Verifikasi WA"}
            </CustomText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: theme.colors.background },
  backBtn: { padding: 8, backgroundColor: theme.colors.surface, borderRadius: 20, elevation: 1 },
  headerTitle: { flex: 1, textAlign: 'center' },
  content: { padding: 20, paddingBottom: 100 },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  roleCard: { flex: 1, alignItems: 'center', paddingVertical: 16, backgroundColor: theme.colors.surface, borderRadius: 16, marginHorizontal: 4, borderWidth: 1, borderColor: theme.colors.border },
  roleCardActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary + '15', padding: 12, borderRadius: 12 },
  inputGroup: { marginBottom: 16 },
  label: { marginBottom: 8 },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'System', color: theme.colors.text, fontSize: 14 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12 },
  passwordInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'System', color: theme.colors.text, fontSize: 14 },
  eyeBtn: { padding: 14 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.colors.surface, paddingHorizontal: 20, paddingVertical: 20, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  registerBtn: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }
});