import { Quiz, RespostaUsuario } from './type';

// URL base da API de quizzes no backend
const API_BASE = 'http://localhost:5000/api/v1/quizzes';

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

    // sucesso: retorna o objeto com pontuação/total
    return data as { pontuacao: number; total: number };
  } catch (error) {
    console.error('Erro ao enviar respostas', error);
    throw error; // componente trata alertas e UX
  }
}
