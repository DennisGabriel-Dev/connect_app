// API calls para quiz
import { Quiz } from "./types";

const BASE_URL = 'http://192.168.1.105:5000'
const API_ROUTE = '/api/v1/quizzes'
const API_URL = BASE_URL + API_ROUTE

export const quizApi = {
  async listarTodos(): Promise<Quiz[]> {
    const resposta = await fetch(`${API_URL}/`)
    if(!resposta.ok){
      throw new Error('Erro ao buscar os quizzes.')
    }
    return await resposta.json()
  }
  // Implementar chamadas API aqui
};