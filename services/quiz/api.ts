import { Quiz, QuizStatus, RespostaUsuario } from './type';
import { authStorage } from '../programacao/authStorage';

const API_BASE = `${process.env.EXPO_PUBLIC_API_BASE_URL}/quizzes`;

// Interface para quiz resumido (usado na listagem)
export interface QuizResumido {
  id: string;
  titulo: string;
  descricao?: string;
  liberado: boolean;
  jaRespondeu: boolean;
}

// Lista todos os quizzes (incluindo não liberados)
export async function listarQuizzes(): Promise<QuizResumido[]> {
  try {
    const response = await fetch(`${API_BASE}/`);

    if (!response.ok) {
      throw new Error('Erro ao listar quizzes');
    }

    const data = await response.json();
    return data as QuizResumido[];
  } catch (error) {
    console.error('Erro ao listar quizzes', error);
    throw error;
  }
}

// Busca o status de todos os quizzes para o participante logado
export async function buscarQuizzesStatus(): Promise<QuizStatus[]> {
  try {
    const usuario = await authStorage.obterUsuario();
    if (!usuario?.id) {
      throw new Error('Usuário não identificado para buscar status dos quizzes.');
    }

    const response = await fetch(`${API_BASE}/participante/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-participante-id': usuario.id,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar o status dos quizzes.');
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar status dos quizzes:', error);
    throw error;
  }
}

// Lista apenas os quizzes liberados
export async function listarQuizzesLiberados(): Promise<QuizResumido[]> {
  try {
    const response = await fetch(`${API_BASE}/liberados`);

    if (!response.ok) {
      throw new Error('Erro ao listar quizzes liberados');
    }

    const data = await response.json();
    return data as QuizResumido[];
  } catch (error) {
    console.error('Erro ao listar quizzes liberados', error);
    throw error;
  }
}


// Lista o quiz associado a uma atividade/palestra específica

export async function buscarQuizPorAtividade(atividadeId: string): Promise<QuizResumido | null> {
  try {
    const apiRoot = process.env.EXPO_PUBLIC_API_BASE_URL;

    const usuario = await authStorage.obterUsuario();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (usuario?.id) {
      headers['x-participante-id'] = usuario.id;
    }

    const response = await fetch(`${apiRoot}/palestras/${atividadeId}/quiz`, { method: 'GET', headers: headers });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Nenhum quiz encontrado para a atividade ${atividadeId}.`);
      }
      return null;
    }

    const quiz: QuizResumido = await response.json();
    return quiz;
  } catch (error) {
    console.error("Erro ao buscar quiz da atividade:", error);
    // Em caso de erro de rede ou outro problema, também retorna null.
    return null;
  }
}


// Busca um quiz específico e completo pelo ID (com perguntas e opções)
export async function buscarQuizCompleto(id: string): Promise<Quiz> {
  try {
    const usuario = await authStorage.obterUsuario();

    if (!usuario?.id) {
       throw new Error('Usuário não identificado.');
    }

    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-participante-id': usuario.id, // <--- O PULO DO GATO ESTÁ AQUI
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar os detalhes do quiz.');
    }
    const data = await response.json();
    return data as Quiz;
  } catch (error) {
    console.error(`Erro ao buscar quiz com id ${id}:`, error);
    throw error;
  }
}


// Envia as respostas do usuário para o backend (POST /api/v1/quizzes/responder/:id)
// O participanteId é obtido automaticamente do authStorage (salvo pelo login)
export async function submeterRespostas(
  quizId: string,
  respostas: RespostaUsuario[],
): Promise<{ pontuacao: number; total: number }> {
  try {
    // 1) Recupera o usuário salvo pelo módulo de autenticação
    const usuario = await authStorage.obterUsuario();
    if (!usuario?.id) {
      throw new Error('Não foi possível identificar o participante (user_id ausente).');
    }

    // 2) Chamada HTTP para envio das respostas
    const response = await fetch(`${API_BASE}/responder/${quizId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // identifica o participante que está respondendo o quiz
        'x-participante-id': usuario.id,
      },
      // corpo no formato esperado pela API: { respostas: [...] }
      body: JSON.stringify({ respostas }),
    });

    // tenta sempre interpretar o corpo da resposta como JSON
    const data = await response.json().catch(() => null);

    // se a API retornou erro (400, 401, 500, ...), monta um erro com a mensagem da API
    if (!response.ok) {
      const mensagemApi = (data as any)?.error || 'Erro ao enviar respostas';
      const erro = new Error(mensagemApi) as any;
      // campo extra para o componente conseguir exibir a mensagem da API
      erro.messageApi = mensagemApi;
      throw erro;
    }

    // sucesso: extrai os dados do resultado retornado pelo backend
    // O backend retorna: { mensagem, resultado: { tentativa: { pontosObtidos }, pontuacaoMaxima, ... } }
    const resultado = (data as any)?.resultado;
    if (resultado) {
      return {
        pontuacao: resultado.tentativa?.pontosObtidos || 0,
        total: resultado.pontuacaoMaxima || 0,
      };
    }

    // fallback caso a estrutura seja diferente
    return data as { pontuacao: number; total: number };
  } catch (error) {
    console.error('Erro ao enviar respostas', error);
    // deixa a tela decidir como reagir (alerta, retry, etc.)
    throw error;
  }
}
