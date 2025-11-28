import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { HeaderTela } from '../../components/shared/HeaderTela';
import { apiProgramacao, Atividade, Palestrante } from '../../services/programacao/api';

export default function TelaDetalheProgramacao() {
  const { id } = useLocalSearchParams();
  const navegador = useRouter();
  const [atividade, setAtividade] = useState<Atividade | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [modalPalestranteVisivel, setModalPalestranteVisivel] = useState(false);
  const [palestranteSelecionado, setPalestranteSelecionado] = useState<Palestrante | null>(null);

  useEffect(() => {
    const carregarAtividade = async () => {
      if (id) {
        try {
          const dados = await apiProgramacao.buscarAtividadePorId(id as string);
          setAtividade(dados);
        } catch (erro) {
          console.error('Erro ao carregar atividade:', erro);
        } finally {
          setCarregando(false);
        }
      }
    };

    carregarAtividade();
  }, [id]);

  const manipularPressionarPalestrante = (palestrante: Palestrante) => {
    setPalestranteSelecionado(palestrante);
    setModalPalestranteVisivel(true);
  };

  if (carregando) {
    return (
      <View style={styles.containerCarregando}>
        <ActivityIndicator size="large" color="#0B7730" />
        <Text style={styles.textoCarregando}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (!atividade) {
    return (
      <View style={styles.containerErro}>
        <Text style={styles.textoErro}>Atividade não encontrada</Text>
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navegador.back()}
        >
          <Text style={styles.textoBotaoVoltar}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const horario = atividade.horarios[0];
  const dataInicio = horario ? new Date(horario.date_start) : new Date();
  const dataFim = horario ? new Date(horario.date_end) : new Date();

  return (
    <>
      <HeaderTela titulo="Voltar" textoBotaoVoltar="Voltar" />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>{atividade.titulo}</Text>
        </View>

        <View style={styles.separador} />

        <View style={styles.secao}>
          <Text style={styles.rotuloSecao}>Data</Text>
          <Text style={styles.conteudoSecao}>
            {dataInicio.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          </Text>
        </View>

        <View style={styles.secao}>
          <Text style={styles.rotuloSecao}>Horário</Text>
          <Text style={styles.conteudoSecao}>
            {dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {dataFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <View style={styles.secao}>
          <Text style={styles.rotuloSecao}>Local</Text>
          <Text style={styles.conteudoSecao}>{atividade.local}</Text>
        </View>

        {/* Palestrantes */}
        {atividade.palestrantes && atividade.palestrantes.length > 0 && (
          <View style={styles.secao}>
            <Text style={styles.rotuloSecao}>
              {atividade.palestrantes.length > 1 ? 'Palestrantes' : 'Palestrante'}
            </Text>
            {atividade.palestrantes.map((palestrante, index) => (
              <TouchableOpacity
                key={index}
                style={styles.containerPalestrante}
                onPress={() => manipularPressionarPalestrante(palestrante)}
              >
                {palestrante.foto && (
                  <Image source={{ uri: palestrante.foto }} style={styles.fotoPalestrante} />
                )}
                <View style={styles.infoPalestrante}>
                  <Text style={styles.nomePalestrante}>{palestrante.nome}</Text>
                  <Text style={styles.detalhesPalestrante}>Ver detalhes →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.separador} />

        {atividade.descricao && (
          <View style={styles.secao}>
            <Text style={styles.rotuloSecao}>Descrição</Text>
            <Text style={styles.conteudoSecao}>{atividade.descricao}</Text>
          </View>
        )}

        <View style={styles.placeholderPresenca}>
          <Text style={styles.textoPresenca}>
            [Componente de Registrar Presença - Outra Equipe]
          </Text>
        </View>

        <View style={styles.espacador} />
      </ScrollView>

      {/* Modal de Detalhes do Palestrante */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalPalestranteVisivel}
        onRequestClose={() => setModalPalestranteVisivel(false)}
      >
        <View style={styles.overlayModal}>
          <View style={styles.conteudoModal}>
            {palestranteSelecionado && (
              <>
                {palestranteSelecionado.foto && (
                  <Image
                    source={{ uri: palestranteSelecionado.foto }}
                    style={styles.fotoModal}
                  />
                )}
                <Text style={styles.tituloModal}>{palestranteSelecionado.nome}</Text>

                {palestranteSelecionado.bio && (
                  <View style={styles.secaoModal}>
                    <Text style={styles.tituloSecaoModal}>Sobre</Text>
                    <Text style={styles.textoModal}>{palestranteSelecionado.bio}</Text>
                  </View>
                )}

                <View style={styles.botoesModal}>
                  <TouchableOpacity
                    style={styles.botaoFechar}
                    onPress={() => setModalPalestranteVisivel(false)}
                  >
                    <Text style={styles.textoBotaoFechar}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  containerCarregando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  textoCarregando: {
    marginTop: 16,
    color: '#64748B',
    fontSize: 16,
  },
  containerErro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  textoErro: {
    fontSize: 18,
    color: '#DC2626',
    marginBottom: 24,
    textAlign: 'center',
  },
  botaoVoltar: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textoBotaoVoltar: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  cabecalho: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 34,
  },
  separador: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 24,
    marginVertical: 16,
  },
  secao: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  rotuloSecao: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  conteudoSecao: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  containerPalestrante: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  fotoPalestrante: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  infoPalestrante: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nomePalestrante: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  detalhesPalestrante: {
    fontSize: 14,
    color: '#1E88E5',
    fontWeight: '600',
  },
  placeholderPresenca: {
    margin: 24,
    padding: 24,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  textoPresenca: {
    color: '#64748B',
    fontSize: 16,
    textAlign: 'center',
  },
  espacador: {
    height: 40,
  },
  overlayModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  conteudoModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
  },
  fotoModal: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 20,
  },
  tituloModal: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  secaoModal: {
    marginBottom: 20,
  },
  tituloSecaoModal: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  textoModal: {
    fontSize: 16,
    lineHeight: 26,
    color: '#475569',
  },
  botoesModal: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  botaoFechar: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  textoBotaoFechar: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});