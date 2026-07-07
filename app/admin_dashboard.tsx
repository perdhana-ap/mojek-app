import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import { apiGet, apiPost } from '../src/api'; 
import CustomText from '../src/components/CustomText';

export default function AdminDashboardScreen() {
  const [adminName, setAdminName] = useState('Admin MOJEK');
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  
  // STATE BARU UNTUK STATISTIK REAL-TIME
  const [stats, setStats] = useState({ online_users: 0, live_orders: 0 });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fungsi ambil Semua Data dari GAS (Verifikasi & Statistik)
  const fetchDashboardData = async () => {
    try {
      // 1. Ambil Data Antrean Verifikasi
      const verifyRes = await apiGet('admin/pending_users');
      if (verifyRes && verifyRes.success) {
        setPendingVerifications(verifyRes.data || []);
      }

      // 2. Ambil Data Statistik Sistem
      const statsRes = await apiGet('admin/stats');
      if (statsRes && statsRes.success) {
        setStats(statsRes.data || { online_users: 0, live_orders: 0 });
      }

    } catch (error) {
      console.log('Error memuat dashboard:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      const dataString = await AsyncStorage.getItem('mojek_user');
      if (dataString) {
        const user = JSON.parse(dataString);
        if (user.name) setAdminName(user.name); 
      }
    };
    loadUserData();
    fetchDashboardData(); 
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('mojek_user');
    router.replace('/');
  };

  const handleApprove = async (userId: string, name: string) => {
    Alert.alert(
      "Konfirmasi Aktifkan",
      `Setujui pendaftaran dan aktifkan akun untuk ${name}?`,
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Ya, Setujui", 
          onPress: async () => {
            setIsLoading(true);
            try {
              const response = await apiPost('admin/approve', { user_id: userId });
              if (response && response.success) {
                Alert.alert("Sukses", `Akun ${name} kini telah aktif!`);
                fetchDashboardData(); 
              } else {
                setIsLoading(false);
                Alert.alert("Gagal menyetujui", response?.message || "Terjadi kendala.");
              }
            } catch (err) {
              setIsLoading(false);
              Alert.alert("Error", "Gagal mengirim data.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* HEADER AREA */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <CustomText size="small" color="surface">Control Center</CustomText>
            <CustomText size="large" weight="bold" color="surface">
              {adminName}
            </CustomText>
            <View style={styles.roleBadge}>
              <CustomText size="small" weight="bold" color="primary">SUPER ADMIN</CustomText>
            </View>
          </View>
          
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={28} color={theme.colors.surface} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollArea} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
      >
        
        {/* STATISTIK RINGKASAN */}
        <View style={{ paddingHorizontal: theme.layout.spacing.lg, marginBottom: 12 }}>
          <CustomText weight="bold" size="medium">Ringkasan Sistem Hari Ini</CustomText>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={28} color={theme.colors.primary} style={{ marginBottom: 8 }} />
            {/* ANGKA ONLINE DINAMIS */}
            <CustomText size="large" weight="bold">{stats.online_users} Akun</CustomText>
            <CustomText size="small" color="textLight">Aktif & Terdaftar</CustomText>
          </View>
          
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => router.push('/admin_live_orders')}
          >
            <Ionicons name="swap-horizontal" size={28} color="#F39C12" style={{ marginBottom: 8 }} />
            <CustomText size="large" weight="bold">{stats.live_orders} Order</CustomText>
            <CustomText size="small" color="textLight">Pesanan Berjalan</CustomText>
          </TouchableOpacity>
        </View>

        {/* MENU MANAJEMEN */}
        <View style={styles.section}>
          <CustomText weight="bold" size="medium" style={{ marginBottom: 16 }}>Menu Manajemen</CustomText>
          
          <View style={styles.menuGrid}>
            {/* UBAH BARIS INI */}
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin_revenue')}>
              <View style={[styles.menuIconBox, { backgroundColor: '#EAF2F8' }]}>
                <Ionicons name="wallet" size={24} color="#3498DB" />
              </View>
              <CustomText weight="bold" style={{ marginTop: 8 }}>Pendapatan</CustomText>
            </TouchableOpacity>

            {/* ARAHKAN KE HALAMAN WITHDRAW BARU */}
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin_withdraw')}>
              <View style={[styles.menuIconBox, { backgroundColor: '#E8F8F5' }]}>
                <Ionicons name="cash" size={24} color="#1ABC9C" />
              </View>
              <CustomText weight="bold" style={{ marginTop: 8 }}>Tarik Dana</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin_promo')}>
              <View style={[styles.menuIconBox, { backgroundColor: '#FEF9E7' }]}>
                <Ionicons name="pricetag" size={24} color="#F1C40F" />
              </View>
              <CustomText weight="bold" style={{ marginTop: 8 }}>Promo</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin_settings')}>
              <View style={[styles.menuIconBox, { backgroundColor: '#F4F6F7' }]}>
                <Ionicons name="settings" size={24} color="#7F8C8D" />
              </View>
              <CustomText weight="bold" style={{ marginTop: 8 }}>Sistem</CustomText>
            </TouchableOpacity>
          </View>
        </View>

        {/* DAFTAR PERMINTAAN VERIFIKASI DARI SHEET */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CustomText weight="bold" size="medium">Antrean Verifikasi Akun</CustomText>
            {!isLoading && pendingVerifications.length > 0 && (
              <View style={styles.badgeCount}>
                <CustomText size="small" color="surface" weight="bold">{pendingVerifications.length}</CustomText>
              </View>
            )}
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 30 }} />
          ) : pendingVerifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done-circle" size={48} color="#27AE60" />
              <CustomText weight="bold" style={{ marginTop: 12 }}>Semua bersih!</CustomText>
              <CustomText size="small" color="textLight" style={{ textAlign: 'center', marginTop: 4 }}>
                Tidak ada antrean pendaftaran baru saat ini.
              </CustomText>
            </View>
          ) : (
            pendingVerifications.map((item) => (
              <View key={item.user_id} style={styles.verifyCard}>
                <View style={styles.verifyHeader}>
                  <View style={{ flex: 1 }}>
                    <CustomText weight="bold" size="medium">{item.name}</CustomText>
                    <CustomText size="small" color="textLight">{item.phone}</CustomText>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}>
                  <CustomText size="small" color="textLight">Mendaftar sebagai: </CustomText>
                  <CustomText size="small" weight="bold" color="primary">{String(item.role).toUpperCase()}</CustomText>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.btnApprove} onPress={() => handleApprove(item.user_id, item.name)}>
                    <CustomText size="small" color="surface" weight="bold" style={{ textAlign: 'center' }}>Setujui & Aktifkan</CustomText>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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
    paddingTop: 60, paddingBottom: 40,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: theme.layout.spacing.lg,
  },
  roleBadge: {
    backgroundColor: theme.colors.surface, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 12, marginTop: 8, alignSelf: 'flex-start',
  },
  scrollArea: { flex: 1, paddingTop: 16 },
  
  statsGrid: {
    flexDirection: 'row', paddingHorizontal: theme.layout.spacing.lg, 
    justifyContent: 'space-between', marginBottom: 24,
  },
  statCard: {
    backgroundColor: theme.colors.surface, flex: 1, padding: 16, borderRadius: 16,
    marginHorizontal: 4, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
    alignItems: 'center', justifyContent: 'center'
  },
  
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 8 },
  menuItem: { 
    width: '48%', backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, 
    marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border 
  },
  menuIconBox: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },

  section: { paddingHorizontal: theme.layout.spacing.lg, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  badgeCount: { backgroundColor: theme.colors.danger, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 },
  
  verifyCard: {
    backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, marginBottom: 12,
    borderLeftWidth: 4, borderLeftColor: theme.colors.primary,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  verifyHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingBottom: 8 },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  btnApprove: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: theme.colors.primary },
  emptyState: { backgroundColor: theme.colors.surface, padding: 32, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed' },
});