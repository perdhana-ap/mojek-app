import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import { apiGet, apiPost } from '../src/api'; 
import CustomText from '../src/components/CustomText';

export default function AdminWithdrawScreen() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mengambil daftar antrean penarikan dari Google Sheets (Wallet_Mutations)
  const fetchWithdrawals = async () => {
    try {
      const response = await apiGet('admin/withdrawals');
      if (response && response.success) {
        setWithdrawals(response.data || []);
      } else {
        Alert.alert("Gagal Memuat", response?.message || "Terjadi kesalahan.");
      }
    } catch (error) {
      console.log('Error fetch withdrawals:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchWithdrawals();
  };

  const handleApprove = (mutationId: string, name: string, amount: number, description: string) => {
    Alert.alert(
      "Konfirmasi Transfer Manual",
      `1. Pastikan Anda SUDAH mentransfer Rp ${amount.toLocaleString('id-ID')} ke rekening: \n\n"${description}" \n\n2. Lanjutkan untuk menandai selesai di sistem?`,
      [
        { text: "Belum Transfer", style: "cancel" },
        { 
          text: "Sudah, Tandai Selesai", 
          onPress: async () => {
            setIsLoading(true);
            try {
              const response = await apiPost('admin/approve_withdrawal', { mutation_id: mutationId });
              if (response && response.success) {
                Alert.alert("Sukses", `Dana untuk ${name} telah ditandai berhasil ditransfer!`);
                fetchWithdrawals();
              } else {
                setIsLoading(false);
                Alert.alert("Gagal Update", response?.message || "Sistem sibuk.");
              }
            } catch (err) {
              setIsLoading(false);
              Alert.alert("Error", "Gagal menghubungi server.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* HEADER KHUSUS WARNA HIJAU/TEAL */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <CustomText size="large" weight="bold" style={styles.headerTitle}>Antrean Pencairan Dana</CustomText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#1ABC9C']} />}
      >
        <View style={styles.infoBox}>
          <Ionicons name="warning" size={20} color="#F39C12" />
          <CustomText size="small" color="textLight" style={{ flex: 1, marginLeft: 8 }}>
            Transfer uang secara manual ke bank tujuan terlebih dahulu, baru tekan tombol "Tandai Selesai" di bawah.
          </CustomText>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#1ABC9C" style={{ marginTop: 40 }} />
        ) : withdrawals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={60} color={theme.colors.textLight} />
            <CustomText weight="bold" style={{ marginTop: 16 }}>Tidak Ada Antrean</CustomText>
            <CustomText size="small" color="textLight" style={{ textAlign: 'center', marginTop: 4 }}>
              Belum ada Mitra yang mengajukan tarik saldo hari ini.
            </CustomText>
          </View>
        ) : (
          withdrawals.map((item) => (
            <View key={item.mutation_id} style={styles.card}>
              <View style={styles.cardHeader}>
                <CustomText weight="bold" size="large" color="primary">
                  Rp {parseInt(item.amount).toLocaleString('id-ID')}
                </CustomText>
                <View style={styles.badgePending}>
                  <CustomText size="small" weight="bold" color="surface">PENDING</CustomText>
                </View>
              </View>

              <View style={styles.cardBody}>
                <CustomText weight="bold">{item.user_name} <CustomText color="textLight" size="small">({item.role})</CustomText></CustomText>
                <View style={styles.bankInfo}>
                  <Ionicons name="business" size={16} color={theme.colors.textLight} style={{ marginTop: 2 }} />
                  <CustomText size="small" style={{ marginLeft: 8, flex: 1 }}>{item.description}</CustomText>
                </View>
                <CustomText size="small" color="textLight" style={{ marginTop: 8 }}>Tgl Request: {item.created_at}</CustomText>
              </View>

              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => handleApprove(item.mutation_id, item.user_name, item.amount, item.description)}
              >
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.surface} />
                <CustomText weight="bold" color="surface" style={{ marginLeft: 8 }}>Tandai Sudah Ditransfer</CustomText>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: theme.colors.background },
  backBtn: { padding: 8, backgroundColor: theme.colors.surface, borderRadius: 20, elevation: 1 },
  headerTitle: { flex: 1, textAlign: 'center' },
  
  content: { padding: 20, paddingBottom: 100 },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF9E7', padding: 12, borderRadius: 12, marginBottom: 20 },
  
  card: { backgroundColor: theme.colors.surface, borderRadius: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  badgePending: { backgroundColor: '#F39C12', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  
  cardBody: { padding: 16 },
  bankInfo: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 12, backgroundColor: theme.colors.background, padding: 12, borderRadius: 8 },
  
  actionBtn: { flexDirection: 'row', backgroundColor: '#1ABC9C', paddingVertical: 14, justifyContent: 'center', alignItems: 'center' },
  
  emptyState: { alignItems: 'center', marginTop: 60, padding: 40, backgroundColor: theme.colors.surface, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: theme.colors.border }
});