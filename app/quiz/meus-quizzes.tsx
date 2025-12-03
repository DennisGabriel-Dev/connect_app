import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/services/auth/context';
import { buscarQuizzesStatus } from '@/services/quiz/api';
import { QuizStatus } from '@/services/quiz/type';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

function formatarData(dataString: string | null) {
  if (!dataString) return '';
  const data = new Date(dataString);
  return `Respondido em ${data.toLocaleDateString('pt-BR')}`;
}

export default function MeusQuizzesScreen() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [quizzes, setQuizzes] = useState<QuizStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadQuizzes = useCallback(async () => {
    if (!usuario) return;
    try {
      setLoading(true);
      const data = await buscarQuizzesStatus();
      setQuizzes(data);
    } catch (error) {
      console.error('Erro ao buscar quizzes:', error);
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  useFocusEffect(
    useCallback(() => {
      loadQuizzes();
    }, [loadQuizzes])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadQuizzes();
    setRefreshing(false);
  }, [loadQuizzes]);

  const renderQuizItem = ({ item }: { item: QuizStatus }) => {
    const isPendente = item.status === 'PENDENTE';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.titulo}>{item.titulo}</Text>
          <View style={[styles.statusBadge, isPendente ? styles.pendenteBadge : styles.respondidoBadge]}>
            <IconSymbol name={isPendente ? 'clock.fill' : 'checkmark.circle.fill'} size={14} color="#fff" />
            <Text style={styles.statusTexto}>{isPendente ? 'Pendente' : 'Respondido'}</Text>
          </View>
        </View>
        <Text style={styles.palestra}>Relacionado à palestra: {item.palestraTitulo}</Text>
        <Text style={styles.descricao}>{item.descricao}</Text>

        <View style={styles.cardFooter}>
          {isPendente ? (
            <TouchableOpacity style={styles.botaoResponder} onPress={() => router.push(`/quiz/${item.id}`)}>
              <Text style={styles.textoBotao}>Responder Agora</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.infoRespondido}>
              <Text style={styles.pontuacao}>Sua pontuação: {item.pontuacao}</Text>
              <Text style={styles.dataResposta}>{formatarData(item.dataResposta)}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading && quizzes.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E88E5" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Meus Quizzes' }} />
      <FlatList
        data={quizzes}
        renderItem={renderQuizItem}
        keyExtractor={(item) => item.id}
        style={styles.container}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text>Nenhum quiz encontrado.</Text>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1E88E5']} />}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  listContent: { padding: 16 },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  pendenteBadge: { backgroundColor: '#F59E0B' },
  respondidoBadge: { backgroundColor: '#10B981' },
  statusTexto: { color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  palestra: { fontSize: 12, color: '#666', fontStyle: 'italic', marginBottom: 8 },
  descricao: { fontSize: 14, color: '#444', marginBottom: 16 },
  cardFooter: { marginTop: 'auto' },
  botaoResponder: {
    backgroundColor: '#1E88E5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotao: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  infoRespondido: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  pontuacao: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  dataResposta: { fontSize: 12, color: '#666', marginTop: 4 },
});
