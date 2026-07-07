import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { theme } from '../theme';
import CustomText from './CustomText';

// Kita hanya mengambil 'label', sisanya kita bungkus ke dalam '...props'
export default function CustomInput({ label, ...props }) {
  return (
    <View style={styles.container}>
      {label && (
        <CustomText weight="bold" size="small" color="textLight" style={styles.label}>
          {label}
        </CustomText>
      )}
      <TextInput
        style={styles.input}
        placeholderTextColor={theme.colors.border}
        // ...props ini akan otomatis menyalurkan value, onChangeText, maxLength, keyboardType, dll langsung ke TextInput!
        {...props} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.layout.spacing.md,
  },
  label: {
    marginBottom: theme.layout.spacing.xs,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.layout.radius.small,
    padding: theme.layout.spacing.md,
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
  }
});