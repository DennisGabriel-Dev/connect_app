// app/feedback/minhas-avaliacoes.tsx
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { showAlert } from '../../utils/alert';
// eslint-disable-next-line import/no-duplicates
import { Atividade } from '../../services/programacao/api';
 
import { HeaderTela } from '@/components/shared/HeaderTela';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '../../services/auth/context';
import { apiFeedback } from '../../services/feedback/api';
import { presencaApi } from '../../services/presenca/api';
import { apiProgramacao } from '../../services/programacao/api';

interface PalestraComPresenca extends Atividade {
  jaAvaliada?: boolean;
  feedbackId?: string;
}

export default function TelaMinhasAvaliacoes() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [palestrasComPresenca, setPalestrasComPresenca] = useState<PalestraComPresenca[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando] = useState(false);

  const carregarMinhasPalestras = useCallback(async () => {
    if (!usuario) {
      return;
    }

    try {
      setCarregando(true);

      // Buscar todas as presenças do usuário
      const minhasPresencas = await presencaApi.listarPresencas(usuario.id);

      // Extrair os IDs das palestras com presença
      const idsPalestrasComPresenca = minhasPresencas.map(p => p.palestraId);

      // Buscar todas as atividades
      const todasPalestras = await apiProgramacao.buscarAtividades();

      // Filtrar apenas as palestras que o usuário tem presença
      const palestrasComPresenca = todasPalestras.filter(palestra => 
        idsPalestrasComPresenca.includes(palestra.id)
      );

      const palestrasComInfoAvaliacao = await Promise.all(
        palestrasComPresenca.map(async (palestra) => {
          try {
            const meusFeedbacks = await apiFeedback.buscarMeusFeedbacks(usuario.id);
            const feedbackExistente = meusFeedbacks.find(fb => fb.palestraId === palestra.id);

            return {
              ...palestra,
              jaAvaliada: !!feedbackExistente,
              feedbackId: feedbackExistente?.id
            };
          } catch (erro) {
            console.error(`Erro ao verificar feedback do evento ${palestra.id}:`, erro);
            return {
              ...palestra,
              jaAvaliada: false
            };
          }
        })
      );

      setPalestrasComPresenca(palestrasComInfoAvaliacao);
    } catch (erro) {
      console.error('Erro ao carregar meus eventos:', erro);
      showAlert('Erro', 'Não foi possível carregar seus eventos');
    } finally {
      setCarregando(false);
    }
  }, [usuario]);

  useEffect(() => {
    if (usuario) {
      carregarMinhasPalestras();
    }
  }, [usuario, carregarMinhasPalestras]);

  const manipularAvaliarPalestra = (palestra: PalestraComPresenca) => {
    if (palestra.jaAvaliada) {
      showAlert(
        'Avaliação já enviada',
        'Você já avaliou este evento. Deseja ver sua avaliação?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Ver Avaliação', 
            onPress: () => router.push(`/feedback/${palestra.id}`)
          }
        ]
      );
    } else {
      router.push(`/feedback/avaliar/${palestra.id}`);
    }
  };

  const renderizarItemPalestra = ({ item }: { item: PalestraComPresenca }) => {
    const horario = item.horarios[0];
    const dataInicio = horario ? new Date(horario.date_start) : new Date();
    const dataFim = horario ? new Date(horario.date_end) : new Date();

    return (
      <TouchableOpacity
        style={styles.cartaoPalestra}
        onPress={() => manipularAvaliarPalestra(item)}
      >
        <View style={styles.infoPalestra}>
          <View style={styles.cabecalhoPalestra}>
            <Text style={styles.tituloPalestra} numberOfLines={2}>
              {item.titulo}
            </Text>
            <View style={[
              styles.statusAvaliacao,
              item.jaAvaliada ? styles.statusAvaliada : styles.statusPendente
            ]}>
              <IconSymbol 
                name={item.jaAvaliada ? 'checkmark.circle.fill' : 'clipboard'} 
                size={14} 
                color={item.jaAvaliada ? '#065F46' : '#92400E'} 
              />
              <Text style={[styles.textoStatus, !item.jaAvaliada && styles.textoStatusPendente]}>
                {item.jaAvaliada ? 'Avaliada' : 'Avaliar'}
              </Text>
            </View>
          </View>

          <View style={styles.linhaInformacoes}>
            <View style={styles.itemInformacao}>
              <IconSymbol name="calendar" size={16} color="#64748B" />
              <Text style={styles.textoInformacao}>
                {dataInicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </Text>
            </View>
          </View>

          <View style={styles.linhaInformacoes}>
            <View style={styles.itemInformacao}>
              <IconSymbol name="clock.fill" size={16} color="#64748B" />
              <Text style={styles.textoInformacao}>
                {dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {dataFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>

          <View style={styles.linhaInformacoes}>
            <View style={styles.itemInformacao}>
              <IconSymbol name="house.fill" size={16} color="#64748B" />
              <Text style={styles.textoInformacao} numberOfLines={1}>
                {item.local}
              </Text>
            </View>
          </View>

          <View style={styles.containerBotaoAcao}>
            <TouchableOpacity
              style={[
                styles.botaoAcao,
                item.jaAvaliada ? styles.botaoVisualizar : styles.botaoAvaliar
              ]}
              onPress={() => manipularAvaliarPalestra(item)}
            >
              <Text style={styles.textoBotaoAcao}>
                {item.jaAvaliada ? 'Ver Minha Avaliação' : 'Avaliar Palestra'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
        
        <View style={styles.infoHeader}>
          <Text style={styles.titulo}>Minhas Avaliações</Text>
          <Text style={styles.subtitulo}>
            Atividades que você frequentou
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.botaoAtualizar}
          onPress={carregarMinhasPalestras}
          disabled={atualizando}
        >
          <IconSymbol 
            name={atualizando ? 'hourglass' : 'arrow.clockwise'} 
            size={20} 
            color="#1E88E5" 
          />

          {/* <Text style={styles.iconeAtualizar}>
          {atualizando ? '⏳' : '🔄'}
          </Text> */}
        </TouchableOpacity>
      </View>

      {carregando ? (
        <View style={styles.containerCarregando}>
          <ActivityIndicator size="large" color="#1E88E5" />
          <Text style={styles.textoCarregando}>Carregando eventos...</Text>
        </View>
      ) : (
        <FlatList
          data={palestrasComPresenca}
          renderItem={renderizarItemPalestra}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.containerLista}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.containerVazio}>
              <IconSymbol name="calendar" size={48} color="#94A3B8" />
              <Text style={styles.tituloVazio}>Nenhum evento frequentado</Text>
              <Text style={styles.textoVazio}>
                Você ainda não registrou presença em nenhum evento.
                {'\n'}Participe dos eventos para poder avaliá-los!
              </Text>
            </View>
          }
          refreshing={atualizando}
          onRefresh={carregarMinhasPalestras}
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
  infoHeader: {
    flex: 1,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  subtitulo: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  botaoAtualizar: {
    padding: 8,
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
  containerLista: {
    padding: 16,
  },
  cartaoPalestra: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  infoPalestra: {
    flex: 1,
  },
  cabecalhoPalestra: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tituloPalestra: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E88E5',
    flex: 1,
    marginRight: 12,
    lineHeight: 24,
  },
  statusAvaliacao: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 100,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  statusAvaliada: {
    backgroundColor: '#D1FAE5',
  },
  statusPendente: {
    backgroundColor: '#FEF3C7',
  },
  textoStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  textoStatusPendente: {
    color: '#92400E',
  },
  linhaInformacoes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemInformacao: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  textoInformacao: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  containerBotaoAcao: {
    marginTop: 12,
  },
  botaoAcao: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoAvaliar: {
    backgroundColor: '#10B981',
  },
  botaoVisualizar: {
    backgroundColor: '#3B82F6',
  },
  textoBotaoAcao: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  containerVazio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
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
});