import axios from 'axios';

// Interfaces para Programação/Atividades
export interface Horario {
  date_start: string;
  date_end: string;
}

export interface Palestrante { 
  nome: string;
  foto?: string;
  bio?: string;
}

export interface Atividade {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: string;
  local?: string;
  horarios: Horario[];
  palestrantes: Palestrante[];
}

// Interfaces para Autenticação
export interface CredenciaisLogin {
  email: string;
  senha: string;
}

export interface RespostaLogin {
  usuario?: any;
  message?: string;
  erro?: string;
  code?: string;
}

const URL_BASE_API = 'http://192.168.1.8:5000/api/v1'; // IP da máquina na rede local

// Serviço de Programação/Atividades
const apiProgramacao = {
  async buscarAtividades(tipo?: string): Promise<Atividade[]> {
    try {
      const params = tipo && tipo !== 'Todos' ? { tipo } : {};

      const resposta = await axios.get(
        `${URL_BASE_API}/palestras`,
        {
          params,
          timeout: 10000,
        }
      );

      if (resposta.status === 200) {
        const dadosAPI = resposta.data;

        if (!dadosAPI || !Array.isArray(dadosAPI)) {
          return [];
        }

        return dadosAPI.map((atividade: any) => ({
          id: atividade.id?.toString() || '',
          titulo: atividade.titulo || 'Sem título',
          descricao: atividade.descricao || '',
          tipo: atividade.tipo || 'Atividade',
          local: atividade.local || 'Local a definir',
          horarios: atividade.horarios || [],
          palestrantes: atividade.palestrantes || []
        }));
      }

      return [];
    } catch (erro: any) {
      console.error('Erro ao buscar atividades:', erro.message);
      return [];
    }
  },

  async buscarAtividadePorId(id: string): Promise<Atividade | null> {
    try {
      const atividades = await this.buscarAtividades();
      const atividadeEncontrada = atividades.find(atv => atv.id === id);

      return atividadeEncontrada || null;
    } catch (erro: any) {
      console.error(`Erro ao buscar atividade ${id}:`, erro.message);
      return null;
    }
  }
};

// Serviço de Autenticação
const apiAuth = {
  async login(credenciais: CredenciaisLogin): Promise<RespostaLogin> {
    try {
      console.log('Tentando conectar em:', `${URL_BASE_API}/auth/login`);

      const resposta = await axios.post(
        `${URL_BASE_API}/auth/login`,
        credenciais,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return resposta.data;
    } catch (erro: any) {
      console.error('Erro:', {
        message: erro.message,
        code: erro.code,
        url: `${URL_BASE_API}/auth/login`
      });

      if (erro.response) {
        throw new Error(erro.response.data.error || erro.response.data.erro || 'Erro ao fazer login');
      } else if (erro.request) {
        throw new Error(`Não foi possível conectar ao servidor: ${URL_BASE_API}`);
      } else {
        throw new Error('Erro ao configurar a requisição');
      }
    }
  },

  async cadastrar(credenciais: CredenciaisLogin): Promise<RespostaLogin> {
    try {
      console.log('Tentando conectar em:', `${URL_BASE_API}/auth/register`);

      const resposta = await axios.post(
        `${URL_BASE_API}/auth/register`,
        credenciais,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return resposta.data;
    } catch (erro: any) {
      console.error('❌ Erro detalhado:', {
        message: erro.message,
        code: erro.code,
        url: `${URL_BASE_API}/auth/register`
      });

      if (erro.response) {
        throw new Error(erro.response.data.error || erro.response.data.erro || 'Erro ao cadastrar');
      } else if (erro.request) {
        throw new Error(`Não foi possível conectar ao servidor: ${URL_BASE_API}`);
      } else {
        throw new Error('Erro ao configurar a requisição');
      }
    }
  },
};

// Exportações
export { apiAuth, apiProgramacao, URL_BASE_API };

export default {
  programacao: apiProgramacao,
  auth: apiAuth,
  URL_BASE_API
};