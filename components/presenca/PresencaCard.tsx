import { StyleSheet, Text, View } from 'react-native';
import { Atividade } from '@/services/programacao/api';
import React from 'react';
interface PresencaCardProps {
  palestra: Atividade & {
    dataHoraPresenca?: string;
    sincronizado?: boolean;
  };
}

export default function PresencaCard({ palestra }: PresencaCardProps) {
  const formatarDataHora = (dataHora?: string) => {
    if (!dataHora) return 'Data não disponível';
    try {
      const data = new Date(dataHora);
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dataHora;
    }
  };

  const horario = palestra.horarios?.[0];
  const dataInicio = horario ? new Date(horario.date_start) : null;

  return (
    <View style={styles.card}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo} numberOfLines={2}>
          {palestra.titulo || 'Sem título'}
        </Text>
        <View style={styles.badgePresenca}>
          <Text style={styles.textoBadge}>✓ Presente</Text>
        </View>
      </View>

      <View style={styles.linhaInformacoes}>
        {dataInicio && (
          <View style={styles.itemInformacao}>
            <Text style={styles.icone}>🕐</Text>
            <Text style={styles.textoInformacao}>
              {dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}

        {palestra.local && (
          <View style={styles.itemInformacao}>
            <Text style={styles.icone}>📍</Text>
            <Text style={styles.textoInformacao} numberOfLines={1}>
              {palestra.local}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.linhaInformacoes}>
        <View style={styles.itemInformacao}>
          <Text style={styles.icone}>🎯</Text>
          <Text style={styles.textoInformacao}>
            {palestra.tipo || 'Não informado'}
          </Text>
        </View>
      </View>

      {palestra.dataHoraPresenca && (
        <View style={styles.containerDataPresenca}>
          <Text style={styles.labelDataPresenca}>Registrado em:</Text>
          <Text style={styles.valorDataPresenca}>{formatarDataHora(palestra.dataHoraPresenca)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E88E5',
    flex: 1,
    marginRight: 12,
    lineHeight: 24,
  },
  badgePresenca: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 90,
    alignItems: 'center',
  },
  textoBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
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
  },
  icone: {
    fontSize: 14,
    marginRight: 8,
    color: '#64748B',
  },
  textoInformacao: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  containerDataPresenca: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  labelDataPresenca: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  valorDataPresenca: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
});
