import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buscarQuiz, submeterRespostas } from '../../services/quiz/api';
import { Pergunta, RespostaUsuario, Quiz, Opcao } from '../../services/quiz/type';

// Tela responsável por exibir e responder um quiz
export default function TelaQuiz() {
  // pega o id do quiz vindo da rota /quiz/[id]
  const { id } = useLocalSearchParams<{ id: string }>();

  // estado com os dados do quiz carregados da API
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  // índice da pergunta atual (0, 1, 2, ...)
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  // guarda, para cada pergunta, o índice da opção selecionada
  const [respostasUsuario, setRespostasUsuario] = useState<{ [key: string]: number }>({});
  // controla loading inicial do quiz
  const [carregando, setCarregando] = useState(true);
  // evita múltiplos envios simultâneos
  const [enviando, setEnviando] = useState(false);

  // sempre que o id da rota mudar, busca o quiz na API
  useEffect(() => {
    if (id) {
      carregarQuiz();
    }
  }, [id]);

  // busca o quiz no backend e atualiza o estado
  async function carregarQuiz() {
    try {
      setCarregando(true);
      const quizData = await buscarQuiz(String(id));
      setQuiz(quizData);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao carregar o quiz.');
    } finally {
      setCarregando(false);
    }
  }

  // monta as respostas e envia para o backend
  async function finalizarQuiz() {
    if (!quiz || enviando) return;

    // transforma o estado local em array no formato esperado pela API
    const respostas: RespostaUsuario[] = quiz.perguntas.map((p: Pergunta) => {
      const indiceSelecionado = respostasUsuario[p.id];
      const opcaoSelecionada: Opcao | undefined = p.opcoes[indiceSelecionado];

      return {
        perguntaId: p.id,
        opcaoId: opcaoSelecionada?.id ?? '',
      };
    });

    // impede envio se alguma pergunta estiver sem resposta
    const algumaSemResposta = respostas.some(r => !r.opcaoId);
    if (algumaSemResposta) {
      Alert.alert('Atenção', 'Responda todas as perguntas antes de finalizar.');
      return;
    }

    // recupera o ID do participante salvo pelo fluxo de login
    const participanteId = await AsyncStorage.getItem('user_id');
    if (!participanteId) {
      Alert.alert('Erro', 'Não foi possível identificar o participante (user_id ausente).');
      return;
    }

    try {
      setEnviando(true);
      const resultado = await submeterRespostas(String(id), participanteId, respostas);

      // sucesso: mostra pontuação retornada pela API
      Alert.alert(
        'Quiz finalizado',
        `Você acertou ${resultado.pontuacao} de ${resultado.total} perguntas.`,
      );
    } catch (err: any) {
      // em caso de erro, usa a mensagem vinda da API (err.messageApi) ou uma genérica
      const mensagemApi =
        err?.messageApi || err?.message || 'Não foi possível enviar as respostas.';
      Alert.alert('Aviso', mensagemApi);
    } finally {
      setEnviando(false);
    }
  }

  // chamada quando o usuário toca em uma opção
  async function selecionarOpcaoEAvancar(indice: number) {
    if (!quiz || enviando) return;

    const perguntaId = quiz.perguntas[perguntaAtual].id;

    // registra o índice da opção escolhida para a pergunta atual
    setRespostasUsuario(prev => ({
      ...prev,
      [perguntaId]: indice,
    }));

    const ultimaPergunta = perguntaAtual === quiz.perguntas.length - 1;

    // se ainda houver perguntas, avança automaticamente
    if (!ultimaPergunta) {
      setPerguntaAtual(perguntaAtual + 1);
    }
    // se for a última, o usuário finaliza manualmente pelo botão
  }

  // estado de carregamento do quiz
  if (carregando) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}
      >
        <Text>Carregando quiz...</Text>
      </View>
    );
  }

  // caso o quiz não tenha sido encontrado pela API
  if (!quiz) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}
      >
        <Text>Quiz não encontrado</Text>
      </View>
    );
  }

  // pergunta que está sendo exibida no momento
  const perguntaAtualObj: Pergunta = quiz.perguntas[perguntaAtual];

  // indica se todas as perguntas já foram respondidas
  const todasRespondidas =
    quiz.perguntas.length > 0 &&
    quiz.perguntas.every(p => respostasUsuario[p.id] !== undefined);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      {/* Cabeçalho com título do quiz e progresso */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
          {quiz.titulo}
        </Text>
        <Text style={{ fontSize: 14, color: '#6b7280' }}>
          {perguntaAtual + 1} / {quiz.perguntas.length}
        </Text>
      </View>

      {/* Bloco principal com enunciado e opções */}
      <ScrollView style={{ flex: 1 }}>
        <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 16 }}>
          {perguntaAtualObj.texto}
        </Text>

        <View>
          {perguntaAtualObj.opcoes.map((opcao: Opcao, indice: number) => {
            const selecionada = respostasUsuario[perguntaAtualObj.id] === indice;
            return (
              <TouchableOpacity
                key={opcao.id ?? indice}
                onPress={() => selecionarOpcaoEAvancar(indice)}
                disabled={enviando}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: selecionada ? '#2563eb' : '#d4d4d4',
                  backgroundColor: selecionada ? '#dbeafe' : '#f9fafb',
                }}
              >
                <Text style={{ fontSize: 16 }}>{opcao.texto}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Botão de finalizar visível apenas quando todas as perguntas têm resposta */}
      {todasRespondidas && (
        <TouchableOpacity
          onPress={finalizarQuiz}
          disabled={enviando}
          style={{
            marginTop: 16,
            paddingVertical: 12,
            borderRadius: 8,
            backgroundColor: enviando ? '#9ca3af' : '#2563eb',
          }}
        >
          <Text
            style={{
              color: '#fff',
              textAlign: 'center',
              fontSize: 18,
              fontWeight: '600',
            }}
          >
            {enviando ? 'Enviando...' : 'Finalizar Quiz'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
