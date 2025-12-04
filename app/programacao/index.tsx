import { IconSymbol } from '@/components/ui/icon-symbol';
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
import { extrairDatasUnicas, filtrarPorDia, filtrarPorTipo, formatarData } from './utils';

export default function TelaProgramacao() {
  const navegador = useRouter();
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [atividadesFiltradas, setAtividadesFiltradas] = useState<Atividade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroDia, setFiltroDia] = useState<string>('Todos os dias');
  const [filtroTipo, setFiltroTipo] = useState<string>('Todos');
  const [tiposAtividade, setTiposAtividade] = useState<string[]>(['Todos']);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [datasUnicas, setDatasUnicas] = useState<string[]>([]);

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
        
        // Move "Outro" para o final
        const tiposOrdenados = tiposUnicos.filter(tipo => tipo !== 'Outro');
        if (tiposUnicos.includes('Outro')) {
          tiposOrdenados.push('Outro');
        }
        
        setTiposAtividade(['Todos', ...tiposOrdenados]);

        const datas = extrairDatasUnicas(dados);
        setDatasUnicas(datas);
      } catch (erro) {
        console.error('Erro ao carregar atividades:', erro);
      } finally {
        setCarregando(false);
      }
    };

    carregarAtividades();
  }, []);

  const aplicarFiltros = (dia: string, tipo: string) => {
    let dadosFiltrados = filtrarPorTipo(atividades, tipo);
    const diaFiltro = dia === 'Todos os dias' ? 'Todos' : dia;
    dadosFiltrados = filtrarPorDia(dadosFiltrados, diaFiltro, datasUnicas);
    setAtividadesFiltradas(dadosFiltrados);
  };

  const selecionarDia = (dia: string) => {
    setFiltroDia(dia);
    setDropdownAberto(false);
    aplicarFiltros(dia, filtroTipo);
  };

  const selecionarTipo = (tipo: string) => {
    setFiltroTipo(tipo);
    aplicarFiltros(filtroDia, tipo);
  };

  const manipularPressionarAtividade = (atividade: Atividade) => {
    navegador.push(`/programacao/${atividade.id}`);
  };

  // Nova função para navegar para as avaliações da palestra
  const manipularVerAvaliacoes = (atividade: Atividade) => {
    navegador.push(`/feedback/${atividade.id}`);
  };



  const renderizarItemAtividade = ({ item }: { item: Atividade }) => {
    const horario = item.horarios[0];
    const dataInicio = horario ? new Date(horario.date_start) : new Date();
    const dataFim = horario ? new Date(horario.date_end) : new Date();

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

          {/* Nova seção para botão de avaliações */}
          <View style={styles.containerAcoes}>
            <TouchableOpacity
              style={styles.botaoAvaliacoes}
              onPress={(e) => {
                e.stopPropagation();
                manipularVerAvaliacoes(item);
              }}
            >
              <IconSymbol name="chart.bar.fill" size={14} color="#FFFFFF" />
              <Text style={styles.textoBotaoAvaliacoes}>Ver Avaliações</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderizarFiltroTipo = (tipo: string) => (
    <TouchableOpacity
      key={tipo}
      style={[
        styles.botaoFiltro,
        filtroTipo === tipo && styles.botaoFiltroAtivo
      ]}
      onPress={() => selecionarTipo(tipo)}
    >
      <Text style={[
        styles.textoFiltro,
        filtroTipo === tipo && styles.textoFiltroAtivo
      ]}>
        {tipo}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={styles.container}>

        {/* Dropdown de Dias */}
        <View style={styles.containerDropdown}>
          <TouchableOpacity 
            style={styles.botaoDropdown}
            onPress={() => setDropdownAberto(!dropdownAberto)}
          >
            <Text style={styles.textoDropdown}>{filtroDia}</Text>
            <IconSymbol name={dropdownAberto ? "chevron.up" : "chevron.down"} size={16} color="#64748B" />
          </TouchableOpacity>
          
          {dropdownAberto && (
            <View style={styles.menuDropdown}>
              <TouchableOpacity
                style={styles.itemDropdown}
                onPress={() => selecionarDia('Todos os dias')}
              >
                <Text style={[styles.textoItemDropdown, filtroDia === 'Todos os dias' && styles.textoItemDropdownAtivo]}>
                  Todos os dias
                </Text>
              </TouchableOpacity>
              {datasUnicas.map((data, index) => (
                <TouchableOpacity
                  key={data}
                  style={styles.itemDropdown}
                  onPress={() => selecionarDia(`Dia ${index + 1}`)}
                >
                  <Text style={[styles.textoItemDropdown, filtroDia === `Dia ${index + 1}` && styles.textoItemDropdownAtivo]}>
                    Dia {index + 1} ({formatarData(data)})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Container de Filtros de Tipo */}
        <View style={styles.containerFiltrosWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.containerFiltros}
          >
            {tiposAtividade.map(renderizarFiltroTipo)}
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
  // Novos estilos para o header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  tituloHeader: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },

  containerDropdown: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 0,
  },
  botaoDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textoDropdown: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  menuDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemDropdown: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  textoItemDropdown: {
    fontSize: 16,
    color: '#64748B',
  },
  textoItemDropdownAtivo: {
    color: '#1E88E5',
    fontWeight: '600',
  },
  containerFiltrosWrapper: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 2,
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
    marginBottom: 12, // Adicionado marginBottom para espaço do botão
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
  tipoAtividade: {
    fontSize: 12,
    color: '#3B82F6',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
    fontWeight: '600',
  },
  // Novos estilos para a seção de ações
  containerAcoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  botaoAvaliacoes: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textoBotaoAvaliacoes: {
    color: '#FFFFFF',
    fontSize: 12,
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