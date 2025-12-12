// services/sorteio/api.ts

import { BASE_URL } from "./utils";


export interface FiltrosSorteio {
  minFeedbacks?: number;
  minVotos?: number;
  minPresencas?: number;
  minQuizScore?: number;
  sortBy?: "votes" | "engagement";
  dateFrom?: string;
  dateTo?: string;
  filtroPerguntas?: "todas" | "premiadas" | "nao_premiadas";
  nomeContains?: string;
  tipoUsuario?: string;
  turma?: string;
}

export async function listarTudo(filtros: FiltrosSorteio = {}) {
  try {
    const url = `${BASE_URL}/sorteio/usuarios/all`;
    console.log('📡 Fazendo requisição para:', url);
    console.log('📋 Filtros:', JSON.stringify(filtros));
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filtros),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta:', response.status, errorText);
      throw new Error(`Erro ao buscar dados de sorteio: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Dados recebidos:', data.length, 'usuários');
    return data;
  } catch (error: any) {
    console.error("❌ Erro no service de sorteio:", error);
    console.error("Erro completo:", JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function buscarDetalhesUsuario(participanteId: string) {
  try {
    const response = await fetch(`${BASE_URL}/sorteio/usuarios/${participanteId}/detalhes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar detalhes do usuário");
    }

    return await response.json();
  } catch (error) {
    console.log("Erro ao buscar detalhes do usuário:", error);
    throw error;
  }
}
