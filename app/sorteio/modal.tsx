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
} from 'react-native';

export default function AdminFiltersModal() {
  const [minPresence, setMinPresence] = useState(0);
  const [minQuizScore, setMinQuizScore] = useState(0);
  const [minFeedbacks, setMinFeedbacks] = useState(0);
  const [sortBy, setSortBy] = useState<'votes' | 'engagement'>('engagement');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // NOVOS FILTROS
  const [nomeContains, setNomeContains] = useState('');
  const [atividadeNome, setAtividadeNome] = useState('');
  const [palestraNome, setPalestraNome] = useState('');

  async function handleApply() {
    const filtros = {
      minPresencas: minPresence,
      minQuizScore,
      minFeedbacks,
      sortBy,
      dateFrom,
      dateTo,

      // novos filtros que o backend vai receber
      nomeContains: nomeContains.trim() || undefined,
      atividadeNome: atividadeNome.trim() || undefined,
      palestraNome: palestraNome.trim() || undefined,
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
    setAtividadeNome('');
    setPalestraNome('');
  }

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

        {/* FILTRO POR ATIVIDADE */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 4 }}>Atividade</Text>
          <Text style={{ color: '#6B7280', marginBottom: 6 }}>
            Filtrar pela atividade vinculada à presença (nome ou código, conforme seu backend).
          </Text>
          <TextInput
            value={atividadeNome}
            onChangeText={setAtividadeNome}
            placeholder="Ex: Workshop, Hackathon..."
            style={{
              borderWidth: 1,
              borderColor: '#D1D5DB',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          />
        </View>

        {/* FILTRO POR PALESTRA */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 4 }}>Palestra</Text>
          <Text style={{ color: '#6B7280', marginBottom: 6 }}>
            Filtrar pela palestra associada à presença.
          </Text>
          <TextInput
            value={palestraNome}
            onChangeText={setPalestraNome}
            placeholder="Ex: Abertura, Keynote..."
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
          <Text style={{ fontWeight: '600', marginBottom: 4 }}>Presença mínima</Text>
          <Text style={{ color: '#6B7280', marginBottom: 6 }}>
            Quantidade mínima de registros de presença.
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <TouchableOpacity
              onPress={() => setMinPresence((prev) => Math.max(prev - 1, 0))}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: '#E5E7EB',
                borderRadius: 999,
              }}
            >
              <Text>-1</Text>
            </TouchableOpacity>

            <Text style={{ minWidth: 40, textAlign: 'center', fontWeight: '600' }}>
              {minPresence}
            </Text>

            <TouchableOpacity
              onPress={() => setMinPresence((prev) => prev + 1)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: '#2563EB',
                borderRadius: 999,
              }}
            >
              <Text style={{ color: '#FFFFFF' }}>+1</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nota mínima */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 4 }}>Nota mínima</Text>
          <Text style={{ color: '#6B7280', marginBottom: 6 }}>
            Nota mínima de média nos quizzes (0 a 10).
          </Text>
          <TextInput
            keyboardType="decimal-pad"
            value={String(minQuizScore || '')}
            onChangeText={(value) => {
              const num = Number(value.replace(',', '.')) || 0;
              const clamped = Math.max(0, Math.min(10, num));
              setMinQuizScore(clamped);
            }}
            style={{
              borderWidth: 1,
              borderColor: '#D1D5DB',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
            placeholder="Ex: 7"
          />
        </View>

        {/* Feedbacks */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 4 }}>Quantidade de feedbacks</Text>
          <Text style={{ color: '#6B7280', marginBottom: 6 }}>
            Número mínimo de feedbacks enviados.
          </Text>
          <TextInput
            keyboardType="numeric"
            value={String(minFeedbacks || '')}
            onChangeText={(value) => {
              const num = parseInt(value || '0', 10) || 0;
              setMinFeedbacks(Math.max(0, num));
            }}
            style={{
              borderWidth: 1,
              borderColor: '#D1D5DB',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
            placeholder="Ex: 3"
          />
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
          paddingVertical: 12,
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
    </View>
  );
}
