import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authStorage } from './../../services/programacao/authStorage';

export interface UsuarioLogado {
  id: string;
  email: string;
  nome: string;
  [key: string]: any;
}

interface AuthContextType {
  usuario: UsuarioLogado | null;
  definirUsuario: (usuario: UsuarioLogado | null) => void;
  estaLogado: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);

  const definirUsuario = (novoUsuario: UsuarioLogado | null) => {
    setUsuario(novoUsuario);
  };

  // Carregar usuário do AsyncStorage ao montar
  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const usuarioArmazenado = await authStorage.obterUsuario();
        if (usuarioArmazenado) {
          setUsuario({
            id: usuarioArmazenado.id,
            email: usuarioArmazenado.email,
            nome: usuarioArmazenado.email.split('@')[0],
          });
        }
      } catch (erro) {
        console.error('Erro ao carregar usuário do storage:', erro);
      }
    };
    carregarUsuario();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        definirUsuario,
        estaLogado: usuario !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
