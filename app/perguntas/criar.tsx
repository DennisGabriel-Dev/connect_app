import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { perguntasApi } from '@/services/perguntas/api';
import { useAuth } from '@/services/auth/context';
import { HeaderTela } from '@/components/shared/HeaderTela';

export default function CriarPerguntaScreen() {
  const router = useRouter();
  const { palestraId, palestraTitulo } = useLocalSearchParams();
  const { usuario } = useAuth();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [enviando, setEnviando] = useState(false);

  const validarFormulario = (): boolean => {
    if (!titulo.trim()) {
      Alert.alert('Atenção', 'Por favor, insira um título para sua pergunta.');
      return false;
    }

    if (titulo.trim().length < 10) {
      Alert.alert('Atenção', 'O título deve ter pelo menos 10 caracteres.');
      return false;
    }

    if (!descricao.trim()) {
      Alert.alert('Atenção', 'Por favor, adicione uma descrição à sua pergunta.');
      return false;
    }

    if (!usuario?.id) {
      Alert.alert('Erro', 'Você precisa estar logado para criar uma pergunta.');
      return false;
    }

    return true;
  };

  const handleEnviar = async () => {
    if (!validarFormulario()) return;

    try {
      setEnviando(true);

      const novaPergunta = {
        palestraId: palestraId as string,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        palestraTitulo: palestraTitulo as string || 'Palestra',
      };

      await perguntasApi.criarPergunta(novaPergunta, usuario?.id || '', usuario?.nome || usuario?.email || '');

      Alert.alert(
        'Sucesso!',
        'Sua pergunta foi enviada com sucesso.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );

    } catch (error) {
      console.error('Erro ao criar pergunta:', error);
      Alert.alert('Erro', 'Não foi possível enviar sua pergunta. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const handleCancelar = () => {
    if (titulo.trim() || descricao.trim()) {
      Alert.alert(
        'Descartar pergunta?',
        'Você tem alterações não salvas. Deseja descartar?',
        [
          { text: 'Continuar editando', style: 'cancel' },
          { text: 'Descartar', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <HeaderTela titulo="Nova Pergunta" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitulo}>{palestraTitulo}</Text>
          </View>

          {/* Formulário */}
          <View style={styles.formulario}>
            {/* Campo Título */}
            <View style={styles.campoContainer}>
              <Text style={styles.label}>Título da Pergunta *</Text>
              <TextInput
                style={styles.inputTitulo}
                placeholder="Ex: Como implementar autenticação JWT?"
                placeholderTextColor="#94A3B8"
                value={titulo}
                onChangeText={setTitulo}
                maxLength={200}
                editable={!enviando}
              />
              <Text style={styles.contador}>
                {titulo.length}/200 caracteres
              </Text>
            </View>

            {/* Campo Descrição */}
            <View style={styles.campoContainer}>
              <Text style={styles.label}>Descrição (opcional)</Text>
              <TextInput
                style={styles.inputDescricao}
                placeholder="Adicione mais detalhes sobre sua pergunta..."
                placeholderTextColor="#94A3B8"
                value={descricao}
                onChangeText={setDescricao}
                maxLength={1000}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                editable={!enviando}
              />
              <Text style={styles.contador}>
                {descricao.length}/1000 caracteres
              </Text>
            </View>

            {/* Dica */}
            <View style={styles.dicaContainer}>
              <Text style={styles.dicaIcon}>💡</Text>
              <Text style={styles.dicaTexto}>
                Perguntas claras e objetivas têm mais chances de serem respondidas!
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Botões de ação */}
        <View style={styles.botoesContainer}>
          <TouchableOpacity
            style={[styles.botao, styles.botaoCancelar]}
            onPress={handleCancelar}
            disabled={enviando}
          >
            <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botao, styles.botaoEnviar, enviando && styles.botaoDesabilitado]}
            onPress={handleEnviar}
            disabled={enviando}
          >
            {enviando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.botaoEnviarTexto}>Enviar Pergunta</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerTitulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  headerSubtitulo: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  formulario: {
    padding: 20,
  },
  campoContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputTitulo: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
  },
  inputDescricao: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    minHeight: 150,
  },
  contador: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: 4,
  },
  dicaContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 8,
  },
  dicaIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  dicaTexto: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  botoesContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  botao: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoCancelar: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  botaoCancelarTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  botaoEnviar: {
    backgroundColor: '#1E88E5',
  },
  botaoEnviarTexto: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  botaoDesabilitado: {
    backgroundColor: '#94A3B8',
  },
});