import { Image } from 'expo-image';
import { Text, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';
import { useNotif } from '@/contexts/notif-context';

const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#A78BFA';
const BG = '#050505';
const CARD_BG = '#111118';

function getDiaSemana() {
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const now = new Date();
  return `${dias[now.getDay()]}, ${now.getDate()} ${meses[now.getMonth()]}`;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { naoLidas } = useNotif();

  const primeiroNome = user?.nome?.split(' ')[0] ?? 'Estudante';
  const inicial = primeiroNome.charAt(0).toUpperCase();
  const metaPct = user ? Math.min(Math.round((user.xp / 1000) * 100), 100) : 0;
  const metaFeitas = user ? Math.round((user.xp / 1000) * 50) : 0;
  const metaFaltam = Math.max(50 - metaFeitas, 0);

  return (
    <View style={styles.container}>
      <View style={styles.glowBg} />
      <View style={styles.glowBg2} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 90 }]}>

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={styles.logoStudy}>Study</Text>
            <Text style={styles.logoConnect}>Connect</Text>
            <Text style={styles.logoPlus}>+</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/notificacoes')} style={styles.notifBtn}>
            <View style={styles.notifIconWrap}>
              <View style={styles.bellBody} />
              <View style={styles.bellTop} />
              <View style={styles.bellBottom} />
              {naoLidas > 0 && <View style={styles.notifDot} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Saudação */}
        <View style={styles.saudacaoRow}>
          <View>
            <Text style={styles.saudacaoTexto}>
              Olá, <Text style={styles.saudacaoNome}>{primeiroNome}</Text>
            </Text>
            <Text style={styles.saudacaoData}>{getDiaSemana()}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/perfil')} style={styles.avatarBorder}>
            {user?.foto ? (
              <Image source={{ uri: user.foto }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarLetra}>{inicial}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Card Meta */}
        <View style={styles.metaCard}>
          <View style={styles.metaCardHeader}>
            <Text style={styles.metaCardTitulo}>Sua meta da semana</Text>
            <Text style={styles.metaCardPct}>{metaPct}%</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${metaPct}%` as any }]} />
          </View>
          <Text style={styles.metaCardSub}>
            {metaFeitas} feitas · {metaFaltam > 0 ? `faltam ${metaFaltam} pra bater a meta` : 'meta batida! 🎉'}
          </Text>
        </View>


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  glowBg: { position: 'absolute', top: -100, left: -100, width: 320, height: 320, borderRadius: 160, backgroundColor: '#7C3AED33', opacity: 0.5 },
  glowBg2: { position: 'absolute', bottom: 100, right: -80, width: 200, height: 200, borderRadius: 100, backgroundColor: '#1E3A5F44', opacity: 0.4 },
  scroll: { paddingHorizontal: 22 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  logoStudy: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  logoConnect: { fontSize: 26, fontWeight: '800', color: PURPLE, letterSpacing: -0.5 },
  logoPlus: { fontSize: 22, fontWeight: '800', color: PURPLE_LIGHT },
  notifBtn: { padding: 4 },
  notifIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2D1B69', borderWidth: 1.5, borderColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', shadowColor: '#7C3AED', shadowOpacity: 0.8, shadowRadius: 10, elevation: 6 },
  bellBody: { width: 16, height: 14, borderRadius: 8, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: '#A78BFA', marginTop: 2 },
  bellTop: { position: 'absolute', top: 8, width: 4, height: 4, borderRadius: 2, backgroundColor: '#A78BFA' },
  bellBottom: { position: 'absolute', bottom: 8, width: 8, height: 3, borderRadius: 2, backgroundColor: '#A78BFA' },
  notifDot: { position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#2D1B69' },
  saudacaoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  saudacaoTexto: { fontSize: 22, color: '#fff', fontWeight: '400' },
  saudacaoNome: { fontSize: 22, color: '#fff', fontWeight: '800' },
  saudacaoData: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  avatarBorder: { padding: 2, borderRadius: 26, borderWidth: 2, borderColor: PURPLE, shadowColor: PURPLE, shadowOpacity: 0.8, shadowRadius: 8, elevation: 6 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1E1040', justifyContent: 'center', alignItems: 'center' },
  avatarImg: { width: 42, height: 42, borderRadius: 21 },
  avatarLetra: { fontSize: 18, fontWeight: '700', color: PURPLE_LIGHT },
  metaCard: { backgroundColor: CARD_BG, borderRadius: 20, padding: 18, marginBottom: 28, borderWidth: 1, borderColor: '#1E1E2E', shadowColor: PURPLE, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  metaCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  metaCardTitulo: { fontSize: 14, color: '#9CA3AF', fontWeight: '500' },
  metaCardPct: { fontSize: 20, fontWeight: '800', color: PURPLE_LIGHT },
  progressBg: { height: 6, backgroundColor: '#1E1E2E', borderRadius: 3, marginBottom: 10 },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: PURPLE, shadowColor: PURPLE, shadowOpacity: 1, shadowRadius: 6 },
  metaCardSub: { fontSize: 12, color: '#6B7280' },
});
