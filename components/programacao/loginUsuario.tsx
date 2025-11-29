import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../services/auth/context';
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
  const { definirUsuario } = useAuth();

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
        // Salvar usuário logado no context
        definirUsuario(resultado.usuario);
        
        Alert.alert('Sucesso', 'Login realizado com sucesso!');
        onLoginSucesso?.();
        router.push('/(tabs)');
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
            <Image
              source={require('../../assets/images/logo-connect.png')}
              style={styles.logo}
            />
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
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textoBotaoFechar: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#475569',
  },
  conteudo: {
    padding: 32,
  },
   logo: {
    width: 280,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 40,
    textAlign: 'center',
    color: '#1E293B',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 20,
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
    marginBottom: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  botaoLogin: {
    backgroundColor: '#1E88E5',
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkCadastro: {
    marginTop: 24,
    alignItems: 'center',
  },
  textoLink: {
    fontSize: 15,
    color: '#64748B',
  },
  textoLinkDestaque: {
    color: '#1E88E5',
    fontWeight: '600',
  },
});