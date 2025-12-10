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
  Platform,
  Modal,
  FlatList
} from 'react-native';

interface PerfilFormProps {
  usuarioId: string;
  onPerfilCompleto: () => void;
}

export default function PerfilForm({ usuarioId, onPerfilCompleto }: PerfilFormProps) {
  const [tipoUsuario, setTipoUsuario] = useState<string>('');
  const [turma, setTurma] = useState<string>('');
  const [carregando, setCarregando] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);

  // Opções de turmas disponíveis
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

  const selecionarTurma = (turmaSelecionada: string) => {
    setTurma(turmaSelecionada);
    setModalVisivel(false);
  };

  const handleSubmit = async () => {
    if (!tipoUsuario) {
      Alert.alert('Erro', 'Por favor, selecione o tipo de usuário');
      return;
    }

    if (tipoUsuario === 'discente' && !turma) {
      Alert.alert('Erro', 'Por favor, selecione a turma');
      return;
    }

    setCarregando(true);
    try {
      const { apiPerfil } = await import('../../services/perfil/api');
      await apiPerfil.atualizarPerfil(usuarioId, {
        tipoUsuario,
        turma: tipoUsuario === 'discente' ? turma : undefined
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
    // Correção aqui, KeyboardAvoidingView com behavior = height estava causando tremedeira na tela em alguns dispositivos, como não há mais inputs do teclado, removi o KeyboardAvoidingView
    <View style={styles.container}>
    {/* <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.container}
    >  */}
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
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={() => setModalVisivel(true)}
              >
                <Text style={turma ? styles.selectText : styles.selectPlaceholder}>
                  {turma || 'Selecione a turma...'}
                </Text>
                <Text style={styles.selectIcon}>▼</Text>
              </TouchableOpacity>
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

      {/* Modal de seleção de turma */}
      <Modal
        visible={modalVisivel}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisivel(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisivel(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Selecione a Turma</Text>
              <TouchableOpacity 
                onPress={() => setModalVisivel(false)}
                style={styles.modalBotaoFechar}
              >
                <Text style={styles.modalTextoFechar}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={turmasDisponiveis}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOpcao,
                    turma === item && styles.modalOpcaoSelecionada
                  ]}
                  onPress={() => selecionarTurma(item)}
                >
                  <Text style={[
                    styles.modalOpcaoTexto,
                    turma === item && styles.modalOpcaoTextoSelecionada
                  ]}>
                    {item}
                  </Text>
                  {turma === item && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
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
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  selectText: {
    fontSize: 16,
    color: '#334155',
  },
  selectPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  selectIcon: {
    fontSize: 12,
    color: '#64748B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: '70%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalBotaoFechar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTextoFechar: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: 'bold',
  },
  modalOpcao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalOpcaoSelecionada: {
    backgroundColor: '#EBF5FF',
  },
  modalOpcaoTexto: {
    fontSize: 16,
    color: '#334155',
  },
  modalOpcaoTextoSelecionada: {
    color: '#1E88E5',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 20,
    color: '#1E88E5',
    fontWeight: 'bold',
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
