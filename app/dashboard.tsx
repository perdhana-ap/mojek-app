import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 
import { theme } from '../src/theme';
import CustomText from '../src/components/CustomText';
import { apiPost } from '../src/api'; 

export default function DashboardScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      const dataString = await AsyncStorage.getItem('mojek_user');
      if (dataString) {
        const user = JSON.parse(dataString);
        setUserData(user);
        
        // Tembak API untuk ambil saldo realtime
        const res = await apiPost('users/balance', { phone: user.phone });
        if (res.success) {
          setBalance("Rp " + res.data.balance.toLocaleString('id-ID'));
        } else {
          setBalance("Rp 0");
        }
      }
    };
    initializeData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('mojek_user');
    router.replace('/');
  };

  const MenuItem = ({ icon, title, color, onPress }: { icon: any, title: string, color: string, onPress?: () => void }) => (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: color + '20' }]}> 
        <Ionicons name={icon} size={32} color={color} />
      </View>
      <CustomText size="small" weight="bold" style={{ marginTop: 8, textAlign: 'center' }}>
        {title}
      </CustomText>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 1. HEADER AREA */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          
          {/* 1. UBAH BAGIAN INI: Mengganti <View> menjadi <TouchableOpacity> dan menambahkan ikon Profil */}
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center' }} 
            onPress={() => router.push('/profile')}
          >
            {/* Tambahan ikon bulat foto profil */}
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Ionicons name={"person" as any} size={24} color={theme.colors.primary} />
            </View>

            <View>
              <CustomText size="small" color="surface">Selamat datang,</CustomText>
              <CustomText size="large" weight="bold" color="surface">
                {userData ? userData.name : 'Memuat...'}
              </CustomText>
              
              {/* ROLE BADGE DIKEMBALIKAN */}
              <View style={styles.roleBadge}>
                <CustomText size="small" weight="bold" color="primary">
                  {userData ? userData.role : ''}
                </CustomText>
              </View>
            </View>
          </TouchableOpacity>
          
          {/* 2. BAGIAN KANAN: Tombol Riwayat (Tombol Logout dihapus karena sudah ada di Profil) */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Ionicons name={"receipt-outline" as any} size={26} color={theme.colors.surface} />
            </TouchableOpacity>
          </View>

        </View>
      </View>
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        
        {/* 2. FLOATING WALLET CARD */}
        <View style={styles.walletCard}>
          <View style={styles.walletTop}>
            <Ionicons name="wallet" size={24} color={theme.colors.primary} />
            <CustomText size="medium" weight="bold" style={{ marginLeft: 8 }}>MO-PAY</CustomText>
          </View>
          
          {balance === null ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 8, alignSelf: 'flex-start' }} />
          ) : (
            <CustomText size="heading" weight="bold" style={{ marginVertical: 8 }}>{balance}</CustomText>
          )}

          {/* WALLET ACTIONS DIKEMBALIKAN (TOP UP & BAYAR) */}
          <View style={styles.walletActions}>
            <TouchableOpacity onPress={() => router.push('/topup')} style={styles.actionButton}>
              <Ionicons name="add-circle" size={20} color={theme.colors.secondary} />
              <CustomText size="small" weight="bold" style={{ marginLeft: 4 }}>Top Up</CustomText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="scan-circle" size={20} color={theme.colors.primary} />
              <CustomText size="small" weight="bold" style={{ marginLeft: 4 }}>Bayar</CustomText>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. GRID MENU UTAMA */}
        <View style={styles.menuSection}>
          <CustomText size="large" weight="bold" style={{ marginBottom: 16 }}>Layanan MOJEK</CustomText>
          <View style={styles.menuGrid}>
            <MenuItem 
              icon="fast-food" 
              title="MO-FOOD" 
              color={theme.colors.primary} 
              onPress={() => router.push('/mofood')}
            />
            <MenuItem icon="bicycle" title="MO-RIDE" color={theme.colors.secondary} />
            <MenuItem icon="cube" title="MO-SEND" color="#F39C12" />
            <MenuItem icon="storefront" title="MO-MART" color="#3498DB" />
          </View>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 60, paddingBottom: 60,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: theme.layout.spacing.lg,
  },
  roleBadge: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 12, marginTop: 4, alignSelf: 'flex-start',
  },
  scrollArea: { flex: 1, marginTop: -40 },
  walletCard: {
    backgroundColor: theme.colors.surface, marginHorizontal: theme.layout.spacing.lg,
    padding: theme.layout.spacing.lg, borderRadius: theme.layout.radius.card,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8,
  },
  walletTop: { flexDirection: 'row', alignItems: 'center' },
  walletActions: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.colors.border,
    paddingTop: 12, marginTop: 8,
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  menuSection: { padding: theme.layout.spacing.lg, marginTop: 8 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  menuItem: { width: '22%', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 60, height: 60, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }
});