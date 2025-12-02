// components/layout/HeaderTela.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderTelaProps {
  titulo: string;
  corFundo?: string;
  corTexto?: string;
  onVoltar?: () => void;
}

/**
 * Componente de header reutilizável para todas as telas
 */
export const HeaderTela: React.FC<HeaderTelaProps> = ({
  titulo,
  corFundo = '#1E88E5',
  corTexto = '#FFFFFF',
}) => {
  const router = useRouter();

  return (
    <View style={[styles.header, { backgroundColor: corFundo }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.botaoVoltar}>
        <Ionicons name="arrow-back" size={24} color={corTexto} />
      </TouchableOpacity>
      <Text style={[styles.titulo, { color: corTexto }]}>{titulo}</Text>
      <View style={{ width: 40 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  botaoVoltar: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
});