import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import CustomText from '../src/components/CustomText';

export default function DriverActiveOrderScreen() {
  const [step, setStep] = useState('menuju_resto'); // 'menuju_resto' atau 'menuju_customer'

  // Persiapan State Real untuk Data Pelanggan (Sementara dikosongkan)
  const [customerData, setCustomerData] = useState({
    name: 'Memuat...',
    phone: '',
    address: 'Memuat...',
    notes: '-',
    restoName: 'Memuat...',
    restoAddress: 'Memuat...'
  });

  const openMaps = (address: string) => {
    // Membuka Google Maps dengan query pencarian
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
  };

  const handleWhatsApp = (phone: string) => {
    // Mengubah awalan '0' menjadi '62' untuk standar WhatsApp
    let waNumber = phone;
    if (waNumber.startsWith('0')) {
      waNumber = '62' + waNumber.substring(1);
    }
    
    // Tautan deep-link menuju WhatsApp
    const url = `https://wa.me/${waNumber}`;
    Linking.openURL(url).catch(() => {
      alert('Gagal membuka WhatsApp. Pastikan aplikasi terinstal di HP Anda.');
    });
  };

  return (
    <View style={styles.container}>
      {/* HEADER STATUS */}
      <View style={styles.header}>
        <CustomText weight="bold" color="surface" size="large">
          {step === 'menuju_resto' ? 'Ambil Pesanan' : 'Antar ke Pelanggan'}
        </CustomText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* 1. CARD PROFIL PELANGGAN & TOMBOL WHATSAPP */}
        <View style={styles.card}>
          <CustomText weight="bold" size="small" color="textLight" style={{ marginBottom: 12 }}>
            PELANGGAN
          </CustomText>
          
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Ionicons name={"person" as any} size={24} color={theme.colors.surface} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <CustomText weight="bold" size="medium">{customerData.name}</CustomText>
              <CustomText size="small" color="textLight" style={{ marginTop: 2 }}>{customerData.phone}</CustomText>
            </View>
            
            {/* HANYA ADA 1 TOMBOL: WHATSAPP */}
            <View style={styles.communicationRow}>
              <TouchableOpacity style={styles.waBtn} onPress={() => handleWhatsApp(customerData.phone)}>
                <Ionicons name={"logo-whatsapp" as any} size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Catatan Tambahan dari Pelanggan */}
          <View style={styles.notesBox}>
            <Ionicons name={"information-circle" as any} size={16} color="#F39C12" />
            <CustomText size="small" style={{ flex: 1, marginLeft: 6, color: '#7F8C8D' }}>
              Catatan: {customerData.notes}
            </CustomText>
          </View>
        </View>

        {/* 2. CARD LOKASI */}
        <View style={styles.card}>
          <CustomText weight="bold" size="small" color="textLight" style={{ marginBottom: 8 }}>
            {step === 'menuju_resto' ? 'RESTO TUJUAN' : 'TUJUAN PENGANTARAN'}
          </CustomText>
          <CustomText weight="bold" size="medium">
            {step === 'menuju_resto' ? customerData.restoName : 'Rumah Pelanggan'}
          </CustomText>
          <CustomText color="textLight" style={{ marginTop: 4 }}>
            {step === 'menuju_resto' ? customerData.restoAddress : customerData.address}
          </CustomText>
          
          <TouchableOpacity 
            style={styles.btnMaps} 
            onPress={() => openMaps(step === 'menuju_resto' ? customerData.restoName : customerData.address)}
          >
            <Ionicons name={"navigate" as any} size={18} color={theme.colors.primary} />
            <CustomText weight="bold" color="primary" style={{ marginLeft: 8 }}>Petunjuk Arah (Maps)</CustomText>
          </TouchableOpacity>
        </View>

        {/* 3. CARD DETAIL ORDER */}
        <View style={styles.card}>
          <CustomText weight="bold" style={{ marginBottom: 12 }}>Rincian Menu Item</CustomText>
          
          <View style={styles.itemRow}>
            <CustomText style={{ flex: 1, fontStyle: 'italic', color: '#999' }}>Memuat pesanan...</CustomText>
          </View>
        </View>

      </ScrollView>

      {/* FOOTER ACTION BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: step === 'menuju_resto' ? theme.colors.primary : '#27AE60' }]} 
          onPress={() => {
            if (step === 'menuju_resto') {
              setStep('menuju_customer');
            } else { 
              alert("Pesanan Berhasil Diantar!"); 
              router.replace('/driver_dashboard'); 
            }
          }}
        >
          <CustomText weight="bold" color="surface">
            {step === 'menuju_resto' ? 'SAYA SUDAH DI RESTO (AMBIL MENU)' : 'KONFIRMASI PESANAN SELESAI'}
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { backgroundColor: theme.colors.primary, paddingTop: 60, paddingBottom: 20, alignItems: 'center' },
  content: { padding: theme.layout.spacing.lg },
  
  card: { backgroundColor: theme.colors.surface, padding: 20, borderRadius: 16, marginBottom: 16, elevation: 2 },
  
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  communicationRow: { flexDirection: 'row', alignItems: 'center' },
  
  // Tampilan Tombol WhatsApp (Hijau WhatsApp Resmi)
  waBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center', elevation: 3 },
  
  notesBox: { flexDirection: 'row', backgroundColor: '#FDF2E9', padding: 12, borderRadius: 12, marginTop: 16, alignItems: 'center' },
  btnMaps: { flexDirection: 'row', alignItems: 'center', marginTop: 16, padding: 12, backgroundColor: theme.colors.primary + '10', borderRadius: 12, justifyContent: 'center' },
  itemRow: { flexDirection: 'row', marginBottom: 8 },
  footer: { padding: 20, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border },
  actionBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }
});