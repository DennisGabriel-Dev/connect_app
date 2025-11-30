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
}

export async function listarTudo(filtros: FiltrosSorteio = {}) {
  try {
    const response = await fetch(`${BASE_URL}/sorteio/usuarios/all`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filtros),
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar dados de sorteio");
    }

    return await response.json();
  } catch (error) {
    console.log("Erro no service de sorteio:", error);
    throw error;
  }
}
