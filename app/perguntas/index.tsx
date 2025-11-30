import PerguntaCard from '@/components/perguntas/PerguntaCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/services/auth/context';
import { perguntasApi } from '@/services/perguntas/api';
import { Pergunta } from '@/services/perguntas/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function PerguntasScreen() {
  const router = useRouter();
  const { palestraId, palestraTitulo } = useLocalSearchParams();
  const { usuario } = useAuth();
  
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  // Carregar perguntas da palestra
  useEffect(() => {
    if (palestraId) {
      carregarPerguntas();
    } else {
      // Se não há palestraId, para o loading e mostra mensagem
      setCarregando(false);
    }
  }, [palestraId]);

  const carregarPerguntas = async () => {
    try {
      setCarregando(true);
      const dados = await perguntasApi.listarPerguntasPorPalestra(palestraId as string);
      // As perguntas já vêm ordenadas por votos da API
      setPerguntas(dados);
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as perguntas.');
    } finally {
      setCarregando(false);
    }
  };

  const atualizarPerguntas = async () => {
    try {
      setAtualizando(true);
      await carregarPerguntas();
    } finally {
      setAtualizando(false);
    }
  };

  const handleVotar = async (perguntaId: string) => {
    if (!usuario?.id) {
      Alert.alert('Erro', 'Você precisa estar logado para votar.');
      return;
    }

    try {
      const pergunta = perguntas.find(p => p.id === perguntaId);
      if (!pergunta) return;

      const jaVotou = pergunta.usuariosVotaram?.includes(usuario.id);

      // Otimistic update - atualiza UI imediatamente
      setPerguntas(prevPerguntas => {
        const novasPerguntas = prevPerguntas.map(p => {
          if (p.id === perguntaId) {
            if (jaVotou) {
              // Remover voto
              return {
                ...p,
                votos: p.votos - 1,
                usuariosVotaram: p.usuariosVotaram.filter(id => id !== usuario.id)
              };
            } else {
              // Adicionar voto
              return {
                ...p,
                votos: p.votos + 1,
                usuariosVotaram: [...p.usuariosVotaram, usuario.id]
              };
            }
          }
          return p;
        });

        // Reordenar por votos (ranking)
        return novasPerguntas.sort((a, b) => b.votos - a.votos);
      });

      // Fazer requisição para API
      if (jaVotou) {
        await perguntasApi.removerVoto(perguntaId, usuario.id);
      } else {
        await perguntasApi.votarPergunta(perguntaId, usuario.id);
      }

    } catch (error) {
      console.error('Erro ao votar:', error);
      // Reverter mudança em caso de erro
      await carregarPerguntas();
      Alert.alert('Erro', 'Não foi possível registrar seu voto. Tente novamente.');
    }
  };

  const handlePressionarPergunta = (pergunta: Pergunta) => {
    router.push(`/perguntas/${pergunta.id}`);
  };

  const handleCriarPergunta = () => {
    router.push({
      pathname: '/perguntas/criar',
      params: { palestraId, palestraTitulo }
    });
  };

  const renderPergunta = ({ item, index }: { item: Pergunta; index: number }) => (
    <View>
      {index === 0 && item.votos > 0 && (
        <View style={styles.bannerTop}>
          <Text style={styles.bannerTexto}>⭐ Pergunta mais votada</Text>
        </View>
      )}
      <PerguntaCard
        pergunta={item}
        usuarioAtualId={usuario?.id || ''}
        onVotar={handleVotar}
        onPressionar={handlePressionarPergunta}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitulo}>Perguntas</Text>
      {palestraTitulo && (
        <Text style={styles.headerSubtitulo}>{palestraTitulo}</Text>
      )}
      <Text style={styles.headerInfo}>
        {perguntas.length} {perguntas.length === 1 ? 'pergunta' : 'perguntas'}
      </Text>
    </View>
  );

  const renderEmpty = () => {
    // Se não há palestraId, mostra mensagem diferente
    if (!palestraId) {
      return (
        <View style={styles.emptyContainer}>
          <IconSymbol name="clipboard" size={64} color="#94A3B8" style={styles.emptyIcon} />
          <Text style={styles.emptyTitulo}>Selecione uma palestra</Text>
          <Text style={styles.emptySubtitulo}>
            Para ver e fazer perguntas, selecione uma palestra na aba Atividades.
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>💭</Text>
        <Text style={styles.emptyTitulo}>Nenhuma pergunta ainda</Text>
        <Text style={styles.emptySubtitulo}>
          Seja o primeiro a fazer uma pergunta!
        </Text>
      </View>
    );
  };

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.loadingText}>Carregando perguntas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={perguntas}
        renderItem={renderPergunta}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={atualizarPerguntas}
            colors={['#1E88E5']}
          />
        }
      />

      {/* Botão flutuante para criar pergunta - só mostra se houver palestraId */}
      {palestraId && (
        <TouchableOpacity 
          style={styles.botaoFlutuante} 
          onPress={handleCriarPergunta}
          activeOpacity={0.8}
        >
          <Text style={styles.botaoFlutuanteTexto}>+ Nova Pergunta</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  listContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerTitulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  headerSubtitulo: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  headerInfo: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  bannerTop: {
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: -8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#FFB74D',
  },
  bannerTexto: {
    color: '#F57C00',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitulo: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitulo: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  botaoFlutuante: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#1E88E5',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  botaoFlutuanteTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});