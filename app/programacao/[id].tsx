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
    backgroundColor: '#FFFFFF',
  },
  containerCarregando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  textoCarregando: {
    marginTop: 12,
    color: '#666',
  },
  containerErro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  textoErro: {
    fontSize: 18,
    color: '#D32F2F',
    marginBottom: 20,
    textAlign: 'center',
  },
  botaoVoltar: {
    backgroundColor: '#0B7730',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  textoBotaoVoltar: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  cabecalho: {
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  separador: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
    marginVertical: 8,
  },
  secao: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  rotuloSecao: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  conteudoSecao: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  containerPalestrante: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fotoPalestrante: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  infoPalestrante: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nomePalestrante: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  detalhesPalestrante: {
    fontSize: 14,
    color: '#0B7730',
    fontWeight: '500',
  },
  placeholderPresenca: {
    margin: 20,
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
  },
  textoPresenca: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
  espacador: {
    height: 40,
  },
  overlayModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  conteudoModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: '90%',
    maxHeight: '80%',
  },
  fotoModal: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 16,
  },
  tituloModal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  secaoModal: {
    marginBottom: 16,
  },
  tituloSecaoModal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  textoModal: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666666',
  },
  botoesModal: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  botaoFechar: {
    backgroundColor: '#0B7730',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  textoBotaoFechar: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});