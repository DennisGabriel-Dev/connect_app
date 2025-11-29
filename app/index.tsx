import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import TelaAuthContainer from "@/components/programacao/telaAuthContainer";
import { authStorage } from '@/services/programacao/authStorage';

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