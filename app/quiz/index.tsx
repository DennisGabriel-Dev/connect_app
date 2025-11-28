// QuizScreen: Lista de quizzes com suporte a temas, loading, refresh e quizzes bloqueados
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/shared/Button';
import { Colors } from '../../constants/theme';
import { quizApi } from '../../services/quiz/api';
import type { Quiz } from '../../services/quiz/types';

export default function QuizScreen() {
  // Estados para gerenciar lista, loading, refresh e erros
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Tema dinâmico e cores atuais
  const theme = useColorScheme();
  const currentColors = Colors[theme ?? 'light'];
  const router = useRouter();

  // Dados mockados para testes - REMOVER EM PRODUÇÃO
  const sampleQuizzes: Quiz[] = [
    {
      id: 'sample-1',
      titulo: 'Quiz de Exemplo: Introdução',
      descricao: 'Um quiz curto para testar o fluxo.',
      liberado: true,
      _count: { perguntas: 3 },
    },
    {
      id: 'sample-2',
      titulo: 'Quiz de Exemplo: Avançado',
      descricao: 'Conteúdo teórico — só disponível depois.',
      liberado: false,
      _count: { perguntas: 5 },
    },
  ];

  // Função principal de carregamento dos quizzes
  const loadQuizzes = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await quizApi.listarTodos();
      setQuizzes(data);
      // TODO: Remover comentários de teste em produção
      // setQuizzes(sampleQuizzes); // Dados mockados para teste
    } catch (err: any) {
      const msg = err?.message ?? 'Não foi possível carregar os quizzes.';
      setError(msg);
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await quizApi.listarTodos();
      setQuizzes(data);
    } catch (error) {
      const msg = (error as any)?.message ?? 'Não foi possível atualizar os quizzes.';
      setError(msg);
      Alert.alert('Erro', msg);
    } finally {
      setRefreshing(false);
    }
  };

  // Carrega quizzes na montagem do componente
  useEffect(() => {
    loadQuizzes();
  }, []);

  // Navega para quiz específico se liberado
  const onStart = (quiz: Quiz) => {
    if (!quiz.liberado) {
      Alert.alert('Quiz bloqueado', 'Este quiz ainda não foi liberado.');
      return;
    }
    router.push(`/quiz/${quiz.id}`);
  };

  // Loading inicial completo
  if (loading && !quizzes) {
    return (
      <View style={[styles.center, { backgroundColor: currentColors.background }]}>
        <ActivityIndicator size="large" color={currentColors.tint} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Exibe erro se houver */}
      {error ? (
        <View style={styles.errorRow}>
          <Text style={{ color: currentColors.text }}>{error}</Text>
        </View>
      ) : null}

      {/* Lista de quizzes com pull-to-refresh */}
      <FlatList
        style={{ flex: 1 }}
        data={quizzes ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => {
          // Determina texto de contagem (prioriza perguntas)
          let countText = '0 perguntas';
          if (item._count) {
            if (typeof item._count.perguntas === 'number') {
              countText = `${item._count.perguntas} perguntas`;
            } else if (typeof item._count.tentativas === 'number') {
              countText = `${item._count.tentativas} tentativas`;
            }
          }
          
          return (
            <View
              style={[
                styles.card,
                { backgroundColor: currentColors.card },
                // Shadows multiplataforma
                Platform.OS === 'web'
                  ? { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
                  : { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
                // Quiz bloqueado com opacidade reduzida
                !item.liberado && { opacity: 0.6 },
              ]}
            >
              {/* Conteúdo do card */}
              <View style={styles.cardBody}>
                <Text style={[styles.title, { color: currentColors.text }]}>{item.titulo}</Text>
                {item.descricao ? <Text style={[styles.desc, { color: currentColors.icon }]}>{item.descricao}</Text> : null}
                <Text style={[styles.count, { color: currentColors.icon }]}>{countText}</Text>
              </View>
              
              {/* Botão ou ícone de trava condicional */}
              {item.liberado ? (
                <Button
                  title="Iniciar"
                  onPress={() => onStart(item)}
                  color={currentColors.tint}
                  disabled={false}
                />
              ) : (
                <Ionicons name="lock-closed" size={24} color={currentColors.icon} style={{ paddingHorizontal: 12 }} />
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

// Estilos do componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  errorRow: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardBody: { 
    flex: 1, 
    paddingRight: 8 
  },
  title: { 
    fontSize: 16, 
    fontWeight: '600' 
  },
  desc: { 
    color: '#666', 
    marginTop: 4 
  },
  count: { 
    color: '#5f5c5cff', 
    marginTop: 6, 
    fontSize: 12 
  },
});
