import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getItem, setItem, deleteItem } from '@/utils/storage';
import { API_BASE, TOKEN_KEY, apiFetch } from '@/utils/api';

export const XP_POR_NIVEL = [0, 100, 250, 500, 1000, 1800, 3000, 4500, 6500, 9000, 12000];

export function calcularNivel(xp: number): number {
  let nivel = 1;
  for (let i = 1; i < XP_POR_NIVEL.length; i++) {
    if (xp >= XP_POR_NIVEL[i]) nivel = i + 1;
    else break;
  }
  return Math.min(nivel, XP_POR_NIVEL.length);
}

export function xpProximoNivel(nivel: number): number {
  return XP_POR_NIVEL[nivel] ?? XP_POR_NIVEL[XP_POR_NIVEL.length - 1];
}

export function xpNivelAtual(nivel: number): number {
  return XP_POR_NIVEL[Math.max(nivel - 1, 0)] ?? 0;
}

export type Badge = {
  id: string;
  icon: string;
  titulo: string;
  desc: string;
  desbloqueada: boolean;
  data?: string;
};

export type User = {
  id: number;
  nome: string;
  email: string;
  foto: string | null;
  xp: number;
  nivel: number;
  sequencia: number;
  pontos: number;
  telefone: string;
  bio: string;
  diasConsecutivos: number;
  horasEstudadas: number;
  questoesResolvidas: number;
  redacoesFeitas: number;
  simuladosConcluidos: number;
  materiaisEnviados: number;
  perfilPublico: boolean;
  ocultarRanking: boolean;
  mostrarConquistas: boolean;
  badges: Badge[];
  ultimoLogin: string;
};

const BADGES_INICIAIS: Badge[] = [
  { id: 'primeira_meta', icon: '🎯', titulo: 'Primeira Meta', desc: 'Concluiu a primeira meta', desbloqueada: false },
  { id: '7_dias', icon: '🔥', titulo: '7 Dias Seguidos', desc: 'Estudou 7 dias consecutivos', desbloqueada: false },
  { id: '30_dias', icon: '💪', titulo: '30 Dias Seguidos', desc: 'Estudou 30 dias consecutivos', desbloqueada: false },
  { id: 'mat_master', icon: '📐', titulo: 'Mestre da Matemática', desc: 'Resolveu 100 questões de matemática', desbloqueada: false },
  { id: 'rei_redacao', icon: '✍️', titulo: 'Rei das Redações', desc: 'Fez 10 redações', desbloqueada: false },
  { id: 'compartilhador', icon: '📤', titulo: 'Compartilhador de Material', desc: 'Enviou 5 materiais', desbloqueada: false },
  { id: 'top1', icon: '👑', titulo: 'Top 1 do Ranking', desc: 'Ficou em 1º lugar no ranking', desbloqueada: false },
];

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<boolean | 'verificar'>;
  logout: () => void;
  atualizarUser: (dados: Partial<User>) => void;
  atualizarPerfil: (nome: string, fotoUrl: string | null) => Promise<boolean>;
  excluirConta: () => Promise<boolean>;
  ganharXP: (quantidade: number, motivo: string) => { levelUp: boolean; novoNivel: number };
  registrarLogin: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  cadastrar: async () => false,
  logout: () => {},
  atualizarUser: () => {},
  atualizarPerfil: async () => false,
  excluirConta: async () => false,
  ganharXP: () => ({ levelUp: false, novoNivel: 1 }),
  registrarLogin: () => {},
});

const USER_KEY = 'studyconnect_user_v3';
const USER_KEYS_LEGADAS = ['studyconnect_user_v2', 'studyconnect_user'];

function hojeBR() {
  return new Date().toLocaleDateString('pt-BR');
}

function normalizarUser(raw: Partial<User> & { redacoesFetas?: number; fotoUrl?: string | null }, nomeFallback = 'Estudante', emailFallback = 'estudante@email.com'): User {
  const xp = raw.xp ?? 0;
  const badgesSalvos = raw.badges ?? [];
  const badges = BADGES_INICIAIS.map((base) => badgesSalvos.find((b) => b.id === base.id) ?? base);
  return {
    id: raw.id ?? 0,
    nome: raw.nome ?? nomeFallback,
    email: raw.email ?? emailFallback,
    foto: raw.foto ?? raw.fotoUrl ?? null,
    xp,
    nivel: calcularNivel(xp),
    sequencia: raw.sequencia ?? raw.diasConsecutivos ?? 0,
    pontos: raw.pontos ?? xp,
    telefone: raw.telefone ?? '',
    bio: raw.bio ?? '',
    diasConsecutivos: raw.diasConsecutivos ?? raw.sequencia ?? 0,
    horasEstudadas: raw.horasEstudadas ?? 0,
    questoesResolvidas: raw.questoesResolvidas ?? 0,
    redacoesFeitas: raw.redacoesFeitas ?? raw.redacoesFetas ?? 0,
    simuladosConcluidos: raw.simuladosConcluidos ?? 0,
    materiaisEnviados: raw.materiaisEnviados ?? 0,
    perfilPublico: raw.perfilPublico ?? true,
    ocultarRanking: raw.ocultarRanking ?? false,
    mostrarConquistas: raw.mostrarConquistas ?? true,
    badges,
    ultimoLogin: raw.ultimoLogin ?? '',
  };
}

function aplicarBadges(user: User): User {
  const hoje = hojeBR();
  const badges = user.badges.map((b) => {
    const desbloqueada =
      (b.id === 'primeira_meta' && user.pontos >= 30) ||
      (b.id === '7_dias' && user.diasConsecutivos >= 7) ||
      (b.id === '30_dias' && user.diasConsecutivos >= 30) ||
      (b.id === 'mat_master' && user.questoesResolvidas >= 100) ||
      (b.id === 'rei_redacao' && user.redacoesFeitas >= 10) ||
      (b.id === 'compartilhador' && user.materiaisEnviados >= 5) ||
      (b.id === 'top1' && user.pontos >= 1240);

    if (desbloqueada && !b.desbloqueada) return { ...b, desbloqueada: true, data: hoje };
    return b;
  });
  return { ...user, badges };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let saved = await getItem(USER_KEY);
      for (const key of USER_KEYS_LEGADAS) {
        if (saved) break;
        saved = await getItem(key);
      }
      if (saved) {
        try {
          setUser(aplicarBadges(normalizarUser(JSON.parse(saved))));
        } catch {}
      }
      setLoading(false);
    })();
  }, []);

  function salvarUser(u: User) {
    const normalizado = aplicarBadges({ ...u, nivel: calcularNivel(u.xp) });
    setUser(normalizado);
    setItem(USER_KEY, JSON.stringify(normalizado));
  }

  async function login(email: string, senha: string): Promise<boolean> {
    if (!email.trim() || !senha.trim()) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), senha }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg: string = err?.message ?? '';
        if (res.status === 403 && msg.toLowerCase().includes('verificado')) {
          throw new Error('email_nao_verificado');
        }
        return false;
      }
      const data = await res.json();
      await setItem(TOKEN_KEY, data.accessToken);
      salvarUser(normalizarUser({
        id: data.id,
        nome: data.nome,
        email: data.email,
        fotoUrl: data.fotoUrl ?? null,
      }));
      return true;
    } catch (e: any) {
      if (e?.message === 'email_nao_verificado') throw e;
      return false;
    }
  }

  async function cadastrar(nome: string, email: string, senha: string): Promise<boolean | 'verificar'> {
    if (!nome.trim() || !email.trim() || !senha.trim()) return false;
    try {
      const res = await fetch(`${API_BASE}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim(), email: email.trim().toLowerCase(), senha }),
      });
      if (res.status === 201) return 'verificar';
      if (res.status === 409) throw new Error('email_ja_cadastrado');
      return false;
    } catch (e: any) {
      if (e?.message === 'email_ja_cadastrado') throw e;
      return false;
    }
  }

  function logout() {
    setUser(null);
    deleteItem(USER_KEY);
    deleteItem(TOKEN_KEY);
  }

  function atualizarUser(dados: Partial<User>) {
    if (!user) return;
    salvarUser({ ...user, ...dados });
  }

  async function atualizarPerfil(nome: string, fotoUrl: string | null): Promise<boolean> {
    if (!user?.id) return false;
    try {
      const res = await apiFetch(`/usuarios/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({ nome, fotoUrl }),
      });
      if (!res.ok) return false;
      salvarUser({ ...user, nome, foto: fotoUrl });
      return true;
    } catch {
      return false;
    }
  }

  async function excluirConta(): Promise<boolean> {
    if (!user?.id) return false;
    try {
      const res = await apiFetch(`/usuarios/${user.id}`, { method: 'DELETE' });
      if (!res.ok) return false;
      logout();
      return true;
    } catch {
      return false;
    }
  }

  function ganharXP(quantidade: number, _motivo: string): { levelUp: boolean; novoNivel: number } {
    if (!user) return { levelUp: false, novoNivel: 1 };
    const novoXP = user.xp + quantidade;
    const novoNivel = calcularNivel(novoXP);
    const levelUp = novoNivel > user.nivel;
    salvarUser({ ...user, xp: novoXP, nivel: novoNivel, pontos: user.pontos + quantidade });
    return { levelUp, novoNivel };
  }

  function registrarLogin() {
    if (!user) return;
    const hoje = hojeBR();
    if (user.ultimoLogin === hoje) return;

    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const ontemStr = ontem.toLocaleDateString('pt-BR');
    const novaSequencia = user.ultimoLogin === ontemStr ? user.sequencia + 1 : 1;
    const novoXP = user.xp + 10;

    salvarUser({
      ...user,
      ultimoLogin: hoje,
      sequencia: novaSequencia,
      diasConsecutivos: novaSequencia,
      xp: novoXP,
      nivel: calcularNivel(novoXP),
      pontos: user.pontos + 10,
    });
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, cadastrar, logout, atualizarUser, atualizarPerfil, excluirConta, ganharXP, registrarLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
