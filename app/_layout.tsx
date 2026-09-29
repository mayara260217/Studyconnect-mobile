import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

import { AppThemeProvider, useAppTheme } from '@/contexts/theme-context';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { NotifProvider } from '@/contexts/notif-context';

export const unstable_settings = { anchor: '(tabs)' };

function RootLayoutInner() {
  const { theme } = useAppTheme();
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const rotaAtual = segments.join('/');
    const naTelaAuth = rotaAtual.includes('login') || rotaAtual.includes('cadastro') || rotaAtual.includes('verificar-email');
    if (!user && !naTelaAuth) {
      router.replace('/login');
    } else if (user && naTelaAuth) {
      router.replace('/(tabs)');
    }
  }, [user, segments, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050505', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#7C3AED" size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro" options={{ headerShown: false }} />
        <Stack.Screen name="material" options={{ headerShown: false }} />
        <Stack.Screen name="configuracoes" options={{ headerShown: false }} />
        <Stack.Screen name="editar-perfil" options={{ headerShown: false }} />
        <Stack.Screen name="notificacoes" options={{ headerShown: false }} />
        <Stack.Screen name="verificar-email" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <NotifProvider>
          <RootLayoutInner />
        </NotifProvider>
      </AuthProvider>
    </AppThemeProvider>
  );
}
