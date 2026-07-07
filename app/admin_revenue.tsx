import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import { apiGet } from '../src/api'; 
import CustomText from '../src/components/CustomText';

export default function AdminRevenueScreen() {
  const [revenueData, setRevenueData] = useState({ total_revenue: 0, today_revenue: 0, history: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRevenue = async () => {
    try {
      const response = await apiGet('admin/revenue');
      if (response && response.success) {
        setRevenueData(response.data);
      }
    } catch (error) {
      console.log('Error fetch revenue:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchRevenue();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2980B9" />
      
      {/* HEADER BIRU KEUANGAN */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.surface} />
          </TouchableOpacity>
          <CustomText size="large" weight="bold" color="surface">Buku Kas Platform</CustomText>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.balanceContainer}>
          <CustomText color="surface" style={{ opacity: 0.9 }}>Total Pendapatan Bersih (Rp)</CustomText>
          {isLoading ? (
             <ActivityIndicator color="white" style={{ marginTop: 8 }} />
          ) : (
             <CustomText size="heading" weight="bold" color="surface" style={{ marginTop: 4, fontSize: 36 }}>
               {revenueData.total_revenue.toLocaleString('id-ID')}
             </CustomText>
          )}
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#2980B9']} />}
      >
        <View style={styles.todayCard}>
          <View style={{ flex: 1 }}>
            <CustomText size="small" color="textLight">Masuk Hari Ini</CustomText>
            <CustomText weight="bold" size="large" color="primary" style={{ marginTop: 4 }}>
              + Rp {revenueData.today_revenue.toLocaleString('id-ID')}
            </CustomText>
          </View>
          <View style={styles.iconBox}>
            <Ionicons name="trending-up" size={24} color="#27AE60" />
          </View>
        </View>

        <CustomText weight="bold" size="medium" style={{ marginTop: 24, marginBottom: 16 }}>Riwayat Biaya Layanan</CustomText>
        
        {isLoading ? (
          <ActivityIndicator size="large" color="#2980B9" style={{ marginTop: 20 }} />
        ) : revenueData.history.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={theme.colors.textLight} />
            <CustomText size="small" color="textLight" style={{ marginTop: 12 }}>Belum ada pesanan yang selesai.</CustomText>
          </View>
        ) : (
          revenueData.history.map((trx: any, index: number) => (
            <View key={index} style={styles.trxRow}>
              <View style={styles.trxIcon}>
                <Ionicons name="swap-horizontal" size={20} color="#2980B9" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <CustomText weight="bold">{trx.order_id}</CustomText>
                <CustomText size="small" color="textLight">{trx.date}</CustomText>
              </View>
              <CustomText weight="bold" color="primary">
                +Rp {trx.fee.toLocaleString('id-ID')}
              </CustomText>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { backgroundColor: '#2980B9', paddingTop: 50, paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  backBtn: { padding: 4 },
  balanceContainer: { alignItems: 'center', marginTop: 30 },
  
  content: { padding: 20, paddingBottom: 100 },
  todayCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: 20, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, marginTop: -40 },
  iconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EAFAF1', alignItems: 'center', justifyContent: 'center' },
  
  trxRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border },
  trxIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EAF2F8', alignItems: 'center', justifyContent: 'center' },
  
  emptyState: { alignItems: 'center', padding: 30, backgroundColor: theme.colors.surface, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed' }
});