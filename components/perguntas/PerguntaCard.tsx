import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { showAlert } from '@/utils/alert';
import { Pergunta, StatusPergunta } from '@/services/perguntas/types';
import { IconSymbol } from '../ui/icon-symbol';

interface PerguntaCardProps {
  pergunta: Pergunta;
  usuarioAtualId: string;
  onVotar: (perguntaId: string) => void;
  onPressionar?: (pergunta: Pergunta) => void;
  onEditar?: (pergunta: Pergunta) => void;
  onExcluir?: (pergunta: Pergunta) => void;
  limiteAtingido?: boolean; // Indica se o limite de 3 votos foi atingido
  periodoAtivo?: boolean; // Indica se o período de votação está ativo
}

export default function PerguntaCard({
  pergunta,
  usuarioAtualId,
  onVotar,
  onPressionar,
  onEditar,
  onExcluir,
  limiteAtingido = false,
  periodoAtivo = true
}: PerguntaCardProps) {
  const usuarioJaVotou = pergunta.usuariosVotaram?.includes(usuarioAtualId) || false;
  const ehAutor = pergunta.usuarioId === usuarioAtualId;

  // Mostrar estilo de limite se atingido E usuário ainda não votou nesta pergunta
  const mostrarLimite = limiteAtingido && !usuarioJaVotou;

  // Botão bloqueado se período inativo OU se limite atingido
  const botaoBloqueado = !periodoAtivo || mostrarLimite;

  const handleVotar = () => {
    // Se período inativo, não fazer nada
    if (!periodoAtivo) {
      return;
    }

    // Se limite atingido e não votou, mostrar alert
    if (mostrarLimite) {
      showAlert(
        'Limite de votos atingido',
        'Você já usou seus 3 votos. Desfaça um voto antes de votar em outra pergunta.',
        [{ text: 'OK' }]
      );
      return;
    }
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <IconSymbol name="trophy.fill" size={14} color="#1E88E5" />
              <Text style={styles.rankingTexto}>{pergunta.votos} votos</Text>
            </View>
          </View>
          {pergunta.respondida && (
            <View style={styles.respondidaBadge}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <IconSymbol name="checkmark.circle.fill" size={14} color="#10B981" />
                <Text style={styles.respondidaTexto}>Respondida</Text>
              </View>
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
          <View style={styles.autorContainer}>
            <IconSymbol name="person.fill" size={13} color="#94A3B8" />
            <Text style={styles.autor}>
              {pergunta.usuarioNome || 'Anônimo'}
            </Text>
          </View>

          {/* Ocultar botão se for o autor */}
          {!ehAutor && (
            <TouchableOpacity
              style={[
                styles.botaoVotar,
                usuarioJaVotou && styles.botaoVotarAtivo,
                botaoBloqueado && styles.botaoVotarDesabilitado
              ]}
              onPress={handleVotar}
              activeOpacity={0.7}
              disabled={botaoBloqueado}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <IconSymbol
                  name={botaoBloqueado ? 'lock.fill' : usuarioJaVotou ? 'heart.fill' : 'heart'}
                  size={16}
                  color={botaoBloqueado ? '#94A3B8' : usuarioJaVotou ? 'rgba(139, 92, 246, 1.00)' : '#64748B'}
                />
                <Text style={[
                  styles.botaoVotarTexto,
                  usuarioJaVotou && styles.botaoVotarTextoAtivo,
                  botaoBloqueado && styles.botaoVotarTextoDesabilitado
                ]}>
                  {!periodoAtivo ? 'Encerrado' : mostrarLimite ? 'Limite atingido' : usuarioJaVotou ? 'Votado' : 'Votar'}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Mostrar badge e botões se for o autor */}
          {ehAutor && (
            <View style={styles.autorContainer}>
              <View style={styles.autorBadge}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <IconSymbol name="person.fill" size={14} color="#4F46E5" />
                  <Text style={styles.autorBadgeTexto}>Sua pergunta</Text>
                </View>
              </View>

              {/* Botões de ação para perguntas pendentes */}
              {pergunta.status === StatusPergunta.PENDENTE && periodoAtivo && (
                <View style={styles.acoesRapidas}>
                  <TouchableOpacity
                    style={styles.botaoEditar}
                    onPress={() => onEditar?.(pergunta)}
                    activeOpacity={0.7}
                  >
                    <IconSymbol name="pencil" size={14} color="#1E88E5" />
                    <Text style={styles.botaoEditarTexto}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.botaoExcluir}
                    onPress={() => onExcluir?.(pergunta)}
                    activeOpacity={0.7}
                  >
                    <IconSymbol name="trash" size={14} color="#EF4444" />
                    <Text style={styles.botaoExcluirTexto}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
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
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#64B5F6',
  },
  rankingTexto: {
    color: '#1565C0',
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
  autorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    backgroundColor: '#EDE9FE',
    borderColor: 'rgba(139, 92, 246, 1.00)',
  },
  botaoVotarTexto: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  botaoVotarTextoAtivo: {
    color: 'rgba(139, 92, 246, 1.00)',
  },
  autorBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A5B4FC',
  },
  autorBadgeTexto: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '600',
  },
  botaoVotarDesabilitado: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    opacity: 0.6,
  },
  botaoVotarTextoDesabilitado: {
    color: '#94A3B8',
  },
  // Novos estilos para editar/excluir
  acoesRapidas: {
    flexDirection: 'row',
    gap: 8,
  },
  botaoEditar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  botaoEditarTexto: {
    color: '#1E88E5',
    fontSize: 12,
    fontWeight: '600',
  },
  botaoExcluir: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  botaoExcluirTexto: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
});