import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import CustomText from '../src/components/CustomText';

export default function MerchantMenuScreen() {
  // State untuk daftar menu real dari database
  const [menus, setMenus] = useState<any[]>([]);

  // Fungsi untuk mengubah status ketersediaan menu
  const toggleAvailability = (id: number) => {
    setMenus(menus.map(menu => 
      menu.id === id ? { ...menu, isAvailable: !menu.isAvailable } : menu
    ));
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name={"arrow-back" as any} size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <CustomText size="large" weight="bold" style={styles.headerTitle}>Kelola Menu</CustomText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* TOMBOL TAMBAH MENU */}
        <TouchableOpacity style={styles.addMenuCard} onPress={() => router.push('/merchant_menu_form')}>
          <View style={styles.addIconBox}>
            <Ionicons name={"add" as any} size={24} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <CustomText weight="bold" size="medium">Tambah Menu Baru</CustomText>
            <CustomText size="small" color="textLight">Buat menu makanan/minuman baru</CustomText>
          </View>
          <Ionicons name={"chevron-forward" as any} size={20} color={theme.colors.textLight} />
        </TouchableOpacity>

        <CustomText weight="bold" size="medium" style={{ marginVertical: 16 }}>Daftar Menu Saat Ini</CustomText>

        {/* DAFTAR MENU */}
        {menus.map((item) => (
          <View key={item.id} style={[styles.menuCard, !item.isAvailable && styles.menuCardDisabled]}>
            <View style={styles.menuInfoRow}>
              <View style={styles.imagePlaceholder}>
                <Ionicons name={"fast-food-outline" as any} size={24} color={theme.colors.textLight} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <CustomText weight="bold" color={item.isAvailable ? "text" : "textLight"}>
                  {item.name}
                </CustomText>
                <CustomText size="small" color="textLight" style={{ marginTop: 2 }}>
                  Rp {item.price.toLocaleString('id-ID')}
                </CustomText>
              </View>
              
              {/* TOMBOL EDIT */}
              <TouchableOpacity 
                style={styles.editBtn}
                onPress={() => router.push({
                  pathname: '/merchant_menu_form',
                  params: {
                    id: item.id,
                    name: item.name,
                    desc: item.desc,
                    price: item.price,
                    isAvailable: item.isAvailable.toString()
                  }
                })}
              >
                <Ionicons name={"pencil" as any} size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            {/* TOGGLE STOK */}
            <View style={styles.stockRow}>
              <CustomText size="small" weight="bold" color={item.isAvailable ? "success" : "danger"}>
                {item.isAvailable ? 'Stok Tersedia' : 'Stok Habis'}
              </CustomText>
              <Switch
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
                thumbColor={item.isAvailable ? theme.colors.primary : "#f4f3f4"}
                onValueChange={() => toggleAvailability(item.id)}
                value={item.isAvailable}
              />
            </View>
          </View>
        ))}

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
  
  addMenuCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary + '10',
    padding: 16, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.primary + '30',
    borderStyle: 'dashed',
  },
  addIconBox: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surface,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  
  menuCard: {
    backgroundColor: theme.colors.surface, borderRadius: 16, padding: 16, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  menuCardDisabled: { opacity: 0.7, backgroundColor: '#F8F9FA' },
  menuInfoRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingBottom: 12 },
  imagePlaceholder: {
    width: 50, height: 50, borderRadius: 12, backgroundColor: theme.colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  editBtn: { padding: 8, backgroundColor: theme.colors.primary + '10', borderRadius: 8 },
  
  stockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 }
});