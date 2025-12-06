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
  const [curtidasUsuario, setCurtidasUsuario] = useState<string[]>([]);

  useEffect(() => {
    carregarPerguntas();
    carregarCurtidasUsuario();
  }, [id]);

  const carregarPerguntas = async () => {
    try {
      setCarregando(true);
      const dados = await perguntasApi.listarPerguntasPorPalestra(id as string);
      
      // Filtrar apenas perguntas aprovadas e ordenar por curtidas
      const perguntasAprovadas = dados
        .filter(p => p.status === StatusPergunta.APROVADA)
        .sort((a, b) => b.votos - a.votos);
      
      setPerguntas(perguntasAprovadas);
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as perguntas.');
    } finally {
      setCarregando(false);
    }
  };

  const carregarCurtidasUsuario = async () => {
    if (!usuario?.id) return;
    try {
      const curtidas = await perguntasApi.obterCurtidasUsuario(usuario.id);
      setCurtidasUsuario(curtidas);
    } catch (error) {
      console.error('Erro ao carregar curtidas:', error);
    }
  };

  const handleCurtir = async (pergunta: Pergunta) => {
    if (!usuario?.id) {
      Alert.alert('Erro', 'Você precisa estar logado para curtir perguntas.');
      return;
    }

    try {
      const jaCurtiu = curtidasUsuario.includes(pergunta.id);

      if (jaCurtiu) {
        // Remover curtida
        await perguntasApi.removerCurtida(usuario.id, pergunta.id);
        await perguntasApi.removerVoto(pergunta.id, usuario.id);
        
        // Atualizar estado local
        setCurtidasUsuario((prev: string[]) => prev.filter((id: string) => id !== pergunta.id));
        setPerguntas((prev: Pergunta[]) =>
          prev
            .map((p: Pergunta) => (p.id === pergunta.id ? { ...p, votos: p.votos - 1 } : p))
            .sort((a: Pergunta, b: Pergunta) => b.votos - a.votos)
        );
      } else {
        // Verificar se pode curtir
        const { pode, motivo } = await perguntasApi.verificarPodeCurtir(usuario.id, pergunta.id);
        
        if (!pode) {
          Alert.alert('Limite atingido', motivo || 'Você não pode curtir mais perguntas.');
          return;
        }

        // Adicionar curtida
        await perguntasApi.adicionarCurtida(usuario.id, pergunta.id);
        await perguntasApi.votarPergunta(pergunta.id, usuario.id);
        
        // Atualizar estado local
        setCurtidasUsuario((prev: string[]) => [...prev, pergunta.id]);
        setPerguntas((prev: Pergunta[]) =>
          prev
            .map((p: Pergunta) => (p.id === pergunta.id ? { ...p, votos: p.votos + 1 } : p))
            .sort((a: Pergunta, b: Pergunta) => b.votos - a.votos)
        );
      }
    } catch (error: any) {
      console.error('Erro ao curtir pergunta:', error);
      Alert.alert('Erro', error.message || 'Não foi possível registrar sua curtida.');
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

  const renderPergunta = ({ item, index }: { item: Pergunta; index: number }) => {
    const jaCurtiu = curtidasUsuario.includes(item.id);

    return (
      <View style={styles.perguntaCard}>
        <View style={styles.rankingBadge}>
          <Text style={styles.rankingTexto}>#{index + 1}</Text>
        </View>

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

        <View style={styles.perguntaFooter}>
          <TouchableOpacity
            style={[styles.botaoCurtir, jaCurtiu && styles.botaoCurtido]}
            onPress={() => handleCurtir(item)}
          >
            <IconSymbol
              name={jaCurtiu ? 'heart.fill' : 'heart'}
              size={20}
              color={jaCurtiu ? '#E53E3E' : '#666'}
            />
            <Text style={[styles.curtidasTexto, jaCurtiu && styles.curtidasTextoCurtido]}>
              {item.votos}
            </Text>
          </TouchableOpacity>

          {item.respondida && item.resposta && (
            <View style={styles.respostaContainer}>
              <Text style={styles.respostaLabel}>Resposta:</Text>
              <Text style={styles.respostaTexto}>{item.resposta}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="bubble.left.and.bubble.right" size={64} color="#CBD5E0" />
      <Text style={styles.emptyTexto}>Nenhuma pergunta aprovada ainda</Text>
      <Text style={styles.emptySubtexto}>
        Seja o primeiro a fazer uma pergunta!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderTela titulo="Perguntas da Palestra" onVoltar={() => router.back()} />

      <View style={styles.infoContainer}>
        <Text style={styles.infoTexto}>
          Você pode curtir até 3 perguntas diferentes
        </Text>
        <Text style={styles.infoContador}>
          {curtidasUsuario.length}/3 curtidas usadas
        </Text>
      </View>

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
        <IconSymbol name="plus.circle.fill" size={24} color="#FFF" />
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
  infoContainer: {
    backgroundColor: '#EBF8FF',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1E88E5',
  },
  infoTexto: {
    fontSize: 14,
    color: '#2C5282',
    marginBottom: 4,
  },
  infoContador: {
    fontSize: 12,
    color: '#2C5282',
    fontWeight: '600',
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
  rankingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#1E88E5',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  rankingTexto: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  perguntaHeader: {
    marginBottom: 8,
    paddingRight: 50,
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
  perguntaFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  botaoCurtir: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
  },
  botaoCurtido: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FEB2B2',
  },
  curtidasTexto: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  curtidasTextoCurtido: {
    color: '#E53E3E',
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
});
