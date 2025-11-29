import axios from 'axios';
import { URL_BASE_API } from '../programacao/api';

export interface DadosPresenca {
  participanteId: string;
  palestraId: string;
}

export interface RespostaPresenca {
  message?: string;
  presenca?: any;
  error?: string;
}

// Serviço de API para Presença
export const presencaApi = {
  async registrarPresenca(dados: DadosPresenca): Promise<RespostaPresenca> {
    try {
      console.log('Registrando presença:', dados);
      console.log('URL:', `${URL_BASE_API}/presenca`);

      const resposta = await axios.post(
        `${URL_BASE_API}/presenca`,
        dados,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return resposta.data;
    } catch (erro: any) {
      console.error('Erro ao registrar presença:', {
        message: erro.message,
        code: erro.code,
        response: erro.response?.data,
      });

      if (erro.response) {
        throw new Error(erro.response.data.error || erro.response.data.erro || 'Erro ao registrar presença');
      } else if (erro.request) {
        throw new Error(`Não foi possível conectar ao servidor: ${URL_BASE_API}`);
      } else {
        throw new Error('Erro ao configurar a requisição');
      }
    }
  },

  async listarPresencas(participanteId: string): Promise<any[]> {
    try {
      const resposta = await axios.get(
        `${URL_BASE_API}/presenca/${participanteId}`,
        {
          timeout: 10000,
        }
      );

      return resposta.data || [];
    } catch (erro: any) {
      console.error('Erro ao listar presenças:', erro.message);
      return [];
    }
  },
};
