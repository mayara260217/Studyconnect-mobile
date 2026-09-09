import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_BASE } from '@/utils/api';

const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#A78BFA';
const BG = '#050505';
const CARD_BG = '#111118';
const BORDER = '#1E1E2E';

export default function VerificarEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  async function handleVerificar() {
    if (!codigo.trim()) {
      Alert.alert('Atenção', 'Digite o código recebido por e-mail.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: codigo.trim() }),
      });
      if (res.ok) {
        Alert.alert('Sucesso', 'E-mail verificado! Faça login para continuar.', [
          { text: 'OK', onPress: () => router.replace('/login') },
        ]);
      } else {
        Alert.alert('Erro', 'Código inválido ou expirado.');
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível verificar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReenviar() {
    setReenviando(true);
    try {
      await fetch(`${API_BASE}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      Alert.alert('Enviado', 'Um novo código foi enviado para seu e-mail.');
    } catch {
      Alert.alert('Erro', 'Não foi possível reenviar o código.');
    } finally {
      setReenviando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.glowBg} />
      <View style={styles.content}>
        <Text style={styles.icon}>📧</Text>
        <Text style={styles.title}>Verifique seu e-mail</Text>
        <Text style={styles.subtitle}>
          Enviamos um código de verificação para{'\n'}
          <Text style={styles.emailText}>{email}</Text>
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Código de verificação</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o código"
            placeholderTextColor="#4B5563"
            value={codigo}
            onChangeText={setCodigo}
            keyboardType="number-pad"
            maxLength={6}
          />

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.6 }]}
            onPress={handleVerificar}
            disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Verificando...' : 'Verificar'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleReenviar} disabled={reenviando} style={styles.reenviarBtn}>
          <Text style={styles.reenviarText}>
            {reenviando ? 'Reenviando...' : 'Não recebeu? Reenviar código'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  glowBg: { position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: '#7C3AED22', opacity: 0.5 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 100, alignItems: 'center' },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  emailText: { color: PURPLE_LIGHT, fontWeight: '600' },
  card: { backgroundColor: CARD_BG, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: BORDER, width: '100%', marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', marginBottom: 6, letterSpacing: 0.5 },
  input: { backgroundColor: '#0D0D14', borderRadius: 12, padding: 14, fontSize: 20, color: '#fff', borderWidth: 1, borderColor: BORDER, marginBottom: 16, textAlign: 'center', letterSpacing: 8 },
  btn: { backgroundColor: PURPLE, borderRadius: 14, padding: 16, alignItems: 'center', shadowColor: PURPLE, shadowOpacity: 0.5, shadowRadius: 12, elevation: 6 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  reenviarBtn: { marginTop: 8 },
  reenviarText: { fontSize: 14, color: PURPLE_LIGHT, fontWeight: '600' },
});
