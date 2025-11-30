import axios from 'axios';
import { URL_BASE_API } from '../programacao/api';

// Interfaces para Feedback
export interface Feedback {
  id: string;
  participanteId: string;
  palestraId: string;
  estrelas: number;
  comentario?: string;
  createdAt: string;
  participante?: {
    nome: string;
    email: string;
  };
  palestra?: {
    titulo: string;
    descricao: string;
  };
}

export interface CriarFeedbackData {
  participanteId: string;
  palestraId: string;
  estrelas: number;
  comentario?: string;
}

// Serviço de Feedback
const apiFeedback = {
  // Buscar feedbacks de uma palestra
  async buscarFeedbacksPalestra(palestraId: string): Promise<Feedback[]> {
    try {
      const resposta = await axios.get(
        `${URL_BASE_API}/feedback/palestra/${palestraId}`,
        { timeout: 10000 }
      );

      if (resposta.status === 200) {
        return resposta.data;
      }
      return [];
    } catch (erro: any) {
      console.error('Erro ao buscar feedbacks da palestra:', erro.message);
      return [];
    }
  },

  // Buscar feedbacks do usuário logado
  async buscarMeusFeedbacks(participanteId: string): Promise<Feedback[]> {
    try {
      console.log('🔍 Buscando feedbacks para usuário:', participanteId);
      const resposta = await axios.get(
        `${URL_BASE_API}/feedback/usuario/${participanteId}`,
        { timeout: 10000 }
      );

      if (resposta.status === 200) {
        return resposta.data;
      }
      return [];
    } catch (erro: any) {
      console.error('Erro ao buscar meus feedbacks:', erro.message);
      return [];
    }
  },

  // Criar novo feedback
  async criarFeedback(dados: CriarFeedbackData): Promise<{message: string; feedback: Feedback} | null> {
    try {
      const resposta = await axios.post(
        `${URL_BASE_API}/feedback`,
        dados,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (resposta.status === 201) {
        return resposta.data;
      }
      return null;
    } catch (erro: any) {
      console.error('Erro ao criar feedback:', erro.message);
      
      if (erro.response) {
        throw new Error(erro.response.data.error || 'Erro ao enviar feedback');
      } else if (erro.request) {
        throw new Error('Não foi possível conectar ao servidor');
      } else {
        throw new Error('Erro ao configurar a requisição');
      }
    }
  },
};

export { apiFeedback };
export default apiFeedback;