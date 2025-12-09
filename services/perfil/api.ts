import axios from 'axios';

const URL_BASE_API = process.env.EXPO_PUBLIC_API_BASE_URL;

// Serviços de Perfil
export const apiPerfil = {
  // Atualiza perfil do participante
  async atualizarPerfil(
    participanteId: string, 
    dados: { tipoUsuario: string; turma?: string }
  ): Promise<{ message: string; participante: any }> {
    try {
      const resposta = await axios.patch(
        `${URL_BASE_API}/participantes/${participanteId}/perfil`,
        dados,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return resposta.data;
    } catch (erro: any) {
      console.error('Erro ao atualizar perfil:', erro.message);
      
      if (erro.response) {
        throw new Error(erro.response.data.error || 'Erro ao atualizar perfil');
      } else if (erro.request) {
        throw new Error(`Não foi possível conectar ao servidor: ${URL_BASE_API}`);
      } else {
        throw new Error('Erro ao configurar a requisição');
      }
    }
  },

  // Busca perfil do participante
  async buscarPerfil(participanteId: string): Promise<{ participante: any }> {
    try {
      const resposta = await axios.get(
        `${URL_BASE_API}/participantes/${participanteId}/perfil`,
        {
          timeout: 10000,
        }
      );

      return resposta.data;
    } catch (erro: any) {
      console.error('Erro ao buscar perfil:', erro.message);
      
      if (erro.response) {
        throw new Error(erro.response.data.error || 'Erro ao buscar perfil');
      } else if (erro.request) {
        throw new Error(`Não foi possível conectar ao servidor: ${URL_BASE_API}`);
      } else {
        throw new Error('Erro ao configurar a requisição');
      }
    }
  }
};

export default apiPerfil;
