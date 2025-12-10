import PerguntaCard from '@/components/perguntas/PerguntaCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { HeaderTela } from '@/components/shared/HeaderTela';
import { useAuth } from '@/services/auth/context';
import { perguntasApi } from '@/services/perguntas/api';
import { Pergunta } from '@/services/perguntas/types';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
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
  const [votosUsados, setVotosUsados] = useState(0);

  const LIMITE_VOTOS = 3;

  // Carregar perguntas da palestra
  useEffect(() => {
    if (palestraId) {
      carregarPerguntas();
    } else {
      // Se não há palestraId, para o loading e mostra mensagem
      setCarregando(false);
    }
  }, [palestraId]);

  // Carregar votos do participante
  useEffect(() => {
    if (palestraId && usuario?.id) {
      carregarVotosParticipante();
    }
  }, [palestraId, usuario?.id]);

  // Recarregar dados quando a tela ganhar foco (ao voltar da tela de detalhes)
  useFocusEffect(
    useCallback(() => {
      if (palestraId) {
        carregarPerguntas();
        if (usuario?.id) {
          carregarVotosParticipante();
        }
      }
    }, [palestraId, usuario?.id])
  );

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

  const carregarVotosParticipante = async () => {
    try {
      if (!usuario?.id || !palestraId) return;

      const count = await perguntasApi.contarVotosParticipante(
        palestraId as string,
        usuario.id
      );
      setVotosUsados(count);
    } catch (error) {
      console.error('Erro ao carregar votos:', error);
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

      // Verificar se é o autor
      if (pergunta.usuarioId === usuario.id) {
        Alert.alert(
          'Ação não permitida',
          'Você não pode votar na sua própria pergunta.',
          [{ text: 'OK' }]
        );
        return;
      }

      const jaVotou = pergunta.usuariosVotaram?.includes(usuario.id);

      // Verificar limite ANTES de votar
      if (!jaVotou && votosUsados >= LIMITE_VOTOS) {
        Alert.alert(
          'Limite de votos atingido',
          `Você já usou seus ${LIMITE_VOTOS} votos. Desfaça um voto antes de votar em outra pergunta.`,
          [{ text: 'OK' }]
        );
        return;
      }

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

      // Atualizar contador local
      if (jaVotou) {
        setVotosUsados(prev => Math.max(0, prev - 1));
      } else {
        setVotosUsados(prev => prev + 1);
      }

      // Fazer requisição para API
      if (jaVotou) {
        await perguntasApi.removerVoto(perguntaId, usuario.id);
      } else {
        await perguntasApi.votarPergunta(perguntaId, usuario.id);
      }

      // Recarregar dados do servidor para garantir sincronização
      await carregarPerguntas();
      await carregarVotosParticipante();

    } catch (error: any) {
      console.error('Erro ao votar:', error);
      // Reverter mudanças em caso de erro
      await carregarPerguntas();
      await carregarVotosParticipante();

      // Mostrar mensagem de erro específica
      const mensagemErro = error.response?.data?.error || 'Não foi possível registrar seu voto. Tente novamente.';
      Alert.alert('Erro', mensagemErro);
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <IconSymbol name="star.fill" size={16} color="#1E88E5" />
            <Text style={styles.bannerTexto}>Pergunta mais votada</Text>
          </View>
        </View>
      )}
      <PerguntaCard
        pergunta={item}
        usuarioAtualId={usuario?.id || ''}
        onVotar={handleVotar}
        onPressionar={handlePressionarPergunta}
        limiteAtingido={votosUsados >= LIMITE_VOTOS}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitulo}>{palestraTitulo}</Text>
      <View style={styles.headerInfoContainer}>
        <Text style={styles.headerInfo}>
          {perguntas.length} {perguntas.length === 1 ? 'pergunta' : 'perguntas'}
        </Text>
        {usuario?.id && (
          <View style={[
            styles.votosContador,
            votosUsados >= LIMITE_VOTOS && styles.votosContadorLimite
          ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <IconSymbol
                name={votosUsados >= LIMITE_VOTOS ? 'lock.fill' : 'heart.fill'}
                size={16}
                color={votosUsados >= LIMITE_VOTOS ? '#DC2626' : '#1E88E5'}
              />
              <Text style={[
                styles.votosContadorTexto,
                votosUsados >= LIMITE_VOTOS && styles.votosContadorTextoLimite
              ]}>
                Votos: {votosUsados}/{LIMITE_VOTOS}
              </Text>
            </View>
          </View>
        )}
      </View>
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
    <View style={{ flex: 1 }}>
      <HeaderTela titulo="Perguntas" />
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
  headerInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  headerInfo: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  votosContador: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  votosContadorLimite: {
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  bannerTop: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: -8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#1E88E5',
  },
  bannerTexto: {
    color: '#1E88E5',
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
  votosContadorTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  votosContadorTextoLimite: {
    color: '#DC2626',
  },
});