import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { perguntasApi } from '@/services/perguntas/api';
import { Pergunta } from '@/services/perguntas/types';
import { useAuth } from '@/services/auth/context';

export default function DetalhePerguntaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { usuario } = useAuth();

  const [pergunta, setPergunta] = useState<Pergunta | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [votosUsados, setVotosUsados] = useState(0);
  const [carregandoVotos, setCarregandoVotos] = useState(true);
  const LIMITE_VOTOS = 3;

  useEffect(() => {
    carregarPergunta();
  }, [id]);

  // Carregar votos quando pergunta e usuário estiverem disponíveis
  useEffect(() => {
    if (pergunta?.palestraId && usuario?.id) {
      carregarVotosParticipante();
    } else {
      setCarregandoVotos(false);
    }
  }, [pergunta?.palestraId, usuario?.id]);

  const carregarPergunta = async () => {
    try {
      setCarregando(true);
      const dados = await perguntasApi.buscarPerguntaPorId(id as string);
      setPergunta(dados);
    } catch (error) {
      console.error('Erro ao carregar pergunta:', error);
      Alert.alert('Erro', 'Não foi possível carregar a pergunta.');
    } finally {
      setCarregando(false);
    }
  };

  const carregarVotosParticipante = async () => {
    try {
      setCarregandoVotos(true);
      if (!usuario?.id || !pergunta?.palestraId) return;

      const count = await perguntasApi.contarVotosParticipante(
        pergunta.palestraId,
        usuario.id
      );
      setVotosUsados(count);
    } catch (error) {
      console.error('Erro ao carregar votos:', error);
    } finally {
      setCarregandoVotos(false);
    }
  };

  const handleVotar = async () => {
    if (!usuario?.id || !pergunta) {
      Alert.alert('Erro', 'Você precisa estar logado para votar.');
      return;
    }

    // Verificar se é o autor
    if (pergunta.usuarioId === usuario.id) {
      Alert.alert(
        'Ação não permitida',
        'Você não pode votar na sua própria pergunta.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
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

      // Atualizar UI imediatamente (optimistic update)
      setPergunta(prev => {
        if (!prev) return prev;

        if (jaVotou) {
          return {
            ...prev,
            votos: prev.votos - 1,
            usuariosVotaram: prev.usuariosVotaram.filter(id => id !== usuario.id)
          };
        } else {
          return {
            ...prev,
            votos: prev.votos + 1,
            usuariosVotaram: [...prev.usuariosVotaram, usuario.id]
          };
        }
      });

      // Atualizar contador de votos usados
      setVotosUsados(prev => jaVotou ? prev - 1 : prev + 1);

      // Fazer requisição
      if (jaVotou) {
        await perguntasApi.removerVoto(pergunta.id, usuario.id);
      } else {
        await perguntasApi.votarPergunta(pergunta.id, usuario.id);
      }

    } catch (error: any) {
      console.error('Erro ao votar:', error);
      // Reverter em caso de erro
      await carregarPergunta();
      await carregarVotosParticipante();

      // Mostrar mensagem de erro específica do backend
      const mensagemErro = error.response?.data?.error || error.message || 'Não foi possível registrar seu voto.';
      Alert.alert('Erro', mensagemErro);
    }
  };

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.loadingText}>Carregando pergunta...</Text>
      </View>
    );
  }

  if (!pergunta) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>❌</Text>
        <Text style={styles.errorText}>Pergunta não encontrada</Text>
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => router.back()}
        >
          <Text style={styles.botaoVoltarTexto}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const usuarioJaVotou = pergunta.usuariosVotaram?.includes(usuario?.id || '');
  // Só mostra limite se já carregou os votos
  const mostrarLimite = !carregandoVotos && votosUsados >= LIMITE_VOTOS && !usuarioJaVotou;
  const dataFormatada = new Date(pergunta.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header com ranking */}
      <View style={styles.header}>
        <View style={styles.rankingContainer}>
          <Text style={styles.rankingIcon}>🏆</Text>
          <View>
            <Text style={styles.rankingNumero}>{pergunta.votos}</Text>
            <Text style={styles.rankingLabel}>
              {pergunta.votos === 1 ? 'voto' : 'votos'}
            </Text>
          </View>
        </View>

        {pergunta.respondida && (
          <View style={styles.badgeRespondida}>
            <Text style={styles.badgeTexto}>✓ Respondida</Text>
          </View>
        )}
      </View>

      {/* Conteúdo da pergunta */}
      <View style={styles.conteudo}>
        <Text style={styles.titulo}>{pergunta.titulo}</Text>

        {pergunta.descricao && (
          <Text style={styles.descricao}>{pergunta.descricao}</Text>
        )}

        {/* Informações do autor */}
        <View style={styles.autorContainer}>
          <View style={styles.autorInfo}>
            <Text style={styles.autorLabel}>Pergunta feita por:</Text>
            <Text style={styles.autorNome}>{pergunta.usuarioNome || 'Anônimo'}</Text>
            <Text style={styles.autorData}>{dataFormatada}</Text>
          </View>
        </View>

        {/* Botão de votar - ou badge se for o autor */}
        {pergunta.usuarioId === usuario?.id ? (
          <View style={styles.autorBadge}>
            <Text style={styles.autorBadgeTexto}>✍️ Esta é sua pergunta</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.botaoVotar,
              usuarioJaVotou && styles.botaoVotarAtivo,
              mostrarLimite && styles.botaoVotarDesabilitado
            ]}
            onPress={handleVotar}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.botaoVotarTexto,
              usuarioJaVotou && styles.botaoVotarTextoAtivo,
              mostrarLimite && styles.botaoVotarTextoDesabilitado
            ]}>
              {mostrarLimite
                ? '🔒 Limite atingido'
                : usuarioJaVotou
                  ? '❤️ Você votou nesta pergunta'
                  : '🤍 Votar nesta pergunta'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Resposta do palestrante */}
        {pergunta.respondida && pergunta.resposta && (
          <View style={styles.respostaContainer}>
            <Text style={styles.respostaLabel}>💬 Resposta do Palestrante:</Text>
            <View style={styles.respostaConteudo}>
              <Text style={styles.respostaTexto}>{pergunta.resposta}</Text>
              {pergunta.dataResposta && (
                <Text style={styles.respostaData}>
                  Respondida em {new Date(pergunta.dataResposta).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Aguardando resposta */}
        {!pergunta.respondida && (
          <View style={styles.aguardandoContainer}>
            <Text style={styles.aguardandoIcon}>⏳</Text>
            <Text style={styles.aguardandoTexto}>
              Aguardando resposta do palestrante
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 24,
  },
  botaoVoltar: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  botaoVoltarTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  rankingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFB74D',
  },
  rankingIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  rankingNumero: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F57C00',
  },
  rankingLabel: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '600',
  },
  badgeRespondida: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#66BB6A',
  },
  badgeTexto: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
  conteudo: {
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    lineHeight: 32,
  },
  descricao: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 24,
  },
  autorContainer: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  autorInfo: {
    gap: 4,
  },
  autorLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  autorNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  autorData: {
    fontSize: 13,
    color: '#64748B',
  },
  botaoVotar: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  botaoVotarAtivo: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  botaoVotarTexto: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  botaoVotarTextoAtivo: {
    color: '#DC2626',
  },
  respostaContainer: {
    marginTop: 8,
  },
  respostaLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  respostaConteudo: {
    backgroundColor: '#E0F2FE',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#7DD3FC',
  },
  respostaTexto: {
    fontSize: 16,
    color: '#0C4A6E',
    lineHeight: 24,
    marginBottom: 12,
  },
  respostaData: {
    fontSize: 13,
    color: '#0369A1',
    fontStyle: 'italic',
  },
  aguardandoContainer: {
    backgroundColor: '#FEF3C7',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  aguardandoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  aguardandoTexto: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  autorBadge: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#A5B4FC',
  },
  autorBadgeTexto: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '700',
  },
  botaoVotarDesabilitado: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    opacity: 0.6,
  },
  botaoVotarTextoDesabilitado: {
    color: '#94A3B8',
  },
});