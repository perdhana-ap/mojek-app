import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import CustomText from '../src/components/CustomText';

export default function HistoryScreen() {
  // State untuk menentukan tab mana yang aktif ('berjalan' atau 'selesai')
  const [activeTab, setActiveTab] = useState('berjalan');

  // State real untuk riwayat pesanan (sementara dikosongkan menunggu integrasi API)
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name={"arrow-back" as any} size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <CustomText size="large" weight="bold" style={styles.headerTitle}>Riwayat Pesanan</CustomText>
        <View style={{ width: 40 }} />
      </View>

      {/* CUSTOM TABS (Sedang Berjalan | Selesai) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'berjalan' && styles.tabActive]}
          onPress={() => setActiveTab('berjalan')}
        >
          <CustomText weight="bold" color={activeTab === 'berjalan' ? 'primary' : 'textLight'}>
            Sedang Berjalan
          </CustomText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'selesai' && styles.tabActive]}
          onPress={() => setActiveTab('selesai')}
        >
          <CustomText weight="bold" color={activeTab === 'selesai' ? 'primary' : 'textLight'}>
            Selesai
          </CustomText>
        </TouchableOpacity>
      </View>

      {/* DAFTAR PESANAN */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
        {activeTab === 'berjalan' ? (
          activeOrders.length > 0 ? (
            activeOrders.map((order) => (
              <TouchableOpacity 
                key={order.id} 
                style={styles.card}
                activeOpacity={0.7}
                // Jika diklik, arahkan kembali ke layar pelacakan
                onPress={() => router.push('/order_status')}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name={"restaurant" as any} size={16} color={theme.colors.primary} />
                    <CustomText weight="bold" style={{ marginLeft: 8 }}>{order.merchant}</CustomText>
                  </View>
                  <CustomText size="small" color="textLight">{order.date}</CustomText>
                </View>
                
                <View style={styles.cardBody}>
                  <CustomText color="textLight" size="small">{order.item}</CustomText>
                  <CustomText weight="bold">Rp {order.total.toLocaleString('id-ID')}</CustomText>
                </View>
                
                <View style={styles.cardFooter}>
                  <CustomText size="small" weight="bold" color="secondary">{order.status}</CustomText>
                  <View style={styles.actionBtn}>
                    <CustomText size="small" color="surface" weight="bold">Lacak</CustomText>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <CustomText color="textLight" style={{ textAlign: 'center', marginTop: 40 }}>
              Tidak ada pesanan berjalan.
            </CustomText>
          )
        ) : (
          completedOrders.map((order) => (
            <TouchableOpacity key={order.id} style={styles.card} activeOpacity={0.9}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={"checkmark-circle" as any} size={16} color="#27AE60" />
                  <CustomText weight="bold" style={{ marginLeft: 8 }}>{order.merchant}</CustomText>
                </View>
                <CustomText size="small" color="textLight">{order.date}</CustomText>
              </View>
              
              <View style={styles.cardBody}>
                <CustomText color="textLight" size="small">{order.item}</CustomText>
                <CustomText weight="bold">Rp {order.total.toLocaleString('id-ID')}</CustomText>
              </View>
              
              <View style={styles.cardFooter}>
                <CustomText size="small" weight="bold" color="textLight">Pesanan Selesai</CustomText>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.primary }]}>
                  <CustomText size="small" color="primary" weight="bold">Pesan Lagi</CustomText>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
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
  
  tabContainer: {
    flexDirection: 'row', backgroundColor: theme.colors.surface, 
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  tabButton: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: theme.colors.primary },
  
  listContainer: { padding: theme.layout.spacing.lg, paddingBottom: 40 },
  card: {
    backgroundColor: theme.colors.surface, borderRadius: 16, padding: 16, marginBottom: 16,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingBottom: 12, marginBottom: 12 },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 }
});