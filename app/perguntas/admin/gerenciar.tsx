import { HeaderTela } from '@/components/shared/HeaderTela';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/services/auth/context';
import { perguntasApi } from '@/services/perguntas/api';
import { Pergunta, StatusPergunta } from '@/services/perguntas/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function GerenciarPerguntasScreen() {
  const router = useRouter();
  const { usuario } = useAuth();
  const { palestraId, palestraTitulo } = useLocalSearchParams();

  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<StatusPergunta>(StatusPergunta.PENDENTE);

  // Estados para configuração de período
  const [modalPeriodoVisivel, setModalPeriodoVisivel] = useState(false);
  const [periodoAtual, setPeriodoAtual] = useState<any>(null);
  const [dataInicio, setDataInicio] = useState(new Date());
  const [dataFim, setDataFim] = useState(new Date());
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [pickerTarget, setPickerTarget] = useState<'inicio' | 'fim'>('inicio');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    // Verificar se é admin
    if (!usuario?.isAdmin) {
      Alert.alert('Acesso Negado', 'Você não tem permissão para acessar esta tela.');
      router.back();
      return;
    }

    carregarPerguntas();
    if (palestraId) {
      carregarPeriodoVotacao();
    }
  }, [filtro, palestraId]);

  const carregarPeriodoVotacao = async () => {
    try {
      const status = await perguntasApi.verificarPeriodoAtivo(palestraId as string);
      setPeriodoAtual(status);

      // Se houver períodos configurados, usar como valores iniciais
      if (status.votacaoInicio) {
        setDataInicio(new Date(status.votacaoInicio));
      }
      if (status.votacaoFim) {
        setDataFim(new Date(status.votacaoFim));
      }
    } catch (error) {
      console.error('Erro ao carregar período:', error);
    }
  };

  const carregarPerguntas = async () => {
    try {
      setCarregando(true);

      // Se há palestraId, filtrar por palestra e status
      // Se não há palestraId, listar todas as perguntas com o status filtrado
      const filtros: { status?: StatusPergunta; palestraId?: string } = {
        status: filtro,
      };

      if (palestraId) {
        filtros.palestraId = palestraId as string;
      }

      const todasPerguntas = await perguntasApi.listarTodasPerguntasAdmin(filtros);
      setPerguntas(todasPerguntas);
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as perguntas.');
    } finally {
      setCarregando(false);
    }
  };

  const handleAprovar = async (pergunta: Pergunta) => {
    Alert.alert(
      'Aprovar Pergunta',
      'Tem certeza que deseja aprovar esta pergunta? Ela ficará visível para todos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprovar',
          onPress: async () => {
            try {
              await perguntasApi.aprovarPergunta(pergunta.id);
              Alert.alert('Sucesso', 'Pergunta aprovada com sucesso!');
              carregarPerguntas();
            } catch (error) {
              console.error('Erro ao aprovar pergunta:', error);
              Alert.alert('Erro', 'Não foi possível aprovar a pergunta.');
            }
          },
        },
      ]
    );
  };

  const handleRejeitar = async (pergunta: Pergunta) => {
    Alert.alert(
      'Rejeitar Pergunta',
      'Tem certeza que deseja rejeitar esta pergunta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: async () => {
            try {
              await perguntasApi.rejeitarPergunta(pergunta.id);
              Alert.alert('Sucesso', 'Pergunta rejeitada.');
              carregarPerguntas();
            } catch (error) {
              console.error('Erro ao rejeitar pergunta:', error);
              Alert.alert('Erro', 'Não foi possível rejeitar a pergunta.');
            }
          },
        },
      ]
    );
  };

  const handleSalvarPeriodo = async () => {
    if (!palestraId) return;

    // Validar que fim é após início
    if (dataFim <= dataInicio) {
      Alert.alert('Erro', 'A data de fim deve ser posterior à data de início.');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/palestras/${palestraId}/periodo-votacao`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            votacaoInicio: dataInicio.toISOString(),
            votacaoFim: dataFim.toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao configurar período');
      }

      Alert.alert('Sucesso', 'Período de votação configurado com sucesso!');
      setModalPeriodoVisivel(false);
      await carregarPeriodoVotacao();
    } catch (error) {
      console.error('Erro ao salvar período:', error);
      Alert.alert('Erro', 'Não foi possível configurar o período.');
    }
  };

  const abrirPicker = (target: 'inicio' | 'fim', mode: 'date' | 'time') => {
    setPickerTarget(target);
    setPickerMode(mode);
    setShowPicker(true);
  };

  const handlePickerChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      if (pickerTarget === 'inicio') {
        setDataInicio(selectedDate);
      } else {
        setDataFim(selectedDate);
      }
    }
  };

  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatarHora = (data: Date) => {
    return data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const renderPergunta = ({ item }: { item: Pergunta }) => {
    return (
      <View style={styles.perguntaCard}>
        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusIndicador,
              item.status === StatusPergunta.APROVADA && styles.statusAprovada,
              item.status === StatusPergunta.REJEITADA && styles.statusRejeitada,
              item.status === StatusPergunta.PENDENTE && styles.statusPendente,
            ]}
          />
          <Text style={styles.statusTexto}>{getStatusLabel(item.status)}</Text>
        </View>

        <View style={styles.perguntaHeader}>
          <Text style={styles.perguntaTitulo}>{item.titulo}</Text>
          <View style={styles.metaInfo}>
            <View style={styles.infoItem}>
              <IconSymbol name="person.fill" size={14} color="#666" />
              <Text style={styles.infoTexto}>{item.usuarioNome}</Text>
            </View>
            <View style={styles.infoItem}>
              <IconSymbol name="heart.fill" size={14} color="#666" />
              <Text style={styles.infoTexto}>{item.votos} curtidas</Text>
            </View>
          </View>
        </View>

        {item.descricao && (
          <Text style={styles.perguntaDescricao}>{item.descricao}</Text>
        )}

        <Text style={styles.palestraInfo}>
          Palestra: {item.palestraId}
        </Text>

        {item.status === StatusPergunta.PENDENTE && (
          <View style={styles.acoesContainer}>
            <TouchableOpacity
              style={[styles.botaoAcao, styles.botaoAprovar]}
              onPress={() => handleAprovar(item)}
            >
              <IconSymbol name="checkmark.circle.fill" size={20} color="#FFF" />
              <Text style={styles.botaoAcaoTexto}>Aprovar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botaoAcao, styles.botaoRejeitar]}
              onPress={() => handleRejeitar(item)}
            >
              <IconSymbol name="xmark.circle.fill" size={20} color="#FFF" />
              <Text style={styles.botaoAcaoTexto}>Rejeitar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="tray" size={64} color="#CBD5E0" />
      <Text style={styles.emptyTexto}>
        Nenhuma pergunta {getStatusLabel(filtro).toLowerCase()}
      </Text>
    </View>
  );

  const getStatusLabel = (status: StatusPergunta): string => {
    switch (status) {
      case StatusPergunta.PENDENTE:
        return 'Pendente';
      case StatusPergunta.APROVADA:
        return 'Aprovada';
      case StatusPergunta.REJEITADA:
        return 'Rejeitada';
      default:
        return status;
    }
  };

  const tituloTela = palestraTitulo
    ? `Gerenciar Perguntas - ${palestraTitulo}`
    : 'Gerenciar Perguntas';

  return (
    <View style={styles.container}>
      <HeaderTela titulo={tituloTela} onVoltar={() => router.back()} />

      <View style={styles.filtrosContainer}>
        <TouchableOpacity
          style={[
            styles.botaoFiltro,
            filtro === StatusPergunta.PENDENTE && styles.botaoFiltroAtivo,
          ]}
          onPress={() => setFiltro(StatusPergunta.PENDENTE)}
        >
          <Text
            style={[
              styles.botaoFiltroTexto,
              filtro === StatusPergunta.PENDENTE && styles.botaoFiltroTextoAtivo,
            ]}
          >
            Pendentes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.botaoFiltro,
            filtro === StatusPergunta.APROVADA && styles.botaoFiltroAtivo,
          ]}
          onPress={() => setFiltro(StatusPergunta.APROVADA)}
        >
          <Text
            style={[
              styles.botaoFiltroTexto,
              filtro === StatusPergunta.APROVADA && styles.botaoFiltroTextoAtivo,
            ]}
          >
            Aprovadas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.botaoFiltro,
            filtro === StatusPergunta.REJEITADA && styles.botaoFiltroAtivo,
          ]}
          onPress={() => setFiltro(StatusPergunta.REJEITADA)}
        >
          <Text
            style={[
              styles.botaoFiltroTexto,
              filtro === StatusPergunta.REJEITADA && styles.botaoFiltroTextoAtivo,
            ]}
          >
            Rejeitadas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Card de Configuração de Período - só mostra se houver palestraId */}
      {palestraId && (
        <View style={styles.periodoCard}>
          <View style={styles.periodoHeader}>
            <View>
              <Text style={styles.periodoTitulo}>Período de Votação</Text>
              {periodoAtual && (
                <Text style={styles.periodoStatus}>
                  Status: {periodoAtual.periodoAtivo ? '✅ Ativo' : '⏰ Encerrado'}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.botaoConfigurar}
              onPress={() => setModalPeriodoVisivel(true)}
            >
              <IconSymbol name="gearshape.fill" size={18} color="#FFF" />
              <Text style={styles.botaoConfigurarTexto}>Configurar</Text>
            </TouchableOpacity>
          </View>

          {periodoAtual && periodoAtual.periodoEfetivo && (
            <View style={styles.periodoInfo}>
              <View style={styles.periodoInfoItem}>
                <IconSymbol name="calendar" size={14} color="#666" />
                <Text style={styles.periodoInfoTexto}>
                  Início: {new Date(periodoAtual.periodoEfetivo.votacaoInicio).toLocaleString('pt-BR')}
                </Text>
              </View>
              <View style={styles.periodoInfoItem}>
                <IconSymbol name="calendar" size={14} color="#666" />
                <Text style={styles.periodoInfoTexto}>
                  Fim: {new Date(periodoAtual.periodoEfetivo.votacaoFim).toLocaleString('pt-BR')}
                </Text>
              </View>
              {periodoAtual.usandoPadrao && (
                <Text style={styles.periodoPadraoTexto}>
                  💡 Usando período padrão (início da palestra até 10min antes do fim)
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Modal de Configuração de Período */}
      <Modal
        visible={modalPeriodoVisivel}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalPeriodoVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Configurar Período de Votação</Text>
              <TouchableOpacity onPress={() => setModalPeriodoVisivel(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalConteudo}>
              {/* Início - Data e Hora */}
              <View style={styles.secaoContainer}>
                <Text style={styles.secaoTitulo}>📅 Início do Período</Text>

                <View style={styles.campoContainer}>
                  <Text style={styles.campoLabel}>Data</Text>
                  <TouchableOpacity
                    style={styles.campoBotao}
                    onPress={() => abrirPicker('inicio', 'date')}
                  >
                    <IconSymbol name="calendar" size={20} color="#1E88E5" />
                    <Text style={styles.campoValor}>
                      {formatarData(dataInicio)}
                    </Text>
                    <IconSymbol name="chevron.right" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                <View style={styles.campoContainer}>
                  <Text style={styles.campoLabel}>Hora</Text>
                  <TouchableOpacity
                    style={styles.campoBotao}
                    onPress={() => abrirPicker('inicio', 'time')}
                  >
                    <IconSymbol name="clock" size={20} color="#1E88E5" />
                    <Text style={styles.campoValor}>
                      {formatarHora(dataInicio)}
                    </Text>
                    <IconSymbol name="chevron.right" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Divisor */}
              <View style={styles.divisor} />

              {/* Fim - Data e Hora */}
              <View style={styles.secaoContainer}>
                <Text style={styles.secaoTitulo}>🏁 Fim do Período</Text>

                <View style={styles.campoContainer}>
                  <Text style={styles.campoLabel}>Data</Text>
                  <TouchableOpacity
                    style={styles.campoBotao}
                    onPress={() => abrirPicker('fim', 'date')}
                  >
                    <IconSymbol name="calendar" size={20} color="#1E88E5" />
                    <Text style={styles.campoValor}>
                      {formatarData(dataFim)}
                    </Text>
                    <IconSymbol name="chevron.right" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                <View style={styles.campoContainer}>
                  <Text style={styles.campoLabel}>Hora</Text>
                  <TouchableOpacity
                    style={styles.campoBotao}
                    onPress={() => abrirPicker('fim', 'time')}
                  >
                    <IconSymbol name="clock" size={20} color="#1E88E5" />
                    <Text style={styles.campoValor}>
                      {formatarHora(dataFim)}
                    </Text>
                    <IconSymbol name="chevron.right" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* DateTimePicker */}
              {showPicker && (
                <DateTimePicker
                  value={pickerTarget === 'inicio' ? dataInicio : dataFim}
                  mode={pickerMode}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handlePickerChange}
                />
              )}

              {/* Botões */}
              <View style={styles.modalBotoes}>
                <TouchableOpacity
                  style={[styles.modalBotao, styles.modalBotaoCancelar]}
                  onPress={() => setModalPeriodoVisivel(false)}
                >
                  <Text style={styles.modalBotaoCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBotao, styles.modalBotaoSalvar]}
                  onPress={handleSalvarPeriodo}
                >
                  <Text style={styles.modalBotaoSalvarTexto}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {carregando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E88E5" />
          <Text style={styles.loadingText}>Carregando perguntas...</Text>
        </View>
      ) : (
        <FlatList
          data={perguntas}
          renderItem={renderPergunta}
          keyExtractor={(item: Pergunta) => item.id}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
  filtrosContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  botaoFiltro: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  botaoFiltroAtivo: {
    backgroundColor: '#1E88E5',
    borderColor: '#1E88E5',
  },
  botaoFiltroTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
  },
  botaoFiltroTextoAtivo: {
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  perguntaCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  statusIndicador: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusPendente: {
    backgroundColor: '#ECC94B',
  },
  statusAprovada: {
    backgroundColor: '#48BB78',
  },
  statusRejeitada: {
    backgroundColor: '#F56565',
  },
  statusTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5568',
  },
  perguntaHeader: {
    marginBottom: 8,
  },
  perguntaTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoTexto: {
    fontSize: 13,
    color: '#666',
  },
  perguntaDescricao: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 12,
    lineHeight: 20,
  },
  palestraInfo: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  acoesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  botaoAcao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  botaoAprovar: {
    backgroundColor: '#48BB78',
  },
  botaoRejeitar: {
    backgroundColor: '#F56565',
  },
  botaoAcaoTexto: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTexto: {
    fontSize: 16,
    color: '#718096',
    marginTop: 16,
  },
  // Estilos para card de per\u00edodo
  periodoCard: {
    backgroundColor: '#FFF',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  periodoTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 4,
  },
  periodoStatus: {
    fontSize: 13,
    color: '#4A5568',
  },
  botaoConfigurar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E88E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  botaoConfigurarTexto: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  periodoInfo: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  periodoInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  periodoInfoTexto: {
    fontSize: 13,
    color: '#4A5568',
  },
  periodoPadraoTexto: {
    fontSize: 12,
    color: '#718096',
    fontStyle: 'italic',
    marginTop: 4,
  },
  // Estilos para modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
  },
  modalConteudo: {
    gap: 20,
  },
  secaoContainer: {
    gap: 12,
  },
  secaoTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  divisor: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  campoContainer: {
    gap: 8,
  },
  campoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  campoBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1E88E5',
    shadowColor: '#1E88E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  campoValor: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
    flex: 1,
  },
  campoTexto: {
    fontSize: 14,
    color: '#2D3748',
    flex: 1,
  },
  modalBotoes: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalBotao: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBotaoCancelar: {
    backgroundColor: '#F1F5F9',
  },
  modalBotaoCancelarTexto: {
    color: '#4A5568',
    fontSize: 14,
    fontWeight: '600',
  },
  modalBotaoSalvar: {
    backgroundColor: '#1E88E5',
  },
  modalBotaoSalvarTexto: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
