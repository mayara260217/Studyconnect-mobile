import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, xpNivelAtual, xpProximoNivel } from '@/contexts/auth-context';

const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#A78BFA';
const BG = '#050505';
const CARD_BG = '#111118';
const BORDER = '#1E1E2E';

export default function PerfilScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const nivel = user?.nivel ?? 1;
  const xpAtual = user?.xp ?? 0;
  const xpBase = xpNivelAtual(nivel);
  const xpProximo = xpProximoNivel(nivel);
  const xpPct = Math.min(((xpAtual - xpBase) / Math.max(xpProximo - xpBase, 1)) * 100, 100);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 90 }}>
      <View style={styles.glowBg} />

      <View style={styles.headerSection}>
        <View style={styles.avatarWrap}>
          {user?.foto ? <Image source={{ uri: user.foto }} style={styles.avatar} /> : (
            <View style={styles.avatarPlaceholder}><Text style={styles.avatarLetra}>{(user?.nome ?? 'E').charAt(0).toUpperCase()}</Text></View>
          )}
          <View style={styles.nivelBadge}><Text style={styles.nivelBadgeText}>Nv.{nivel}</Text></View>
        </View>
        <Text style={styles.nome}>{user?.nome ?? 'Estudante'}</Text>
        <Text style={styles.email}>{user?.email ?? ''}</Text>
        {user?.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

        <View style={styles.xpWrap}>
          <View style={styles.xpRow}>
            <Text style={styles.xpLabel}>XP {xpAtual} / {xpProximo}</Text>
            <Text style={styles.xpPct}>{Math.round(xpPct)}%</Text>
          </View>
          <View style={styles.xpBg}><View style={[styles.xpFill, { width: `${xpPct}%` as any }]} /></View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <Stat value={user?.diasConsecutivos ?? 0} label="Dias seguidos" />
        <Stat value={`${user?.horasEstudadas ?? 0}h`} label="Horas estudadas" />
        <Stat value={user?.questoesResolvidas ?? 0} label="Questões" />
        <Stat value={user?.redacoesFeitas ?? 0} label="Redações" />
        <Stat value={user?.simuladosConcluidos ?? 0} label="Simulados" />
        <Stat value={user?.materiaisEnviados ?? 0} label="Materiais" />
      </View>

      <Text style={styles.sectionTitle}>CONTA</Text>
      <Option label="Editar Perfil" icon="✏️" onPress={() => router.push('/editar-perfil')} />
      <Option label="Configurações" icon="⚙️" onPress={() => router.push('/configuracoes')} />


    </ScrollView>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Option({ label, icon, onPress }: { label: string; icon: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.optionCard} onPress={onPress}>
      <Text style={styles.optionIcon}>{icon}</Text>
      <Text style={styles.optionLabel}>{label}</Text>
      <Text style={styles.optionArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  glowBg: { position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: '#7C3AED22', opacity: 0.5 },
  headerSection: { alignItems: 'center', paddingHorizontal: 22, marginBottom: 20 },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: { width: 92, height: 92, borderRadius: 46, borderWidth: 2.5, borderColor: PURPLE },
  avatarPlaceholder: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#1E1040', justifyContent: 'center', alignItems: 'center', borderWidth: 2.5, borderColor: PURPLE },
  avatarLetra: { color: PURPLE_LIGHT, fontSize: 36, fontWeight: '900' },
  nivelBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: PURPLE, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 2, borderColor: BG },
  nivelBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  nome: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 4 },
  email: { color: '#6B7280', fontSize: 13 },
  bio: { color: '#9CA3AF', fontSize: 13, textAlign: 'center', marginTop: 8 },
  xpWrap: { width: '100%', marginTop: 16 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpLabel: { color: '#6B7280', fontSize: 12 },
  xpPct: { color: PURPLE_LIGHT, fontSize: 12, fontWeight: '900' },
  xpBg: { height: 7, backgroundColor: '#1E1E2E', borderRadius: 4, overflow: 'hidden' },
  xpFill: { height: 7, backgroundColor: PURPLE, borderRadius: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginHorizontal: 22, marginBottom: 26 },
  statCard: { width: '31%', backgroundColor: CARD_BG, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  statValue: { color: '#fff', fontSize: 17, fontWeight: '900' },
  statLabel: { color: '#6B7280', fontSize: 10, textAlign: 'center', marginTop: 3 },
  sectionTitle: { color: '#4B5563', fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 12, paddingHorizontal: 22 },

  optionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CARD_BG, borderRadius: 14, padding: 16, marginHorizontal: 22, marginBottom: 10, borderWidth: 1, borderColor: BORDER },
  optionIcon: { fontSize: 18 },
  optionLabel: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '700' },
  optionArrow: { color: '#4B5563', fontSize: 20 },

});
