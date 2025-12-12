// app/sorteio/modal.tsx

import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
} from 'react-native';

export default function AdminFiltersModal() {
  const [minPresence, setMinPresence] = useState(0);
  const [minQuizScore, setMinQuizScore] = useState(0);
  const [minFeedbacks, setMinFeedbacks] = useState(0);
  const [sortBy, setSortBy] = useState<'votes' | 'engagement'>('engagement');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filtroPerguntas, setFiltroPerguntas] = useState<'todas' | 'premiadas' | 'nao_premiadas'>('todas');

  // NOVOS FILTROS
  const [nomeContains, setNomeContains] = useState('');
  
  // FILTROS DE TIPO E TURMA
  const [tipoUsuario, setTipoUsuario] = useState<string>('');
  const [turma, setTurma] = useState<string>('');
  const [modalTurmaVisivel, setModalTurmaVisivel] = useState(false);

  // Lista de turmas disponíveis
  const turmasDisponiveis = [
    '1 TDS - Matutino',
    '1 ADM - Matutino',
    '2 AUT - Matutino',
    '2 TI - Matutino',
    '3 TI - Matutino',
    '3 ADM - Matutino',
    '1 AUT - Vespertino',
    '2 ADM - Vespertino',
    '3 TI A - Vespertino',
    '3 TI B - Vespertino',
    'ADS - Módulo IV',
    'ADS - Módulo V',
    'ADM - Módulo V',
    'ADM - Módulo IX',
    'PROEJA',
    'AUT SUB',
  ];

  async function handleApply() {
    const filtros = {
      minPresencas: minPresence,
      minQuizScore,
      minFeedbacks,
      sortBy,
      dateFrom,
      dateTo,
      filtroPerguntas: filtroPerguntas !== 'todas' ? filtroPerguntas : undefined,

      // novos filtros que o backend vai receber
      nomeContains: nomeContains.trim() || undefined,
      tipoUsuario: tipoUsuario || undefined,
      turma: turma || undefined,
    };

    router.push({
      pathname: '/sorteio',
      params: { filtros: JSON.stringify(filtros) },
    });
  }

  function handleClear() {
    setMinPresence(0);
    setMinQuizScore(0);
    setMinFeedbacks(0);
    setSortBy('engagement');
    setDateFrom('');
    setDateTo('');
    setNomeContains('');
    setTipoUsuario('');
    setTurma('');
    setFiltroPerguntas('todas');
  }

  // Opções selecionáveis para presença mínima
  const opcoesPresenca = [0, 1, 2, 3, 5, 10, 15, 20];
  
  // Opções selecionáveis para nota mínima
  const opcoesNota = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  // Opções selecionáveis para feedbacks
  const opcoesFeedbacks = [0, 1, 2, 3, 5, 10];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 16,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>
        Painel de filtros
      </Text>
      <Text style={{ color: '#6B7280', marginBottom: 16 }}>
        Configure os filtros para analisar os usuários mais engajados.
      </Text>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* FILTRO POR NOME */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 4 }}>Nome do participante</Text>
          <Text style={{ color: '#6B7280', marginBottom: 6 }}>
            Filtrar participantes pelo nome (contém).
          </Text>
          <TextInput
            value={nomeContains}
            onChangeText={setNomeContains}
            placeholder="Ex: Maria, João..."
            style={{
              borderWidth: 1,
              borderColor: '#D1D5DB',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          />
        </View>


        {/* Presença mínima */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 4 }}>Quantidade mínima de registros de presença</Text>
          <Text style={{ color: '#6B7280', marginBottom: 8 }}>
            Selecione a quantidade mínima de presenças.
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {opcoesPresenca.map((valor) => (
              <TouchableOpacity
                key={valor}
                onPress={() => setMinPresence(valor)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: minPresence === valor ? '#2563EB' : '#E5E7EB',
                }}
              >
                <Text
                  style={{
                    color: minPresence === valor ? '#FFFFFF' : '#111827',
                    fontWeight: '600',
                    fontSize: 14,
                  }}
                >
                  {valor === 0 ? 'Todas' : `≥ ${valor}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nota mínima */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 4 }}>Nota mínima</Text>
          <Text style={{ color: '#6B7280', marginBottom: 8 }}>
            Nota mínima de média nos quizzes (0 a 10).
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {opcoesNota.map((valor) => (
              <TouchableOpacity
                key={valor}
                onPress={() => setMinQuizScore(valor)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: minQuizScore === valor ? '#2563EB' : '#E5E7EB',
                }}
              >
                <Text
                  style={{
                    color: minQuizScore === valor ? '#FFFFFF' : '#111827',
                    fontWeight: '600',
                    fontSize: 14,
                  }}
                >
                  {valor === 0 ? 'Todas' : valor}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Feedbacks */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 4 }}>Número mínimo de feedbacks enviados</Text>
          <Text style={{ color: '#6B7280', marginBottom: 8 }}>
            Selecione a quantidade mínima de feedbacks.
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {opcoesFeedbacks.map((valor) => (
              <TouchableOpacity
                key={valor}
                onPress={() => setMinFeedbacks(valor)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: minFeedbacks === valor ? '#2563EB' : '#E5E7EB',
                }}
              >
                <Text
                  style={{
                    color: minFeedbacks === valor ? '#FFFFFF' : '#111827',
                    fontWeight: '600',
                    fontSize: 14,
                  }}
                >
                  {valor === 0 ? 'Todas' : `≥ ${valor}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filtro de Perguntas */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 4 }}>Perguntas</Text>
          <Text style={{ color: '#6B7280', marginBottom: 8 }}>
            Filtrar por status das perguntas do usuário.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setFiltroPerguntas('todas')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: filtroPerguntas === 'todas' ? '#2563EB' : '#E5E7EB',
              }}
            >
              <Text
                style={{
                  color: filtroPerguntas === 'todas' ? '#FFFFFF' : '#111827',
                  fontWeight: '600',
                }}
              >
                Todas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFiltroPerguntas('premiadas')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: filtroPerguntas === 'premiadas' ? '#2563EB' : '#E5E7EB',
              }}
            >
              <Text
                style={{
                  color: filtroPerguntas === 'premiadas' ? '#FFFFFF' : '#111827',
                  fontWeight: '600',
                }}
              >
                Premiadas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFiltroPerguntas('nao_premiadas')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: filtroPerguntas === 'nao_premiadas' ? '#2563EB' : '#E5E7EB',
              }}
            >
              <Text
                style={{
                  color: filtroPerguntas === 'nao_premiadas' ? '#FFFFFF' : '#111827',
                  fontWeight: '600',
                }}
              >
                Não Premiadas
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Foco da análise */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 4 }}>Foco da análise</Text>
          <Text style={{ color: '#6B7280', marginBottom: 6 }}>
            Escolha se quer priorizar perguntas mais votadas ou engajamento geral.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setSortBy('engagement')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor:
                  sortBy === 'engagement' ? '#2563EB' : '#E5E7EB',
              }}
            >
              <Text
                style={{
                  color: sortBy === 'engagement' ? '#FFFFFF' : '#111827',
                  fontWeight: '600',
                }}
              >
                Engajamento geral
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSortBy('votes')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: sortBy === 'votes' ? '#2563EB' : '#E5E7EB',
              }}
            >
              <Text
                style={{
                  color: sortBy === 'votes' ? '#FFFFFF' : '#111827',
                  fontWeight: '600',
                }}
              >
                Perguntas mais votadas
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tipo de Usuário */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 4 }}>Tipo de Usuário</Text>
          <Text style={{ color: '#6B7280', marginBottom: 6 }}>
            Filtrar por tipo de participante.
          </Text>
          
          <View style={{ gap: 8 }}>
            <TouchableOpacity
              onPress={() => {
                setTipoUsuario('');
                setTurma('');
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                borderRadius: 8,
                backgroundColor: tipoUsuario === '' ? '#EBF5FF' : '#F9FAFB',
                borderWidth: 1,
                borderColor: tipoUsuario === '' ? '#1E88E5' : '#E5E7EB',
              }}
            >
              <View style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: tipoUsuario === '' ? '#1E88E5' : '#94A3B8',
                marginRight: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                {tipoUsuario === '' && (
                  <View style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#1E88E5',
                  }} />
                )}
              </View>
              <Text style={{ color: '#111827', fontSize: 15 }}>Todos os tipos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setTipoUsuario('publico_externo');
                setTurma('');
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                borderRadius: 8,
                backgroundColor: tipoUsuario === 'publico_externo' ? '#EBF5FF' : '#F9FAFB',
                borderWidth: 1,
                borderColor: tipoUsuario === 'publico_externo' ? '#1E88E5' : '#E5E7EB',
              }}
            >
              <View style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: tipoUsuario === 'publico_externo' ? '#1E88E5' : '#94A3B8',
                marginRight: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                {tipoUsuario === 'publico_externo' && (
                  <View style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#1E88E5',
                  }} />
                )}
              </View>
              <Text style={{ color: '#111827', fontSize: 15 }}>Público Externo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setTipoUsuario('docente');
                setTurma('');
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                borderRadius: 8,
                backgroundColor: tipoUsuario === 'docente' ? '#EBF5FF' : '#F9FAFB',
                borderWidth: 1,
                borderColor: tipoUsuario === 'docente' ? '#1E88E5' : '#E5E7EB',
              }}
            >
              <View style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: tipoUsuario === 'docente' ? '#1E88E5' : '#94A3B8',
                marginRight: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                {tipoUsuario === 'docente' && (
                  <View style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#1E88E5',
                  }} />
                )}
              </View>
              <Text style={{ color: '#111827', fontSize: 15 }}>Docente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTipoUsuario('discente')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                borderRadius: 8,
                backgroundColor: tipoUsuario === 'discente' ? '#EBF5FF' : '#F9FAFB',
                borderWidth: 1,
                borderColor: tipoUsuario === 'discente' ? '#1E88E5' : '#E5E7EB',
              }}
            >
              <View style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: tipoUsuario === 'discente' ? '#1E88E5' : '#94A3B8',
                marginRight: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                {tipoUsuario === 'discente' && (
                  <View style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#1E88E5',
                  }} />
                )}
              </View>
              <Text style={{ color: '#111827', fontSize: 15 }}>Discente</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Turma - aparece apenas quando discente */}
        {tipoUsuario === 'discente' && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: '600', marginBottom: 4 }}>Turma</Text>
            <Text style={{ color: '#6B7280', marginBottom: 6 }}>
              Filtrar por turma específica.
            </Text>
            <TouchableOpacity
              onPress={() => setModalTurmaVisivel(true)}
              style={{
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: '#FFFFFF',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: turma ? '#111827' : '#9CA3AF' }}>
                {turma || 'Selecione a turma...'}
              </Text>
              <Text style={{ color: '#6B7280' }}>▼</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Período */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 4 }}>Período da atividade</Text>
          <Text style={{ color: '#6B7280', marginBottom: 6 }}>
            Filtrar por intervalo de datas (dd/mm/aaaa).
          </Text>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>
                De
              </Text>
              <TextInput
                value={dateFrom}
                onChangeText={setDateFrom}
                placeholder="dd/mm/aaaa"
                style={{
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>
                Até
              </Text>
              <TextInput
                value={dateTo}
                onChangeText={setDateTo}
                placeholder="dd/mm/aaaa"
                style={{
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botões */}
      <View
        style={{
          flexDirection: 'row',
          gap: 12,
          paddingVertical: 4,
          marginBottom: 42
        }}
      >
        <TouchableOpacity
          onPress={handleClear}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: '#D1D5DB',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontWeight: '600', color: '#111827' }}>Limpar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleApply}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 999,
            backgroundColor: '#2563EB',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontWeight: '600', color: '#FFFFFF' }}>
            Aplicar filtros
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de seleção de turma */}
      <Modal
        visible={modalTurmaVisivel}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalTurmaVisivel(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            padding: 20,
          }}
          activeOpacity={1}
          onPress={() => setModalTurmaVisivel(false)}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              maxHeight: '70%',
              elevation: 5,
            }}
            onStartShouldSetResponder={() => true}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: '#E2E8F0',
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#1E293B' }}>
                Selecione a Turma
              </Text>
              <TouchableOpacity
                onPress={() => setModalTurmaVisivel(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#F1F5F9',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 20, color: '#64748B', fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={turmasDisponiveis}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 18,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F1F5F9',
                    backgroundColor: turma === item ? '#EBF5FF' : '#FFFFFF',
                  }}
                  onPress={() => {
                    setTurma(item);
                    setModalTurmaVisivel(false);
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: turma === item ? '#1E88E5' : '#334155',
                      fontWeight: turma === item ? '600' : 'normal',
                    }}
                  >
                    {item}
                  </Text>
                  {turma === item && (
                    <Text style={{ fontSize: 20, color: '#1E88E5', fontWeight: 'bold' }}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}