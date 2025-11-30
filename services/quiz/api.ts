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

// Busca um quiz específico pelo ID (GET /api/v1/quizzes/:id)
export async function buscarQuiz(quizId: string): Promise<Quiz> {
  try {
    // faz a requisição HTTP para o backend
    const response = await fetch(`${API_BASE}/${quizId}`);

    // se não for status 2xx, considera que o quiz não foi encontrado
    if (!response.ok) {
      throw new Error('Quiz não encontrado');
    }

    // converte o JSON da resposta para o tipo Quiz
    const data = await response.json();
    return data as Quiz;
  } catch (error) {
    console.error('Erro ao buscar quiz', error);
    // propaga o erro para o componente tratar (alerta, tela de erro, etc.)
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