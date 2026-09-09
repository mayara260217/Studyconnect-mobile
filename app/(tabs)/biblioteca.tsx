import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const PURPLE = '#7C3AED';
const BG = '#050505';
const CARD_BG = '#111118';
const BORDER = '#1E1E2E';

export type Material = {
  id: string;
  titulo: string;
  materia: string;
  tipo: string;
  categoria: string;
  data: string;
  cor: string;
};

const CATEGORIAS = ['Todos', 'Resumos', 'PDFs', 'Word', 'Mapa Mental'];

const COR_POR_TIPO: Record<string, string> = {
  PDF: '#EC4899',
  Resumo: '#7C3AED',
  Word: '#3B82F6',
  'Mapa Mental': '#22C55E',
};

const TIPO_ICON: Record<string, string> = {
  PDF: '📕',
  Resumo: '📝',
  Word: '📘',
  'Mapa Mental': '🗺️',
};

export default function BibliotecaScreen() {
  const router = useRouter();
  const [categoria, setCategoria] = useState('Todos');
  const [busca, setBusca] = useState('');
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // TODO: substituir pela URL real da API
    fetch('http://SEU_BACKEND/api/materiais')
      .then((r) => r.json())
      .then((data: Material[]) => {
        const normalizados = data.map((m) => ({
          ...m,
          cor: m.cor ?? COR_POR_TIPO[m.tipo] ?? '#7C3AED',
        }));
        setMateriais(normalizados);
      })
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  const filtrados = useMemo(() => materiais.filter((m) => {
    const matchCategoria = categoria === 'Todos' || m.categoria === categoria;
    const termo = busca.toLowerCase();
    const matchBusca = m.titulo.toLowerCase().includes(termo) || m.materia.toLowerCase().includes(termo);
    return matchCategoria && matchBusca;
  }), [categoria, busca, materiais]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.glowBg} />
      <View style={styles.header}>
        <Text style={styles.title}>Biblioteca</Text>
        <Text style={styles.subtitle}>{materiais.length} materiais</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput style={styles.searchInput} placeholder="Buscar material..." placeholderTextColor="#4B5563" value={busca} onChangeText={setBusca} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={styles.filterScroll}>
        {CATEGORIAS.map((c) => (
          <TouchableOpacity key={c} onPress={() => setCategoria(c)} style={[styles.chip, categoria === c && styles.chipActive]}>
            <Text style={[styles.chipText, categoria === c && styles.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {carregando ? (
          <ActivityIndicator color={PURPLE} style={{ marginTop: 60 }} />
        ) : filtrados.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Nenhum material encontrado</Text>
            <Text style={styles.emptySub}>Tente outro filtro.</Text>
          </View>
        ) : filtrados.map((item) => (
          <TouchableOpacity key={item.id} activeOpacity={0.78} onPress={() => router.push({ pathname: '/material', params: { id: item.id, titulo: item.titulo, tipo: item.tipo, materia: item.materia, data: item.data, cor: item.cor } })} style={[styles.card, { borderLeftColor: item.cor }]}>
            <View style={[styles.iconBox, { backgroundColor: item.cor + '22' }]}>
              <Text style={styles.icon}>{TIPO_ICON[item.tipo] ?? '📄'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.titulo}</Text>
              <Text style={styles.cardMeta}>{item.tipo} · {item.materia}</Text>
              <Text style={styles.cardMeta}>{item.data}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  glowBg: { position: 'absolute', top: -80, right: -80, width: 250, height: 250, borderRadius: 125, backgroundColor: '#3B82F633', opacity: 0.4 },
  header: { paddingHorizontal: 22, paddingTop: 4, paddingBottom: 4 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900' },
  subtitle: { color: '#6B7280', fontSize: 13, marginTop: 4 },
  searchWrap: { marginHorizontal: 22, marginBottom: 0, backgroundColor: CARD_BG, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: BORDER },
  searchInput: { color: '#fff', paddingVertical: 12 },
  filterScroll: { flexShrink: 0, maxHeight: 44 },
  filterRow: { paddingHorizontal: 22, paddingVertical: 4, gap: 8, alignItems: 'center' },
  chip: { height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },
  chipActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  chipText: { color: '#6B7280', fontWeight: '800', fontSize: 12 },
  chipTextActive: { color: '#fff' },
  listScroll: { flex: 1 },
  list: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 90 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: CARD_BG, borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: BORDER, borderLeftWidth: 3 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 20 },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: '900' },
  cardMeta: { color: '#6B7280', fontSize: 11, marginTop: 2 },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 42 },
  emptyTitle: { color: '#9CA3AF', fontSize: 16, fontWeight: '900', marginTop: 8 },
  emptySub: { color: '#4B5563', fontSize: 13, marginTop: 4 },
});
