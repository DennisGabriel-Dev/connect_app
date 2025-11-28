import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import api, { Atividade } from '../../services/programacao/api';

export default function TelaProgramacao() {
  const navegador = useRouter();
  const [, setAtividades] = useState<Atividade[]>([]);
  const [atividadesFiltradas, setAtividadesFiltradas] = useState<Atividade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroSelecionado, setFiltroSelecionado] = useState<string>('Todos');
  const [tiposAtividade, setTiposAtividade] = useState<string[]>(['Todos']);

  useEffect(() => {
    const carregarAtividades = async () => {
      try {
        const dados = await api.programacao.buscarAtividades();
        setAtividades(dados);
        setAtividadesFiltradas(dados);

        // Extrai os tipos únicos de atividades do backend
        const tiposUnicos = Array.from(
          new Set(
            dados
              .map((atividade) => atividade.tipo)
              .filter((tipo): tipo is string => !!tipo)
          )
        );
        setTiposAtividade(['Todos', ...tiposUnicos]);
      } catch (erro) {
        console.error('Erro ao carregar atividades:', erro);
      } finally {
        setCarregando(false);
      }
    };

    carregarAtividades();
  }, []);

  const filtrarAtividades = async (tipo: string) => {
    setFiltroSelecionado(tipo);
    setCarregando(true);

    try {
      if (tipo === 'Todos') {
        const dados = await api.programacao.buscarAtividades();
        setAtividadesFiltradas(dados);
      } else {
        const dados = await api.programacao.buscarAtividades(tipo);
        setAtividadesFiltradas(dados);
      }
    } catch (erro) {
      console.error('Erro ao filtrar atividades:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const manipularPressionarAtividade = (atividade: Atividade) => {
    navegador.push(`/programacao/${atividade.id}`);
  };

  const renderizarItemAtividade = ({ item }: { item: Atividade }) => {
    const horario = item.horarios[0];
    const dataInicio = horario ? new Date(horario.date_start) : new Date();

    return (
      <TouchableOpacity
        style={styles.cartaoAtividade}
        onPress={() => manipularPressionarAtividade(item)}
      >
        <View style={styles.infoAtividade}>
          <View style={styles.cabecalhoAtividade}>
            <Text style={styles.tituloAtividade} numberOfLines={2}>
              {item.titulo}
            </Text>
            <Text style={styles.tipoAtividade}>
              {item.tipo}
            </Text>
          </View>

          <View style={styles.linhaInformacoes}>
            <View style={styles.itemInformacao}>
              <Text style={styles.icone}>🕐</Text>
              <Text style={styles.horarioAtividade}>
                {dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>

            <View style={styles.itemInformacao}>
              <Text style={styles.icone}>📍</Text>
              <Text style={styles.localAtividade} numberOfLines={1}>
                {item.local}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderizarFiltro = (tipo: string) => (
    <TouchableOpacity
      key={tipo}
      style={[
        styles.botaoFiltro,
        filtroSelecionado === tipo && styles.botaoFiltroAtivo
      ]}
      onPress={() => filtrarAtividades(tipo)}
    >
      <Text style={[
        styles.textoFiltro,
        filtroSelecionado === tipo && styles.textoFiltroAtivo
      ]}>
        {tipo}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={styles.container}>
        {/* Container de Filtros Scrollavel */}
        <View style={styles.containerFiltrosWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.containerFiltros}
          >
            {tiposAtividade.map(renderizarFiltro)}
          </ScrollView>
        </View>

        <View style={styles.separador} />

        {carregando ? (
          <View style={styles.containerCarregando}>
            <ActivityIndicator size="large" color="#1E88E5" />
            <Text style={styles.textoCarregando}>Carregando eventos...</Text>
          </View>
        ) : (
          <FlatList
            data={atividadesFiltradas}
            renderItem={renderizarItemAtividade}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.containerLista}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.containerVazio}>
                <Text style={styles.textoVazio}>
                  Nenhuma atividade encontrada para o filtro selecionado.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  containerFiltrosWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  containerFiltros: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    minHeight: 60,
  },
  botaoFiltro: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoFiltroAtivo: {
    backgroundColor: '#1E88E5',
    borderColor: '#1E88E5',
  },
  textoFiltro: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  textoFiltroAtivo: {
    color: '#FFFFFF',
  },
  separador: {
    height: 1,
    backgroundColor: '#E2E8F0',
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
  cartaoAtividade: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  infoAtividade: {
    flex: 1,
  },
  cabecalhoAtividade: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tituloAtividade: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E88E5',
    flex: 1,
    marginRight: 12,
    lineHeight: 24,
  },
  linhaInformacoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  itemInformacao: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icone: {
    fontSize: 16,
    marginRight: 8,
    color: '#64748B',
  },
  horarioAtividade: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  localAtividade: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  tipoAtividade: {
    fontSize: 12,
    color: '#FFFFFF',
    backgroundColor: '#1E88E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
    fontWeight: '600',
  },
  containerVazio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  textoVazio: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
});
