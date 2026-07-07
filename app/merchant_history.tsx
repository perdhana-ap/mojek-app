import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import CustomText from '../src/components/CustomText';

export default function MerchantHistoryScreen() {
  const [activeTab, setActiveTab] = useState('selesai');

  // State real untuk riwayat transaksi toko dari database
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [cancelledOrders, setCancelledOrders] = useState<any[]>([]);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name={"arrow-back" as any} size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <CustomText size="large" weight="bold" style={styles.headerTitle}>Riwayat Transaksi</CustomText>
        <View style={{ width: 40 }} />
      </View>

      {/* CUSTOM TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'selesai' && styles.tabActive]}
          onPress={() => setActiveTab('selesai')}
        >
          <CustomText weight="bold" color={activeTab === 'selesai' ? 'primary' : 'textLight'}>
            Sukses Selesai
          </CustomText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'batal' && styles.tabActiveDanger]}
          onPress={() => setActiveTab('batal')}
        >
          <CustomText weight="bold" color={activeTab === 'batal' ? 'danger' : 'textLight'}>
            Dibatalkan
          </CustomText>
        </TouchableOpacity>
      </View>

      {/* DAFTAR TRANSAKSI */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
        
        {/* TAB: SELESAI */}
        {activeTab === 'selesai' && (
          completedOrders.map((order) => (
            <View key={order.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={"checkmark-circle" as any} size={18} color="#27AE60" />
                  <CustomText weight="bold" style={{ marginLeft: 8 }}>{order.customer}</CustomText>
                </View>
                <CustomText size="small" color="textLight">{order.time}</CustomText>
              </View>
              
              <View style={styles.cardBody}>
                <CustomText size="small" color="textLight" style={{ flex: 1, marginRight: 16 }}>{order.items}</CustomText>
                <CustomText weight="bold" color="primary">Rp {order.total.toLocaleString('id-ID')}</CustomText>
              </View>
              
              <View style={styles.cardFooter}>
                <CustomText size="small" color="textLight">ID: {order.id}</CustomText>
                <CustomText size="small" weight="bold" color="success">Dana Masuk</CustomText>
              </View>
            </View>
          ))
        )}

        {/* TAB: BATAL */}
        {activeTab === 'batal' && (
          cancelledOrders.length > 0 ? (
            cancelledOrders.map((order) => (
              <View key={order.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name={"close-circle" as any} size={18} color={theme.colors.danger} />
                    <CustomText weight="bold" style={{ marginLeft: 8 }}>{order.customer}</CustomText>
                  </View>
                  <CustomText size="small" color="textLight">{order.time}</CustomText>
                </View>
                
                <View style={styles.cardBody}>
                  <CustomText size="small" color="textLight" style={{ flex: 1, marginRight: 16 }}>{order.items}</CustomText>
                  <CustomText weight="bold">Rp {order.total.toLocaleString('id-ID')}</CustomText>
                </View>
                
                <View style={styles.cardFooter}>
                  <CustomText size="small" color="textLight">ID: {order.id}</CustomText>
                  <CustomText size="small" weight="bold" color="danger">{order.status}</CustomText>
                </View>
              </View>
            ))
          ) : (
            <CustomText color="textLight" style={{ textAlign: 'center', marginTop: 40 }}>
              Tidak ada pesanan yang dibatalkan.
            </CustomText>
          )
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
  tabActiveDanger: { borderBottomWidth: 3, borderBottomColor: theme.colors.danger },
  
  listContainer: { padding: theme.layout.spacing.lg, paddingBottom: 40 },
  card: {
    backgroundColor: theme.colors.surface, borderRadius: 16, padding: 16, marginBottom: 16,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingBottom: 12, marginBottom: 12 },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});