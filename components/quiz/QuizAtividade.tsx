import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { QuizResumido, buscarQuizPorAtividade } from '../../services/quiz/api';

interface QuizAtividadeProps {
  atividadeId: string;
}

const QuizAtividade: React.FC<QuizAtividadeProps> = ({ atividadeId }) => {
  const navegador = useRouter();
  const [quiz, setQuiz] = useState<QuizResumido | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarQuizAtividade();
  }, [atividadeId]);

  async function carregarQuizAtividade() {
    try {
      setCarregando(true);
      const dados = await buscarQuizPorAtividade(atividadeId);
      setQuiz(dados);
    } catch (erro) {
      console.error('Erro ao carregar quiz da atividade:', erro);
    } finally {
      setCarregando(false);
    }
  }

  const manipularPressionarQuiz = (quizId: string) => {
    if (!quiz) return;

    if (quiz.jaRespondeu) {
      Alert.alert("Concluído", "Você já respondeu este quiz.");
      return;
    }

    navegador.push(`/quiz/${quiz.id}`);
  };

  if (carregando) {
    return (
      <View style={styles.containerCarregando}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.textoCarregando}>Carregando quiz da atividade...</Text>
      </View>
    );
  }

  if (!quiz) {
    return null;
  }

  const estiloBotao = quiz.jaRespondeu ? styles.botaoConcluido : styles.botaoResponderQuiz;
  const textoBotao = quiz.jaRespondeu ? "Quiz Concluído" : "Responder Quiz";

  // Exibe apenas o botão para responder quiz com título
  return (
    <View style={styles.containerBotaoQuiz}>
      <Text style={styles.tituloQuizAtividade}>Quiz da Atividade</Text>
      <TouchableOpacity
        style={estiloBotao}
        onPress={() => manipularPressionarQuiz(quiz.id)}
      >
        <Text style={styles.textoBotaoResponderQuiz}>{textoBotao}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default QuizAtividade;

const styles = StyleSheet.create({
  containerCarregando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCarregando: {
    marginTop: 16,
    color: '#64748B',
    fontSize: 16,
  },
  containerBotaoQuiz: {
    alignItems: 'center',
    marginVertical: 12,
  },
  tituloQuizAtividade: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginBottom: 10,
    marginTop: 8,
    textAlign: 'center',
  },
  botaoResponderQuiz: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    elevation: 2,
  },
  botaoConcluido: {
    backgroundColor: '#64748B',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    elevation: 0,
  },
  textoBotaoResponderQuiz: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
});
