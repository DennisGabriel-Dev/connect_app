import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/services/auth/context';
import { authStorage } from '@/services/programacao/authStorage';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Profile() {
  const router = useRouter();
  const { usuario } = useAuth();


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
      >
        <View style={styles.card}>
          <Text style={styles.titulo}>Informações do Perfil</Text>
          
          {/* <View style={styles.infoContainer}>
            <Text style={styles.label}>ID</Text>
            <Text style={styles.valor}>{usuario?.id || 'Não disponível'}</Text>
          </View> */}

          <View style={styles.infoContainer}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.valor}>{usuario?.email || 'Não disponível'}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.botaoAvaliacoes} 
          onPress={() => router.push('/feedback/minhas-avaliacoes')}
        >
          <IconSymbol size={20} name="star.fill" color="#FFFFFF" style={styles.icone} />
          <Text style={styles.textoBotaoAvaliacoes}>Minhas Avaliações</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.botaoPresencas} 
          onPress={() => router.push('/presenca/minhas-presencas')}
        >
          <IconSymbol size={20} name="checkmark.circle.fill" color="#FFFFFF" style={styles.icone} />
          <Text style={styles.textoBotaoPresencas}>Minhas Presenças</Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.botaoLogout} onPress={handleLogout}>
          <IconSymbol size={20} name="arrow.right.square.fill" color="#FFFFFF" style={styles.icone} />
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
  botaoAvaliacoes: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icone: {
    marginRight: 8,
  },
  textoBotaoAvaliacoes: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  botaoPresencas: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  textoBotaoPresencas: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  botaoLogout: {
    backgroundColor: '#E53935',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
