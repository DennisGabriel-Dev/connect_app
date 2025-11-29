// Tipos TypeScript para perguntas
export interface Pergunta {
  id: string;
  palestraId: string;
  usuarioId: string;
  usuarioNome: string;
  titulo: string;
  descricao: string;
  votos: number;
  usuariosVotaram: string[];
  respondida: boolean;
  resposta?: string;
  dataResposta?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CriarPerguntaDTO {
  palestraId: string;
  titulo: string;
  descricao: string;
}

export interface VotarPerguntaDTO {
  perguntaId: string;
  usuarioId: string;
}