import { useState } from 'react';
import { Text, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotif } from '@/contexts/notif-context';

const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#A78BFA';
const BG = '#050505';
const CARD_BG = '#111118';
const BORDER = '#1E1E2E';

export default function NotificacoesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { notificacoes, naoLidas, marcarLida, marcarTodasLidas, limpar } = useNotif();

  const [expandido, setExpandido] = useState<string | null>(null);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.glowBg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Voltar</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Notificações</Text>
          {naoLidas > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{naoLidas}</Text>
            </View>
          )}
        </View>
        <View style={styles.acoes}>
          {naoLidas > 0 && (
            <TouchableOpacity onPress={marcarTodasLidas} style={styles.acaoBtn}>
              <Text style={styles.acaoBtnText}>Marcar todas como lidas</Text>
            </TouchableOpacity>
          )}
          {notificacoes.length > 0 && (
            <TouchableOpacity onPress={limpar} style={styles.acaoBtnDanger}>
              <Text style={styles.acaoBtnDangerText}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>

        {notificacoes.length === 0 && (
          <View style={styles.vazio}>
            <Text style={styles.vazioEmoji}>🔔</Text>
            <Text style={styles.vazioTitulo}>Nenhuma notificação</Text>
            <Text style={styles.vazioSub}>Você está em dia com tudo!</Text>
          </View>
        )}

        {notificacoes.length > 0 && (
          <>
            <Text style={styles.secaoLabel}>TODAS</Text>
            {notificacoes.map((n) => {
              const aberto = expandido === n.id;
              return (
                <TouchableOpacity
                  key={n.id}
                  onPress={() => {
                    setExpandido(aberto ? null : n.id);
                    marcarLida(n.id);
                  }}
                  activeOpacity={0.75}
                  style={[styles.card, !n.lida && styles.cardNaoLida, aberto && styles.cardAberto]}>
                  {!n.lida && <View style={styles.dotNaoLida} />}
                  <View style={styles.cardTopo}>
                    <View style={styles.cardIconBox}>
                      <Text style={styles.cardIcon}>📚</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={[styles.cardTitulo, !n.lida && { color: '#fff' }]}>{n.titulo}</Text>
                      <Text style={styles.cardData}>{n.data}</Text>
                    </View>
                    <Text style={styles.chevron}>{aberto ? '▲' : '▼'}</Text>
                  </View>
                  {aberto && (
                    <View style={styles.cardExpand}>
                      <View style={styles.cardExpandDivider} />
                      <Text style={styles.cardDesc}>{n.descricao}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  glowBg: { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: '#7C3AED22', opacity: 0.4 },
  header: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 16 },
  backBtn: { marginBottom: 10 },
  backText: { fontSize: 16, color: PURPLE_LIGHT, fontWeight: '600' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  badge: { backgroundColor: '#EF4444', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  acoes: { flexDirection: 'row', gap: 10 },
  acaoBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: PURPLE + '22', borderWidth: 1, borderColor: PURPLE },
  acaoBtnText: { fontSize: 12, color: PURPLE_LIGHT, fontWeight: '600' },
  acaoBtnDanger: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#EF444422', borderWidth: 1, borderColor: '#EF444444' },
  acaoBtnDangerText: { fontSize: 12, color: '#EF4444', fontWeight: '600' },
  content: { paddingHorizontal: 22 },
  secaoLabel: { fontSize: 11, fontWeight: '700', color: '#4B5563', letterSpacing: 1.5, marginBottom: 10 },
  card: { backgroundColor: CARD_BG, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: BORDER },
  cardAberto: { borderColor: PURPLE + '88' },
  cardNaoLida: { borderColor: PURPLE + '55', backgroundColor: '#111128' },
  dotNaoLida: { position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: 4, backgroundColor: PURPLE },
  cardTopo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#2D1B69', justifyContent: 'center', alignItems: 'center' },
  cardIcon: { fontSize: 18 },
  cardInfo: { flex: 1 },
  cardTitulo: { fontSize: 14, fontWeight: '700', color: '#D1D5DB', marginBottom: 2 },
  cardData: { fontSize: 11, color: '#374151' },
  chevron: { color: '#4B5563', fontSize: 10, fontWeight: '900' },
  cardExpand: { marginTop: 12 },
  cardExpandDivider: { height: 1, backgroundColor: BORDER, marginBottom: 10 },
  cardDesc: { fontSize: 13, color: '#9CA3AF', lineHeight: 20 },
  vazio: { alignItems: 'center', paddingTop: 80, gap: 8 },
  vazioEmoji: { fontSize: 48 },
  vazioTitulo: { fontSize: 18, fontWeight: '700', color: '#6B7280' },
  vazioSub: { fontSize: 13, color: '#374151' },
});
