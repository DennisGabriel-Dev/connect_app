import { authStorage, UsuarioArmazenado } from '@/services/programacao/authStorage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Profile() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioArmazenado | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarUsuario();
  }, []);

  const carregarUsuario = async () => {
    try {
      const usuarioArmazenado = await authStorage.obterUsuario();
      setUsuario(usuarioArmazenado);
    } catch (erro) {
      console.error('Erro ao carregar usuário:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Sair',
        onPress: async () => {
          await authStorage.limpar();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (carregando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1e88e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.titulo}>Informações do Perfil</Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.label}>ID</Text>
          <Text style={styles.valor}>{usuario?.id || 'Não disponível'}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.valor}>{usuario?.email || 'Não disponível'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.botaoLogout} onPress={handleLogout}>
        <Text style={styles.textoBotao}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  infoContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  valor: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  botaoLogout: {
    backgroundColor: '#E53935',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
