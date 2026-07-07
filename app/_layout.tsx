import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      {/* headerShown: false akan menghilangkan header hitam/bawaan selamanya */}
      <Stack screenOptions={{ headerShown: false }}>
        {/* Daftarkan layar-layar Anda di sini */}
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="mofood" />
      </Stack>
    </>
  );
}