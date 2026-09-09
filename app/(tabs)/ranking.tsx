import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';

const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#A78BFA';
const BG = '#050505';
const CARD_BG = '#111118';
const BORDER = '#1E1E2E';

type Periodo = 'Semanal' | 'Mensal' | 'Geral';
type RankingItem = { nome: string; avatar: string; nivel: number; xp: number; cor: string; isVoce?: boolean; pos?: number };

type TipoMeta = 'Diária' | 'Semanal';
type Meta = { id: number; titulo: string; tipo: TipoMeta; alvo: string; xp: number; concluida: boolean };

export default function RankingScreen() {
  const insets = useSafeAreaInsets();
  const { user, ganharXP, atualizarUser } = useAuth();
  const [aba, setAba] = useState<'metas' | 'ranking'>('metas');
  const [periodo, setPeriodo] = useState<Periodo>('Semanal');
  const [modalAdd, setModalAdd] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<TipoMeta>('Diária');
  const [alvo, setAlvo] = useState('Resolver 20 questões');
  const [xp, setXp] = useState('30');
  const [rankingData, setRankingData] = useState<RankingItem[]>([]);
  const [carregandoRanking, setCarregandoRanking] = useState(false);
  const [metas, setMetas] = useState<Meta[]>([]);

  useEffect(() => {
    if (aba !== 'ranking') return;
    setCarregandoRanking(true);
    // TODO: substituir pela URL real da API
    fetch(`http://SEU_BACKEND/api/ranking?periodo=${periodo}`)
      .then((r) => r.json())
      .then((data: RankingItem[]) => setRankingData(data))
      .catch(() => setRankingData([]))
      .finally(() => setCarregandoRanking(false));
  }, [aba, periodo]);

  const ranking = useMemo(() => {
    const voce: RankingItem = {
      nome: user?.nome ?? 'Você',
      avatar: (user?.nome ?? 'V').charAt(0).toUpperCase(),
      nivel: user?.nivel ?? 1,
      xp: user?.ocultarRanking ? 0 : user?.xp ?? 0,
      cor: PURPLE,
      isVoce: true,
    };
    const lista = rankingData.some((r) => r.nome === voce.nome)
      ? rankingData
      : [...rankingData, voce];
    return lista.sort((a, b) => b.xp - a.xp).map((item, index) => ({ ...item, pos: index + 1 }));
  }, [rankingData, user]);

  const voce = ranking.find((item) => item.isVoce);
  const pendentes = metas.filter((m) => !m.concluida);
  const concluidas = metas.filter((m) => m.concluida);

  function concluirMeta(meta: Meta) {
    if (meta.concluida) return;
    setMetas((prev) => prev.map((m) => m.id === meta.id ? { ...m, concluida: true } : m));
    const result = ganharXP(meta.xp, 'meta_concluida');
    const horas = meta.titulo.toLowerCase().includes('hora') ? 1 : 0;
    const questoes = meta.titulo.toLowerCase().includes('quest') ? 20 : 0;
    const redacoes = meta.titulo.toLowerCase().includes('redação') || meta.titulo.toLowerCase().includes('redações') ? 2 : 0;
    const simulados = meta.titulo.toLowerCase().includes('simulado') ? 1 : 0;
    atualizarUser({
      horasEstudadas: (user?.horasEstudadas ?? 0) + horas,
      questoesResolvidas: (user?.questoesResolvidas ?? 0) + questoes,
      redacoesFeitas: (user?.redacoesFeitas ?? 0) + redacoes,
      simuladosConcluidos: (user?.simuladosConcluidos ?? 0) + simulados,
    });
    if (result.levelUp) Alert.alert('Level up!', `Você chegou ao nível ${result.novoNivel}.`);
  }

  function salvarMeta() {
    if (!titulo.trim()) return;
    setMetas((prev) => [...prev, { id: Date.now(), titulo: titulo.trim(), tipo, alvo: alvo.trim() || titulo.trim(), xp: parseInt(xp, 10) || 20, concluida: false }]);
    setTitulo('');
    setAlvo('Resolver 20 questões');
    setXp('30');
    setTipo('Diária');
    setModalAdd(false);
  }

  function resetMetas() {
    setMetas((prev) => prev.map((m) => ({ ...m, concluida: false })));
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.glowBg} />
      <View style={styles.header}>
        <Text style={styles.title}>Metas & Ranking</Text>
        <Text style={styles.subtitle}>Ganhe XP estudando todos os dias</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tabBtn, aba === 'metas' && styles.tabActive]} onPress={() => setAba('metas')}><Text style={[styles.tabText, aba === 'metas' && styles.tabTextActive]}>Metas</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, aba === 'ranking' && styles.tabActive]} onPress={() => setAba('ranking')}><Text style={[styles.tabText, aba === 'ranking' && styles.tabTextActive]}>Ranking</Text></TouchableOpacity>
      </View>

      {aba === 'metas' ? (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]} showsVerticalScrollIndicator={false}>
          <View style={styles.goalSummary}>
            <Text style={styles.goalSummaryValue}>{concluidas.length}/{metas.length}</Text>
            <Text style={styles.goalSummaryText}>metas concluídas hoje</Text>
            <TouchableOpacity onPress={resetMetas}><Text style={styles.resetText}>Reiniciar ciclo</Text></TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalAdd(true)}><Text style={styles.addBtnText}>+ Nova meta</Text></TouchableOpacity>

          <Text style={styles.sectionLabel}>PENDENTES</Text>
          {pendentes.length === 0 ? <Empty text="Todas as metas foram concluídas." /> : pendentes.map((m) => <MetaCard key={m.id} meta={m} onDone={() => concluirMeta(m)} />)}

          {concluidas.length > 0 && <Text style={styles.sectionLabel}>CONCLUÍDAS</Text>}
          {concluidas.map((m) => <MetaCard key={m.id} meta={m} onDone={() => {}} />)}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]} showsVerticalScrollIndicator={false}>
          <View style={styles.periodRow}>
            {(['Semanal', 'Mensal', 'Geral'] as Periodo[]).map((p) => (
              <TouchableOpacity key={p} onPress={() => setPeriodo(p)} style={[styles.periodBtn, periodo === p && styles.periodActive]}>
                <Text style={[styles.periodText, periodo === p && styles.periodTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.youCard}>
            <Text style={styles.youText}>Você está em <Text style={styles.youStrong}>{voce?.pos ?? '-' }º</Text> com <Text style={styles.youStrong}>{voce?.xp ?? 0} XP</Text></Text>
          </View>
          {carregandoRanking ? (
            <ActivityIndicator color={PURPLE} style={{ marginTop: 40 }} />
          ) : ranking.map((item) => (
            <View key={item.nome} style={[styles.rankCard, item.isVoce && styles.rankCardYou]}>
              <Text style={styles.rankPos}>{item.pos}º</Text>
              <View style={[styles.avatar, { borderColor: item.cor, backgroundColor: item.cor + '22' }]}><Text style={[styles.avatarText, { color: item.cor }]}>{item.avatar}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rankName, item.isVoce && { color: PURPLE_LIGHT }]}>{item.nome}</Text>
                <Text style={styles.rankLevel}>Nível {item.nivel}</Text>
              </View>
              <Text style={styles.rankXp}>{item.xp} XP</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={modalAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Nova meta</Text>
            <Text style={styles.modalLabel}>Título</Text>
            <TextInput style={styles.input} placeholder="Ex: Resolver 30 questões" placeholderTextColor="#4B5563" value={titulo} onChangeText={setTitulo} />
            <Text style={styles.modalLabel}>Tipo</Text>
            <View style={styles.typeRow}>
              {(['Diária', 'Semanal'] as TipoMeta[]).map((t) => (
                <TouchableOpacity key={t} onPress={() => setTipo(t)} style={[styles.typeBtn, tipo === t && styles.typeActive]}><Text style={[styles.typeText, tipo === t && styles.typeTextActive]}>{t}</Text></TouchableOpacity>
              ))}
            </View>
            <Text style={styles.modalLabel}>Alvo</Text>
            <TextInput style={styles.input} placeholder="20 questões, 1 hora..." placeholderTextColor="#4B5563" value={alvo} onChangeText={setAlvo} />
            <Text style={styles.modalLabel}>XP da recompensa</Text>
            <TextInput style={styles.input} placeholder="30" placeholderTextColor="#4B5563" value={xp} onChangeText={setXp} keyboardType="numeric" />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalAdd(false)}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={salvarMeta}><Text style={styles.saveText}>Salvar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MetaCard({ meta, onDone }: { meta: Meta; onDone: () => void }) {
  return (
    <View style={[styles.metaCard, meta.concluida && { opacity: 0.55 }]}>
      <TouchableOpacity onPress={onDone} style={[styles.check, meta.concluida && styles.checkDone]}><Text style={styles.checkText}>{meta.concluida ? '✓' : ''}</Text></TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={[styles.metaTitle, meta.concluida && { textDecorationLine: 'line-through', color: '#4B5563' }]}>{meta.titulo}</Text>
        <Text style={styles.metaSub}>{meta.tipo} · {meta.alvo}</Text>
      </View>
      <Text style={styles.metaXp}>+{meta.xp} XP</Text>
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return <View style={styles.empty}><Text style={styles.emptyText}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  glowBg: { position: 'absolute', top: -80, left: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: '#7C3AED22', opacity: 0.5 },
  header: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 12 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900' },
  subtitle: { color: '#6B7280', marginTop: 4, fontSize: 13 },
  tabRow: { flexDirection: 'row', marginHorizontal: 22, marginBottom: 18, backgroundColor: CARD_BG, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: BORDER },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: PURPLE },
  tabText: { color: '#6B7280', fontWeight: '800' },
  tabTextActive: { color: '#fff' },
  content: { paddingHorizontal: 22 },
  goalSummary: { backgroundColor: CARD_BG, borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 18, alignItems: 'center', marginBottom: 14 },
  goalSummaryValue: { color: '#fff', fontSize: 28, fontWeight: '900' },
  goalSummaryText: { color: '#6B7280', fontSize: 13, marginTop: 2 },
  resetText: { color: PURPLE_LIGHT, fontSize: 12, fontWeight: '800', marginTop: 10 },
  addBtn: { backgroundColor: PURPLE, borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 18 },
  addBtnText: { color: '#fff', fontWeight: '900' },
  sectionLabel: { color: '#4B5563', fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10, marginTop: 6 },
  metaCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CARD_BG, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: BORDER, marginBottom: 10 },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#4B5563', alignItems: 'center', justifyContent: 'center' },
  checkDone: { backgroundColor: PURPLE, borderColor: PURPLE },
  checkText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  metaTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  metaSub: { color: '#6B7280', fontSize: 11, marginTop: 3 },
  metaXp: { color: PURPLE_LIGHT, fontSize: 12, fontWeight: '900' },
  empty: { backgroundColor: CARD_BG, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 12 },
  emptyText: { color: '#6B7280', textAlign: 'center' },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  periodBtn: { flex: 1, backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER, borderRadius: 12, padding: 10, alignItems: 'center' },
  periodActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  periodText: { color: '#6B7280', fontWeight: '800', fontSize: 12 },
  periodTextActive: { color: '#fff' },
  youCard: { backgroundColor: '#2D1B6933', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: PURPLE, marginBottom: 14 },
  youText: { color: '#9CA3AF', textAlign: 'center', fontSize: 13 },
  youStrong: { color: PURPLE_LIGHT, fontWeight: '900' },
  rankCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CARD_BG, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: BORDER, marginBottom: 8 },
  rankCardYou: { borderColor: PURPLE, backgroundColor: '#2D1B6933' },
  rankPos: { color: '#6B7280', fontWeight: '900', width: 30 },
  avatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '900' },
  rankName: { color: '#fff', fontWeight: '800', fontSize: 14 },
  rankLevel: { color: '#6B7280', fontSize: 11, marginTop: 2 },
  rankXp: { color: '#9CA3AF', fontWeight: '900', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#0D0D14', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: BORDER },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 16 },
  modalLabel: { color: '#9CA3AF', fontSize: 12, fontWeight: '800', marginBottom: 6 },
  input: { backgroundColor: CARD_BG, borderRadius: 12, padding: 13, color: '#fff', borderWidth: 1, borderColor: BORDER, marginBottom: 14 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  typeBtn: { flex: 1, backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER, borderRadius: 12, padding: 12, alignItems: 'center' },
  typeActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  typeText: { color: '#6B7280', fontWeight: '900' },
  typeTextActive: { color: '#fff' },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER, borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelText: { color: '#6B7280', fontWeight: '900' },
  saveBtn: { flex: 1, backgroundColor: PURPLE, borderRadius: 12, padding: 14, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '900' },
});
