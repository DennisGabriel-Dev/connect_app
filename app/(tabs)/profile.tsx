import { useAuth } from '@/services/auth/context';
import { apiProgramacao, Atividade } from '@/services/programacao/api';
import PresencaCard from '@/components/presenca/PresencaCard';
import { authStorage } from '@/services/programacao/authStorage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Profile() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [palestras, setPalestras] = useState<(Atividade & { dataHoraPresenca?: string; sincronizado?: boolean })[]>([]);
  const [carregandoPresencas, setCarregandoPresencas] = useState(false);

  const carregarPalestras = useCallback(async () => {
    if (!usuario?.id) return;
    
    setCarregandoPresencas(true);
    try {
      const palestrasLista = await apiProgramacao.buscarPalestrasPorParticipante(usuario.id);
      console.log('Palestras recebidas da API:', palestrasLista);
      setPalestras(palestrasLista);
    } catch (erro) {
      console.error('Erro ao carregar palestras:', erro);
    } finally {
      setCarregandoPresencas(false);
    }
  }, [usuario?.id]);

  // Recarregar presenças sempre que a tela receber foco
  useFocusEffect(
    useCallback(() => {
      if (usuario?.id) {
        carregarPalestras();
      }
    }, [usuario?.id, carregarPalestras])
  );


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

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={carregandoPresencas}
            onRefresh={carregarPalestras}
            colors={['#1e88e5']}
          />
        }
      >
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

        <View style={styles.secaoPresencas}>
          <Text style={styles.tituloSecao}>Minhas Presenças</Text>
          
          {carregandoPresencas ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#1e88e5" />
            </View>
          ) : palestras.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma presença registrada ainda.</Text>
            </View>
          ) : (
            palestras.map((palestra) => (
              <PresencaCard key={palestra.id} palestra={palestra} />
            ))
          )}
        </View>

        <TouchableOpacity style={styles.botaoLogout} onPress={handleLogout}>
          <Text style={styles.textoBotao}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
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
    padding: 20,
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
  secaoPresencas: {
    marginBottom: 20,
  },
  tituloSecao: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  botaoLogout: {
    backgroundColor: '#E53935',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
