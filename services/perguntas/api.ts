import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { CriarPerguntaDTO, Pergunta, StatusPergunta, PeriodoVotacaoStatus } from './types';

const URL_BASE_API = `${process.env.EXPO_PUBLIC_API_BASE_URL}/perguntas`;
const STORAGE_KEY_CURTIDAS = '@perguntas:curtidas_usuario';

// Interface para o formato retornado pelo backend
interface PerguntaBackend {
  _id?: string;
  id?: string;
  texto: string;
  participanteId: string;
  participanteNome?: string;  // Formato flat (listagem pública)
  participante?: {             // Formato aninhado (admin)
    id: string;
    nome: string;
    email?: string;
  };
  palestraId: string;
  palestraTitulo: string;
  dataHora: string;
  respondida: boolean;
  resposta?: string;
  palestranteNome?: string;
  dataResposta?: string;
  curtidas: number;
  usuariosVotaram?: string[]; // Array de IDs dos participantes que votaram
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

  // Obter nome do participante (suporta formato flat e aninhado)
  const usuarioNome = perguntaBackend.participante?.nome || perguntaBackend.participanteNome || 'Anônimo';

  return {
    id: perguntaBackend._id || perguntaBackend.id || '',
    palestraId: perguntaBackend.palestraId,
    usuarioId: perguntaBackend.participanteId,
    usuarioNome: usuarioNome,
    titulo: titulo.trim(),
    descricao: descricao.trim(),
    votos: perguntaBackend.curtidas || 0,
    usuariosVotaram: perguntaBackend.usuariosVotaram || [], // Agora vem do backend
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
      const response = await axios.put(`${URL_BASE_API}/${perguntaId}/curtir`, {}, {
        headers: { 'x-participante-id': usuarioId }
      });
      // A resposta vem no formato { success, message, data }
      const perguntaBackend = response.data.data || response.data;
      return mapearPerguntaBackendParaFrontend(perguntaBackend);
    } catch (error) {
      console.error('Erro ao votar na pergunta:', error);
      throw error;
    }
  },

  // Remover voto de uma pergunta
  async removerVoto(perguntaId: string, usuarioId: string): Promise<Pergunta> {
    try {
      // Usa o mesmo endpoint /curtir que faz toggle
      const response = await axios.put(`${URL_BASE_API}/${perguntaId}/curtir`, {}, {
        headers: { 'x-participante-id': usuarioId }
      });
      const perguntaBackend = response.data.data || response.data;
      return mapearPerguntaBackendParaFrontend(perguntaBackend);
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

  // Contar votos usados pelo participante em uma palestra
  async contarVotosParticipante(palestraId: string, participanteId: string): Promise<number> {
    try {
      const response = await axios.get(
        `${URL_BASE_API}/participante/${participanteId}/votos`,
        { params: { palestraId } }
      );
      return response.data.count || 0;
    } catch (error) {
      console.error('Erro ao contar votos:', error);
      return 0;
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

  // Editar pergunta (apenas autor e pendente)
  async editarPergunta(perguntaId: string, titulo: string, descricao: string, usuarioId: string): Promise<Pergunta> {
    try {
      const texto = titulo + (descricao ? `\n\n${descricao}` : '');
      const response = await axios.put(`${URL_BASE_API}/${perguntaId}`, {
        texto,
        participanteId: usuarioId
      });
      const perguntaBackend = response.data.data || response.data;
      return mapearPerguntaBackendParaFrontend(perguntaBackend);
    } catch (error) {
      console.error('Erro ao editar pergunta:', error);
      throw error;
    }
  },

  // Deletar pergunta (apenas autor)
  async deletarPergunta(perguntaId: string, usuarioId: string): Promise<void> {
    try {
      await axios.delete(`${URL_BASE_API}/${perguntaId}`, {
        data: { participanteId: usuarioId }
      });
    } catch (error) {
      console.error('Erro ao deletar pergunta:', error);
      throw error;
    }
  },

  // Listar perguntas pendentes do participante
  async listarPendentesPorParticipante(palestraId: string, participanteId: string): Promise<Pergunta[]> {
    try {
      const response = await axios.get(
        `${URL_BASE_API}/palestra/${palestraId}/pendentes/${participanteId}`
      );
      const perguntasBackend = response.data.data || response.data;
      const perguntasArray = Array.isArray(perguntasBackend) ? perguntasBackend : [];
      return perguntasArray.map(mapearPerguntaBackendParaFrontend);
    } catch (error) {
      console.error('Erro ao listar perguntas pendentes:', error);
      return [];
    }
  },

  // Verificar período de votação ativo
  async verificarPeriodoAtivo(palestraId: string): Promise<PeriodoVotacaoStatus> {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/palestras/${palestraId}/periodo-votacao`
      );
      return response.data.data;
    } catch (error) {
      console.error('Erro ao verificar período de votação:', error);
      // Em caso de erro, retornar período ativo por segurança
      return {
        palestraId,
        palestraTitulo: '',
        votacaoInicio: null,
        votacaoFim: null,
        periodoAtivo: true,
        periodoEfetivo: null,
        usandoPadrao: false,
        motivo: null
      };
    }
  },
};