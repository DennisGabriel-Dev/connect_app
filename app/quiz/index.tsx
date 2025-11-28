import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/shared/Button';
import { Colors } from '../../constants/theme';
import { quizApi } from '../../services/quiz/api';
import type { Quiz } from '../../services/quiz/types';

export default function QuizScreen() {
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useColorScheme();
  const currentColors = Colors[theme ?? 'light'];
  const router = useRouter();

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

  const loadQuizzes = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await quizApi.listarTodos();
      setQuizzes(data);
    } catch (err: any) {
      const msg = err?.message ?? 'Não foi possível carregar os quizzes.';
      setError(msg);
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    loadQuizzes();
  }, []);

  const onStart = (quiz: Quiz) => {
    if (!quiz.liberado) {
      Alert.alert('Quiz bloqueado', 'Este quiz ainda não foi liberado.');
      return;
    }

    router.push(`/quiz/${quiz.id}`);
  };



  if (loading && !quizzes) {
    return (
      <View style={[styles.center, { backgroundColor: currentColors.background }] }>
        <ActivityIndicator size="large" color={currentColors.tint} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }] }>
      <View style={styles.headerRow}>
        <IconSymbol name="list.bullet" size={20} color={currentColors.tabIconSelected ?? currentColors.tint} />
        <Text style={[styles.header, { color: currentColors.text, marginLeft: 8 }]}>Quizzes</Text>
      </View>



      {error ? (
        <View style={styles.errorRow}>
          <Text style={{ color: currentColors.text }}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        style={{ flex: 1 }}
        data={(quizzes && quizzes.length > 0) ? quizzes : (error ? sampleQuizzes : [])}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff' },
              Platform.OS === 'web'
                ? { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
                : { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
            ]}
          >
            <View style={styles.cardBody}>
              <Text style={[styles.title, { color: currentColors.text }]}>{item.titulo}</Text>
              {item.descricao ? <Text style={[styles.desc, { color: currentColors.icon }]}>{item.descricao}</Text> : null}
              <Text style={[styles.count, { color: currentColors.icon }]}>{item._count?.perguntas ?? 0} perguntas</Text>
            </View>

            <Button title={item.liberado ? 'Iniciar' : 'Bloqueado'} onPress={() => onStart(item)} />
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <Text style={{ color: currentColors.text }}>Nenhum quiz encontrado.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
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
    backgroundColor: '#fff',
    marginBottom: 10,
    // shadows are added per-platform inline (web uses boxShadow)
  },
  cardBody: { flex: 1, paddingRight: 8 },
  title: { fontSize: 16, fontWeight: '600' },
  desc: { color: '#666', marginTop: 4 },
  count: { color: '#999', marginTop: 6, fontSize: 12 },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonEnabled: {
    backgroundColor: '#0B7730',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});