import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { HeaderTela } from '../../components/shared/HeaderTela';
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
      <HeaderTela titulo="Eventos" />

      <View style={styles.container}>
        <View style={styles.containerFiltros}>
          {tiposAtividade.map(renderizarFiltro)}
        </View>

        <View style={styles.separador} />

        {carregando ? (
          <View style={styles.containerCarregando}>
            <ActivityIndicator size="large" color="#0B7730" />
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
    backgroundColor: '#FFFFFF',
  },
  containerFiltros: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  botaoFiltro: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  botaoFiltroAtivo: {
    backgroundColor: '#0B7730',
  },
  textoFiltro: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  textoFiltroAtivo: {
    color: '#FFFFFF',
  },
  separador: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  containerCarregando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCarregando: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  containerLista: {
    padding: 16,
  },
  cartaoAtividade: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  infoAtividade: {
    flex: 1,
  },
  cabecalhoAtividade: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tituloAtividade: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B7730',
    flex: 1,
    marginRight: 8,
  },
  linhaInformacoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  itemInformacao: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icone: {
    fontSize: 14,
    marginRight: 4,
  },
  horarioAtividade: {
    fontSize: 14,
    color: '#6B7280',
  },
  localAtividade: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  tipoAtividade: {
    fontSize: 12,
    color: '#FFFFFF',
    backgroundColor: '#0b7731ce',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  containerVazio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  textoVazio: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});