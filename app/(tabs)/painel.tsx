import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/services/auth/context';
import { listarTudo } from '@/services/sorteio/api';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PainelScreen() {
  const { usuario } = useAuth();
  const { filtros } = useLocalSearchParams();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregar(filtrosAplicados: any = {}) {
    try {
      setLoading(true);
      const data = await listarTudo(filtrosAplicados);
      setUsuarios(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (filtros) {
      carregar(JSON.parse(filtros as string));
    } else {
      carregar({});
    }
  }, [filtros]);

  const isAdmin = usuario?.role === 'admin' || usuario?.isAdmin === true;

  // Guardão simples no cliente: impede acesso direto via rota se não for admin
  if (!isAdmin) {
    return (
      <View style={styles.screenContainer}>
        <Text style={styles.errorText}>
          Você não tem permissão para acessar este painel.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      {/* Título + Botão de filtros */}
      <View style={styles.header}>
        <Text style={styles.title}>Usuários</Text>
        <TouchableOpacity
          onPress={() => router.push('/sorteio/modal')}
          style={styles.filterButton}
        >
          <IconSymbol name="line.3.horizontal.decrease.circle" size={24} color="#1e88e5" />
        </TouchableOpacity>
      </View>

      {/* Lista de usuários */}
      {loading ? (
        <View style={styles.containerCarregando}>
          <ActivityIndicator size="large" color="#1E88E5" />
          <Text style={styles.textoCarregando}>Carregando usuários...</Text>
        </View>
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/sorteio/details',
                  params: { data: JSON.stringify(item) },
                })
              }
              style={styles.card}
            >
              <Text style={styles.cardTitle}>{item.nome}</Text>
              <Text style={styles.cardEmail}>{item.email}</Text>

              <View style={styles.statsContainer}>
                <Text style={styles.statText}>Feedbacks: {item.feedbacks}</Text>
                <Text style={styles.statText}>Perguntas: {item.perguntas}</Text>
                {item.perguntasPremiadas > 0 && (
                  <Text style={[styles.statText, { color: "#F59E0B", fontWeight: "600" }]}>
                    Perguntas Premiadas: {item.perguntasPremiadas}
                  </Text>
                )}
                <Text style={styles.statText}>Votos: {item.votosPerguntas}</Text>
                <Text style={styles.statText}>Presenças: {item.presencas}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 20,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardEmail: {
    color: '#6B7280',
    marginBottom: 10,
  },
  statsContainer: {
    marginTop: 10,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  totalScore: {
    fontWeight: 'bold',
    marginTop: 8,
    fontSize: 16,
    color: '#1e88e5',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '600',
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
});


