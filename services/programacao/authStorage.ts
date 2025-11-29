import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UsuarioArmazenado {
  id: string;
  email: string;
  token?: string;
}

const CHAVE_USUARIO = '@connect_usuario';
const CHAVE_TOKEN = '@connect_token';

export const authStorage = {
  async salvarUsuario(usuario: UsuarioArmazenado, token?: string): Promise<void> {
    try {
      await AsyncStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
      if (token) {
        await AsyncStorage.setItem(CHAVE_TOKEN, token);
      }
    } catch (erro) {
      console.error('Erro ao salvar usuário:', erro);
      throw erro;
    }
  },

  async obterUsuario(): Promise<UsuarioArmazenado | null> {
    try {
      const usuario = await AsyncStorage.getItem(CHAVE_USUARIO);
      return usuario ? JSON.parse(usuario) : null;
    } catch (erro) {
      console.error('Erro ao obter usuário:', erro);
      return null;
    }
  },

  async obterToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(CHAVE_TOKEN);
    } catch (erro) {
      console.error('Erro ao obter token:', erro);
      return null;
    }
  },

  async limpar(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([CHAVE_USUARIO, CHAVE_TOKEN]);
    } catch (erro) {
      console.error('Erro ao limpar storage:', erro);
      throw erro;
    }
  },

  async estaAutenticado(): Promise<boolean> {
    const usuario = await this.obterUsuario();
    return usuario !== null;
  }
};
