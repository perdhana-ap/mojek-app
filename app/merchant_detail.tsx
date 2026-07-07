import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import CustomText from '../src/components/CustomText';
import { apiGet } from '../src/api';

export default function MerchantDetailScreen() {
  // Menangkap parameter id dan name yang dikirim dari halaman MO-Food
  const { id, name } = useLocalSearchParams(); 
  
  const [menus, setMenus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // STATE KERANJANG: { "PRD-123": 2, "PRD-456": 1 }
  const [cart, setCart] = useState<{[key: string]: number}>({});

  // 1. FUNGSI MENGAMBIL MENU DARI GOOGLE SHEETS
  const fetchMenus = async () => {
    try {
      // Menambahkan parameter merchant_id ke dalam URL request
      const res = await apiGet(`customer/merchant_products&merchant_id=${id}`);
      if (res && res.success) {
        setMenus(res.data || []);
      }
    } catch (error) {
      console.log('Error fetch menus:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [id]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchMenus();
  };

  // 2. LOGIKA KERANJANG BELANJA
  const handleAdd = (productId: string) => {
    setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const handleMinus = (productId: string) => {
    setCart(prev => {
      const current = prev[productId] || 0;
      if (current <= 1) {
        const newCart = { ...prev };
        delete newCart[productId];
        return newCart;
      }
      return { ...prev, [productId]: current - 1 };
    });
  };

  // Menghitung ringkasan keranjang
  const getTotalItems = () => Object.values(cart).reduce((a, b) => a + b, 0);
  
  const getTotalPrice = () => {
    let total = 0;
    menus.forEach(menu => {
      if (cart[menu.product_id]) {
        total += (parseInt(menu.price) || 0) * cart[menu.product_id];
      }
    });
    return total;
  };

  // 3. FUNGSI MELANJUTKAN KE CHECKOUT
  const goToCheckout = () => {
    // Siapkan array objek barang yang dipesan untuk dilempar ke checkout
    const selectedItems = menus
      .filter(menu => cart[menu.product_id] > 0)
      .map(menu => ({
        id: menu.product_id,
        name: menu.item_name,
        price: parseInt(menu.price),
        qty: cart[menu.product_id]
      }));

    router.push({
      pathname: '/checkout',
      params: { 
        merchantName: name, 
        merchantId: id,
        items: JSON.stringify(selectedItems),
        totalPrice: getTotalPrice()
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* HEADER TOKO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <CustomText size="large" weight="bold" style={styles.headerTitle} numberOfLines={1}>
          {name || 'Detail Toko'}
        </CustomText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
      >
        <CustomText weight="bold" size="medium" style={{ marginBottom: 16 }}>Daftar Menu Tersedia</CustomText>
        
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : menus.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="fast-food-outline" size={48} color={theme.colors.textLight} />
            <CustomText color="textLight" style={{ marginTop: 12, textAlign: 'center' }}>
              Toko ini belum menambahkan menu makanan ke dalam sistem.
            </CustomText>
          </View>
        ) : (
          menus.map((item) => {
            const qty = cart[item.product_id] || 0;
            return (
              <View key={item.product_id} style={styles.menuCard}>
                <View style={styles.menuInfo}>
                  <CustomText weight="bold" size="medium">{item.item_name}</CustomText>
                  <CustomText size="small" color="textLight" style={{ marginTop: 4 }}>
                    {item.description || 'Menu lezat siap saji'}
                  </CustomText>
                  <CustomText weight="bold" color="primary" style={{ marginTop: 8 }}>
                    Rp {(parseInt(item.price) || 0).toLocaleString('id-ID')}
                  </CustomText>
                </View>

                <View style={styles.menuAction}>
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="fast-food" size={24} color={theme.colors.textLight} />
                  </View>
                  
                  {qty === 0 ? (
                    <TouchableOpacity style={styles.addButton} onPress={() => handleAdd(item.product_id)}>
                      <CustomText size="small" weight="bold" color="surface">Tambah</CustomText>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.qtyContainer}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => handleMinus(item.product_id)}>
                        <Ionicons name="remove" size={16} color={theme.colors.primary} />
                      </TouchableOpacity>
                      <CustomText weight="bold" style={{ marginHorizontal: 12 }}>{qty}</CustomText>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => handleAdd(item.product_id)}>
                        <Ionicons name="add" size={16} color={theme.colors.primary} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* FLOATING CART (Hanya muncul jika ada barang di keranjang) */}
      {getTotalItems() > 0 && (
        <View style={styles.floatingCartContainer}>
          <TouchableOpacity style={styles.floatingCart} onPress={goToCheckout}>
            <View>
              <CustomText color="surface" weight="bold" size="medium">{getTotalItems()} Item</CustomText>
              <CustomText color="surface" size="small">{name}</CustomText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CustomText color="surface" weight="bold" size="large" style={{ marginRight: 8 }}>
                Rp {getTotalPrice().toLocaleString('id-ID')}
              </CustomText>
              <Ionicons name="basket" size={24} color={theme.colors.surface} />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: theme.layout.spacing.lg, paddingBottom: theme.layout.spacing.md,
    backgroundColor: theme.colors.surface, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 2,
  },
  backBtn: { padding: 8, backgroundColor: theme.colors.background, borderRadius: 20 },
  headerTitle: { flex: 1, textAlign: 'center', paddingHorizontal: 10 },
  content: { padding: theme.layout.spacing.lg, paddingBottom: 100 },
  
  menuCard: {
    flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: theme.layout.radius.card, 
    padding: theme.layout.spacing.md, marginBottom: theme.layout.spacing.md, justifyContent: 'space-between',
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
  },
  menuInfo: { flex: 1, paddingRight: 12 },
  menuAction: { alignItems: 'center', justifyContent: 'space-between' },
  imagePlaceholder: {
    width: 60, height: 60, backgroundColor: theme.colors.background, borderRadius: theme.layout.radius.small, 
    alignItems: 'center', justifyContent: 'center', marginBottom: 8
  },
  addButton: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 },
  
  qtyContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background,
    borderRadius: 12, paddingHorizontal: 4, paddingVertical: 2, borderWidth: 1, borderColor: theme.colors.border
  },
  qtyBtn: { padding: 4 },
  
  floatingCartContainer: { position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center' },
  floatingCart: {
    backgroundColor: theme.colors.primaryDark, width: '90%', borderRadius: 20, paddingHorizontal: 20, 
    paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  }
});