// Tipos TypeScript para perguntas
export enum StatusPergunta {
  PENDENTE = 'pendente',
  APROVADA = 'aprovada',
  REJEITADA = 'rejeitada'
}

export interface Pergunta {
  id: string;
  palestraId: string;
  usuarioId: string;
  usuarioNome: string;
  titulo: string;
  descricao: string;
  votos: number;
  usuariosVotaram: string[];
  status: StatusPergunta;
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
  palestraTitulo?: string;
}

export interface VotarPerguntaDTO {
  perguntaId: string;
  usuarioId: string;
}

export interface AprovarRejeitarPerguntaDTO {
  perguntaId: string;
  status: StatusPergunta;
}