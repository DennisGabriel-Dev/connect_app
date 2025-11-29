// app/sorteio/modal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { listarTudo } from '../../services/sorteio/api';

export default function AdminFiltersModal() {
  const [minPresence, setMinPresence] = useState(0);
  const [minQuizScore, setMinQuizScore] = useState(0);
  const [minFeedbacks, setMinFeedbacks] = useState(0);
  const [sortBy, setSortBy] = useState<'votes' | 'engagement'>('engagement');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  async function handleApply() {
    const filtros = {
      minPresencas: minPresence,
      minQuizScore,
      minFeedbacks,
      sortBy,
      dateFrom,
      dateTo,
    };

    router.push({
      pathname: "/sorteio",
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
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F3F4F6' }}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 32,
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: 'bold',
          marginBottom: 8,
        }}
      >
        Painel de filtros !
      </Text>
      <Text style={{ color: '#6B7280', marginBottom: 16 }}>
        Configure os filtros para analisar os usuários mais engajados.
      </Text>

      {/* Presença mínima */}
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <Text style={{ fontWeight: '600', marginBottom: 4 }}>
          Presença mínima
        </Text>
        <Text style={{ color: '#6B7280', marginBottom: 8 }}>
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
            <Text>-</Text>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              minWidth: 40,
              textAlign: 'center',
            }}
          >
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
            <Text style={{ color: 'white' }}>+1</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Nota mínima */}
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <Text style={{ fontWeight: '600', marginBottom: 4 }}>
          Nota mínima
        </Text>
        <Text style={{ color: '#6B7280', marginBottom: 8 }}>
          Nota mínima de média nos quizzes (0 a 10).
        </Text>

        <TextInput
          keyboardType={Platform.OS === 'web' ? 'number' : 'numeric'}
          value={String(minQuizScore)}
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
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <Text style={{ fontWeight: '600', marginBottom: 4 }}>
          Quantidade de feedbacks
        </Text>

        <TextInput
          keyboardType={Platform.OS === 'web' ? 'number' : 'numeric'}
          value={String(minFeedbacks)}
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

      {/* Foco */}
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <Text style={{ fontWeight: '600', marginBottom: 4 }}>
          Foco da análise
        </Text>
        <Text style={{ color: '#6B7280', marginBottom: 8 }}>
          Escolha se quer priorizar perguntas mais votadas ou engajamento geral.
        </Text>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setSortBy('engagement')}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor:
                sortBy === 'engagement' ? '#2563EB' : '#E5E7EB',
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                color: sortBy === 'engagement' ? 'white' : '#111827',
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
              backgroundColor: sortBy === 'votes' ? '#2563EB' : '#E5E7EB',
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                color: sortBy === 'votes' ? 'white' : '#111827',
                fontWeight: '600',
              }}
            >
              Perguntas mais votadas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Período */}
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontWeight: '600', marginBottom: 4 }}>
          Período da atividade
        </Text>
        <Text style={{ color: '#6B7280', marginBottom: 8 }}>
          Filtrar por intervalo de datas (dd/mm/aaaa).
        </Text>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>De</Text>
            <TextInput
              value={dateFrom}
              onChangeText={setDateFrom}
              placeholder="01/11/2025"
              style={{
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 6,
              }}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>Até</Text>
            <TextInput
              value={dateTo}
              onChangeText={setDateTo}
              placeholder="30/11/2025"
              style={{
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 6,
              }}
            />
          </View>
        </View>
      </View>

      {/* Botões */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity
          onPress={handleClear}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#D1D5DB',
            backgroundColor: 'white',
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              fontWeight: '600',
              color: '#374151',
            }}
          >
            Limpar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleApply}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 8,
            backgroundColor: '#2563EB',
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              fontWeight: '600',
              color: 'white',
            }}
          >
            Aplicar filtros
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
