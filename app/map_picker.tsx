import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Alert } from 'react-native';
import { router } from 'expo-router';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import CustomText from '../src/components/CustomText';

export default function MapPickerScreen() {
  const [region, setRegion] = useState({
    latitude: -7.8167,
    longitude: 112.0167,
    latitudeDelta: 0.002, // Zoom sangat dekat agar POI / Gedung terdeteksi
    longitudeDelta: 0.002,
  });

  const [readableAddress, setReadableAddress] = useState('Mencari detail lokasi...');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const pinY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setReadableAddress('Izin GPS ditolak. Silakan ketik lokasi manual di catatan.');
        setIsMapLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const currentRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0015, // Sangat presisi
        longitudeDelta: 0.0015,
      };
      setRegion(currentRegion);
      setIsMapLoading(false);
      
      getAddressFromCoords(location.coords.latitude, location.coords.longitude);
    })();
  }, []);

  const getAddressFromCoords = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      let response = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (response && response.length > 0) {
        const place = response[0];
        
        let placeName = place.name || '';
        let streetName = place.street || '';

        // 1. ELIMINASI PLUS CODE DAN ANGKA KOORDINAT MENTAH
        if (placeName.includes('+') || /^[0-9X\-+ \s]+$/.test(placeName)) {
          placeName = ''; 
        }
        if (streetName.includes('+') || /^[0-9X\-+ \s]+$/.test(streetName)) {
          streetName = ''; 
        }

        // 2. CEGAH DUPLIKASI (Jika nama tempat sama dengan nama jalan)
        if (placeName && streetName && placeName.toLowerCase() === streetName.toLowerCase()) {
          streetName = '';
        }

        // 3. SUSUNAN ALAMAT SUPER PRESISI
        // Contoh Target: WARKOP FEBRIL, Jl. Pattimura, Kecamatan Mojo, Kabupaten Kediri
        const addressParts = [
          placeName ? `${placeName}` : '',                             // Baris utama: Nama Gedung/Toko (Jika ada)
          streetName ? `${streetName}` : '',                           // Baris kedua: Nama Jalan
          place.district ? `Kec. ${place.district}` : '',              // Kecamatan
          place.city || place.subregion || ''                          // Kota / Kabupaten
        ].filter(Boolean); // Buang yang kosong

        const fullAddress = addressParts.join(', ');
        setReadableAddress(fullAddress || 'Area tidak dikenali di peta');
      } else {
        setReadableAddress('Gagal membaca area peta');
      }
    } catch (error) {
      setReadableAddress('Kendala mendeteksi data satelit');
    } finally {
      setIsGeocoding(false);
    }
  };

  const onRegionChange = () => {
    if (!isDragging) {
      setIsDragging(true);
      Animated.timing(pinY, {
        toValue: -25, 
        duration: 120,
        useNativeDriver: true,
      }).start();
    }
  };

  const onRegionChangeComplete = (newRegion: any) => {
    setIsDragging(false);
    Animated.spring(pinY, {
      toValue: 0, 
      friction: 4, 
      tension: 40,
      useNativeDriver: true,
    }).start();

    setRegion(newRegion);
    getAddressFromCoords(newRegion.latitude, newRegion.longitude);
  };

  const handleConfirmLocation = async () => {
    try {
      // Simpan alamat ke brankas memori agar abadi
      await AsyncStorage.setItem('mojek_temp_address', readableAddress);
      router.back(); 
    } catch (e) {
      Alert.alert("Error", "Gagal menyimpan data lokasi.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <CustomText weight="bold" size="medium" style={{ flex: 1, textAlign: 'center' }}>Pilih Titik Pengantaran</CustomText>
        <View style={{ width: 40 }} />
      </View>

      {isMapLoading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <CustomText style={{ marginTop: 12 }}>Mencari sinyal GPS...</CustomText>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <MapView
            style={styles.map}
            initialRegion={region}
            onRegionChange={onRegionChange}
            onRegionChangeComplete={onRegionChangeComplete}
            showsUserLocation={true}
            showsMyLocationButton={true}
          />
          
          <View style={styles.pinOverlay} pointerEvents="none">
            <Animated.View style={{ transform: [{ translateY: pinY }] }}>
              <Ionicons name="location" size={54} color={theme.colors.danger} style={{ marginBottom: -8 }} />
            </Animated.View>
            <View style={styles.pinShadow} />
          </View>
        </View>
      )}

      <View style={styles.bottomPanel}>
        <View style={styles.locationDetail}>
          {isGeocoding ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginRight: 12 }} />
          ) : (
            <Ionicons name="navigate-circle" size={32} color={theme.colors.primary} style={{ marginRight: 12 }} />
          )}
          <View style={{ flex: 1 }}>
            <CustomText weight="bold" size="large">Titik Lokasi</CustomText>
            <CustomText size="small" color="textLight" numberOfLines={3} style={{ marginTop: 4, lineHeight: 18 }}>
              {readableAddress}
            </CustomText>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.confirmBtn, isGeocoding && { opacity: 0.7 }]} 
          onPress={handleConfirmLocation}
          disabled={isGeocoding}
        >
          <CustomText weight="bold" color="surface" size="medium">Gunakan Lokasi Ini</CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: theme.colors.surface, elevation: 4, zIndex: 10 },
  backBtn: { padding: 8, backgroundColor: theme.colors.background, borderRadius: 20 },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { flex: 1 },
  pinOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 40, justifyContent: 'center', alignItems: 'center' },
  pinShadow: { width: 14, height: 4, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 7, marginTop: 2 },
  bottomPanel: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 10 },
  locationDetail: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  confirmBtn: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', elevation: 2 }
});