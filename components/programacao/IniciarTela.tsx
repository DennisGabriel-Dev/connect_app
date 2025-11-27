import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import TelaAuthContainer from '../../components/programacao/telaAuthContainer';

export default function IniciarTela() {
  const router = useRouter();

  const handleLoginSucesso = () => {
    console.log('Autenticação bem-sucedida!');
  };

  const handleFechar = () => {
    router.back(); // Volta para tela anterior
  };

  return (  
     <View style={{ flex: 1 }}>
      <TelaAuthContainer
        onLoginSucesso={handleLoginSucesso}
        onFechar={handleFechar}
      />
    </View>
     
  );
}