import TelaAuthContainer from "@/components/programacao/telaAuthContainer";
import { authStorage } from '@/services/programacao/authStorage';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const verificarAutenticacao = async () => {
      const estaAutenticado = await authStorage.estaAutenticado();
      if (estaAutenticado) {
        router.replace('/(tabs)');
      }
    };
    verificarAutenticacao();
  }, []);

  return <TelaAuthContainer />
}