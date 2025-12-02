// app/feedback/[id].tsx
import { HeaderTela } from '@/components/shared/HeaderTela';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../services/auth/context';
import apiFeedback, { Feedback } from '../../services/feedback/api';
import { apiProgramacao, Atividade } from '../../services/programacao/api';

export default function TelaAvaliacoesPalestra() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { usuario } = useAuth();
  const [palestra, setPalestra] = useState<Atividade | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mediaEstrelas, setMediaEstrelas] = useState(0);
  const [jaAvaliou, setJaAvaliou] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      if (!id) return;

      try {
        setCarregando(true);
        
        const dadosPalestra = await apiProgramacao.buscarAtividadePorId(id as string);
        setPalestra(dadosPalestra);

        const dadosFeedbacks = await apiFeedback.buscarFeedbacksPalestra(id as string);
        setFeedbacks(dadosFeedbacks);

        if (dadosFeedbacks.length > 0) {
          const totalEstrelas = dadosFeedbacks.reduce((acc, feedback) => acc + feedback.estrelas, 0);
          setMediaEstrelas(totalEstrelas / dadosFeedbacks.length);
        }

        // Verificar se o usuário já avaliou
        if (usuario?.id) {
          const avaliou = await apiFeedback.verificarSeJaAvaliou(usuario.id, id as string);
          setJaAvaliou(avaliou);
        }
      } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [id]);

  const renderizarEstrelas = (estrelas: number, tamanho: number = 16) => {
    return (
      <View style={styles.containerEstrelas}>
        {[1, 2, 3, 4, 5].map((estrela) => (
          <Text
            key={estrela}
            style={[
              styles.estrela,
              { fontSize: tamanho },
              estrela <= estrelas ? styles.estrelaPreenchida : styles.estrelaVazia
            ]}
          >
            {estrela <= estrelas ? '★' : '☆'}
          </Text>
        ))}
      </View>
    );
  };

  const renderizarItemFeedback = ({ item }: { item: Feedback }) => (
    <View style={styles.cartaoFeedback}>
      <View style={styles.cabecalhoFeedback}>
        <View style={styles.infoUsuario}>
          <Text style={styles.nomeUsuario}>
            {item.participante?.nome || 'Usuário Anônimo'}
          </Text>
          <Text style={styles.emailUsuario}>
            {item.participante?.email || ''}
          </Text>
        </View>
        {renderizarEstrelas(item.estrelas)}
      </View>
      
      {item.comentario && (
        <Text style={styles.comentario}>
          `{item.comentario}`
        </Text>
      )}
    </View>
  );

  if (carregando) {
    return (
      <View style={styles.containerCarregando}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.textoCarregando}>Carregando avaliações...</Text>
      </View>
    );
  }

  if (!palestra) {
    return (
      <View style={styles.containerErro}>
        <Text style={styles.textoErro}>Palestra não encontrada</Text>
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
    <View style={styles.container}>
          <HeaderTela titulo='Avaliações'/>
      
      <View style={styles.header}>
        {/* <TouchableOpacity 
          style={styles.botaoVoltar}
          onPress={() => router.back()}
        >
          <Text style={styles.iconeVoltar}>←</Text>
        </TouchableOpacity> */}
    
        
        <View style={styles.infoPalestra}>
          <Text style={styles.tituloPalestra} numberOfLines={2}>
            {palestra.titulo}
          </Text>
          <Text style={styles.tipoPalestra}>
            {palestra.tipo}
          </Text>
        </View>
      </View>

      <View style={styles.resumoAvaliacoes}>
        <View style={styles.estatisticas}>
          <View style={styles.estatistica}>
            <Text style={styles.numeroEstatistica}>{feedbacks.length}</Text>
            <Text style={styles.labelEstatistica}>Avaliações</Text>
          </View>
          
          <View style={styles.estatistica}>
            <Text style={styles.numeroEstatistica}>
              {mediaEstrelas > 0 ? mediaEstrelas.toFixed(1) : '0.0'}
            </Text>
            <Text style={styles.labelEstatistica}>Média</Text>
          </View>
        </View>

        {mediaEstrelas > 0 && (
          <View style={styles.mediaEstrelas}>
            {renderizarEstrelas(Math.round(mediaEstrelas), 20)}
            <Text style={styles.textoMedia}>
              {mediaEstrelas.toFixed(1)} de 5 estrelas
            </Text>
          </View>
        )}

        {jaAvaliou ? (
          <View style={[styles.botaoAvaliar, styles.botaoAvaliado]}>
            <IconSymbol name="checkmark.seal.fill" size={24} color="#10B981" />
            <Text style={styles.textoBotaoAvaliado}>Avaliação Enviada</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.botaoAvaliar}
            onPress={() => router.push(`/feedback/avaliar/${id}`)}
          >
            <IconSymbol name="star.fill" size={20} color="#FFFFFF" />
            <Text style={styles.textoBotaoAvaliar}>Avaliar Atividade</Text>
          </TouchableOpacity>
        )}
      </View>

      {feedbacks.length > 0 ? (
        <FlatList
          data={feedbacks}
          renderItem={renderizarItemFeedback}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listaFeedbacks}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.containerVazio}>
          <Text style={styles.iconeVazio}>💬</Text>
          <Text style={styles.tituloVazio}>Nenhuma avaliação ainda</Text>
          <Text style={styles.textoVazio}>
            Seja o primeiro a avaliar esta palestra!
          </Text>
        </View>
      )}
    </View>
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
    padding: 20,
  },
  textoErro: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 20,
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
  botaoVoltar: {
    padding: 8,
    marginRight: 12,
  },
  iconeVoltar: {
    fontSize: 20,
    color: '#1E88E5',
    fontWeight: '600',
  },
  infoPalestra: {
    flex: 1,
  },
  tituloPalestra: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  tipoPalestra: {
    fontSize: 14,
    color: '#64748B',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  resumoAvaliacoes: {
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
  estatisticas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  estatistica: {
    alignItems: 'center',
  },
  numeroEstatistica: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E88E5',
    marginBottom: 4,
  },
  labelEstatistica: {
    fontSize: 14,
    color: '#64748B',
  },
  mediaEstrelas: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  textoMedia: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  botaoAvaliar: {
    backgroundColor: '#1e88e5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  botaoAvaliado: {
    backgroundColor: '#E8F5E9',
    borderWidth: 0,
    borderColor: '#10B981',
  },
  textoBotaoAvaliar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  textoBotaoAvaliado: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  listaFeedbacks: {
    padding: 16,
    paddingTop: 0,
  },
  cartaoFeedback: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cabecalhoFeedback: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoUsuario: {
    flex: 1,
    marginRight: 12,
  },
  nomeUsuario: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  emailUsuario: {
    fontSize: 12,
    color: '#64748B',
  },
  containerEstrelas: {
    flexDirection: 'row',
  },
  estrela: {
    marginHorizontal: 1,
  },
  estrelaPreenchida: {
    color: '#FFD700',
  },
  estrelaVazia: {
    color: '#E2E8F0',
  },
  comentario: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 8,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E2E8F0',
  },
  dataFeedback: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'right',
  },
  containerVazio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconeVazio: {
    fontSize: 48,
    marginBottom: 16,
  },
  tituloVazio: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    textAlign: 'center',
  },
  textoVazio: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  textoBotaoVoltar: {
    color: '#1E88E5',
    fontSize: 16,
    fontWeight: '600',
  },
});