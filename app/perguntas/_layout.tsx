import { Stack } from 'expo-router';

export default function PerguntasLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Perguntas' }} />
      <Stack.Screen name="criar" options={{ title: 'Criar Pergunta' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalhes da Pergunta' }} />
    </Stack>
  );
}