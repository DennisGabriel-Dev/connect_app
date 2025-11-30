// hooks/useAuth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiAuth } from '../services/programacao/api';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  carregando: boolean;
}

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  login: async () => {},
  logout: async () => {},
  carregando: true
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarUsuario();
  }, []);

  const carregarUsuario = async () => {
    try {
      const usuarioSalvo = await AsyncStorage.getItem('usuario');
      
      if (usuarioSalvo) {
        const usuarioParseado = JSON.parse(usuarioSalvo);
        setUsuario(usuarioParseado);
      }
    } catch (erro) {
      console.error('Erro ao carregar usuário:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const login = async (email: string, senha: string) => {
    try {
      const resposta = await apiAuth.login({ email, senha });

      if (resposta.usuario) {
        const usuarioData: Usuario = {
          id: resposta.usuario.id.toString(),
          nome: resposta.usuario.nome,
          email: resposta.usuario.email
        };
        
        await AsyncStorage.setItem('usuario', JSON.stringify(usuarioData));
        setUsuario(usuarioData);
      } else {
        throw new Error(resposta.erro || 'Erro no login');
      }
    } catch (erro: any) {
      if (erro.message.includes('Primeiro acesso detectado')) {
        throw new Error('FIRST_ACCESS');
      }
      throw new Error(erro.message || 'Erro ao fazer login');
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('usuario');
    setUsuario(null);
  };

  const value = {
    usuario,
    login,
    logout,
    carregando
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};