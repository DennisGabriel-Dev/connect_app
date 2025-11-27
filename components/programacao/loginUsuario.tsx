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

interface LoginUsuarioProps {
  onLoginSucesso?: () => void;
  onFechar?: () => void;
  onAlternarParaCadastro?: () => void;
}

export default function LoginUsuario({
  onLoginSucesso,
  onAlternarParaCadastro
}: LoginUsuarioProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const manipularLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    const credenciais: CredenciaisLogin = { email, senha };

    setCarregando(true);
    try {
      const resultado = await apiAuth.login(credenciais);

      if (resultado.usuario) {
        Alert.alert('Sucesso', 'Login realizado com sucesso!');
        onLoginSucesso?.();
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

  const irParaCadastro = () => {
    onAlternarParaCadastro?.();
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
              Login
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

            <TouchableOpacity
              onPress={manipularLogin}
              disabled={carregando}
              style={[styles.botao, styles.botaoLogin]}
            >
              {carregando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.textoBotao}>
                  Fazer Login
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={irParaCadastro}
              style={styles.linkCadastro}
            >
              <Text style={styles.textoLink}>
                Não tem uma conta? <Text style={styles.textoLinkDestaque}>Cadastre-se</Text>
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
  conteudo: {
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#0B7730',
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
  botao: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  botaoLogin: {
    backgroundColor: '#0B7730',
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkCadastro: {
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