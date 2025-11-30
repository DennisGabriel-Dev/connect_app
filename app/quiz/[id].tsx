import { HeaderTela } from '@/components/shared/HeaderTela';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { buscarQuiz, submeterRespostas } from '../../services/quiz/api';
import { Opcao, Pergunta, Quiz, RespostaUsuario } from '../../services/quiz/type';

export default function TelaQuiz() {
  // pega o id do quiz a partir da rota /quiz/[id]
  const { id } = useLocalSearchParams<{ id: string }>();

  // estado com os dados do quiz carregado da API
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  // índice da pergunta atual (0, 1, 2, ...)
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  // armazena, para cada pergunta, o índice da opção escolhida
  const [respostasUsuario, setRespostasUsuario] = useState<{ [key: string]: number }>({});
  // controla loading inicial do quiz
  const [carregando, setCarregando] = useState(true);
  // evita múltiplos envios enquanto a API está respondendo
  const [enviando, setEnviando] = useState(false);

  // quando o id da rota mudar, carrega o quiz da API
  useEffect(() => {
    if (id) {
      carregarQuiz();
    }
  }, [id]);

  // busca os dados do quiz no backend
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

    // transforma o estado local em array no formato que a API espera
    const respostas: RespostaUsuario[] = quiz.perguntas.map((p: Pergunta) => {
      const indiceSelecionado = respostasUsuario[p.id];
      const opcaoSelecionada: Opcao | undefined = p.opcoes[indiceSelecionado];

      return {
        perguntaId: p.id,
        opcaoId: opcaoSelecionada?.id ?? '',
      };
    });

    // bloqueia envio caso alguma pergunta não tenha resposta
    const algumaSemResposta = respostas.some(r => !r.opcaoId);
    if (algumaSemResposta) {
      Alert.alert('Atenção', 'Responda todas as perguntas antes de finalizar.');
      return;
    }

    try {
      setEnviando(true);
      const resultado = await submeterRespostas(String(id), respostas);

      // sucesso: mostra pontuação vinda do backend
      Alert.alert(
        'Quiz finalizado',
        `Você obteve ${resultado.pontuacao} de ${resultado.total} pontos.`,
      );
    } catch (err: any) {
      // se o backend mandou { error: "..." }, essa mensagem vem em err.messageApi
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

    // salva o índice da opção escolhida para a pergunta atual
    setRespostasUsuario(prev => ({
      ...prev,
      [perguntaId]: indice,
    }));

    const ultimaPergunta = perguntaAtual === quiz.perguntas.length - 1;

    // se ainda tiver pergunta, avança automaticamente
    if (!ultimaPergunta) {
      setPerguntaAtual(perguntaAtual + 1);
    }
    // se for a última, o usuário finaliza pelo botão "Finalizar Quiz"
  }

  // estado de loading inicial
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

  // caso a API não encontre o quiz
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

  // verifica se o usuário já respondeu todas as perguntas
  const todasRespondidas =
    quiz.perguntas.length > 0 &&
    quiz.perguntas.every(p => respostasUsuario[p.id] !== undefined);

  return (
    
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <HeaderTela titulo='Teste seu conhecimento'/>

      
      {/* Cabeçalho com título do quiz e progresso */}
      <View style={{ marginBottom: 24, padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
          {quiz.titulo}
        </Text>
        <Text style={{ fontSize: 14, color: '#6b7280' }}>
          {perguntaAtual + 1} / {quiz.perguntas.length}
        </Text>
      </View>

      {/* Bloco principal: enunciado + opções */}
      <ScrollView style={{ flex: 1, padding: 16 }}>
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

      {/* Botão Finalizar visível só quando todas as perguntas têm resposta */}
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
