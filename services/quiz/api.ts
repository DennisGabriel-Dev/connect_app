import { Quiz, RespostaUsuario } from './type';

// URL base da API de quizzes no backend
// Usando IP da máquina na rede local (mesmo padrão dos outros serviços)
const API_BASE = 'http://192.168.3.30:5000/api/v1/quizzes';

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

// Busca um quiz específico pelo ID
export async function buscarQuiz(quizId: string): Promise<Quiz> {
  try {
    const response = await fetch(`${API_BASE}/${quizId}`);

    // se não vier 2xx, considera que não encontrou o quiz
    if (!response.ok) {
      throw new Error('Quiz não encontrado');
    }

    // converte o JSON para o tipo Quiz
    const data = await response.json();
    return data as Quiz;
  } catch (error) {
    console.error('Erro ao buscar quiz', error);
    throw error; // deixa o componente decidir o que mostrar
  }
}

// Envia as respostas do usuário para o backend
export async function submeterRespostas(
  quizId: string,
  respostas: RespostaUsuario[],
): Promise<{ pontuacao: number; total: number }> {
  try {
    const response = await fetch(`${API_BASE}/responder/${quizId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // ID fixo de participante para ambiente de teste
        'x-participante-id': '6929f849ab5ff429a863b113',
      },
      // body no formato esperado pela API: { respostas: [...] }
      body: JSON.stringify({ respostas }),
    });

    // tenta ler o corpo da resposta mesmo em caso de erro
    const data = await response.json().catch(() => null);

    // se a API retornou erro (400, 500, etc.), repassa a mensagem
    if (!response.ok) {
      const mensagemApi = (data as any)?.error || 'Erro ao enviar respostas';
      const erro = new Error(mensagemApi) as any;
      // campo extra para o componente exibir a mensagem da API
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
    throw error; // componente trata alertas e UX
  }
}
