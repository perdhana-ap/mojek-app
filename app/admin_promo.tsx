import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Alert, TextInput, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import { apiGet, apiPost } from '../src/api'; 
import CustomText from '../src/components/CustomText';

export default function AdminPromoScreen() {
  const [promos, setPromos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk form tambah promo
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => { fetchPromos(); }, []);

  const fetchPromos = async () => {
    setIsLoading(true);
    const res = await apiGet('admin/promos');
    if (res && res.success) setPromos(res.data || []);
    setIsLoading(false);
  };

  const handleAddPromo = async () => {
    if (!code || !discount) return Alert.alert("Error", "Kode dan Diskon wajib diisi.");
    setIsAdding(true);
    
    const res = await apiPost('admin/add_promo', {
      promo_code: code,
      discount_amount: parseInt(discount),
      min_purchase: parseInt(minPurchase) || 0
    });
    
    setIsAdding(false);
    if (res && res.success) {
      Alert.alert("Sukses", "Promo ditambahkan!");
      setCode(''); setDiscount(''); setMinPurchase('');
      fetchPromos();
    } else {
      Alert.alert("Gagal", res?.message || "Terjadi kesalahan.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F39C12" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <CustomText size="large" weight="bold" color="surface" style={{ flex: 1, textAlign: 'center' }}>Voucher & Promo</CustomText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* FORM TAMBAH PROMO */}
        <View style={styles.formCard}>
          <CustomText weight="bold" style={{ marginBottom: 16 }}>Buat Promo Baru</CustomText>
          <TextInput style={styles.input} placeholder="KODE (contoh: MOJEKHEMAT)" value={code} onChangeText={setCode} autoCapitalize="characters" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Diskon (Rp)" value={discount} onChangeText={setDiscount} keyboardType="numeric" />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Min. Belanja" value={minPurchase} onChangeText={setMinPurchase} keyboardType="numeric" />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddPromo} disabled={isAdding}>
            {isAdding ? <ActivityIndicator color="#FFF" /> : <CustomText weight="bold" color="surface">Tebarkan Promo</CustomText>}
          </TouchableOpacity>
        </View>

        <CustomText weight="bold" size="medium" style={{ marginTop: 24, marginBottom: 12 }}>Daftar Promo Aktif</CustomText>
        
        {isLoading ? (
          <ActivityIndicator size="large" color="#F39C12" style={{ marginTop: 20 }} />
        ) : promos.length === 0 ? (
          <CustomText color="textLight" style={{ textAlign: 'center', marginTop: 20 }}>Belum ada promo yang dibuat.</CustomText>
        ) : (
          promos.map((item, index) => (
            <View key={index} style={styles.promoCard}>
              <View style={styles.iconBox}><Ionicons name="ticket" size={24} color="#F39C12" /></View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <CustomText weight="bold" size="large">{item.promo_code}</CustomText>
                <CustomText size="small" color="textLight">Potongan: Rp {parseInt(item.discount_amount).toLocaleString('id-ID')}</CustomText>
                <CustomText size="small" color="textLight">Min. Beli: Rp {parseInt(item.min_purchase).toLocaleString('id-ID')}</CustomText>
              </View>
              <View style={{ backgroundColor: '#27AE60', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                <CustomText size="small" weight="bold" color="surface">{item.status}</CustomText>
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
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#F39C12' },
  backBtn: { padding: 4 },
  formCard: { backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  input: { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 12, marginBottom: 12 },
  addBtn: { backgroundColor: '#F39C12', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  promoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed' },
  iconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FEF9E7', alignItems: 'center', justifyContent: 'center' }
});