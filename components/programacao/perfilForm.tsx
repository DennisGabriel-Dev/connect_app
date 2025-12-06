import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

interface PerfilFormProps {
  usuarioId: string;
  onPerfilCompleto: () => void;
}

export default function PerfilForm({ usuarioId, onPerfilCompleto }: PerfilFormProps) {
  const [tipoUsuario, setTipoUsuario] = useState<string>('');
  const [turma, setTurma] = useState<string>('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async () => {
    if (!tipoUsuario) {
      Alert.alert('Erro', 'Por favor, selecione o tipo de usuário');
      return;
    }

    if (tipoUsuario === 'discente' && !turma.trim()) {
      Alert.alert('Erro', 'Por favor, informe a turma');
      return;
    }

    setCarregando(true);
    try {
      const { apiPerfil } = await import('../../services/perfil/api');
      await apiPerfil.atualizarPerfil(usuarioId, {
        tipoUsuario,
        turma: tipoUsuario === 'discente' ? turma.trim() : undefined
      });

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      onPerfilCompleto();
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Erro ao salvar perfil');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.conteudo}>
          <Text style={styles.titulo}>Complete seu Perfil</Text>
          <Text style={styles.subtitulo}>
            Precisamos de mais algumas informações sobre você
          </Text>

          <Text style={styles.label}>Você é:</Text>
          
          <TouchableOpacity
            style={[
              styles.opcao,
              tipoUsuario === 'publico_externo' && styles.opcaoSelecionada
            ]}
            onPress={() => setTipoUsuario('publico_externo')}
          >
            <View style={styles.radio}>
              {tipoUsuario === 'publico_externo' && <View style={styles.radioPreenchido} />}
            </View>
            <Text style={styles.textoOpcao}>Público Externo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.opcao,
              tipoUsuario === 'docente' && styles.opcaoSelecionada
            ]}
            onPress={() => setTipoUsuario('docente')}
          >
            <View style={styles.radio}>
              {tipoUsuario === 'docente' && <View style={styles.radioPreenchido} />}
            </View>
            <Text style={styles.textoOpcao}>Docente</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.opcao,
              tipoUsuario === 'discente' && styles.opcaoSelecionada
            ]}
            onPress={() => setTipoUsuario('discente')}
          >
            <View style={styles.radio}>
              {tipoUsuario === 'discente' && <View style={styles.radioPreenchido} />}
            </View>
            <Text style={styles.textoOpcao}>Discente</Text>
          </TouchableOpacity>

          {tipoUsuario === 'discente' && (
            <View style={styles.campoTurma}>
              <Text style={styles.label}>Turma:</Text>
              <TextInput
                placeholder="Ex: ADS 2025.2"
                value={turma}
                onChangeText={setTurma}
                style={styles.input}
                placeholderTextColor="#999"
                autoCapitalize="words"
              />
            </View>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={carregando}
            style={[styles.botao, carregando && styles.botaoDesabilitado]}
          >
            {carregando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.textoBotao}>Continuar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  conteudo: {
    padding: 32,
  },
  titulo: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    color: '#1E293B',
  },
  subtitulo: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 16,
    marginTop: 8,
  },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  opcaoSelecionada: {
    borderColor: '#1E88E5',
    backgroundColor: '#EBF5FF',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#94A3B8',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioPreenchido: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1E88E5',
  },
  textoOpcao: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  campoTurma: {
    marginTop: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 8,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  botao: {
    padding: 18,
    borderRadius: 12,
    marginTop: 32,
    alignItems: 'center',
    backgroundColor: '#1E88E5',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  botaoDesabilitado: {
    backgroundColor: '#94A3B8',
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
