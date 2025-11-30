import { LoadingScreen } from '@/components/shared/LoadingScreen';
import TelaAuthContainer from '@/components/programacao/telaAuthContainer';
import { authStorage } from '@/services/programacao/authStorage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

export default function Index() {
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const verificarAutenticacao = async () => {
      const estaAutenticado = await authStorage.estaAutenticado();
      if (estaAutenticado) {
        router.replace('/(tabs)');
      } else {
        setVerificando(false);
      }
    };
    verificarAutenticacao();
  }, []);

  if (verificando) {
    return <LoadingScreen />;
  }

  return <TelaAuthContainer />;
}
