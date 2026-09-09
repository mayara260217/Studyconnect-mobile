import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';

const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#A78BFA';
const BG = '#050505';
const CARD_BG = '#111118';
const BORDER = '#1E1E2E';

export default function EditarPerfilScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, atualizarUser } = useAuth();

  const [nome, setNome] = useState(user?.nome ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [telefone, setTelefone] = useState(user?.telefone ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [foto, setFoto] = useState<string | null>(user?.foto ?? null);

  async function escolherFoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setFoto(result.assets[0].uri);
  }

  function salvar() {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'O nome não pode estar vazio.');
      return;
    }
    atualizarUser({ nome: nome.trim(), email: email.trim(), telefone: telefone.trim(), bio: bio.trim(), foto });
    router.back();
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.glowBg} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Editar Perfil</Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={escolherFoto} activeOpacity={0.8} style={styles.avatarWrap}>
            {foto ? (
              <Image source={{ uri: foto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarLetra}>{nome.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.cameraBtn}>
              <View style={styles.cameraCorpo}>
                <View style={styles.cameraLente} />
                <View style={styles.cameraSaliente} />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Toque para alterar a foto</Text>
        </View>

        {/* Campos */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>INFORMAÇÕES PESSOAIS</Text>

          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome completo"
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

          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            placeholder="(00) 00000-0000"
            placeholderTextColor="#4B5563"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Fale um pouco sobre você..."
            placeholderTextColor="#4B5563"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity style={styles.salvarBtn} onPress={salvar}>
          <Text style={styles.salvarText}>Salvar Alterações</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  glowBg: { position: 'absolute', top: -80, left: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: '#7C3AED22', opacity: 0.5 },
  scroll: { paddingHorizontal: 22 },

  header: { marginBottom: 28 },
  backBtn: { marginBottom: 10 },
  backText: { fontSize: 16, color: PURPLE_LIGHT, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },

  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarWrap: { position: 'relative', marginBottom: 10 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2.5, borderColor: PURPLE },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#1E1040',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2.5, borderColor: PURPLE,
    shadowColor: PURPLE, shadowOpacity: 0.5, shadowRadius: 12, elevation: 6,
  },
  avatarLetra: { fontSize: 40, fontWeight: '800', color: PURPLE_LIGHT },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: PURPLE,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2.5, borderColor: '#050505',
    shadowColor: PURPLE, shadowOpacity: 0.7, shadowRadius: 8, elevation: 5,
  },
  cameraCorpo: {
    width: 18, height: 13, borderRadius: 3,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  cameraLente: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: PURPLE,
  },
  cameraSaliente: {
    position: 'absolute', top: -4, left: 3,
    width: 5, height: 4, borderRadius: 1,
    backgroundColor: '#fff',
  },
  avatarHint: { fontSize: 13, color: '#6B7280' },

  card: { backgroundColor: CARD_BG, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: BORDER, marginBottom: 20 },
  cardSectionLabel: { fontSize: 11, fontWeight: '700', color: '#4B5563', letterSpacing: 1.5, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', marginBottom: 6, letterSpacing: 0.5 },
  input: {
    backgroundColor: '#0D0D14',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
  },
  inputMultiline: { height: 90, textAlignVertical: 'top' },

  salvarBtn: {
    backgroundColor: PURPLE,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: PURPLE,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  salvarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
