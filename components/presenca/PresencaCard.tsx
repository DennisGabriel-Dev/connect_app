import { StyleSheet, Text, View } from 'react-native';
import { Atividade } from '@/services/programacao/api';

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

  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>{palestra.titulo || 'Sem título'}</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Tipo</Text>
        <Text style={styles.valor}>{palestra.tipo || 'Não informado'}</Text>
      </View>

      {palestra.local && (
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Local</Text>
          <Text style={styles.valor}>{palestra.local}</Text>
        </View>
      )}

      {palestra.dataHoraPresenca && (
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Data/Hora da Presença</Text>
          <Text style={styles.valor}>{formatarDataHora(palestra.dataHoraPresenca)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  infoContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  valor: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});
