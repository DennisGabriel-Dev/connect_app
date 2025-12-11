import { HeaderTela } from '@/components/shared/HeaderTela';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showAlert } from '../../utils/alert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buscarQuizCompleto, submeterRespostas } from '../../services/quiz/api';
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
      const quizData = await buscarQuizCompleto(String(id));
      setQuiz(quizData);
    } catch (error) {
      console.error(error);
      showAlert('Erro', 'Falha ao carregar o quiz.');
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
      showAlert('Atenção', 'Responda todas as perguntas antes de finalizar.');
      return;
    }

    showAlert(
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

      showAlert(
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
        showAlert('Aviso', mensagemApi, [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(tabs)');
            },
          },
        ]);
      } else {
        showAlert('Aviso', mensagemApi);
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
    <>
   
    <HeaderTela titulo="Teste seu conhecimento" />
    
    <SafeAreaView style={styles.safeArea}>

      <View style={styles.quizHeader}>
        <Text style={styles.quizTitle}>{quiz.titulo}</Text>
        <Text style={styles.quizProgress}>
          {perguntaAtual + 1} / {quiz.perguntas.length}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.questionText}>{perguntaAtualObj.texto}</Text>

        <View>
          {perguntaAtualObj.opcoes.map((opcao: Opcao, indice: number) => {
            const selecionada = respostasUsuario[perguntaAtualObj.id] === indice;
            return (
              <TouchableOpacity
                key={opcao.id}
                onPress={() => {
                  const perguntaId = quiz.perguntas[perguntaAtual].id;
                  setRespostasUsuario(prev => ({
                    ...prev,
                    [perguntaId]: indice,
                  }));
                }}
                disabled={enviando}
                style={[
                  styles.optionButton,
                  selecionada ? styles.optionSelected : styles.optionDefault,
                ]}
              >
                <Text style={styles.optionText}>{opcao.texto}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.navigationButtonsContainer}>
        <TouchableOpacity
          onPress={() => setPerguntaAtual(perguntaAtual - 1)}
          disabled={perguntaAtual === 0 || enviando}
          style={[styles.navButton, { opacity: perguntaAtual === 0 || enviando ? 0.5 : 1 }]}
        >
          <IconSymbol name="chevron.left" size={20} color="#374151" />
          <Text style={styles.navButtonText}>Anterior</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setPerguntaAtual(perguntaAtual + 1)}
          disabled={perguntaAtual === quiz.perguntas.length - 1 || enviando}
          style={[
            styles.navButton,
            { opacity: perguntaAtual === quiz.perguntas.length - 1 || enviando ? 0.5 : 1 },
          ]}
        >
          <Text style={styles.navButtonText}>Próxima</Text>
          <IconSymbol name="chevron.right" size={20} color="#374151" />
        </TouchableOpacity>
      </View> 

      <TouchableOpacity
        onPress={finalizarQuiz}
        disabled={!todasRespondidas || enviando}
        style={[
          styles.submitButton,
          {
            backgroundColor: !todasRespondidas || enviando ? '#9ca3af' : '#2563eb',
            opacity: !todasRespondidas || enviando ? 0.6 : 1,
            
          },
        ]}
      >
        <Text style={styles.submitButtonText}>
          {enviando ? 'Enviando...' : 'Finalizar Quiz'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
     </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff', paddingBottom: 8 },
  quizHeader: { marginBottom: 24, paddingHorizontal: 16 },
  quizTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  quizProgress: { fontSize: 14, color: '#6b7280' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  questionText: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  optionButton: { padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1 },
  optionDefault: { borderColor: '#d4d4d4', backgroundColor: '#f9fafb' },
  optionSelected: { borderColor: '#2563eb', backgroundColor: '#dbeafe' },
  optionText: { fontSize: 16 },
  navigationButtonsContainer: { flexDirection: 'row', gap: 12, padding: 16 },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  navButtonText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  submitButton: {
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
});