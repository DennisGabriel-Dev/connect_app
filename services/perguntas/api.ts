import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { CriarPerguntaDTO, Pergunta, StatusPergunta } from './types';

const URL_BASE_API = `${process.env.EXPO_PUBLIC_API_BASE_URL}/perguntas`;
const STORAGE_KEY_CURTIDAS = '@perguntas:curtidas_usuario';

// Interface para o formato retornado pelo backend
interface PerguntaBackend {
  _id?: string;
  id?: string;
  texto: string;
  participanteId: string;
  participanteNome: string;
  palestraId: string;
  palestraTitulo: string;
  dataHora: string;
  respondida: boolean;
  resposta?: string;
  palestranteNome?: string;
  dataResposta?: string;
  curtidas: number;
  status?: string; // 'pendente', 'aprovada', 'rejeitada'
}

// Função para mapear dados do backend para o formato do frontend
function mapearPerguntaBackendParaFrontend(perguntaBackend: PerguntaBackend): Pergunta {
  // Separar título e descrição do texto
  // Assumindo que a primeira linha é o título e o resto é descrição
  const linhas = perguntaBackend.texto.split('\n\n');
  const titulo = linhas[0] || perguntaBackend.texto;
  const descricao = linhas.slice(1).join('\n\n') || '';

  // Mapear status do backend para enum
  let status = StatusPergunta.PENDENTE;
  if (perguntaBackend.status) {
    const statusLower = perguntaBackend.status.toLowerCase();
    if (statusLower === 'aprovada' || statusLower === 'aprovado') {
      status = StatusPergunta.APROVADA;
    } else if (statusLower === 'rejeitada' || statusLower === 'rejeitado') {
      status = StatusPergunta.REJEITADA;
    }
  }

  return {
    id: perguntaBackend._id || perguntaBackend.id || '',
    palestraId: perguntaBackend.palestraId,
    usuarioId: perguntaBackend.participanteId,
    usuarioNome: perguntaBackend.participanteNome,
    titulo: titulo.trim(),
    descricao: descricao.trim(),
    votos: perguntaBackend.curtidas || 0,
    usuariosVotaram: [], // O backend não tem esse campo ainda
    status: status,
    respondida: perguntaBackend.respondida || false,
    resposta: perguntaBackend.resposta,
    dataResposta: perguntaBackend.dataResposta,
    createdAt: perguntaBackend.dataHora,
    updatedAt: perguntaBackend.dataHora,
  };
}

// API calls para perguntas
export const perguntasApi = {
  // Listar todas as perguntas de uma palestra (ordenadas por votos)
  async listarPerguntasPorPalestra(palestraId: string): Promise<Pergunta[]> {
    try {
      const response = await axios.get(`${URL_BASE_API}/palestra/${palestraId}`);
      // A resposta vem no formato { success, data, count }
      const perguntasBackend = response.data.data || response.data;
      const perguntasArray = Array.isArray(perguntasBackend) ? perguntasBackend : [];

      // Mapear cada pergunta do formato backend para o formato frontend
      return perguntasArray.map(mapearPerguntaBackendParaFrontend);
    } catch (error) {
      console.error('Erro ao listar perguntas:', error);
      throw error;
    }
  },

  // Criar nova pergunta
  async criarPergunta(dados: CriarPerguntaDTO & { palestraTitulo?: string }, usuarioId: string, usuarioNome: string): Promise<Pergunta> {
    try {
      // O backend espera: { texto, participanteId, participanteNome, palestraId, palestraTitulo }
      // O frontend envia: { titulo, descricao, palestraId, palestraTitulo? }
      const pergunta = {
        texto: dados.titulo + (dados.descricao ? `\n\n${dados.descricao}` : ''),
        participanteId: usuarioId,
        participanteNome: usuarioNome,
        palestraId: dados.palestraId,
        palestraTitulo: dados.palestraTitulo || 'Palestra',
      };

      const response = await axios.post(`${URL_BASE_API}`, pergunta);
      // A resposta vem no formato { success, message, data }
      const perguntaBackend = response.data.data || response.data;
      return mapearPerguntaBackendParaFrontend(perguntaBackend);
    } catch (error) {
      console.error('Erro ao criar pergunta:', error);
      throw error;
    }
  },

  // Votar em uma pergunta (curtir)
  async votarPergunta(perguntaId: string, usuarioId: string): Promise<Pergunta> {
    try {
      const response = await axios.put(`${URL_BASE_API}/${perguntaId}/curtir`);
      // A resposta vem no formato { success, message, data }
      const perguntaBackend = response.data.data || response.data;
      return mapearPerguntaBackendParaFrontend(perguntaBackend);
    } catch (error) {
      console.error('Erro ao votar na pergunta:', error);
      throw error;
    }
  },

  // Remover voto de uma pergunta (não implementado no backend ainda)
  async removerVoto(perguntaId: string, usuarioId: string): Promise<Pergunta> {
    try {
      // Por enquanto, apenas retorna a pergunta sem o voto
      // TODO: Implementar endpoint de remover curtida no backend
      const pergunta = await this.buscarPerguntaPorId(perguntaId);
      return pergunta;
    } catch (error) {
      console.error('Erro ao remover voto:', error);
      throw error;
    }
  },

  // Buscar pergunta por ID
  async buscarPerguntaPorId(id: string): Promise<Pergunta> {
    try {
      const response = await axios.get(`${URL_BASE_API}/${id}`);
      // A resposta vem no formato { success, data }
      const perguntaBackend = response.data.data || response.data;
      return mapearPerguntaBackendParaFrontend(perguntaBackend);
    } catch (error) {
      console.error('Erro ao buscar pergunta:', error);
      throw error;
    }
  },

  // Responder pergunta (para palestrantes)
  async responderPergunta(perguntaId: string, resposta: string): Promise<Pergunta> {
    try {
      const response = await axios.put(`${URL_BASE_API}/${perguntaId}/responder`, {
        resposta,
      });
      // A resposta vem no formato { success, message, data }
      const perguntaBackend = response.data.data || response.data;
      return mapearPerguntaBackendParaFrontend(perguntaBackend);
    } catch (error) {
      console.error('Erro ao responder pergunta:', error);
      throw error;
    }
  },

  // Gerenciamento de curtidas locais (máximo 3 perguntas diferentes)
  async obterCurtidasUsuario(usuarioId: string): Promise<string[]> {
    try {
      const key = `${STORAGE_KEY_CURTIDAS}:${usuarioId}`;
      const curtidas = await AsyncStorage.getItem(key);
      return curtidas ? JSON.parse(curtidas) : [];
    } catch (error) {
      console.error('Erro ao obter curtidas do usuário:', error);
      return [];
    }
  },

  async adicionarCurtida(usuarioId: string, perguntaId: string): Promise<boolean> {
    try {
      const curtidas = await this.obterCurtidasUsuario(usuarioId);

      // Verificar se já curtiu esta pergunta
      if (curtidas.includes(perguntaId)) {
        return false;
      }

      // Verificar limite de 3 curtidas
      if (curtidas.length >= 3) {
        throw new Error('Você já atingiu o limite de 3 curtidas em perguntas diferentes');
      }

      const novasCurtidas = [...curtidas, perguntaId];
      const key = `${STORAGE_KEY_CURTIDAS}:${usuarioId}`;
      await AsyncStorage.setItem(key, JSON.stringify(novasCurtidas));
      return true;
    } catch (error) {
      console.error('Erro ao adicionar curtida:', error);
      throw error;
    }
  },

  async removerCurtida(usuarioId: string, perguntaId: string): Promise<void> {
    try {
      const curtidas = await this.obterCurtidasUsuario(usuarioId);
      const novasCurtidas = curtidas.filter(id => id !== perguntaId);
      const key = `${STORAGE_KEY_CURTIDAS}:${usuarioId}`;
      await AsyncStorage.setItem(key, JSON.stringify(novasCurtidas));
    } catch (error) {
      console.error('Erro ao remover curtida:', error);
      throw error;
    }
  },

  async verificarPodeCurtir(usuarioId: string, perguntaId: string): Promise<{ pode: boolean; jaCurtiu: boolean; motivo?: string }> {
    try {
      const curtidas = await this.obterCurtidasUsuario(usuarioId);
      const jaCurtiu = curtidas.includes(perguntaId);

      if (jaCurtiu) {
        return { pode: true, jaCurtiu: true }; // Pode descurtir
      }

      if (curtidas.length >= 3) {
        return {
          pode: false,
          jaCurtiu: false,
          motivo: 'Você já curtiu 3 perguntas diferentes. Remova uma curtida antes de adicionar outra.'
        };
      }

      return { pode: true, jaCurtiu: false };
    } catch (error) {
      console.error('Erro ao verificar se pode curtir:', error);
      return { pode: false, jaCurtiu: false, motivo: 'Erro ao verificar curtidas' };
    }
  },

  // Listar todas as perguntas (admin) - com filtros opcionais
  async listarTodasPerguntasAdmin(filtros?: { status?: StatusPergunta; palestraId?: string }): Promise<Pergunta[]> {
    try {
      const params = new URLSearchParams();
      if (filtros?.status) {
        params.append('status', filtros.status);
      }
      if (filtros?.palestraId) {
        params.append('palestraId', filtros.palestraId);
      }

      const url = `${URL_BASE_API}/admin/todas${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await axios.get(url);

      const perguntasBackend = response.data.data || response.data;
      const perguntasArray = Array.isArray(perguntasBackend) ? perguntasBackend : [];

      return perguntasArray.map(mapearPerguntaBackendParaFrontend);
    } catch (error) {
      console.error('Erro ao listar perguntas admin:', error);
      throw error;
    }
  },

  // Aprovar pergunta (admin)
  async aprovarPergunta(perguntaId: string): Promise<Pergunta> {
    try {
      const response = await axios.patch(`${URL_BASE_API}/${perguntaId}/aprovar`);
      const perguntaBackend = response.data.data || response.data;
      return mapearPerguntaBackendParaFrontend(perguntaBackend);
    } catch (error) {
      console.error('Erro ao aprovar pergunta:', error);
      throw error;
    }
  },

  // Rejeitar pergunta (admin)
  async rejeitarPergunta(perguntaId: string): Promise<Pergunta> {
    try {
      const response = await axios.patch(`${URL_BASE_API}/${perguntaId}/rejeitar`);
      const perguntaBackend = response.data.data || response.data;
      return mapearPerguntaBackendParaFrontend(perguntaBackend);
    } catch (error) {
      console.error('Erro ao rejeitar pergunta:', error);
      throw error;
    }
  },
};