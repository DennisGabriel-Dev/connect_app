import { HeaderTela } from '@/components/shared/HeaderTela';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { buscarQuiz, submeterRespostas } from '../../services/quiz/api';
import { Opcao, Pergunta, Quiz, RespostaUsuario } from '../../services/quiz/type';

// Tela responsável por exibir e responder um quiz
export default function TelaQuiz() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostasUsuario, setRespostasUsuario] = useState<{ [key: string]: number }>({});
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (id) {
      carregarQuiz();
    }
  }, [id]);

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

  async function finalizarQuiz() {
    if (!quiz || enviando) return;

    const respostas: RespostaUsuario[] = quiz.perguntas.map((p: Pergunta) => {
      const indiceSelecionado = respostasUsuario[p.id];
      const opcaoSelecionada: Opcao | undefined = p.opcoes[indiceSelecionado];

      return {
        perguntaId: p.id,
        opcaoId: opcaoSelecionada?.id ?? '',
      };
    });

    const algumaSemResposta = respostas.some(r => !r.opcaoId);
    if (algumaSemResposta) {
      Alert.alert('Atenção', 'Responda todas as perguntas antes de finalizar.');
      return;
    }

    Alert.alert(
      'Confirmar Envio',
      'Deseja finalizar e enviar suas respostas? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Finalizar',
          onPress: () => enviarRespostas(respostas),
        },
      ],
    );
  }

  async function enviarRespostas(respostas: RespostaUsuario[]) {
    try {
      setEnviando(true);
      const resultado = await submeterRespostas(String(id), respostas);

      Alert.alert(
        'Quiz finalizado',
        `Você obteve ${resultado.pontuacao} de ${resultado.total} pontos.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // volta para a tela de Programação
              router.replace('/(tabs)'); // use '/(tabs)/programacao' se estiver em grupo de tabs
            },
          },
        ],
      );
    } catch (err: any) {
      const mensagemApi =
        err?.messageApi || err?.message || 'Não foi possível enviar as respostas.';

      if (mensagemApi.includes('já respondeu')) {
        Alert.alert('Aviso', mensagemApi, [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(tabs)');
            },
          },
        ]);
      } else {
        Alert.alert('Aviso', mensagemApi);
      }
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F8FAFC',
        }}
      >
        <Text style={{ fontSize: 16, color: '#64748B' }}>Carregando quiz...</Text>
      </View>
    );
  }

  if (!quiz) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F8FAFC',
        }}
      >
        <Text style={{ fontSize: 18, color: '#DC2626', marginBottom: 16 }}>
          Quiz não encontrado
        </Text>
      </View>
    );
  }

  const perguntaAtualObj: Pergunta = quiz.perguntas[perguntaAtual];

  const todasRespondidas =
    quiz.perguntas.length > 0 &&
    quiz.perguntas.every(p => respostasUsuario[p.id] !== undefined);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <HeaderTela titulo="Teste seu conhecimento" />

      <View style={{ marginBottom: 24, padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
          {quiz.titulo}
        </Text>
        <Text style={{ fontSize: 14, color: '#6b7280' }}>
          {perguntaAtual + 1} / {quiz.perguntas.length}
        </Text>
      </View>

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
                onPress={() => {
                  const perguntaId = quiz.perguntas[perguntaAtual].id;
                  setRespostasUsuario(prev => ({
                    ...prev,
                    [perguntaId]: indice,
                  }));
                }}
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

      <View style={{ flexDirection: 'row', gap: 12, padding: 16 }}>
        <TouchableOpacity
          onPress={() => setPerguntaAtual(perguntaAtual - 1)}
          disabled={perguntaAtual === 0 || enviando}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 8,
            backgroundColor: perguntaAtual === 0 ? '#e5e7eb' : '#f3f4f6',
            borderWidth: 1,
            borderColor: '#d1d5db',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <IconSymbol name="chevron.left" size={20} color={perguntaAtual === 0 ? '#9ca3af' : '#374151'} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: perguntaAtual === 0 ? '#9ca3af' : '#374151' }}>
            Anterior
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setPerguntaAtual(perguntaAtual + 1)}
          disabled={perguntaAtual === quiz.perguntas.length - 1 || enviando}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 8,
            backgroundColor: perguntaAtual === quiz.perguntas.length - 1 ? '#e5e7eb' : '#f3f4f6',
            borderWidth: 1,
            borderColor: '#d1d5db',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: perguntaAtual === quiz.perguntas.length - 1 ? '#9ca3af' : '#374151' }}>
            Próxima
          </Text>
          <IconSymbol name="chevron.right" size={20} color={perguntaAtual === quiz.perguntas.length - 1 ? '#9ca3af' : '#374151'} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={finalizarQuiz}
        disabled={!todasRespondidas || enviando}
        style={{
          margin: 16,
          marginTop: 0,
          paddingVertical: 12,
          borderRadius: 8,
          backgroundColor: !todasRespondidas || enviando ? '#9ca3af' : '#2563eb',
          opacity: !todasRespondidas || enviando ? 0.6 : 1,
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
    </View>
  );
}
