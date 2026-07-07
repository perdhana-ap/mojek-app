import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../theme';
import CustomText from './CustomText';

export default function CustomButton({ 
  title, 
  onPress, 
  type = 'primary',
  isLoading = false,
  style = {} 
}) {
  const isPrimary = type === 'primary';

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isLoading}
      style={[
        styles.button,
        { 
          backgroundColor: isPrimary ? theme.colors.primary : 'transparent',
          borderColor: theme.colors.primary,
          borderWidth: isPrimary ? 0 : 2,
        },
        style
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? '#FFF' : theme.colors.primary} />
      ) : (
        <CustomText 
          weight="bold" 
          size="medium" 
          color={isPrimary ? 'surface' : 'text'}
        >
          {title}
        </CustomText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.layout.spacing.md,
    paddingHorizontal: theme.layout.spacing.lg,
    borderRadius: theme.layout.radius.button, // <-- Ini membaca radius dari theme.js!
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: theme.layout.spacing.sm,
  }
});