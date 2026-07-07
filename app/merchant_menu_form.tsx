import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import CustomText from '../src/components/CustomText';

export default function MerchantMenuFormScreen() {
  // Menangkap parameter dari layar sebelumnya untuk mendeteksi mode Edit/Tambah
  const params = useLocalSearchParams();
  const isEdit = !!params.id; // Jika ada ID, berarti ini mode EDIT

  // Inisialisasi State (Jika Edit, isi dengan data lama. Jika Tambah, kosongkan)
  const [name, setName] = useState(params.name ? String(params.name) : '');
  const [desc, setDesc] = useState(params.desc ? String(params.desc) : '');
  const [price, setPrice] = useState(params.price ? String(params.price) : '');
  const [isAvailable, setIsAvailable] = useState(params.isAvailable === 'false' ? false : true);

  const handleSave = () => {
    alert(isEdit ? "Perubahan Menu Berhasil Disimpan!" : "Menu Baru Berhasil Ditambahkan!");
    router.back();
  };

  const handleDelete = () => {
    alert("Menu Berhasil Dihapus!");
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name={"arrow-back" as any} size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <CustomText size="large" weight="bold" style={styles.headerTitle}>
          {isEdit ? 'Edit Menu' : 'Tambah Menu Baru'}
        </CustomText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* UPLOAD FOTO (MOCKUP) */}
        <View style={styles.imageUploadBox}>
          <Ionicons name={"camera" as any} size={40} color={theme.colors.textLight} />
          <CustomText size="small" color="textLight" style={{ marginTop: 8 }}>
            Tap untuk unggah foto menu
          </CustomText>
        </View>

        {/* FORM INPUT: NAMA MENU */}
        <View style={styles.inputGroup}>
          <CustomText weight="bold" style={styles.label}>Nama Menu</CustomText>
          <TextInput 
            style={styles.input}
            placeholder="Contoh: Paket Geprek Dada"
            value={name}
            onChangeText={setName}
            placeholderTextColor={theme.colors.textLight}
          />
        </View>

        {/* FORM INPUT: DESKRIPSI */}
        <View style={styles.inputGroup}>
          <CustomText weight="bold" style={styles.label}>Deskripsi Singkat</CustomText>
          <TextInput 
            style={[styles.input, styles.textArea]}
            placeholder="Contoh: Nasi hangat dengan ayam dada geprek level pedas sedang + lalapan"
            value={desc}
            onChangeText={setDesc}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholderTextColor={theme.colors.textLight}
          />
        </View>

        {/* FORM INPUT: HARGA */}
        <View style={styles.inputGroup}>
          <CustomText weight="bold" style={styles.label}>Harga (Rp)</CustomText>
          <TextInput 
            style={styles.input}
            placeholder="Contoh: 25000"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholderTextColor={theme.colors.textLight}
          />
        </View>

        {/* TOGGLE: STATUS KETERSEDIAAN */}
        <View style={styles.switchGroup}>
          <View>
            <CustomText weight="bold">Status Ketersediaan</CustomText>
            <CustomText size="small" color="textLight">Aktifkan jika stok menu sedang ada</CustomText>
          </View>
          <Switch
            trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
            thumbColor={isAvailable ? theme.colors.primary : "#f4f3f4"}
            onValueChange={() => setIsAvailable(!isAvailable)}
            value={isAvailable}
          />
        </View>

      </ScrollView>

      {/* FOOTER ACTION BUTTONS */}
      <View style={styles.footer}>
        {/* Tombol Hapus hanya muncul jika sedang dalam mode Edit */}
        {isEdit && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name={"trash" as any} size={24} color={theme.colors.danger} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <CustomText color="surface" weight="bold" style={{ textAlign: 'center' }}>
            {isEdit ? 'Simpan Perubahan' : 'Tambah Menu'}
          </CustomText>
        </TouchableOpacity>
      </View>
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
  content: { padding: theme.layout.spacing.lg, paddingBottom: 100 },
  
  imageUploadBox: {
    backgroundColor: theme.colors.surface, height: 150, borderRadius: 16,
    borderWidth: 2, borderColor: theme.colors.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  
  inputGroup: { marginBottom: 16 },
  label: { marginBottom: 8 },
  input: {
    backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontFamily: 'System',
    color: theme.colors.text, fontSize: 16,
  },
  textArea: { height: 100 },
  
  switchGroup: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, marginTop: 8,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.colors.surface,
    flexDirection: 'row', paddingHorizontal: theme.layout.spacing.lg, paddingVertical: 16,
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  saveBtn: { 
    flex: 1, backgroundColor: theme.colors.primary, paddingVertical: 14, 
    borderRadius: 12, justifyContent: 'center' 
  },
  deleteBtn: {
    backgroundColor: theme.colors.surface, paddingHorizontal: 16, justifyContent: 'center',
    borderRadius: 12, borderWidth: 1, borderColor: theme.colors.danger, marginRight: 12
  }
});