import { createContext, useContext, useState, ReactNode } from 'react';

export type Notificacao = {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'estudo';
  data: string;
  lida: boolean;
};

type NotifContextType = {
  notificacoes: Notificacao[];
  naoLidas: number;
  setNotificacoes: (lista: Notificacao[]) => void;
  marcarLida: (id: string) => void;
  marcarTodasLidas: () => void;
  limpar: () => void;
};

const NotifContext = createContext<NotifContextType>({
  notificacoes: [],
  naoLidas: 0,
  setNotificacoes: () => {},
  marcarLida: () => {},
  marcarTodasLidas: () => {},
  limpar: () => {},
});

export function NotifProvider({ children }: { children: ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  function marcarLida(id: string) {
    setNotificacoes((prev) => prev.map((n) => n.id === id ? { ...n, lida: true } : n));
  }

  function marcarTodasLidas() {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  }

  function limpar() {
    setNotificacoes([]);
  }

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <NotifContext.Provider value={{ notificacoes, naoLidas, setNotificacoes, marcarLida, marcarTodasLidas, limpar }}>
      {children}
    </NotifContext.Provider>
  );
}

export function useNotif() {
  return useContext(NotifContext);
}
