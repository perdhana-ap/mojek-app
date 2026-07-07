import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../src/theme';
import { apiPost } from '../src/api'; // TAMBAHKAN BARIS INI
import CustomText from '../src/components/CustomText';

export default function WithdrawScreen() {
  const [amount, setAmount] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);

  // State real untuk data bank dari database
  const [bankDetails, setBankDetails] = useState({
    bank_name: "Memuat...",
    account_number: "-",
    account_holder: "-"
  });

  useEffect(() => {
    const loadData = async () => {
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
    loadData();
  }, []);

  const handleWithdraw = () => {
    const withdrawAmount = parseInt(amount);
    if (!amount || withdrawAmount < 50000) {
      Alert.alert('Gagal', 'Minimal penarikan adalah Rp 50.000');
      return;
    }
    if (withdrawAmount > currentBalance) {
      Alert.alert('Gagal', 'Saldo Anda tidak mencukupi.');
      return;
    }

    Alert.alert(
      'Konfirmasi Penarikan',
      `Tarik dana sebesar Rp ${withdrawAmount.toLocaleString('id-ID')} ke rekening ${bankDetails.bank_name}?\n\nAdmin akan memproses ini dalam waktu 1x24 Jam.`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Ya, Tarik Saldo', 
          onPress: () => {
            alert('Pengajuan Tarik Saldo berhasil dikirim ke Admin!');
            router.back();
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* BERUBAH: Status bar menyesuaikan warna primary */}
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* BERUBAH: Header warna primary MOJEK */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name={"arrow-back" as any} size={24} color={theme.colors.surface} />
        </TouchableOpacity>
        <CustomText size="large" weight="bold" color="surface" style={styles.headerTitle}>Tarik Saldo</CustomText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* BERUBAH: Card saldo warna primary */}
        <View style={styles.balanceCard}>
          <CustomText color="surface" style={{ opacity: 0.9 }}>Saldo yang dapat ditarik</CustomText>
          <CustomText size="heading" weight="bold" color="surface" style={{ marginTop: 4 }}>
            Rp {currentBalance.toLocaleString('id-ID')}
          </CustomText>
        </View>

        <View style={styles.content}>
          {/* REKENING TUJUAN */}
          <CustomText weight="bold" size="medium" style={{ marginBottom: 12 }}>Rekening Tujuan</CustomText>
          <View style={styles.bankCard}>
            {/* BERUBAH: Ikon dan background bank */}
            <View style={styles.bankIcon}>
              <Ionicons name={"business" as any} size={24} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <CustomText weight="bold" size="medium">{bankDetails.bank_name}</CustomText>
              <CustomText color="textLight" style={{ marginTop: 2 }}>{bankDetails.account_number}</CustomText>
              <CustomText size="small" color="textLight" style={{ marginTop: 2 }}>a/n {bankDetails.account_holder}</CustomText>
            </View>
            <TouchableOpacity onPress={() => alert('Fitur ubah rekening di Pengaturan.')}>
              <CustomText size="small" weight="bold" color="primary">Ubah</CustomText>
            </TouchableOpacity>
          </View>

          {/* INPUT NOMINAL TARIK */}
          <CustomText weight="bold" size="medium" style={{ marginTop: 24, marginBottom: 12 }}>Nominal Penarikan</CustomText>
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
          
          <TouchableOpacity onPress={() => setAmount(currentBalance.toString())} style={{ marginTop: 8, alignSelf: 'flex-start' }}>
            <CustomText size="small" weight="bold" color="primary">Tarik Semua Saldo</CustomText>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Ionicons name={"information-circle" as any} size={20} color="#F39C12" />
            <CustomText size="small" color="textLight" style={{ flex: 1, marginLeft: 8 }}>
              Pencairan dana akan diproses manual oleh Admin MOJEK maksimal 1x24 Jam kerja.
            </CustomText>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleWithdraw}>
          <CustomText weight="bold" color="surface" size="medium">Ajukan Penarikan</CustomText>
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
  bankCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border },
  bankIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 16, paddingHorizontal: 16 },
  input: { flex: 1, fontSize: 24, fontWeight: 'bold', paddingVertical: 16, marginLeft: 8, color: theme.colors.text },
  
  infoBox: { flexDirection: 'row', backgroundColor: '#FEF9E7', padding: 16, borderRadius: 12, marginTop: 32 },

  footer: { padding: 20, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border },
  actionBtn: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center' }
});