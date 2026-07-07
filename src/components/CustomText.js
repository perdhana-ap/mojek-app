import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

export default function CustomText({ 
  children, 
  style = {}, 
  weight = 'regular', 
  size = 'regular', 
  color = 'text',
  ...props 
}) {
  
  const getFontWeight = () => {
    switch (weight) {
      case 'bold': return 'bold';
      case 'light': return '300';
      default: return 'normal';
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return theme.fonts.size.small;
      case 'large': return theme.fonts.size.large;
      case 'heading': return theme.fonts.size.heading;
      default: return theme.fonts.size.medium;
    }
  };

  const getColor = () => {
    return theme.colors[color] || theme.colors.text;
  };

  return (
    <Text
      style={[
        {
          fontFamily: 'System', 
          includeFontPadding: false, 
          // FIX GLOBAL: Kita naikkan padding-nya dan tambahkan textAlignVertical
          paddingRight: 5,           
          paddingLeft: 1,            // Jaga-jaga agar huruf pertama tidak mepet
          textAlignVertical: 'center', 
          fontWeight: getFontWeight(),
          fontSize: getFontSize(),
          color: getColor(),
        },
        style
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}