import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../src/theme';
import { apiPost } from '../src/api'; // TAMBAHKAN BARIS INI
import CustomText from '../src/components/CustomText';

export default function TopUpScreen() {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('BCA');
  const [currentBalance, setCurrentBalance] = useState(0);

  const nominalOptions = ['20000', '50000', '100000', '200000'];
  const paymentMethods = [
    { id: 'BCA', name: 'BCA Virtual Account', icon: 'card' },
    { id: 'MANDIRI', name: 'Mandiri Virtual Account', icon: 'card' },
    { id: 'QRIS', name: 'QRIS (Semua Bank/E-Wallet)', icon: 'qr-code' },
    { id: 'ALFAMART', name: 'Minimarket (Alfamart/Indomaret)', icon: 'storefront' },
  ];

  useEffect(() => {
    const loadBalance = async () => {
      const userStr = await AsyncStorage.getItem('mojek_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // Tembak API untuk ambil saldo realtime
        try {
          const res = await apiPost('users/balance', { phone: user.phone });
          if (res && res.success) {
            setCurrentBalance(res.data.balance || 0);
          }
        } catch (error) {
          setCurrentBalance(0);
        }
      }
    };
    loadBalance();
  }, []);

  const handleTopUp = () => {
    if (!amount || parseInt(amount) < 10000) {
      Alert.alert('Nominal Tidak Valid', 'Minimal Top Up adalah Rp 10.000');
      return;
    }

    Alert.alert(
      'Instruksi Pembayaran',
      `Silakan transfer sebesar Rp ${parseInt(amount).toLocaleString('id-ID')} ke ${selectedMethod}. (Simulasi: Saldo langsung bertambah)`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Selesai Bayar', 
          onPress: () => {
            alert('Top Up Berhasil!');
            router.back();
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name={"arrow-back" as any} size={24} color={theme.colors.surface} />
        </TouchableOpacity>
        <CustomText size="large" weight="bold" color="surface" style={styles.headerTitle}>Top Up MO-PAY</CustomText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* INFO SALDO SAAT INI */}
        <View style={styles.balanceCard}>
          <CustomText color="surface" style={{ opacity: 0.9 }}>Saldo Anda Saat Ini</CustomText>
          <CustomText size="heading" weight="bold" color="surface" style={{ marginTop: 4 }}>
            Rp {currentBalance.toLocaleString('id-ID')}
          </CustomText>
        </View>

        <View style={styles.content}>
          {/* INPUT NOMINAL */}
          <CustomText weight="bold" size="medium" style={{ marginBottom: 12 }}>Masukkan Nominal</CustomText>
          <View style={styles.inputContainer}>
            <CustomText weight="bold" size="large" color="textLight">Rp</CustomText>
            <TextInput 
              style={styles.input}
              placeholder="0"
              keyboardType="number-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {/* OPSI NOMINAL CEPAT */}
          <View style={styles.chipContainer}>
            {nominalOptions.map((nom, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.chip, amount === nom && styles.chipActive]}
                onPress={() => setAmount(nom)}
              >
                <CustomText size="small" weight="bold" color={amount === nom ? 'surface' : 'primary'}>
                  {parseInt(nom).toLocaleString('id-ID')}
                </CustomText>
              </TouchableOpacity>
            ))}
          </View>

          {/* PILIH METODE PEMBAYARAN */}
          <CustomText weight="bold" size="medium" style={{ marginTop: 24, marginBottom: 12 }}>Metode Pembayaran</CustomText>
          {paymentMethods.map((method) => (
            <TouchableOpacity 
              key={method.id} 
              style={[styles.methodCard, selectedMethod === method.id && styles.methodCardActive]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={styles.methodIcon}>
                <Ionicons name={method.icon as any} size={20} color={selectedMethod === method.id ? theme.colors.primary : theme.colors.textLight} />
              </View>
              <CustomText weight={selectedMethod === method.id ? "bold" : "regular"} style={{ flex: 1, marginLeft: 12 }}>
                {method.name}
              </CustomText>
              {selectedMethod === method.id && (
                <Ionicons name={"checkmark-circle" as any} size={24} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* FOOTER BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleTopUp}>
          <CustomText weight="bold" color="surface" size="medium">Top Up Sekarang</CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary, paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, textAlign: 'center' },
  
  balanceCard: { backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  
  content: { padding: 20, marginTop: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 16, paddingHorizontal: 16 },
  input: { flex: 1, fontSize: 24, fontWeight: 'bold', paddingVertical: 16, marginLeft: 8, color: theme.colors.text },
  
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, gap: 10 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.primary, backgroundColor: theme.colors.surface },
  chipActive: { backgroundColor: theme.colors.primary },
  
  methodCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: theme.colors.surface, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border },
  methodCardActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' },
  methodIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' },
  
  footer: { padding: 20, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border },
  actionBtn: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center' }
});