import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import CustomText from '../src/components/CustomText';

const { width } = Dimensions.get('window');

export default function OrderStatusScreen() {
  // Simulasi pergerakan status pesanan (0: Dibuat, 1: Disiapkan, 2: Diantar)
  const [currentStep, setCurrentStep] = useState(0);

  // State real untuk data driver yang menerima pesanan
  const [driverData, setDriverData] = useState({
    name: 'Mencari Driver...',
    phone: '',
    vehicle: '-',
    rating: '0.0'
  });

  // Efek simulasi: Status berubah otomatis setiap 5 detik
  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 5000);
    const timer2 = setTimeout(() => setCurrentStep(2), 10000);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  const handleWhatsApp = (phone: string) => {
    // Mengubah awalan '0' menjadi '62' untuk standar link WhatsApp
    let waNumber = phone;
    if (waNumber.startsWith('0')) {
      waNumber = '62' + waNumber.substring(1);
    }
    
    const url = `https://wa.me/${waNumber}`;
    Linking.openURL(url).catch(() => {
      alert('Gagal membuka WhatsApp. Pastikan aplikasi terinstal di HP Anda.');
    });
  };

  const steps = [
    { title: "Pesanan Dibuat", desc: "Menunggu konfirmasi restoran", icon: "receipt" },
    { title: "Makanan Disiapkan", desc: "Restoran sedang memasak pesananmu", icon: "restaurant" },
    { title: "Driver Menuju Lokasi", desc: "Makanan dalam perjalanan", icon: "bicycle" }
  ];

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/dashboard')} style={styles.backBtn}>
          <Ionicons name={"close" as any} size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <CustomText size="large" weight="bold" style={styles.headerTitle}>Status Pesanan</CustomText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* MAP PLACEHOLDER */}
        <View style={styles.mapPlaceholder}>
          <Ionicons name={"map" as any} size={60} color={theme.colors.textLight} opacity={0.3} />
          <CustomText weight="bold" color="textLight" style={{ marginTop: 8 }}>Peta Perjalanan Driver</CustomText>
        </View>

        {/* PROFIL DRIVER DENGAN INTEGRASI WHATSAPP BARU */}
        <View style={styles.driverCard}>
          <View style={styles.driverAvatar}>
            <Ionicons name={"person" as any} size={24} color={theme.colors.surface} />
          </View>
          <View style={styles.driverInfo}>
            <CustomText weight="bold" size="medium">{driverData.name}</CustomText>
            <CustomText size="small" color="textLight">{driverData.vehicle}</CustomText>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Ionicons name={"star" as any} size={14} color="#F39C12" />
              <CustomText size="small" style={{ marginLeft: 4 }}>{driverData.rating}</CustomText>
            </View>
          </View>
          
          {/* TOMBOL HUBUNGI WHATSAPP (Sama persis seperti sisi Driver) */}
          <View style={styles.communicationRow}>
            <TouchableOpacity style={styles.waBtn} onPress={() => handleWhatsApp(driverData.phone)}>
              <Ionicons name={"logo-whatsapp" as any} size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* TIMELINE STATUS */}
        <View style={styles.timelineCard}>
          <CustomText weight="bold" size="medium" style={{ marginBottom: 16 }}>Perkembangan Pesanan</CustomText>
          
          {steps.map((step, index) => {
            const isActive = index <= currentStep;
            return (
              <View key={index} style={styles.timelineRow}>
                {index < steps.length - 1 && (
                  <View style={[styles.timelineLine, { backgroundColor: isActive ? theme.colors.primary : theme.colors.border }]} />
                )}
                
                <View style={[styles.timelineDot, { backgroundColor: isActive ? theme.colors.primary : theme.colors.border }]}>
                  <Ionicons name={step.icon as any} size={16} color={isActive ? theme.colors.surface : theme.colors.textLight} />
                </View>
                
                <View style={styles.timelineText}>
                  <CustomText weight={isActive ? "bold" : "regular"} color={isActive ? "text" : "textLight"}>
                    {step.title}
                  </CustomText>
                  <CustomText size="small" color="textLight">{step.desc}</CustomText>
                </View>
              </View>
            );
          })}
        </View>

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
  content: { padding: theme.layout.spacing.lg, paddingBottom: 40 },
  
  mapPlaceholder: {
    height: 200, backgroundColor: theme.colors.surface, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed'
  },
  
  driverCard: {
    flexDirection: 'row', backgroundColor: theme.colors.surface, padding: 16,
    borderRadius: 16, alignItems: 'center', marginBottom: 16,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  driverAvatar: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: theme.colors.textLight,
    alignItems: 'center', justifyContent: 'center', marginRight: 12
  },
  driverInfo: { flex: 1 },
  
  // Style Tombol Komunikasi WhatsApp Tunggal
  communicationRow: { flexDirection: 'row', alignItems: 'center' },
  waBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center', elevation: 3 },

  timelineCard: {
    backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  timelineRow: { flexDirection: 'row', marginBottom: 24, position: 'relative' },
  timelineLine: { position: 'absolute', left: 15, top: 30, bottom: -24, width: 2, zIndex: 1 },
  timelineDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16, zIndex: 2 },
  timelineText: { flex: 1, justifyContent: 'center' }
});