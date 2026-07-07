import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Alert, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import { apiGet, apiPost } from '../src/api'; 
import CustomText from '../src/components/CustomText';

export default function AdminSettingsScreen() {
  const [baseFee, setBaseFee] = useState('0');
  const [perKmRate, setPerKmRate] = useState('0');
  const [platformFee, setPlatformFee] = useState('0');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiGet('admin/settings');
      if (res && res.success) {
        setBaseFee(String(res.data.BASE_DELIVERY_FEE || '0'));
        setPerKmRate(String(res.data.PER_KM_RATE || '0'));
        setPlatformFee(String(res.data.PLATFORM_FEE || '0'));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const payload = {
      BASE_DELIVERY_FEE: parseInt(baseFee) || 0,
      PER_KM_RATE: parseInt(perKmRate) || 0,
      PLATFORM_FEE: parseInt(platformFee) || 0
    };

    const res = await apiPost('admin/update_settings', payload);
    setIsSaving(false);
    if (res && res.success) {
      Alert.alert("Sukses", "Pengaturan ongkir & tarif berhasil diperbarui!");
      router.back();
    } else {
      Alert.alert("Gagal", res?.message || "Terjadi kesalahan.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <CustomText size="large" weight="bold" style={{ flex: 1, textAlign: 'center' }}>Pengaturan Sistem</CustomText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#3498DB" />
          <CustomText size="small" color="textLight" style={{ marginLeft: 8, flex: 1 }}>
            Perubahan di sini akan langsung berlaku untuk semua kalkulasi pesanan Customer baru.
          </CustomText>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <View>
            <View style={styles.inputGroup}>
              <CustomText weight="bold" style={styles.label}>Tarif Ongkir Dasar (Rp)</CustomText>
              <TextInput style={styles.input} value={baseFee} onChangeText={setBaseFee} keyboardType="numeric" />
              <CustomText size="small" color="textLight" style={{ marginTop: 4 }}>Tarif awal sebelum dihitung jarak per KM.</CustomText>
            </View>

            <View style={styles.inputGroup}>
              <CustomText weight="bold" style={styles.label}>Tarif Per Kilometer (Rp)</CustomText>
              <TextInput style={styles.input} value={perKmRate} onChangeText={setPerKmRate} keyboardType="numeric" />
              <CustomText size="small" color="textLight" style={{ marginTop: 4 }}>Tambahan biaya untuk setiap 1 KM perjalanan.</CustomText>
            </View>

            <View style={styles.inputGroup}>
              <CustomText weight="bold" style={styles.label}>Biaya Layanan / Platform (Rp)</CustomText>
              <TextInput style={styles.input} value={platformFee} onChangeText={setPlatformFee} keyboardType="numeric" />
              <CustomText size="small" color="textLight" style={{ marginTop: 4 }}>Keuntungan bersih platform per transaksi.</CustomText>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
              {isSaving ? <ActivityIndicator color="#FFF" /> : <CustomText weight="bold" color="surface">Simpan Perubahan</CustomText>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { padding: 8, backgroundColor: theme.colors.surface, borderRadius: 20, elevation: 1 },
  infoBox: { flexDirection: 'row', backgroundColor: '#EAF2F8', padding: 12, borderRadius: 12, marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { marginBottom: 8 },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 16, fontSize: 16, fontWeight: 'bold' },
  saveBtn: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 }
});