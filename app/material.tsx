import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ASSETS_MATERIAIS } from '@/utils/assets-materiais';

const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#A78BFA';
const BG = '#050505';
const CARD_BG = '#111118';
const BORDER = '#1E1E2E';

const TIPO_ICON: Record<string, string> = {
  PDF: '📕',
  Resumo: '📝',
  'Mapa Mental': '🗺️',
  Word: '📘',
  Exercício: '✏️',
};

const TIPO_COR: Record<string, string> = {
  PDF: '#EC4899',
  Resumo: '#7C3AED',
  'Mapa Mental': '#22C55E',
  Word: '#06B6D4',
  Exercício: '#F59E0B',
};

export default function MaterialScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, titulo, tipo, materia, data, cor } = useLocalSearchParams<{
    id: string; titulo: string; tipo: string; materia: string; data: string; cor: string;
  }>();

  const corTipo = cor ?? TIPO_COR[tipo] ?? PURPLE;
  const asset = ASSETS_MATERIAIS[id];
  const isPDF = tipo === 'PDF';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.glowBg, { backgroundColor: corTipo + '22' }]} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Voltar</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={[styles.tipoBadge, { backgroundColor: corTipo + '22', borderColor: corTipo }]}>
            <Text style={styles.tipoIcon}>{TIPO_ICON[tipo] ?? '📄'}</Text>
            <Text style={[styles.tipoText, { color: corTipo }]}>{tipo}</Text>
          </View>
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.meta}>{materia} · {data}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        {!asset ? (
          <View style={styles.semConteudo}>
            <Text style={styles.semConteudoText}>Material não encontrado.</Text>
          </View>
        ) : isPDF ? (
          <View style={styles.pdfCard}>
            <Text style={styles.pdfIconEmoji}>📕</Text>
            <Text style={styles.pdfTitulo}>{titulo}</Text>
            <Text style={styles.pdfSub}>Arquivo PDF — disponível para visualização no app mobile.</Text>
          </View>
        ) : (
          <Image
            source={asset}
            style={styles.imagem}
            contentFit="contain"
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  glowBg: { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, opacity: 0.4 },
  header: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 20 },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 16, color: PURPLE_LIGHT, fontWeight: '600' },
  headerInfo: { gap: 8 },
  tipoBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, borderWidth: 1, gap: 6 },
  tipoIcon: { fontSize: 14 },
  tipoText: { fontSize: 12, fontWeight: '700' },
  titulo: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  meta: { fontSize: 13, color: '#6B7280' },
  content: { paddingHorizontal: 16 },
  imagem: { width: '100%', minHeight: 600, borderRadius: 12 },
  pdfCard: { backgroundColor: CARD_BG, borderRadius: 20, padding: 40, borderWidth: 1, borderColor: BORDER, alignItems: 'center', gap: 12 },
  pdfIconEmoji: { fontSize: 52 },
  pdfTitulo: { color: '#fff', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  pdfSub: { color: '#6B7280', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  semConteudo: { backgroundColor: CARD_BG, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: BORDER, alignItems: 'center' },
  semConteudoText: { color: '#6B7280', fontSize: 14 },
});
