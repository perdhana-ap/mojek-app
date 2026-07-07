import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import { apiGet } from '../src/api'; 
import CustomText from '../src/components/CustomText';

export default function AdminLiveOrdersScreen() {
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLiveOrders = async () => {
    try {
      const response = await apiGet('admin/live_orders');
      if (response && response.success) {
        setLiveOrders(response.data || []);
      } else {
        Alert.alert("Gagal", response?.message || "Gagal memuat data live order.");
      }
    } catch (error) {
      console.log('Error fetch live orders:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveOrders();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchLiveOrders();
  };

  // Helper untuk mewarnai badge status
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return '#F39C12'; // Orange
      case 'PREPARING': return '#3498DB'; // Biru
      case 'DRIVER_ASSIGNED': return '#9B59B6'; // Ungu
      case 'PICKED_UP': return '#1ABC9C'; // Teal
      default: return theme.colors.textLight;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      
      {/* HEADER KHUSUS WARNA GELAP (RADAR MODE) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.surface} />
        </TouchableOpacity>
        <CustomText size="large" weight="bold" color="surface" style={styles.headerTitle}>Radar Transaksi Live</CustomText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#2C3E50']} />}
      >
        <View style={styles.infoBox}>
          <Ionicons name="pulse" size={24} color="#E74C3C" />
          <CustomText size="small" color="textLight" style={{ flex: 1, marginLeft: 8 }}>
            Halaman ini menampilkan seluruh pesanan yang sedang berjalan secara real-time. Tarik layar untuk menyegarkan radar.
          </CustomText>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#2C3E50" style={{ marginTop: 40 }} />
        ) : liveOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="planet-outline" size={60} color={theme.colors.textLight} />
            <CustomText weight="bold" style={{ marginTop: 16 }}>Radar Bersih</CustomText>
            <CustomText size="small" color="textLight" style={{ textAlign: 'center', marginTop: 4 }}>
              Saat ini tidak ada pesanan aktif yang sedang berlangsung.
            </CustomText>
          </View>
        ) : (
          liveOrders.map((order) => (
            <View key={order.order_id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <CustomText weight="bold">{order.order_id}</CustomText>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.order_status) }]}>
                  <CustomText size="small" weight="bold" color="surface">{order.order_status}</CustomText>
                </View>
              </View>

              <View style={styles.orderBody}>
                <View style={styles.row}>
                  <Ionicons name="person" size={16} color={theme.colors.textLight} />
                  <CustomText size="small" style={{ marginLeft: 8 }}>Customer: <CustomText weight="bold">{order.customer_name}</CustomText></CustomText>
                </View>
                <View style={styles.row}>
                  <Ionicons name="storefront" size={16} color={theme.colors.textLight} />
                  <CustomText size="small" style={{ marginLeft: 8 }}>Toko: <CustomText weight="bold">{order.merchant_id}</CustomText></CustomText>
                </View>
                <View style={styles.row}>
                  <Ionicons name="bicycle" size={16} color={theme.colors.textLight} />
                  <CustomText size="small" style={{ marginLeft: 8 }}>Driver: <CustomText weight="bold">{order.driver_id || 'Mencari Driver...'}</CustomText></CustomText>
                </View>
              </View>

              <View style={styles.orderFooter}>
                <CustomText size="small" color="textLight">{order.created_at}</CustomText>
                <TouchableOpacity onPress={() => alert('Fitur Batal Paksa sedang dikembangkan.')}>
                  <CustomText size="small" weight="bold" color="danger">Batalkan Paksa</CustomText>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#2C3E50' },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, textAlign: 'center' },
  
  content: { padding: 20, paddingBottom: 100 },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, marginBottom: 20, elevation: 1 },
  
  orderCard: { backgroundColor: theme.colors.surface, borderRadius: 16, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, overflow: 'hidden' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#F8F9F9', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  
  orderBody: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.background },
  
  emptyState: { alignItems: 'center', marginTop: 60, padding: 40, backgroundColor: theme.colors.surface, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: theme.colors.border }
});