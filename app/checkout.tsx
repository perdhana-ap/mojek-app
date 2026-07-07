import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import CustomText from '../src/components/CustomText';
import { apiGet, apiPost } from '../src/api';

export default function CheckoutScreen() {
  const { merchantName, merchantId, items, totalPrice } = useLocalSearchParams();
  
  const orderItems = items ? JSON.parse(items as string) : [];
  const subTotal = totalPrice ? parseInt(totalPrice as string) : 0;
  
  const [address, setAddress] = useState('Pilih lokasi pengantaran...'); // Mengganti pesan dummy
  const [noteForDriver, setNoteForDriver] = useState('');
  const [noteForMerchant, setNoteForMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'MOPAY' | 'CASH'>('MOPAY');
  
  const [customerBalance, setCustomerBalance] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(5000); 
  const [serviceFee, setServiceFee] = useState(2000);   
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FIXED: Memuat alamat abadi setiap kali halaman ini tampil di layar (Termasuk saat baru mundur dari Peta)
  useFocusEffect(
    useCallback(() => {
      const loadSavedAddress = async () => {
        try {
          const savedAddress = await AsyncStorage.getItem('mojek_temp_address');
          if (savedAddress) {
            setAddress(savedAddress);
          }
        } catch (e) {
          console.log("Gagal memuat alamat:", e);
        }
      };
      loadSavedAddress();
    }, [])
  );

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        const dataString = await AsyncStorage.getItem('mojek_user');
        if (dataString) {
          const user = JSON.parse(dataString);
          const resBalance = await apiPost('users/balance', { phone: user.phone });
          if (resBalance && resBalance.success) setCustomerBalance(resBalance.data.balance || 0);
        }
        const resSettings = await apiGet('admin/settings');
        if (resSettings && resSettings.success) {
          setDeliveryFee(parseInt(resSettings.data.BASE_DELIVERY_FEE) || 5000);
          setServiceFee(parseInt(resSettings.data.PLATFORM_FEE) || 2000);
        }
      } catch (err) {
        console.log("Error load checkout data:", err);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchCheckoutData();
  }, []);

  const finalTotal = subTotal + deliveryFee + serviceFee;

  const formatRupiah = (angka: number) => {
    return 'Rp ' + angka.toLocaleString('id-ID');
  };

  const goToMapPicker = () => {
    router.push({
      pathname: '/map_picker',
    });
  };

  const handleOrder = async () => {
    if (address.startsWith('Ketuk di sini')) {
      Alert.alert("Alamat Kosong", "Silakan tentukan lokasi pengantaran di peta terlebih dahulu.");
      return;
    }
    if (paymentMethod === 'MOPAY' && customerBalance < finalTotal) {
      Alert.alert("Saldo Tidak Cukup", "Saldo MO-PAY Anda kurang untuk transaksi ini.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const dataString = await AsyncStorage.getItem('mojek_user');
      if (!dataString) return Alert.alert("Error", "Sesi habis.");
      const user = JSON.parse(dataString);

      // 1. Tambahkan special_instruction agar catatan merchant masuk ke database rincian pesanan
      const formattedItems = orderItems.map((item: any) => ({
        product_id: item.id,       
        item_name: item.name,      
        price: item.price,
        quantity: item.qty,
        special_instruction: noteForMerchant // <--- Tambahan agar terbaca oleh backend
      }));

      // 2. Ubah note_driver menjadi special_notes
      const payload = {
        customer_id: user.user_id,
        customer_name: user.name,
        customer_phone: user.phone,
        merchant_id: merchantId,
        merchant_name: merchantName,
        delivery_address: address,
        payment_method: paymentMethod, 
        subtotal: subTotal,
        delivery_fee: deliveryFee,
        platform_fee: serviceFee,
        total_price: finalTotal,
        special_notes: noteForDriver, // <--- Ubah namanya dari note_driver agar masuk ke kolom 37 di Orders
        items: formattedItems 
      };

      const response = await apiPost('orders/create', payload);
      
      if (response && response.success) {
        // PERHATIAN: Kode penghapus memori alamat SUDAH SAYA HAPUS di sini.
        // Alamat akan abadi untuk pesanan berikutnya!
        
        router.replace({
          pathname: '/order_status',
          params: { orderId: response.data.order_id }
        });
      } else {
        Alert.alert("Gagal Memesan", response?.message || "Terjadi kendala saat membuat pesanan.");
      }
    } catch (error) {
      Alert.alert("Error", "Gagal menghubungi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <CustomText size="large" weight="bold" style={styles.headerTitle}>Konfirmasi Pesanan</CustomText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* SEKSI ALAMAT PENGANTARAN */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CustomText weight="bold" size="medium">Alamat Pengantaran</CustomText>
          </View>
          <TouchableOpacity style={styles.addressCard} onPress={goToMapPicker}>
            <Ionicons name="map" size={24} color={theme.colors.primary} />
            <CustomText size="small" style={{ marginLeft: 12, flex: 1, lineHeight: 18 }} color="text">
              {address}
            </CustomText>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>

          <TextInput 
            style={[styles.noteInput, { marginTop: 12 }]} 
            placeholder="🚗 Catatan untuk Driver (misal: Rumah pagar hitam)" 
            value={noteForDriver} 
            onChangeText={setNoteForDriver} 
          />
        </View>

        {/* RINGKASAN PESANAN */}
        <View style={styles.section}>
          <CustomText weight="bold" size="medium" style={{ marginBottom: 12 }}>Ringkasan Pesanan</CustomText>
          {orderItems.map((item: any, idx: number) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.qtyBox}><CustomText size="small" weight="bold" color="primary">{item.qty}x</CustomText></View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <CustomText weight="bold">{item.name}</CustomText>
                <CustomText size="small" color="textLight">Satuan: {formatRupiah(item.price)}</CustomText>
              </View>
              <CustomText weight="bold" color="text">{formatRupiah(item.price * item.qty)}</CustomText>
            </View>
          ))}
          <TextInput style={styles.noteInput} placeholder="📝 Catatan untuk Merchant (misal: minta sendok plastik)" value={noteForMerchant} onChangeText={setNoteForMerchant} />
        </View>

        {/* METODE PEMBAYARAN */}
        <View style={styles.section}>
          <CustomText weight="bold" size="medium" style={{ marginBottom: 12 }}>Metode Pembayaran</CustomText>
          <View style={styles.paymentMethodRow}>
            <TouchableOpacity style={[styles.paymentCard, paymentMethod === 'MOPAY' && styles.paymentCardActive]} onPress={() => setPaymentMethod('MOPAY')}>
              <View style={[styles.paymentIcon, { backgroundColor: paymentMethod === 'MOPAY' ? theme.colors.primary : theme.colors.border }]}><Ionicons name="wallet" size={18} color="#FFF" /></View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <CustomText weight="bold">MO-PAY</CustomText>
                <CustomText size="small" color="textLight">Saldo: {formatRupiah(customerBalance)}</CustomText>
              </View>
              {paymentMethod === 'MOPAY' && <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.paymentCard, { marginTop: 8 }, paymentMethod === 'CASH' && styles.paymentCardActive]} onPress={() => setPaymentMethod('CASH')}>
              <View style={[styles.paymentIcon, { backgroundColor: paymentMethod === 'CASH' ? '#27AE60' : theme.colors.border }]}><Ionicons name="cash" size={18} color="#FFF" /></View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <CustomText weight="bold">Tunai / Cash</CustomText>
                <CustomText size="small" color="textLight">Bayar langsung ke driver</CustomText>
              </View>
              {paymentMethod === 'CASH' && <Ionicons name="checkmark-circle" size={22} color="#27AE60" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* RINCIAN BIAYA */}
        <View style={[styles.section, { marginBottom: 20 }]}>
          <CustomText weight="bold" size="medium" style={{ marginBottom: 12 }}>Rincian Pembayaran</CustomText>
          <View style={styles.costRow}><CustomText size="small" color="textLight">Subtotal</CustomText><CustomText size="small" weight="bold">{formatRupiah(subTotal)}</CustomText></View>
          <View style={styles.costRow}><CustomText size="small" color="textLight">Biaya Ongkir</CustomText><CustomText size="small" weight="bold">{formatRupiah(deliveryFee)}</CustomText></View>
          <View style={styles.costRow}><CustomText size="small" color="textLight">Biaya Layanan</CustomText><CustomText size="small" weight="bold">{formatRupiah(serviceFee)}</CustomText></View>
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={{ flex: 1 }}><CustomText size="small" color="textLight">Total</CustomText><CustomText size="large" weight="bold" color="primary">{formatRupiah(finalTotal)}</CustomText></View>
        <TouchableOpacity style={styles.orderBtn} onPress={handleOrder} disabled={isSubmitting || isLoadingData}>
          {isSubmitting ? <ActivityIndicator color="#FFF" /> : <CustomText weight="bold" color="surface" size="medium">Pesan Sekarang</CustomText>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: theme.layout.spacing.lg, paddingBottom: 16, backgroundColor: theme.colors.surface, elevation: 2 },
  backBtn: { padding: 8, backgroundColor: theme.colors.background, borderRadius: 20 },
  headerTitle: { flex: 1, textAlign: 'center' },
  scrollContent: { paddingBottom: 140 },
  section: { backgroundColor: theme.colors.surface, marginTop: 8, padding: theme.layout.spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
  addressCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', paddingBottom: 8 },
  qtyBox: { backgroundColor: theme.colors.primary + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  noteInput: { backgroundColor: theme.colors.background, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border },
  paymentMethodRow: { marginTop: 4 },
  paymentCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, padding: 14, borderRadius: 14, backgroundColor: theme.colors.surface },
  paymentCardActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '05', borderWidth: 1.5 },
  paymentIcon: { padding: 8, borderRadius: 10 },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, width: '100%' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.colors.surface, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.layout.spacing.lg, paddingVertical: 18, elevation: 15, borderTopWidth: 1, borderTopColor: theme.colors.border },
  orderBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, elevation: 3 }
});