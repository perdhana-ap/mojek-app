import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import CustomText from '../src/components/CustomText';
import { apiGet } from '../src/api'; 

export default function MoFoodScreen() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. FUNGSI AMBIL DATA TOKO DARI GOOGLE SHEETS
  const fetchMerchants = async () => {
    try {
      const res = await apiGet('customer/merchants');
      if (res && res.success) {
        setMerchants(res.data || []);
      }
    } catch (error) {
      console.log('Error fetch merchants:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchMerchants();
  };

  // 2. LOGIKA PENCARIAN (SEARCH)
  const filteredMerchants = merchants.filter(m =>
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 3. NAVIGASI KE DETAIL TOKO (Fixing Route Name & Parameter)
  const goToDetail = (merchant: any) => {
    router.push({
      // Pastikan nama ini sesuai dengan nama file Anda: merchant_detail.tsx
      pathname: '/merchant_detail', 
      params: { 
        id: merchant.merchant_id, // melempar id
        name: merchant.name       // melempar nama toko
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <CustomText size="large" weight="bold" style={styles.headerTitle}>MO-FOOD</CustomText>
        <View style={{ width: 40 }} />
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.textLight} />
        <TextInput 
          style={styles.searchInput} 
          placeholder="Cari makanan atau toko..." 
          placeholderTextColor={theme.colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* DAFTAR TOKO ASLI */}
      <ScrollView 
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : filteredMerchants.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="storefront-outline" size={48} color={theme.colors.textLight} />
            <CustomText color="textLight" style={{ marginTop: 12 }}>Toko tidak ditemukan.</CustomText>
          </View>
        ) : (
          filteredMerchants.map((merchant, index) => (
            <TouchableOpacity key={index} style={styles.card} onPress={() => goToDetail(merchant)}>
              <View style={styles.imagePlaceholder}>
                <Ionicons name="restaurant" size={32} color={theme.colors.textLight} />
              </View>
              <View style={styles.cardInfo}>
                <CustomText weight="bold" size="medium">{merchant.name}</CustomText>
                
                <CustomText size="small" color="textLight" numberOfLines={1} style={{ marginTop: 2 }}>
                  {merchant.category || 'Kuliner'} • {merchant.address || 'Alamat tidak tersedia'}
                </CustomText>
                
                <View style={styles.statsRow}>
                  <Ionicons name="star" size={14} color="#F1C40F" />
                  <CustomText size="small" weight="bold" style={{ marginLeft: 4 }}>4.8</CustomText>
                  <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: theme.colors.textLight, marginHorizontal: 8 }} />
                  <CustomText size="small" color="textLight">Terverifikasi</CustomText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.border} />
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
    paddingTop: 50, paddingHorizontal: theme.layout.spacing.lg, paddingBottom: theme.layout.spacing.md,
  },
  backBtn: { padding: 8, backgroundColor: theme.colors.surface, borderRadius: 20 },
  headerTitle: { flex: 1, textAlign: 'center' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface,
    marginHorizontal: theme.layout.spacing.lg, paddingHorizontal: theme.layout.spacing.md,
    borderRadius: theme.layout.radius.button, marginBottom: theme.layout.spacing.md,
    borderWidth: 1, borderColor: theme.colors.border
  },
  searchInput: { flex: 1, paddingVertical: 12, marginLeft: 8, fontFamily: 'System', color: theme.colors.text },
  listContainer: { paddingHorizontal: theme.layout.spacing.lg, paddingBottom: 40 },
  
  card: {
    flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: theme.layout.radius.card,
    padding: theme.layout.spacing.sm, marginBottom: theme.layout.spacing.md, alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
  },
  imagePlaceholder: {
    width: 70, height: 70, backgroundColor: theme.colors.background,
    borderRadius: theme.layout.radius.small, alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 }
});