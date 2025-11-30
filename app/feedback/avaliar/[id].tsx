// app/feedback/avaliar/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {apiProgramacao} from '../../../services/programacao/api';
import {apiFeedback} from '../../../services/feedback/api';
import { Atividade } from '../../../services/programacao/api';
import { useAuth } from '../../../hooks/useAuth';

export default function TelaAvaliarPalestra() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { usuario } = useAuth();
  const [palestra, setPalestra] = useState<Atividade | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  
  const [estrelas, setEstrelas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [estrelasTemporarias, setEstrelasTemporarias] = useState(0);

  useEffect(() => {
    const carregarPalestra = async () => {
      if (!id) return;

      try {
        setCarregando(true);
        const dadosPalestra = await apiProgramacao.buscarAtividadePorId(id as string);
        setPalestra(dadosPalestra);
      } catch (erro) {
        console.error('Erro ao carregar palestra:', erro);
        Alert.alert('Erro', 'Não foi possível carregar os dados da palestra');
      } finally {
        setCarregando(false);
      }
    };

    carregarPalestra();
  }, [id]);

  const manipularSelecionarEstrela = (quantidade: number) => {
    setEstrelas(quantidade);
  };

  const manipularEnviarAvaliacao = async () => {
    if (!usuario || !palestra) return;

    if (estrelas === 0) {
      Alert.alert('Atenção', 'Por favor, selecione uma avaliação de 1 a 5 estrelas');
      return;
    }

    try {
      setEnviando(true);

      const dadosFeedback = {
        participanteId: usuario.id,
        palestraId: palestra.id,
        estrelas: estrelas,
        comentario: comentario.trim() || undefined,
      };

      const resultado = await apiFeedback.criarFeedback(dadosFeedback);

      if (resultado) {
        Alert.alert(
          'Avaliação Enviada!',
          'Sua avaliação foi registrada com sucesso. Obrigado pelo feedback!',
          [
            {
              text: 'Ver Todas as Avaliações',
              onPress: () => router.push(`/feedback/${palestra.id}`),
            },
            {
              text: 'Voltar para Minhas Avaliações',
              onPress: () => router.push('/feedback/minhas-avaliacoes'),
            }
          ]
        );
      }
    } catch (erro: any) {
      console.error('Erro ao enviar avaliação:', erro);
      
      if (erro.message.includes('já enviou um feedback')) {
        Alert.alert(
          'Avaliação Já Existente',
          'Você já enviou uma avaliação para esta palestra.',
          [
            {
              text: 'Ver Minha Avaliação',
              onPress: () => router.push(`/feedback/${palestra.id}`),
            },
            {
              text: 'OK',
              style: 'cancel',
            }
          ]
        );
      } else if (erro.message.includes('precisa ter comparecido')) {
        Alert.alert(
          'Presença Não Registrada',
          'Você precisa ter comparecido à palestra para enviar uma avaliação.',
          [
            {
              text: 'Entendi',
              style: 'cancel',
            }
          ]
        );
      } else {
        Alert.alert('Erro', erro.message || 'Não foi possível enviar sua avaliação');
      }
    } finally {
      setEnviando(false);
    }
  };

  const renderizarEstrelas = () => {
    return (
      <View style={styles.containerEstrelas}>
        {[1, 2, 3, 4, 5].map((estrela) => (
          <TouchableOpacity
            key={estrela}
            onPress={() => manipularSelecionarEstrela(estrela)}
            onPressIn={() => setEstrelasTemporarias(estrela)}
            onPressOut={() => setEstrelasTemporarias(0)}
          >
            <Text
              style={[
                styles.estrela,
                estrela <= (estrelasTemporarias || estrelas) 
                  ? styles.estrelaPreenchida 
                  : styles.estrelaVazia
              ]}
            >
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getTextoAvaliacao = () => {
    if (estrelas === 0) return 'Selecione sua avaliação';
    if (estrelas === 1) return 'Péssima';
    if (estrelas === 2) return 'Ruim';
    if (estrelas === 3) return 'Boa';
    if (estrelas === 4) return 'Muito Boa';
    if (estrelas === 5) return 'Excelente';
    return '';
  };

  if (carregando) {
    return (
      <View style={styles.containerCarregando}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.textoCarregando}>Carregando palestra...</Text>
      </View>
    );
  }

  if (!palestra) {
    return (
      <View style={styles.containerErro}>
        <Text style={styles.iconeErro}>❌</Text>
        <Text style={styles.tituloErro}>Palestra não encontrada</Text>
        <Text style={styles.textoErro}>
          A palestra que você está tentando avaliar não foi encontrada.
        </Text>
        <TouchableOpacity 
          style={styles.botaoVoltar}
          onPress={() => router.back()}
        >
          <Text style={styles.textoBotaoVoltar}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.botaoVoltarHeader}
            onPress={() => router.back()}
          >
            <Text style={styles.iconeVoltar}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.infoHeader}>
            <Text style={styles.tituloHeader}>Avaliar Palestra</Text>
          </View>
        </View>

        <View style={styles.cardPalestra}>
          <Text style={styles.tituloPalestra}>{palestra.titulo}</Text>
          
          {palestra.descricao && (
            <Text style={styles.descricaoPalestra} numberOfLines={3}>
              {palestra.descricao}
            </Text>
          )}

          <View style={styles.infoAdicional}>
            <View style={styles.itemInfo}>
              <Text style={styles.iconeInfo}>🎯</Text>
              <Text style={styles.textoInfo}>{palestra.tipo}</Text>
            </View>
            
            {palestra.local && (
              <View style={styles.itemInfo}>
                <Text style={styles.iconeInfo}>📍</Text>
                <Text style={styles.textoInfo}>{palestra.local}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardAvaliacao}>
          <Text style={styles.tituloAvaliacao}>Como foi sua experiência?</Text>
          
          <View style={styles.secaoEstrelas}>
            {renderizarEstrelas()}
            <Text style={styles.textoAvaliacao}>
              {getTextoAvaliacao()}
            </Text>
            <Text style={styles.legendaEstrelas}>
              {estrelas > 0 ? `${estrelas} de 5 estrelas` : 'Toque nas estrelas para avaliar'}
            </Text>
          </View>

          <View style={styles.secaoComentario}>
            <Text style={styles.labelComentario}>
              Comentário (opcional)
            </Text>
            <TextInput
              style={styles.inputComentario}
              value={comentario}
              onChangeText={setComentario}
              placeholder="Conte mais sobre sua experiência nesta palestra..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.contadorCaracteres}>
              {comentario.length}/500 caracteres
            </Text>
          </View>
        </View>

        <View style={styles.containerBotao}>
          <TouchableOpacity
            style={[
              styles.botaoEnviar,
              (estrelas === 0 || enviando) && styles.botaoEnviarDesabilitado
            ]}
            onPress={manipularEnviarAvaliacao}
            disabled={estrelas === 0 || enviando}
          >
            {enviando ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.textoBotaoEnviar}>
                Enviar Avaliação
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.botaoCancelar}
            onPress={() => router.back()}
            disabled={enviando}
          >
            <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
  containerErro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconeErro: {
    fontSize: 48,
    marginBottom: 16,
  },
  tituloErro: {
    fontSize: 20,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  textoErro: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  botaoVoltarHeader: {
    padding: 8,
    marginRight: 12,
  },
  iconeVoltar: {
    fontSize: 20,
    color: '#1E88E5',
    fontWeight: '600',
  },
  infoHeader: {
    flex: 1,
  },
  tituloHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  cardPalestra: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tituloPalestra: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E88E5',
    marginBottom: 8,
    lineHeight: 24,
  },
  descricaoPalestra: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoAdicional: {
    gap: 8,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconeInfo: {
    fontSize: 14,
    marginRight: 8,
    color: '#64748B',
  },
  textoInfo: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  cardAvaliacao: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tituloAvaliacao: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 24,
    textAlign: 'center',
  },
  secaoEstrelas: {
    alignItems: 'center',
    marginBottom: 24,
  },
  containerEstrelas: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  estrela: {
    fontSize: 40,
    marginHorizontal: 6,
  },
  estrelaPreenchida: {
    color: '#FFD700',
  },
  estrelaVazia: {
    color: '#E2E8F0',
  },
  textoAvaliacao: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  legendaEstrelas: {
    fontSize: 14,
    color: '#64748B',
  },
  secaoComentario: {
    marginBottom: 8,
  },
  labelComentario: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputComentario: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  contadorCaracteres: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: 4,
  },
  containerBotao: {
    paddingHorizontal: 16,
    gap: 12,
  },
  botaoEnviar: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoEnviarDesabilitado: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  textoBotaoEnviar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  botaoCancelar: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textoBotaoCancelar: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  botaoVoltar: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  textoBotaoVoltar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});