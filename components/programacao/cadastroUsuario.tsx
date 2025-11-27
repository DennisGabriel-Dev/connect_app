import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiAuth, CredenciaisLogin } from '../../services/programacao/api'; 

interface CadastroUsuarioProps {
  onCadastroSucesso?: () => void;
  onFechar?: () => void;
  onAlternarParaLogin?: () => void;
}

export default function CadastroUsuario({
  onCadastroSucesso,
  onAlternarParaLogin
}: CadastroUsuarioProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const validarCampos = () => {
    if (!email || !senha || !confirmarSenha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return false;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }

    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return false;
    }

    return true;
  };

  const manipularCadastro = async () => {
    if (!validarCampos()) {
      return;
    }

    const credenciais: CredenciaisLogin = { email, senha };

    setCarregando(true);
    try {
      const resultado = await apiAuth.cadastrar(credenciais);

      if (resultado.message) {
        Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
        onCadastroSucesso?.();
        router.push('/programacao');
      } else {
        Alert.alert('Erro', resultado.erro || 'Erro desconhecido');
      }
    } catch (erro: any) {
      Alert.alert('Erro', erro.message);
    } finally {
      setCarregando(false);
    }
  };

  const irParaLogin = () => {
    onAlternarParaLogin?.();
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.conteudo}>
            <Text style={styles.titulo}>
              Criar Cadastro
            </Text>

            <Text style={styles.subtitulo}>
              Preencha os dados abaixo para criar sua conta
            </Text>

            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              placeholderTextColor="#999"
            />

            <TextInput
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#999"
            />

            <TextInput
              placeholder="Confirmar Senha"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#999"
            />

            <View style={styles.dicasSenha}>
              <Text style={styles.textoDica}>
                • A senha deve ter pelo menos 6 caracteres
              </Text>
            </View>

            <TouchableOpacity
              onPress={manipularCadastro}
              disabled={carregando}
              style={[styles.botao, styles.botaoCadastro]}
            >
              {carregando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.textoBotao}>
                  Criar Conta
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={irParaLogin}
              style={styles.linkLogin}
            >
              <Text style={styles.textoLink}>
                Já tem uma conta? <Text style={styles.textoLinkDestaque}>Fazer Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  botaoFechar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  textoBotaoFechar: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  botaoVoltar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 1001,
  },
  textoBotaoVoltar: {
    fontSize: 16,
    color: '#0B7730',
    fontWeight: '500',
  },
  conteudo: {
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#0B7730',
  },
  subtitulo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  dicasSenha: {
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  textoDica: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  botao: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  botaoCadastro: {
    backgroundColor: '#0B7730',
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkLogin: {
    marginTop: 20,
    alignItems: 'center',
  },
  textoLink: {
    fontSize: 14,
    color: '#666',
  },
  textoLinkDestaque: {
    color: '#0B7730',
    fontWeight: '600',
  },
});