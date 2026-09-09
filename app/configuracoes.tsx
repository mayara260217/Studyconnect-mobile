import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';
import { getItem, setItem, deleteItem } from '@/utils/storage';

const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#A78BFA';
const BORDER = '#1E1E2E';

type Prefs = { notifMetas: boolean; notifSimulados: boolean };
const PREFS_KEY = 'studyconnect_prefs_v2';

export default function ConfiguracoesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, atualizarUser, logout } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>({ notifMetas: true, notifSimulados: true });
  const [modalSair, setModalSair] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);

  const BG = '#050505';
  const CARD_BG = '#111118';
  const TEXT = '#FFFFFF';
  const TEXT_MUTED = '#6B7280';
  const SECTION_COLOR = '#4B5563';

  useEffect(() => {
    getItem(PREFS_KEY).then((saved) => {
      if (saved) try { setPrefs(JSON.parse(saved)); } catch {}
    });
  }, []);

  function salvarPrefs(novas: Prefs) {
    setPrefs(novas);
    setItem(PREFS_KEY, JSON.stringify(novas));
  }

  function confirmarSair() {
    setModalSair(false);
    logout();
    router.replace('/login');
  }

  function confirmarExcluir() {
    setModalExcluir(false);
    deleteItem('studyconnect_user_v3');
    logout();
    router.replace('/login');
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: BG }]} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: TEXT }]}>Configurações</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: SECTION_COLOR }]}>CONTA</Text>
      <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: BORDER }]}>
        <NavRow label="Editar perfil" desc={user?.email ?? ''} onPress={() => router.push('/editar-perfil')} TEXT={TEXT} TEXT_MUTED={TEXT_MUTED} />
      </View>

      <Text style={[styles.sectionTitle, { color: SECTION_COLOR }]}>NOTIFICAÇÕES</Text>
      <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: BORDER }]}>
        <SwitchRow label="Metas" desc="Lembretes diários e semanais" value={prefs.notifMetas} onChange={(v) => salvarPrefs({ ...prefs, notifMetas: v })} TEXT={TEXT} TEXT_MUTED={TEXT_MUTED} />
        <View style={[styles.divider, { backgroundColor: BORDER }]} />
        <SwitchRow label="Simulados" desc="Datas e resultados" value={prefs.notifSimulados} onChange={(v) => salvarPrefs({ ...prefs, notifSimulados: v })} TEXT={TEXT} TEXT_MUTED={TEXT_MUTED} />
      </View>

      <Text style={[styles.sectionTitle, { color: SECTION_COLOR }]}>PRIVACIDADE</Text>
      <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: BORDER }]}>
        <SwitchRow label="Perfil público" desc="Mostrar foto, nível e XP" value={user?.perfilPublico ?? true} onChange={(v) => atualizarUser({ perfilPublico: v })} TEXT={TEXT} TEXT_MUTED={TEXT_MUTED} />
        <View style={[styles.divider, { backgroundColor: BORDER }]} />
        <SwitchRow label="Ocultar ranking" desc="Remover seu perfil das listas" value={user?.ocultarRanking ?? false} onChange={(v) => atualizarUser({ ocultarRanking: v })} TEXT={TEXT} TEXT_MUTED={TEXT_MUTED} />
      </View>

      <Text style={[styles.sectionTitle, { color: SECTION_COLOR }]}>SESSÃO</Text>
      <TouchableOpacity style={styles.sairBtn} onPress={() => setModalSair(true)}>
        <Text style={styles.sairText}>Sair da conta</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: SECTION_COLOR, marginTop: 24 }]}>ZONA DE PERIGO</Text>
      <TouchableOpacity style={styles.excluirBtn} onPress={() => setModalExcluir(true)}>
        <Text style={styles.excluirText}>Excluir conta</Text>
        <Text style={styles.excluirSub}>Esta ação é permanente e não pode ser desfeita</Text>
      </TouchableOpacity>

      {/* Modal Sair */}
      <Modal visible={modalSair} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: CARD_BG }]}>
            <Text style={styles.modalEmoji}>👋</Text>
            <Text style={[styles.modalTitulo, { color: TEXT }]}>Sair da conta?</Text>
            <Text style={[styles.modalDesc, { color: TEXT_MUTED }]}>Você precisará fazer login novamente para acessar o app.</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtnCancel, { borderColor: BORDER }]} onPress={() => setModalSair(false)}>
                <Text style={[styles.modalBtnCancelText, { color: TEXT_MUTED }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm} onPress={confirmarSair}>
                <Text style={styles.modalBtnConfirmText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Excluir */}
      <Modal visible={modalExcluir} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: CARD_BG }]}>
            <Text style={styles.modalEmoji}>⚠️</Text>
            <Text style={[styles.modalTitulo, { color: TEXT }]}>Excluir conta?</Text>
            <Text style={[styles.modalDesc, { color: TEXT_MUTED }]}>Todos os seus dados serão apagados permanentemente. Esta ação não pode ser desfeita.</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtnCancel, { borderColor: BORDER }]} onPress={() => setModalExcluir(false)}>
                <Text style={[styles.modalBtnCancelText, { color: TEXT_MUTED }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnExcluir} onPress={confirmarExcluir}>
                <Text style={styles.modalBtnConfirmText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function NavRow({ label, desc, onPress, TEXT, TEXT_MUTED }: { label: string; desc: string; onPress: () => void; TEXT: string; TEXT_MUTED: string }) {
  return (
    <TouchableOpacity style={styles.navRow} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: TEXT }]}>{label}</Text>
        <Text style={[styles.rowDesc, { color: TEXT_MUTED }]}>{desc}</Text>
      </View>
      <Text style={{ color: TEXT_MUTED, fontSize: 24 }}>›</Text>
    </TouchableOpacity>
  );
}

function SwitchRow({ label, desc, value, onChange, TEXT, TEXT_MUTED }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void; TEXT: string; TEXT_MUTED: string }) {
  return (
    <View style={styles.switchRow}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: TEXT }]}>{label}</Text>
        <Text style={[styles.rowDesc, { color: TEXT_MUTED }]}>{desc}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: BORDER, true: PURPLE }} thumbColor={value ? PURPLE_LIGHT : '#4B5563'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 22 },
  header: { marginBottom: 24 },
  backBtn: { marginBottom: 8 },
  backText: { color: PURPLE_LIGHT, fontSize: 16, fontWeight: '800' },
  title: { fontSize: 28, fontWeight: '900' },
  sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10 },
  card: { borderRadius: 18, padding: 16, borderWidth: 1, marginBottom: 24 },
  navRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLabel: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  rowDesc: { fontSize: 12 },
  divider: { height: 1, marginVertical: 13 },

  sairBtn: { backgroundColor: '#1A0808', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#EF444433', marginBottom: 8 },
  sairText: { color: '#EF4444', fontWeight: '900', fontSize: 15 },
  excluirBtn: { backgroundColor: '#1A0808', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444', marginBottom: 8 },
  excluirText: { color: '#EF4444', fontWeight: '900', fontSize: 15, marginBottom: 4 },
  excluirSub: { color: '#EF444488', fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  modalBox: { borderRadius: 24, padding: 28, width: '100%', alignItems: 'center', gap: 8 },
  modalEmoji: { fontSize: 40, marginBottom: 4 },
  modalTitulo: { fontSize: 20, fontWeight: '900', textAlign: 'center' },
  modalDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 8 },
  modalBtns: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 },
  modalBtnCancel: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1 },
  modalBtnCancelText: { fontWeight: '800', fontSize: 15 },
  modalBtnConfirm: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', backgroundColor: '#EF4444' },
  modalBtnExcluir: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', backgroundColor: '#DC2626' },
  modalBtnConfirmText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});
