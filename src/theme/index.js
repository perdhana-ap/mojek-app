// src/theme/index.js

export const theme = {
// 1. WARNA BARU MOJEK
  colors: {
    primary: '#680BB2',      // Primary Purple (Tombol utama, teks judul)
    primaryDark: '#6112A5',  // Dark Purple (Warna status bar HP)
    secondary: '#63E500',    // Primary Green (Aksen, logo, badge)
    secondaryLight: '#91E05C', // Light Green (Highlight)
    background: '#E9E9E9',   // Light Gray (Latar belakang utama aplikasi)
    surface: '#FFFFFF',      // White (Kotak menu, header, card)
    text: '#333333',         // Warna teks utama
    textLight: '#888888',    // Warna teks pudar
    danger: '#E74C3C',       // Merah untuk error
    success: '#63E500',      // Kita gunakan Primary Green untuk sukses
    border: '#CCCCCC',       // Warna garis tepi
  },

  // 2. TIPOGRAFI / FONT SIZE
  fonts: {
    size: {
      small: 12,
      regular: 14,
      medium: 16,
      large: 20,
      title: 24,
      heading: 32,
    },
    weight: {
      regular: '400',
      bold: '700',
    }
  },

  // 3. SHAPE & SPACING (Bentuk & Jarak)
  layout: {
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    radius: {
      small: 8,       // Untuk input field
      button: 25,     // Ubah ke 8 jika ingin tombol kotak, 25 untuk tombol kapsul
      card: 15,       // Untuk kotak menu/merchant
    }
  }
};