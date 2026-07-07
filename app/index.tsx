import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme'; 
import CustomText from '../src/components/CustomText'; 
import CustomButton from '../src/components/CustomButton'; 

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Mengecek ingatan login saat aplikasi pertama kali dibuka
    const checkLoginStatus = async () => {
      const user = await AsyncStorage.getItem('mojek_user');
      if (user) {
        const parsedUser = JSON.parse(user);
        
        // Baca role dari memori lokal (hasil dari database)
        const userRole = parsedUser.role ? String(parsedUser.role).toUpperCase() : 'CUSTOMER';

        // Lempar ke dashboard yang tepat
        if (userRole === 'ADMIN') {
          router.replace('/admin_dashboard');
        } else if (userRole === 'DRIVER') {
          router.replace('/driver_dashboard');
        } else if (userRole === 'MERCHANT') {
          router.replace('/merchant_dashboard');
        } else {
          router.replace('/dashboard'); // Customer
        }
      } else {
        setIsChecking(false);
      }
    };
    checkLoginStatus();
  }, []);

  // Tampilan layar memuat (Splash screen transisi)
  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <CustomText style={{ marginTop: 16 }} color="primary" weight="bold">Memuat MOJEK...</CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* 1. BRANDING AREA (Bagian Atas Berwarna Khas) */}
      <View style={styles.brandArea}>
        <View style={styles.logoCircle}>
          {/* Ikon roket melambangkan kecepatan delivery, bisa diganti logo asli nanti */}
          <Ionicons name={"rocket" as any} size={60} color={theme.colors.primary} />
        </View>
        <CustomText size="heading" weight="bold" color="surface" style={styles.brandTitle}>
          MOJEK
        </CustomText>
        <CustomText size="medium" color="surface" style={styles.brandSubtitle}>
          Mojo Ojek
        </CustomText>
      </View>

      {/* 2. INTERACTION AREA (Bagian Bawah Melengkung) */}
      <View style={styles.bottomSheet}>
        <CustomText size="large" weight="bold" style={styles.welcomeText}>
          Selamat Datang!
        </CustomText>
        <CustomText size="small" color="textLight" style={styles.descText}>
          Pesan makanan, antar barang, hingga kelola toko hanya dalam satu genggaman tangan.
        </CustomText>

        {/* Tombol Login */}
        <CustomButton 
          title="Masuk ke Akun Saya" 
          onPress={() => router.push('/login')} 
          style={styles.mainBtn}
        />
        
        {/* Tombol Daftar (Langsung terhubung ke Halaman Register) */}
        <TouchableOpacity 
          style={styles.registerBtn}
          onPress={() => router.push('/register')}
        >
          <CustomText weight="bold" color="primary">Belum Punya Akun? Daftar Disini</CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center'
  },
  // Latar belakang utama menggunakan warna primary MOJEK
  container: {
    flex: 1, backgroundColor: theme.colors.primary
  },
  
  // Gaya untuk logo dan tulisan di atas
  brandArea: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40
  },
  logoCircle: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: theme.colors.surface,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10
  },
  brandTitle: { fontSize: 42, letterSpacing: 2, marginBottom: 4 },
  brandSubtitle: { opacity: 0.9, letterSpacing: 0.5 },
  
  // Gaya untuk panel putih melengkung di bawah
  bottomSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 40, borderTopRightRadius: 40,
    paddingHorizontal: 24, paddingTop: 40, paddingBottom: 60,
    elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20
  },
  welcomeText: { marginBottom: 8, textAlign: 'center' },
  descText: { marginBottom: 32, textAlign: 'center', paddingHorizontal: 16, lineHeight: 20 },
  
  mainBtn: { marginBottom: 16, borderRadius: 16, paddingVertical: 16 },
  
  // Desain tombol daftar yang dibuat transparan dengan garis pinggir
  registerBtn: {
    paddingVertical: 16, alignItems: 'center', justifyContent: 'center',
    borderRadius: 16, borderWidth: 1, borderColor: theme.colors.primary + '50', 
    backgroundColor: theme.colors.primary + '10'
  }
});