import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, StatusBar, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import { apiPost } from '../src/api'; // TAMBAHKAN BARIS INI
import CustomText from '../src/components/CustomText';

const { width } = Dimensions.get('window');

export default function DriverDashboardScreen() {
  const [driverName, setDriverName] = useState('Memuat...');
  const [balance, setBalance] = useState('Memuat...'); // State untuk saldo asli
  const [isOnline, setIsOnline] = useState(false);
  const [hasIncomingOrder, setHasIncomingOrder] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const dataString = await AsyncStorage.getItem('mojek_user');
      if (dataString) {
        const user = JSON.parse(dataString);
        setDriverName(user.name); 

        // Tembak API untuk ambil saldo realtime driver
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

  // Simulasi mencari pesanan: Muncul orderan 3 detik setelah Online
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isOnline) {
      timer = setTimeout(() => {
        setHasIncomingOrder(true);
      }, 3000);
    } else {
      setHasIncomingOrder(false);
    }
    return () => clearTimeout(timer);
  }, [isOnline]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('mojek_user');
    router.replace('/');
  };

  const handleTerimaPesanan = () => {
    router.push('/driver_active_order');
    setHasIncomingOrder(false);
  };

  const handleTolakPesanan = () => {
    setHasIncomingOrder(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* 1. AREA PETA (MAP PLACEHOLDER) */}
      <View style={styles.mapArea}>
        {/* Ilustrasi background map */}
        <Ionicons name={"map-outline" as any} size={width * 0.8} color={theme.colors.border} style={styles.mapIcon} />
        
        {/* Indikator Pencarian (Radar Simulasi) */}
        {isOnline && !hasIncomingOrder && (
          <View style={styles.radarContainer}>
            <View style={styles.radarCircle} />
            <Ionicons name={"radio" as any} size={40} color={theme.colors.primary} />
            <CustomText weight="bold" style={{ marginTop: 8 }}>Mencari Pesanan...</CustomText>
          </View>
        )}

        {!isOnline && (
          <View style={styles.offlineContainer}>
            <Ionicons name={"moon" as any} size={40} color={theme.colors.textLight} />
            <CustomText weight="bold" color="textLight" style={{ marginTop: 8 }}>Anda Sedang Offline</CustomText>
          </View>
        )}
      </View>

      {/* HEADER MENGAMBANG DI ATAS PETA */}
      <View style={styles.headerFloating}>
        <View style={styles.headerProfile}>
          <View style={styles.avatar}>
            <Ionicons name={"person" as any} size={20} color={theme.colors.surface} />
          </View>
          <View>
            <CustomText size="small" color="textLight">Mitra Pengemudi</CustomText>
            <CustomText weight="bold">{driverName}</CustomText>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name={"log-out-outline" as any} size={24} color={theme.colors.danger} />
        </TouchableOpacity>
      </View>

      {/* POPUP PESANAN MASUK MENGAMBANG (Hanya muncul jika ada order) */}
      {hasIncomingOrder && (
        <View style={styles.incomingOrderCard}>
          <View style={styles.incomingHeader}>
            <CustomText weight="bold" color="surface" style={{ flex: 1 }}>PESANAN MASUK!</CustomText>
            <CustomText weight="bold" color="surface">15 Detik</CustomText>
          </View>
          
          <View style={styles.incomingBody}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name={"restaurant" as any} size={20} color={theme.colors.primary} />
              <CustomText weight="bold" style={{ marginLeft: 8 }}>Ayam Geprek Bensu</CustomText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name={"location" as any} size={20} color="#F39C12" />
              <CustomText style={{ marginLeft: 8 }} color="textLight">Antar ke: Jl. Merdeka No. 45</CustomText>
            </View>
            
            <View style={styles.feeRow}>
              <CustomText color="textLight">Estimasi Pendapatan</CustomText>
              <CustomText size="large" weight="bold" color="success">Rp 12.000</CustomText>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.btnAbaikan} onPress={handleTolakPesanan}>
                <CustomText weight="bold" color="textLight" style={{ textAlign: 'center' }}>Abaikan</CustomText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnTerima} onPress={handleTerimaPesanan}>
                <CustomText weight="bold" color="surface" style={{ textAlign: 'center' }}>Terima Order</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* BOTTOM SHEET (KONTROL & STATISTIK) */}
      <View style={styles.bottomSheet}>
        {/* TOGGLE ONLINE/OFFLINE */}
        <View style={styles.toggleCard}>
          <View>
            <CustomText size="large" weight="bold" color={isOnline ? 'primary' : 'textLight'}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </CustomText>
            <CustomText size="small" color="textLight">
              {isOnline ? 'Siap menerima pesanan' : 'Geser untuk mulai bekerja'}
            </CustomText>
          </View>
          <Switch
            trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
            thumbColor={isOnline ? theme.colors.primary : "#f4f3f4"}
            onValueChange={() => setIsOnline(!isOnline)}
            value={isOnline}
            style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
          />
        </View>

        {/* STATISTIK HARI INI */}
        <View style={styles.profileRow}>
          <CustomText size="large" weight="bold">Halo, {driverName}</CustomText>
          <CustomText color="textLight" size="small">ID: DRV-7821</CustomText>
        </View>

        {/* ROW STATISTIK - 3 KOTAK BERSEBELAHAN */}
        <View style={styles.statsRow}>
          {/* TARIK UANG */}
          <TouchableOpacity 
            style={[styles.statBox, styles.withdrawBox]}
            onPress={() => router.push('/withdraw')}
          >
            <Ionicons name={"wallet" as any} size={22} color={theme.colors.primary} />
            <CustomText weight="bold" color="primary" style={{ marginTop: 4 }}>{balance}</CustomText>
            <CustomText size="small" color="primary" weight="bold" style={{ marginTop: 2 }}>Tarik Uang &gt;</CustomText>
          </TouchableOpacity>

          {/* RATING */}
          <View style={styles.statBox}>
            <Ionicons name={"star" as any} size={22} color="#F1C40F" />
            {/* Ubah jadi 0 dulu sampai fitur rating siap */}
            <CustomText weight="bold" style={{ marginTop: 4 }}>0</CustomText> 
            <CustomText size="small" color="textLight">Rating Anda</CustomText>
          </View>

          {/* ORDER HARI INI */}
          <View style={styles.statBox}>
            <Ionicons name={"bicycle" as any} size={22} color={theme.colors.textLight} />
            {/* Ubah jadi 0 dulu sampai fitur hitung order siap */}
            <CustomText weight="bold" style={{ marginTop: 4 }}>0</CustomText>
            <CustomText size="small" color="textLight">Order Hari Ini</CustomText>
          </View>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAEAEA' },
  
  mapArea: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  mapIcon: { position: 'absolute', opacity: 0.2 },
  radarContainer: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.8)', padding: 20, borderRadius: 100 },
  radarCircle: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: theme.colors.primary, opacity: 0.1 },
  offlineContainer: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.8)', padding: 20, borderRadius: 24 },

  headerFloating: {
    position: 'absolute', top: 50, left: 20, right: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerProfile: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface,
    padding: 10, borderRadius: 30, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  logoutBtn: { backgroundColor: theme.colors.surface, width: 45, height: 45, borderRadius: 25, alignItems: 'center', justifyContent: 'center', elevation: 4 },

  incomingOrderCard: {
    position: 'absolute', top: '25%', left: 20, right: 20,
    backgroundColor: theme.colors.surface, borderRadius: 20, overflow: 'hidden',
    elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 10, zIndex: 10,
  },
  incomingHeader: { backgroundColor: theme.colors.primary, padding: 16, flexDirection: 'row', alignItems: 'center' },
  incomingBody: { padding: 20 },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.border, marginBottom: 16 },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  btnAbaikan: { flex: 1, paddingVertical: 14, backgroundColor: theme.colors.background, borderRadius: 12, marginRight: 8 },
  btnTerima: { flex: 2, paddingVertical: 14, backgroundColor: theme.colors.primary, borderRadius: 12, marginLeft: 8 },

  // GAYA UNTUK BOTTOM SHEET & STATISTIK DRIVER
  bottomSheet: {
    backgroundColor: theme.colors.surface, 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30,
    padding: 24, 
    paddingBottom: 40, 
    elevation: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: -5 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 10,
  },
  profileRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 16 
  },
  
  // INI KUNCI AGAR KOTAKNYA RAPI DAN BERJARAK
  statBox: {
    flex: 1, // Membagi lebar sama rata
    backgroundColor: theme.colors.background, // Warna abu-abu terang
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4, // Memberi jarak antar kotak
  },
  
  withdrawBox: {
    backgroundColor: theme.colors.primary + '15', // Warna ungu transparan
    borderWidth: 1,
    borderColor: theme.colors.primary, // Garis tepi ungu
  },
  
  toggleCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: theme.colors.background, padding: 20, borderRadius: 20, marginBottom: 24,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  

});