import PerguntaCard from '@/components/perguntas/PerguntaCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { HeaderTela } from '@/components/shared/HeaderTela';
import { useAuth } from '@/services/auth/context';
import { perguntasApi } from '@/services/perguntas/api';
import { Pergunta } from '@/services/perguntas/types';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Modal, TextInput, KeyboardAvoidingView, ScrollView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { showAlert } from '@/utils/alert';

export default function PerguntasScreen() {
  const router = useRouter();
  const { palestraId, palestraTitulo } = useLocalSearchParams();
  const { usuario } = useAuth();

  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [votosUsados, setVotosUsados] = useState(0);
  const [periodoAtivo, setPeriodoAtivo] = useState(true);
  const [motivoPeriodoInativo, setMotivoPeriodoInativo] = useState<string | null>(null);

  // Estados para edição
  const [editando, setEditando] = useState(false);
  const [perguntaEditando, setPerguntaEditando] = useState<Pergunta | null>(null);
  const [textoEdit, setTextoEdit] = useState('');

  // Perguntas pendentes do usuário
  const [perguntasPendentes, setPerguntasPendentes] = useState<Pergunta[]>([]);

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

  // Carregar votos do participante e verificar período
  useEffect(() => {
    if (palestraId && usuario?.id) {
      carregarVotosParticipante();
      verificarPeriodo();
    } else if (palestraId) {
      verificarPeriodo();
    }
  }, [palestraId, usuario?.id]);

  const verificarPeriodo = async () => {
    try {
      if (!palestraId) return;
      const status = await perguntasApi.verificarPeriodoAtivo(palestraId as string);
      setPeriodoAtivo(status.periodoAtivo);
      setMotivoPeriodoInativo(status.motivo);
    } catch (error) {
      console.error('Erro ao verificar período:', error);
      setPeriodoAtivo(true);
    }
  };

  // Recarregar dados quando a tela ganhar foco (ao voltar da tela de detalhes)
  useFocusEffect(
    useCallback(() => {
      if (palestraId) {
        carregarPerguntas();
        if (usuario?.id) {
          carregarVotosParticipante();
          carregarPerguntasPendentes();
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
      showAlert('Erro', 'Não foi possível carregar as perguntas.');
    } finally {
      setCarregando(false);
    }
  };

  const atualizarPerguntas = async () => {
    try {
      setAtualizando(true);
      await carregarPerguntas();
      if (usuario?.id && palestraId) {
        await carregarPerguntasPendentes();
      }
    } finally {
      setAtualizando(false);
    }
  };

  const carregarPerguntasPendentes = async () => {
    if (!usuario?.id || !palestraId) return;
    try {
      const pendentes = await perguntasApi.listarPendentesPorParticipante(
        palestraId as string,
        usuario.id
      );
      setPerguntasPendentes(pendentes);
    } catch (error) {
      console.error('Erro ao carregar perguntas pendentes:', error);
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
      showAlert('Erro', 'Você precisa estar logado para votar.');
      return;
    }

    try {
      const pergunta = perguntas.find(p => p.id === perguntaId);
      if (!pergunta) return;

      // Verificar se é o autor
      if (pergunta.usuarioId === usuario.id) {
        showAlert(
          'Ação não permitida',
          'Você não pode votar na sua própria pergunta.',
          [{ text: 'OK' }]
        );
        return;
      }

      const jaVotou = pergunta.usuariosVotaram?.includes(usuario.id);

      // Verificar limite ANTES de votar
      if (!jaVotou && votosUsados >= LIMITE_VOTOS) {
        showAlert(
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
      showAlert('Erro', mensagemErro);
    }
  };

  const handlePressionarPergunta = (pergunta: Pergunta) => {
    router.push(`/perguntas/${pergunta.id}`);
  };

  const handleEditar = (pergunta: Pergunta) => {
    setPerguntaEditando(pergunta);
    // Combinar título e descrição se existir, ou usar apenas título
    const textoCompleto = pergunta.titulo + (pergunta.descricao ? `\n\n${pergunta.descricao}` : '');
    setTextoEdit(textoCompleto);
    setEditando(true);
  };

  const handleSalvarEdicao = async () => {
    if (!usuario?.id || !perguntaEditando) return;
    if (!textoEdit.trim()) {
      showAlert('Atenção', 'O texto da pergunta é obrigatório');
      return;
    }
    try {
      // Separar primeira linha como título, resto como descrição
      const linhas = textoEdit.trim().split('\n\n');
      const titulo = linhas[0] || textoEdit.trim();
      const descricao = linhas.slice(1).join('\n\n') || '';

      await perguntasApi.editarPergunta(
        perguntaEditando.id,
        titulo,
        descricao,
        usuario.id
      );
      showAlert('Sucesso', 'Pergunta editada com sucesso!');
      setEditando(false);
      setPerguntaEditando(null);
      await carregarPerguntas();
      await carregarPerguntasPendentes();
    } catch (error: any) {
      console.error('Erro ao editar:', error);
      const mensagem = error.response?.data?.error || 'Não foi possível editar a pergunta';
      showAlert('Erro', mensagem);
    }
  };

  const handleExcluir = (pergunta: Pergunta) => {
    if (!usuario?.id) return;
    showAlert(
      'Excluir Pergunta',
      `Tem certeza que deseja excluir esta pergunta?\n\nVocês tem ${pergunta.votos} votos nela.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await perguntasApi.deletarPergunta(pergunta.id, usuario.id);
              showAlert('Sucesso', 'Pergunta excluída com sucesso!');
              await carregarPerguntas();
              await carregarPerguntasPendentes();
            } catch (error: any) {
              console.error('Erro ao excluir:', error);
              const mensagem = error.response?.data?.error || 'Não foi possível excluir a pergunta';
              showAlert('Erro', mensagem);
            }
          }
        }
      ]
    );
  };

  const handleCriarPergunta = () => {
    router.push({
      pathname: '/perguntas/criar',
      params: { palestraId, palestraTitulo }
    });
  };

  const renderPergunta = ({ item, index }: { item: Pergunta; index: number }) => (
    <PerguntaCard
      pergunta={item}
      usuarioAtualId={usuario?.id || ''}
      onVotar={handleVotar}
      onPressionar={handlePressionarPergunta}
      onEditar={handleEditar}
      onExcluir={handleExcluir}
      limiteAtingido={votosUsados >= LIMITE_VOTOS}
      periodoAtivo={periodoAtivo}
    />
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

      {/* Badge de período ativo/inativo */}
      {!periodoAtivo && (
        <View style={styles.periodoBadge}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <IconSymbol name="clock.fill" size={14} color="#92400E" />
            <Text style={styles.periodoBadgeTexto}>
              {motivoPeriodoInativo || 'Período de perguntas encerrado'}
            </Text>
          </View>
        </View>
      )}

      {periodoAtivo && (
        <View style={styles.periodoAtivoBadge}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <IconSymbol name="checkmark.circle.fill" size={14} color="#10B981" />
            <Text style={styles.periodoAtivoBadgeTexto}>Aberto a perguntas</Text>
          </View>
        </View>
      )}

      {/* Seção de Perguntas Pendentes do Usuário */}
      {usuario?.id && perguntasPendentes.length > 0 && periodoAtivo && (
        <View style={styles.secaoPendentes}>
          <View style={styles.pendentesTitulo}>
            <IconSymbol name="clock.fill" size={18} color="#F59E0B" />
            <Text style={styles.pendentesTituloTexto}>
              Minhas Perguntas Pendentes ({perguntasPendentes.length})
            </Text>
          </View>

          {perguntasPendentes.map((pergunta) => (
            <View key={pergunta.id} style={styles.cardPendente}>
              <View style={styles.pendenteBadge}>
                <IconSymbol name="clock.fill" size={12} color="#92400E" />
                <Text style={styles.pendenteBadgeTexto}>Aguardando aprovação</Text>
              </View>

              <Text style={styles.pendenteTitulo} numberOfLines={2}>
                {pergunta.titulo}
              </Text>

              {pergunta.descricao && (
                <Text style={styles.pendenteDescricao} numberOfLines={2}>
                  {pergunta.descricao}
                </Text>
              )}

              <View style={styles.pendenteAcoes}>
                <TouchableOpacity
                  style={styles.botaoEditarPendente}
                  onPress={() => handleEditar(pergunta)}
                >
                  <IconSymbol name="pencil" size={14} color="#1E88E5" />
                  <Text style={styles.botaoEditarPendenteTexto}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botaoExcluirPendente}
                  onPress={() => handleExcluir(pergunta)}
                >
                  <IconSymbol name="xmark.circle.fill" size={14} color="#EF4444" />
                  <Text style={styles.botaoExcluirPendenteTexto}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Seção Top 3 Perguntas Mais Votadas */}
      {perguntas.length > 0 && perguntas.slice(0, 3).some(p => p.votos > 0) && (
        <View style={styles.secaoTop3}>
          <View style={styles.top3Titulo}>
            <IconSymbol name="star.fill" size={18} color="#1E88E5" />
            <Text style={styles.top3TituloTexto}>
              Top 3 Perguntas Mais Votadas
            </Text>
          </View>

          {perguntas.slice(0, 3).filter(p => p.votos > 0).map((pergunta, index) => (
            <View key={pergunta.id} style={styles.cardTop3}>
              <View style={styles.top3Badge}>
                <IconSymbol name="trophy.fill" size={14} color="#1E88E5" />
                <Text style={styles.top3BadgeTexto}>
                  #{index + 1} · {pergunta.votos} {pergunta.votos === 1 ? 'voto' : 'votos'}
                </Text>
              </View>

              <Text style={styles.top3Titulo} numberOfLines={2}>
                {pergunta.titulo}
              </Text>

              {pergunta.descricao && (
                <Text style={styles.top3Descricao} numberOfLines={2}>
                  {pergunta.descricao}
                </Text>
              )}

              <TouchableOpacity
                style={styles.botaoVerTop3}
                onPress={() => handlePressionarPergunta(pergunta)}
              >
                <Text style={styles.botaoVerTop3Texto}>Ver detalhes</Text>
                <IconSymbol name="chevron.right" size={14} color="#4F46E5" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
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
          style={[styles.botaoFlutuante, !periodoAtivo && styles.botaoFlutuanteDesabilitado]}
          onPress={handleCriarPergunta}
          activeOpacity={0.8}
          disabled={!periodoAtivo}
        >
          <Text style={styles.botaoFlutuanteTexto}>
            {periodoAtivo ? '+ Nova Pergunta' : 'Período encerrado'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Modal de Edição */}
      <Modal
        visible={editando}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditando(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.modalContainer}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitulo}>Editar Pergunta</Text>
                    <TouchableOpacity onPress={() => setEditando(false)}>
                      <IconSymbol name="xmark.circle.fill" size={24} color="#64748B" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    style={styles.modalScroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                  >
                    <TextInput
                      style={styles.inputTexto}
                      placeholder="Digite sua pergunta..."
                      value={textoEdit}
                      onChangeText={setTextoEdit}
                      multiline
                      maxLength={500}
                      textAlignVertical="top"
                    />

                    <Text style={styles.contadorCaracteres}>
                      {textoEdit.length}/500 caracteres
                    </Text>
                  </ScrollView>

                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={styles.botaoCancelar}
                      onPress={() => setEditando(false)}
                    >
                      <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.botaoSalvar}
                      onPress={handleSalvarEdicao}
                    >
                      <Text style={styles.botaoSalvarTexto}>Salvar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
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
  periodoBadge: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  periodoBadgeTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
  },
  periodoAtivoBadge: {
    backgroundColor: '#D1FAE5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  periodoAtivoBadgeTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#047857',
  },
  botaoFlutuanteDesabilitado: {
    backgroundColor: '#94A3B8',
  },
  // Estilos para Modal de Edição
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalScroll: {
    flexGrow: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  inputTexto: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 150,
    maxHeight: 300,
  },
  contadorCaracteres: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'right',
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  botaoCancelar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  botaoCancelarTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  botaoSalvar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1E88E5',
    alignItems: 'center',
  },
  botaoSalvarTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  // Estilos para seção de perguntas pendentes
  secaoPendentes: {
    marginTop: 16,
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  pendentesTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pendentesTituloTexto: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
  },
  cardPendente: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendenteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  pendenteBadgeTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
  pendenteTitulo: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  pendenteDescricao: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  pendenteAcoes: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  botaoEditarPendente: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  botaoEditarPendenteTexto: {
    color: '#1E88E5',
    fontSize: 13,
    fontWeight: '600',
  },
  botaoExcluirPendente: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  botaoExcluirPendenteTexto: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  // Estilos para seção Top 3 Perguntas
  secaoTop3: {
    marginTop: 16,
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  top3Titulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  top3TituloTexto: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
  },
  cardTop3: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  top3Badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  top3BadgeTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
  },
  top3Descricao: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  botaoVerTop3: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A5B4FC',
    marginTop: 4,
  },
  botaoVerTop3Texto: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '600',
  },
});