import { Quiz, RespostaUsuario } from './type';

// URL base da API de quizzes no backend
const API_BASE = 'http://localhost:5000/api/v1/quizzes';

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

    // sucesso: retorna o objeto com pontuação e total de pontos
    return data as { pontuacao: number; total: number };
  } catch (error) {
    console.error('Erro ao enviar respostas', error);
    // deixa a tela decidir como reagir (alerta, retry, etc.)
    throw error;
  }
}