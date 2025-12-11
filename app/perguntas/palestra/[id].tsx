import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { perguntasApi } from '@/services/perguntas/api';
import { Pergunta, StatusPergunta } from '@/services/perguntas/types';
import { useAuth } from '@/services/auth/context';
import { HeaderTela } from '@/components/shared/HeaderTela';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function PerguntasPalestraScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { usuario } = useAuth();

  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [novaPerguntaTitulo, setNovaPerguntaTitulo] = useState('');
  const [novaPerguntaDescricao, setNovaPerguntaDescricao] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregarPerguntas();
  }, [id]);

  const carregarPerguntas = async () => {
    try {
      setCarregando(true);
      const dados = await perguntasApi.listarPerguntasPorPalestra(id as string);

      // Filtrar apenas perguntas aprovadas
      const perguntasAprovadas = dados.filter(p => p.status === StatusPergunta.APROVADA);

      setPerguntas(perguntasAprovadas);
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as perguntas.');
    } finally {
      setCarregando(false);
    }
  };

  const handleEnviarPergunta = async () => {
    if (!usuario?.id || !usuario?.nome) {
      Alert.alert('Erro', 'Você precisa estar logado para enviar perguntas.');
      return;
    }

    if (!novaPerguntaTitulo.trim()) {
      Alert.alert('Atenção', 'Por favor, digite uma pergunta.');
      return;
    }

    try {
      setEnviando(true);
      await perguntasApi.criarPergunta(
        {
          palestraId: id as string,
          titulo: novaPerguntaTitulo,
          descricao: novaPerguntaDescricao,
        },
        usuario.id,
        usuario.nome
      );

      Alert.alert(
        'Sucesso',
        'Sua pergunta foi enviada e está aguardando aprovação do administrador.'
      );

      setNovaPerguntaTitulo('');
      setNovaPerguntaDescricao('');
      setModalVisivel(false);
    } catch (error) {
      console.error('Erro ao enviar pergunta:', error);
      Alert.alert('Erro', 'Não foi possível enviar sua pergunta. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const renderPergunta = ({ item }: { item: Pergunta }) => {
    return (
      <View style={styles.perguntaCard}>
        <View style={styles.perguntaHeader}>
          <Text style={styles.perguntaTitulo}>{item.titulo}</Text>
          <View style={styles.autorInfo}>
            <IconSymbol name="person.fill" size={14} color="#666" />
            <Text style={styles.autorNome}>{item.usuarioNome}</Text>
          </View>
        </View>

        {item.descricao && (
          <Text style={styles.perguntaDescricao}>{item.descricao}</Text>
        )}

        {item.respondida && item.resposta && (
          <View style={styles.respostaContainer}>
            <Text style={styles.respostaLabel}>Resposta:</Text>
            <Text style={styles.respostaTexto}>{item.resposta}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="bubble.right.fill" size={64} color="#CBD5E0" />
      <Text style={styles.emptyTexto}>Nenhuma pergunta aprovada ainda</Text>
      <Text style={styles.emptySubtexto}>
        Seja o primeiro a fazer uma pergunta!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderTela titulo="Perguntas da Palestra" onVoltar={() => router.back()} />

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={carregarPerguntas}
        disabled={carregando}
      >
        <Text style={styles.refreshButtonText}>
          Atualizar
        </Text>
      </TouchableOpacity>

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

      <TouchableOpacity
        style={styles.botaoNovaPergunta}
        onPress={() => setModalVisivel(true)}
      >
        <IconSymbol name="checkmark.circle.fill" size={24} color="#FFF" />
        <Text style={styles.botaoNovaPerguntaTexto}>Nova Pergunta</Text>
      </TouchableOpacity>

      {/* Modal para adicionar nova pergunta */}
      <Modal
        visible={modalVisivel}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Nova Pergunta</Text>
              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Digite sua pergunta"
              placeholderTextColor="#999"
              value={novaPerguntaTitulo}
              onChangeText={setNovaPerguntaTitulo}
              multiline
            />

            <TextInput
              style={[styles.input, styles.inputDescricao]}
              placeholder="Descrição adicional (opcional)"
              placeholderTextColor="#999"
              value={novaPerguntaDescricao}
              onChangeText={setNovaPerguntaDescricao}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.avisoTexto}>
              Sua pergunta será enviada para aprovação do administrador antes de aparecer para todos.
            </Text>

            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={[styles.botaoModal, styles.botaoCancelar]}
                onPress={() => setModalVisivel(false)}
              >
                <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botaoModal, styles.botaoEnviar]}
                onPress={handleEnviarPergunta}
                disabled={enviando}
              >
                {enviando ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.botaoEnviarTexto}>Enviar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
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
  perguntaHeader: {
    marginBottom: 8,
  },
  perguntaTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 6,
  },
  autorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  autorNome: {
    fontSize: 13,
    color: '#666',
  },
  perguntaDescricao: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 12,
    lineHeight: 20,
  },
  respostaContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0FFF4',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#48BB78',
  },
  respostaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22543D',
    marginBottom: 4,
  },
  respostaTexto: {
    fontSize: 14,
    color: '#2D3748',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTexto: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A5568',
    marginTop: 16,
  },
  emptySubtexto: {
    fontSize: 14,
    color: '#718096',
    marginTop: 8,
  },
  botaoNovaPergunta: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E88E5',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    gap: 8,
  },
  botaoNovaPerguntaTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
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
    color: '#2D3748',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2D3748',
    marginBottom: 12,
    minHeight: 50,
  },
  inputDescricao: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  avisoTexto: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 20,
    lineHeight: 18,
  },
  modalBotoes: {
    flexDirection: 'row',
    gap: 12,
  },
  botaoModal: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoCancelar: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  botaoCancelarTexto: {
    color: '#4A5568',
    fontSize: 16,
    fontWeight: '600',
  },
  botaoEnviar: {
    backgroundColor: '#1E88E5',
  },
  botaoEnviarTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    borderColor: '#1e88e5',
    borderWidth: 2,
    padding: 12,
    borderRadius: 8,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 10,
    marginRight: 16,
  },
  refreshButtonText: {
    color: '#1e88e5',
    fontWeight: 'bold'
  }
});
