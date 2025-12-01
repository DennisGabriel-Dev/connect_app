import { Quiz, RespostaUsuario } from './type';

const API_BASE = `${process.env.EXPO_PUBLIC_API_BASE_URL}/quizzes`;

// Interface para quiz resumido (usado na listagem)
export interface QuizResumido {
  id: string;
  titulo: string;
  descricao?: string;
  liberado: boolean;
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
    const response = await fetch(`${apiRoot}/palestras/${atividadeId}/quiz`);
    // Se a resposta for 404 (Not Found), significa que não há quiz. Retornamos null.
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Nenhum quiz encontrado para a atividade ${atividadeId}.`);
      }
      return null;
    }

    // Extrai o quiz da resposta e retorna o objeto diretamente
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
    const response = await fetch(`${API_BASE}/${id}`);
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
// recebe o quizId, o id do participante (dinâmico) e o array de respostas
export async function submeterRespostas(
  quizId: string,
  participanteId: string,
  respostas: RespostaUsuario[],
): Promise<{ pontuacao: number; total: number }> {
  try {
    // chamada HTTP para envio das respostas
    const response = await fetch(`${API_BASE}/responder/${quizId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // identifica o participante que está respondendo o quiz
        'x-participante-id': participanteId,
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