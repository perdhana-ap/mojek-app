import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import CustomText from '../src/components/CustomText';
import { apiPost } from '../src/api';

export default function ProfileScreen() {
  const [userName, setUserName] = useState('Pengguna');
  const [userRole, setUserRole] = useState('CUSTOMER');
  const [userPhone, setUserPhone] = useState('Memuat...'); // State asli untuk telepon
  const [balance, setBalance] = useState('Memuat...'); // State asli untuk saldo
  
  useEffect(() => {
    const loadUserData = async () => {
      const dataString = await AsyncStorage.getItem('mojek_user');
      if (dataString) {
        const user = JSON.parse(dataString);
        setUserName(user.name);
        setUserRole(user.role.toUpperCase());
        setUserPhone(user.phone); // Set nomor asli

        // Tembak API untuk ambil saldo realtime seperti di dashboard
        try {
          const res = await apiPost('users/balance', { phone: user.phone });
          if (res && res.success) {
            setBalance("Rp " + res.data.balance.toLocaleString('id-ID'));
          } else {
            setBalance("Rp 0");
          }
        } catch (error) {
          setBalance("Rp 0");
        }
      }
    };
    loadUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('mojek_user');
    router.replace('/');
  };

  const menuItems = [
    { icon: 'location-outline', title: 'Alamat Tersimpan', subtitle: 'Atur alamat rumah & kantor' },
    { icon: 'notifications-outline', title: 'Notifikasi', subtitle: 'Atur pengingat dan promo' },
    { icon: 'shield-checkmark-outline', title: 'Keamanan Akun', subtitle: 'Ganti Password & PIN' },
    { icon: 'help-buoy-outline', title: 'Pusat Bantuan', subtitle: 'Hubungi CS MOJEK' },
    { icon: 'document-text-outline', title: 'Syarat & Ketentuan', subtitle: 'Kebijakan layanan kami' },
  ];

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name={"arrow-back" as any} size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <CustomText size="large" weight="bold" style={styles.headerTitle}>Profil Saya</CustomText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* 1. INFO PROFIL */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Ionicons name={"person" as any} size={40} color={theme.colors.surface} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <CustomText weight="bold" size="large">{userName}</CustomText>
            <CustomText color="textLight" style={{ marginTop: 2 }}>{userPhone}</CustomText>
            <View style={styles.roleBadge}>
              <CustomText size="small" weight="bold" color="surface">{userRole}</CustomText>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name={"pencil" as any} size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* 2. KARTU DOMPET DIGITAL (MO-PAY) */}
        <View style={styles.mopayCard}>
          <View style={styles.mopayHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name={"wallet" as any} size={24} color={theme.colors.surface} />
              <CustomText weight="bold" color="surface" style={{ marginLeft: 8 }}>MO-PAY</CustomText>
            </View>
            <TouchableOpacity onPress={() => alert('Membuka Riwayat Transaksi Saldo')}>
              <CustomText size="small" color="surface" weight="bold">Riwayat &gt;</CustomText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.mopayBody}>
            <View>
              <CustomText size="small" color="surface" style={{ opacity: 0.9 }}>Saldo Tersedia</CustomText>
              <CustomText size="heading" weight="bold" color="surface" style={{ marginTop: 4 }}>
                {balance}
              </CustomText>
            </View>
            <TouchableOpacity onPress={() => router.push('/topup')} style={styles.topupBtn}> 
              <Ionicons name={"add-circle" as any} size={20} color={theme.colors.primary} />
              <CustomText weight="bold" color="primary" style={{ marginLeft: 4 }}>Top Up</CustomText> 
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. MENU PENGATURAN UMUM */}
        <CustomText weight="bold" size="medium" style={{ marginBottom: 12, marginTop: 16 }}>Pengaturan Akun</CustomText>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={22} color={theme.colors.textLight} />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <CustomText weight="bold">{item.title}</CustomText>
                <CustomText size="small" color="textLight" style={{ marginTop: 2 }}>{item.subtitle}</CustomText>
              </View>
              <Ionicons name={"chevron-forward" as any} size={20} color={theme.colors.border} />
            </TouchableOpacity>
          ))}
        </View>

        {/* 4. TOMBOL LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name={"log-out-outline" as any} size={24} color={theme.colors.danger} />
          <CustomText weight="bold" color="danger" style={{ marginLeft: 8 }}>Keluar dari Akun</CustomText>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: theme.layout.spacing.lg, paddingBottom: 16,
    backgroundColor: theme.colors.surface, elevation: 2,
  },
  backBtn: { padding: 8, backgroundColor: theme.colors.background, borderRadius: 20 },
  headerTitle: { flex: 1, textAlign: 'center' },
  content: { padding: theme.layout.spacing.lg, paddingBottom: 40 },
  
  // Gaya Info Profil
  profileSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingHorizontal: 4 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: theme.colors.primary + '50', alignItems: 'center', justifyContent: 'center' },
  roleBadge: { backgroundColor: theme.colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8, alignSelf: 'flex-start' },
  editBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', elevation: 2 },

  // Gaya Kartu MO-PAY
  mopayCard: {
    backgroundColor: theme.colors.primary, borderRadius: 20, padding: 20, marginBottom: 24,
    elevation: 6, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  mopayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', paddingBottom: 16, marginBottom: 16 },
  mopayBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topupBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },

  // Gaya Menu Pengaturan
  menuContainer: { backgroundColor: theme.colors.surface, borderRadius: 20, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, elevation: 2, marginBottom: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.background },
  menuIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' },

  // Gaya Tombol Keluar
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFEBEE', paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: '#FFCDD2' }
});