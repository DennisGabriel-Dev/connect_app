import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    // Opcional: salvar no localStorage para persistência (web)
    if (typeof window !== 'undefined' && window.localStorage) {
      if (novoUsuario) {
        localStorage.setItem('@connect:usuario', JSON.stringify(novoUsuario));
      } else {
        localStorage.removeItem('@connect:usuario');
      }
    }
  };

  // Carregar usuário do localStorage ao montar (apenas web)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const dadosSalvos = localStorage.getItem('@connect:usuario');
      if (dadosSalvos) {
        try {
          setUsuario(JSON.parse(dadosSalvos));
        } catch (erro) {
          console.error('Erro ao carregar usuário do localStorage:', erro);
        }
      }
    }
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

