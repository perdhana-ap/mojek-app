import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import CustomText from '../src/components/CustomText';

export default function MerchantDashboardScreen() {
  const [merchantName, setMerchantName] = useState('Memuat...');
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      const dataString = await AsyncStorage.getItem('mojek_user');
      if (dataString) {
        const user = JSON.parse(dataString);
        setMerchantName(user.name); 
      }
    };
    loadUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('mojek_user');
    router.replace('/');
  };

  // State real untuk antrean pesanan toko
  const [incomingOrders, setIncomingOrders] = useState<any[]>([]);
  const [processingOrders, setProcessingOrders] = useState<any[]>([]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryDark} />
      
      {/* 1. HEADER AREA */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <CustomText size="small" color="surface">Dashboard Toko</CustomText>
            <CustomText size="large" weight="bold" color="surface">
              {merchantName}
            </CustomText>
            
            <View style={styles.roleBadge}>
              <CustomText size="small" weight="bold" color="primary">MERCHANT</CustomText>
            </View>
          </View>
          
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name={"log-out-outline" as any} size={28} color={theme.colors.surface} />
          </TouchableOpacity>
        </View>

        {/* TOGGLE BUKA/TUTUP TOKO */}
        <View style={styles.storeStatusCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons 
              name={isStoreOpen ? "storefront" as any : "storefront-outline" as any} 
              size={24} 
              color={isStoreOpen ? theme.colors.primary : theme.colors.textLight} 
            />
            <View style={{ marginLeft: 12 }}>
              <CustomText weight="bold">{isStoreOpen ? 'Toko Buka' : 'Toko Tutup'}</CustomText>
              <CustomText size="small" color="textLight">
                {isStoreOpen ? 'Menerima pesanan masuk' : 'Pelanggan tidak bisa memesan'}
              </CustomText>
            </View>
          </View>
          <Switch
            trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
            thumbColor={isStoreOpen ? theme.colors.primary : "#f4f3f4"}
            onValueChange={() => setIsStoreOpen(!isStoreOpen)}
            value={isStoreOpen}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        
        {/* NAVIGASI CEPAT MERCHANT (Diselaraskan sejajar dengan Statistik) */}
        <View style={styles.gridRow}>
          <TouchableOpacity style={styles.navCard} onPress={() => router.push('/merchant_menu')}>
            <Ionicons name={"restaurant" as any} size={24} color={theme.colors.primary} style={{ marginBottom: 8 }} />
            <CustomText size="small" weight="bold" style={{ textAlign: 'center' }}>Kelola Menu</CustomText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navCard} onPress={() => router.push('/merchant_history')}>
            <Ionicons name={"time" as any} size={24} color="#F39C12" style={{ marginBottom: 8 }} />
            <CustomText size="small" weight="bold" style={{ textAlign: 'center' }}>Riwayat</CustomText>
          </TouchableOpacity>
        </View>

        {/* RINGKASAN TOKO */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name={"cash" as any} size={24} color={theme.colors.primary} />
          <CustomText weight="bold" size="large" style={{ marginTop: 8 }}>Rp 450.000</CustomText>
          <CustomText size="small" color="textLight">Pendapatan Hari Ini</CustomText>
          
          {/* 🟢 TAMBAHKAN TOMBOL WITHDRAW DI SINI */}
          <TouchableOpacity 
            style={styles.inlineWithdrawBtn} 
            onPress={() => router.push('/withdraw')}
          >
            <CustomText size="small" weight="bold" color="primary">Tarik Saldo</CustomText>
            <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name={"checkmark-done" as any} size={24} color="#27AE60" />
          <CustomText weight="bold" size="large" style={{ marginTop: 8 }}>12</CustomText>
          <CustomText size="small" color="textLight">Pesanan Selesai</CustomText>
        </View>
      </View>

        {/* PESANAN BARU */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CustomText weight="bold" size="medium">Pesanan Baru</CustomText>
            <View style={styles.badgeCount}>
              <CustomText size="small" color="surface" weight="bold"> {incomingOrders.length} </CustomText>
            </View>
          </View>

          {incomingOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <CustomText weight="bold">{order.customer}</CustomText>
                <CustomText size="small" color="textLight">{order.time}</CustomText>
              </View>
              <CustomText size="small" color="textLight" style={{ marginVertical: 8 }}>{order.item}</CustomText>
              <CustomText weight="bold" color="primary">Rp {order.total.toLocaleString('id-ID')}</CustomText>
              
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.btnTolak}>
                  <CustomText size="small" color="danger" weight="bold" style={{ textAlign: 'center' }}>Tolak</CustomText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnTerima}>
                  <CustomText size="small" color="surface" weight="bold" style={{ textAlign: 'center' }}>Terima Pesanan</CustomText>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* SEDANG DISIAPKAN */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CustomText weight="bold" size="medium">Sedang Disiapkan</CustomText>
            <View style={styles.badgeCount}>
              <CustomText size="small" color="surface" weight="bold"> {processingOrders.length} </CustomText>
            </View>
          </View>

          {processingOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <CustomText weight="bold">{order.customer}</CustomText>
                <CustomText size="small" color="textLight">{order.time}</CustomText>
              </View>
              <CustomText size="small" color="textLight" style={{ marginVertical: 8 }}>{order.item}</CustomText>
              
              <TouchableOpacity style={styles.btnSiap}>
                <CustomText size="small" color="surface" weight="bold" style={{ textAlign: 'center' }}>Makanan Siap Diambil</CustomText>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: theme.colors.primary, paddingTop: 60, paddingBottom: 60,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: theme.layout.spacing.lg,
  },
  roleBadge: {
    backgroundColor: "#F39C12", paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 12, marginTop: 4, alignSelf: 'flex-start',
  },
  storeStatusCard: {
    backgroundColor: theme.colors.surface, marginHorizontal: theme.layout.spacing.lg,
    marginTop: 20, padding: 16, borderRadius: 16, flexDirection: 'row', 
    justifyContent: 'space-between', alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  scrollArea: { flex: 1, marginTop: -20 },
  
  // PERBAIKAN GRID & ALIGNMENT
  gridRow: {
    flexDirection: 'row', paddingHorizontal: theme.layout.spacing.lg, 
    justifyContent: 'space-between', marginBottom: 12,
  },
  navCard: {
    backgroundColor: theme.colors.surface, flex: 1, padding: 16, borderRadius: 16,
    marginHorizontal: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, shadowRadius: 2, alignItems: 'center', justifyContent: 'center'
  },
  statsContainer: { flexDirection: 'row', paddingHorizontal: theme.layout.spacing.lg, marginBottom: 24, gap: 12 },
  
  statCard: {
    backgroundColor: theme.colors.surface, flex: 1, padding: 16, borderRadius: 16,
    marginHorizontal: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, shadowRadius: 2, justifyContent: 'center'
  },
  inlineWithdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '15',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 12,
    justifyContent: 'center'
  },

  section: { paddingHorizontal: theme.layout.spacing.lg, marginTop: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  badgeCount: {
    backgroundColor: theme.colors.danger, borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8
  },
  orderCard: {
    backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingBottom: 8 },
  
  // PERBAIKAN TOMBOL AGAR CENTER
  actionRow: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  btnTolak: { 
    paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, 
    backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.danger,
    alignItems: 'center', justifyContent: 'center'
  },
  btnTerima: { 
    flex: 1, paddingVertical: 12, marginLeft: 12, borderRadius: 12, 
    backgroundColor: theme.colors.primary, 
    alignItems: 'center', justifyContent: 'center'
  },
  btnSiap: { 
    width: '100%', paddingVertical: 12, marginTop: 12, borderRadius: 12, 
    backgroundColor: "#27AE60", 
    alignItems: 'center', justifyContent: 'center'
  }
  
});