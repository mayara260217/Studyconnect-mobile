import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';

const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#A78BFA';
const BG = '#050505';
const CARD_BG = '#111118';
const BORDER = '#1E1E2E';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    const ok = await login(email, senha);
    setLoading(false);
    if (ok) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Erro', 'Credenciais inválidas.');
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.glowBg} />
      <View style={styles.glowBg2} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoIconBox}>
            <Text style={styles.logoIconText}>S</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={styles.logoStudy}>Study</Text>
            <Text style={styles.logoConnect}>Connect</Text>
            <Text style={styles.logoPlus}>+</Text>
          </View>
          <Text style={styles.logoSub}>Sua plataforma de estudos</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Entrar</Text>
          <Text style={styles.cardSub}>Bem-vindo de volta 👋</Text>

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#4B5563"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#4B5563"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.loginBtn, loading && { opacity: 0.6 }]} onPress={handleLogin} disabled={loading}>
            <Text style={styles.loginBtnText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
          </TouchableOpacity>
        </View>

        {/* Cadastro */}
        <View style={styles.cadastroRow}>
          <Text style={styles.cadastroText}>Não tem conta? </Text>
          <TouchableOpacity onPress={() => router.push('/cadastro')}>
            <Text style={styles.cadastroLink}>Criar conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  glowBg: { position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: '#7C3AED33', opacity: 0.5 },
  glowBg2: { position: 'absolute', bottom: -80, right: -80, width: 250, height: 250, borderRadius: 125, backgroundColor: '#3B82F622', opacity: 0.4 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 },
  logoWrap: { alignItems: 'center', marginBottom: 40, gap: 8 },
  logoIconBox: { width: 64, height: 64, borderRadius: 20, backgroundColor: PURPLE, justifyContent: 'center', alignItems: 'center', marginBottom: 8, shadowColor: PURPLE, shadowOpacity: 0.6, shadowRadius: 16, elevation: 8 },
  logoIconText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  logoStudy: { fontSize: 28, fontWeight: '800', color: '#fff' },
  logoConnect: { fontSize: 28, fontWeight: '800', color: PURPLE },
  logoPlus: { fontSize: 24, fontWeight: '800', color: PURPLE_LIGHT },
  logoSub: { fontSize: 13, color: '#6B7280' },
  card: { backgroundColor: CARD_BG, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: BORDER, marginBottom: 24 },
  cardTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 },
  cardSub: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', marginBottom: 6, letterSpacing: 0.5 },
  input: { backgroundColor: '#0D0D14', borderRadius: 12, padding: 14, fontSize: 15, color: '#fff', borderWidth: 1, borderColor: BORDER, marginBottom: 16 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { fontSize: 13, color: PURPLE_LIGHT, fontWeight: '600' },
  loginBtn: { backgroundColor: PURPLE, borderRadius: 14, padding: 16, alignItems: 'center', shadowColor: PURPLE, shadowOpacity: 0.5, shadowRadius: 12, elevation: 6 },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  cadastroRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  cadastroText: { fontSize: 14, color: '#6B7280' },
  cadastroLink: { fontSize: 14, color: PURPLE_LIGHT, fontWeight: '700' },
});
