import axios from 'axios';
import { CriarPerguntaDTO, Pergunta } from './types';

// URL base da API - mesma do sistema
const URL_BASE_API = 'https://api-even3-hml.onrender.com';

// API calls para perguntas
export const perguntasApi = {
  // Listar todas as perguntas de uma palestra (ordenadas por votos)
  async listarPerguntasPorPalestra(palestraId: string): Promise<Pergunta[]> {
    try {
      const response = await axios.get(`${URL_BASE_API}/perguntas/palestra/${palestraId}`);
      // Ordenar por votos (mais votadas primeiro)
      const perguntas = response.data.sort((a: Pergunta, b: Pergunta) => b.votos - a.votos);
      return perguntas;
    } catch (error) {
      console.error('Erro ao listar perguntas:', error);
      throw error;
    }
  },

  // Criar nova pergunta
  async criarPergunta(dados: CriarPerguntaDTO, usuarioId: string, usuarioNome: string): Promise<Pergunta> {
    try {
      const pergunta = {
        ...dados,
        usuarioId,
        usuarioNome,
        votos: 0,
        usuariosVotaram: [],
        respondida: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const response = await axios.post(`${URL_BASE_API}/perguntas`, pergunta);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar pergunta:', error);
      throw error;
    }
  },

  // Votar em uma pergunta
  async votarPergunta(perguntaId: string, usuarioId: string): Promise<Pergunta> {
    try {
      const response = await axios.post(`${URL_BASE_API}/perguntas/${perguntaId}/votar`, {
        usuarioId,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao votar na pergunta:', error);
      throw error;
    }
  },

  // Remover voto de uma pergunta
  async removerVoto(perguntaId: string, usuarioId: string): Promise<Pergunta> {
    try {
      const response = await axios.post(`${URL_BASE_API}/perguntas/${perguntaId}/remover-voto`, {
        usuarioId,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao remover voto:', error);
      throw error;
    }
  },

  // Buscar pergunta por ID
  async buscarPerguntaPorId(id: string): Promise<Pergunta> {
    try {
      const response = await axios.get(`${URL_BASE_API}/perguntas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pergunta:', error);
      throw error;
    }
  },

  // Responder pergunta (para palestrantes)
  async responderPergunta(perguntaId: string, resposta: string): Promise<Pergunta> {
    try {
      const response = await axios.patch(`${URL_BASE_API}/perguntas/${perguntaId}/responder`, {
        resposta,
        dataResposta: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao responder pergunta:', error);
      throw error;
    }
  },
};