import PresencaCard from '@/components/presenca/PresencaCard';
import { HeaderTela } from '@/components/shared/HeaderTela';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/services/auth/context';
import { apiProgramacao, Atividade } from '@/services/programacao/api';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function TelaMinhasPresencas() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [palestras, setPalestras] = useState<(Atividade & { dataHoraPresenca?: string; sincronizado?: boolean })[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  const carregarPresencas = useCallback(async () => {
    if (!usuario?.id) {
      setCarregando(false);
      return;
    }

    try {
      setAtualizando(true);
      const palestrasLista = await apiProgramacao.buscarPalestrasPorParticipante(usuario.id);
      setPalestras(palestrasLista);
    } catch (erro) {
      console.error('Erro ao carregar presenças:', erro);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [usuario?.id]);

  // Recarregar presenças sempre que a tela receber foco
  useFocusEffect(
    useCallback(() => {
      if (usuario?.id) {
        carregarPresencas();
      }
    }, [usuario?.id, carregarPresencas])
  );

  const renderizarItemPresenca = ({ item }: { item: Atividade & { dataHoraPresenca?: string; sincronizado?: boolean } }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => router.push(`/programacao/${item.id}`)}
      >
        <PresencaCard palestra={item} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderTela titulo="Minhas Presenças" />

      {carregando ? (
        <View style={styles.containerCarregando}>
          <ActivityIndicator size="large" color="#1E88E5" />
          <Text style={styles.textoCarregando}>Carregando presenças...</Text>
        </View>
      ) : (
        <FlatList
          data={palestras}
          renderItem={renderizarItemPresenca}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.containerLista}
          showsVerticalScrollIndicator={false}
          refreshing={atualizando}
          onRefresh={carregarPresencas}
          ListEmptyComponent={
            <View style={styles.containerVazio}>
              <IconSymbol name="clipboard" size={48} color="#94A3B8" />
              <Text style={styles.tituloVazio}>Nenhuma presença registrada</Text>
              <Text style={styles.textoVazio}>
                Você ainda não registrou presença em nenhuma atividade.
                {'\n'}Registre sua presença nas atividades para vê-las aqui!
              </Text>
            </View>
          }
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  infoHeader: {
    flex: 1,
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
