import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { listarQuizzesLiberados, QuizResumido } from '../../services/quiz/api';

export default function QuizScreen() {
  const navegador = useRouter();
  const [quizzes, setQuizzes] = useState<QuizResumido[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarQuizzes();
  }, []);

  async function carregarQuizzes() {
    try {
      setCarregando(true);
      const dados = await listarQuizzesLiberados();
      setQuizzes(dados);
    } catch (erro) {
      console.error('Erro ao carregar quizzes:', erro);
    } finally {
      setCarregando(false);
    }
  }

  const manipularPressionarQuiz = (quiz: QuizResumido) => {
    navegador.push(`/quiz/${quiz.id}`);
  };

  const renderizarItemQuiz = ({ item }: { item: QuizResumido }) => {
    return (
      <TouchableOpacity
        style={styles.cartaoQuiz}
        onPress={() => manipularPressionarQuiz(item)}
      >
        <View style={styles.infoQuiz}>
          <Text style={styles.tituloQuiz} numberOfLines={2}>
            {item.titulo}
          </Text>
          {item.descricao && (
            <Text style={styles.descricaoQuiz} numberOfLines={2}>
              {item.descricao}
            </Text>
          )}
          <View style={styles.badgeContainer}>
            <View style={styles.badgeLiberado}>
              <Text style={styles.badgeTexto}>Disponível</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {carregando ? (
        <View style={styles.containerCarregando}>
          <ActivityIndicator size="large" color="#1E88E5" />
          <Text style={styles.textoCarregando}>Carregando quizzes...</Text>
        </View>
      ) : (
        <FlatList
          data={quizzes}
          renderItem={renderizarItemQuiz}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.containerLista}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.containerVazio}>
              <Text style={styles.textoVazio}>
                Nenhum quiz disponível no momento.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
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
  containerLista: {
    padding: 16,
  },
  cartaoQuiz: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  infoQuiz: {
    flex: 1,
  },
  tituloQuiz: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E88E5',
    marginBottom: 8,
    lineHeight: 24,
  },
  descricaoQuiz: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeLiberado: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  badgeTexto: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  containerVazio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  textoVazio: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
});