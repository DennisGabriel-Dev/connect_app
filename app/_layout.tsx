import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/services/auth/context';
import { authStorage } from '@/services/programacao/authStorage';
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAutenticado, setIsAutenticado] = useState<boolean | null>(null);

  useEffect(() => {
    const verificarAutenticacao = async () => {
      const autenticado = await authStorage.estaAutenticado();
      setIsAutenticado(autenticado);
    };
    verificarAutenticacao();
  }, []);

  if (isAutenticado === null) {
    return null;
  }

  return (
     <AuthProvider>
    <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {isAutenticado ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    </AuthProvider>
  );
}
