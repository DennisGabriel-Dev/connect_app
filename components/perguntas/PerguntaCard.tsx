import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Pergunta } from '@/services/perguntas/types';

interface PerguntaCardProps {
  pergunta: Pergunta;
  usuarioAtualId: string;
  onVotar: (perguntaId: string) => void;
  onPressionar?: (pergunta: Pergunta) => void;
}

export default function PerguntaCard({ 
  pergunta, 
  usuarioAtualId, 
  onVotar, 
  onPressionar 
}: PerguntaCardProps) {
  const usuarioJaVotou = pergunta.usuariosVotaram?.includes(usuarioAtualId) || false;

  const handleVotar = () => {
    onVotar(pergunta.id);
  };

  const handlePress = () => {
    if (onPressionar) {
      onPressionar(pergunta);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.conteudo}>
        {/* Header com ranking */}
        <View style={styles.header}>
          <View style={styles.rankingBadge}>
            <Text style={styles.rankingTexto}>🏆 {pergunta.votos} votos</Text>
          </View>
          {pergunta.respondida && (
            <View style={styles.respondidaBadge}>
              <Text style={styles.respondidaTexto}>✓ Respondida</Text>
            </View>
          )}
        </View>

        {/* Título da pergunta */}
        <Text style={styles.titulo} numberOfLines={2}>
          {pergunta.titulo}
        </Text>

        {/* Descrição */}
        {pergunta.descricao && (
          <Text style={styles.descricao} numberOfLines={3}>
            {pergunta.descricao}
          </Text>
        )}

        {/* Footer com autor e botão de votar */}
        <View style={styles.footer}>
          <Text style={styles.autor}>
            Por: {pergunta.usuarioNome || 'Anônimo'}
          </Text>

          <TouchableOpacity 
            style={[
              styles.botaoVotar,
              usuarioJaVotou && styles.botaoVotarAtivo
            ]} 
            onPress={handleVotar}
          >
            <Text style={[
              styles.botaoVotarTexto,
              usuarioJaVotou && styles.botaoVotarTextoAtivo
            ]}>
              {usuarioJaVotou ? '❤️ Votado' : '🤍 Votar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  conteudo: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankingBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  rankingTexto: {
    color: '#F57C00',
    fontSize: 13,
    fontWeight: '600',
  },
  respondidaBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#66BB6A',
  },
  respondidaTexto: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 24,
  },
  descricao: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  autor: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  botaoVotar: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  botaoVotarAtivo: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  botaoVotarTexto: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  botaoVotarTextoAtivo: {
    color: '#DC2626',
  },
});