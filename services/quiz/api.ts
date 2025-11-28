import { Quiz } from './types';

// Backend monta as rotas em /api/v1/quizzes — manter consistente com o servidor
import { Platform } from 'react-native';

// Detecta ambiente para usar a baseURL correta
const BASE_URL = 'http://192.168.1.13:5000'; // Para web, use localhost
const API_ROUTE = '/api/v1/quizzes';

// Para usar emuladores ou dispositivos físicos, ajuste o IP.
// - Android (emulador): 'http://10.0.2.2:5000'
// - iOS (emulador): 'http://localhost:5000'
// - Dispositivo físico: Use o IP da sua máquina na rede local (ex: 'http://192.168.1.10:5000')
let API_URL = BASE_URL + API_ROUTE;

if (Platform.OS === 'android') {
  // IP especial do emulador Android para acessar o localhost do host
  API_URL = 'http://10.0.2.2:5000' + API_ROUTE;
} else if (Platform.OS === 'web') {
  API_URL = BASE_URL + API_ROUTE;
}
// Para iOS no simulador, o localhost funciona. Para dispositivo físico, precisa do IP local.


// API calls para quiz
export const quizApi = {
  async listarTodos(): Promise<Quiz[]> {
    const response = await fetch(`${API_URL}/listarQuizzes`);
    if (!response.ok) {
      throw new Error('Erro ao buscar quizzes');
    }
    return response.json();
  },
};