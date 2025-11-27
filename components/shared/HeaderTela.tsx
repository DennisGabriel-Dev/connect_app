// components/layout/HeaderTela.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

interface HeaderTelaProps {
  titulo: string;
  textoBotaoVoltar?: string;
  corFundo?: string;
  corTexto?: string;
}

/**
 * Componente de header reutilizável para todas as telas
 */
export const HeaderTela: React.FC<HeaderTelaProps> = ({
  titulo,
  textoBotaoVoltar = 'Voltar',
  corFundo = '#0B7730',
  corTexto = '#FFFFFF',
}) => {
  return (
    <Stack.Screen 
      options={{
        title: titulo,
        headerBackTitle: textoBotaoVoltar,
        headerStyle: {
          backgroundColor: corFundo,
        },
        headerTintColor: corTexto,
        headerTitleStyle: {
          color: corTexto,
        },
      }} 
    />
  );
};

const styles = StyleSheet.create({
  // Estilos podem ser adicionados aqui
});