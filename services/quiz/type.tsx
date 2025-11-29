// Representa uma única opção de resposta de uma pergunta
export interface Opcao {
  id: string;    // ID único da opção (usado para enviar ao backend)
  texto: string; // Texto visível para o usuário
}

// Representa uma pergunta do quiz
export interface Pergunta {
  id: string;        // ID único da pergunta
  texto: string;     // Enunciado da pergunta
  pontos: number;    // Quantos pontos essa pergunta vale
  opcoes: Opcao[];   // Lista de opções disponíveis para responder
}

// Representa um quiz completo
export interface Quiz {
  id: string;            // ID único do quiz
  titulo: string;        // Título exibido na tela
  descricao?: string;    // Descrição opcional
  liberado?: boolean;    // Indica se o quiz está disponível ou não (opcional)
  perguntas: Pergunta[]; // Conjunto de perguntas do quiz
}

// Representa a resposta do usuário para uma pergunta
export interface RespostaUsuario {
  perguntaId: string; // ID da pergunta respondida
  opcaoId: string;    // ID da opção escolhida (não é índice, é o id da opção)
}
