import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';

const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#A78BFA';
const BG = '#050505';
const CARD_BG = '#111118';
const BORDER = '#1E1E2E';

export default function CadastroScreen() {
  const router = useRouter();
  const { cadastrar } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCadastro() {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (senha !== confirmar) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    const resultado = await cadastrar(nome, email, senha);
    setLoading(false);
    if (resultado === true || resultado === 'verificar') {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Erro', 'Não foi possível criar a conta.');
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.glowBg} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Voltar</Text>
        </TouchableOpacity>

        <View style={styles.headerWrap}>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Comece sua jornada de estudos 🚀</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Nome completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor="#4B5563"
            value={nome}
            onChangeText={setNome}
          />

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
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#4B5563"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          <Text style={styles.label}>Confirmar senha</Text>
          <TextInput
            style={[styles.input, confirmar.length > 0 && senha !== confirmar && styles.inputErro]}
            placeholder="Repita a senha"
            placeholderTextColor="#4B5563"
            value={confirmar}
            onChangeText={setConfirmar}
            secureTextEntry
          />
          {confirmar.length > 0 && senha !== confirmar && (
            <Text style={styles.erroText}>As senhas não coincidem</Text>
          )}

          <TouchableOpacity
            style={[styles.cadastroBtn, loading && { opacity: 0.6 }]}
            onPress={handleCadastro}
            disabled={loading}>
            <Text style={styles.cadastroBtnText}>{loading ? 'Criando conta...' : 'Criar Conta'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginLink}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  glowBg: { position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: '#7C3AED22', opacity: 0.5 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  backBtn: { marginBottom: 24 },
  backText: { fontSize: 16, color: PURPLE_LIGHT, fontWeight: '600' },
  headerWrap: { marginBottom: 28 },
  title: { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 6 },
  card: { backgroundColor: CARD_BG, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: BORDER, marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', marginBottom: 6, letterSpacing: 0.5 },
  input: { backgroundColor: '#0D0D14', borderRadius: 12, padding: 14, fontSize: 15, color: '#fff', borderWidth: 1, borderColor: BORDER, marginBottom: 16 },
  inputErro: { borderColor: '#EF4444' },
  erroText: { fontSize: 12, color: '#EF4444', marginTop: -10, marginBottom: 12 },
  cadastroBtn: { backgroundColor: PURPLE, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4, shadowColor: PURPLE, shadowOpacity: 0.5, shadowRadius: 12, elevation: 6 },
  cadastroBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontSize: 14, color: '#6B7280' },
  loginLink: { fontSize: 14, color: PURPLE_LIGHT, fontWeight: '700' },
});
