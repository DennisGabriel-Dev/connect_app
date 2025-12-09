import { Stack } from 'expo-router';
import React from 'react';

export default function PerguntasLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="criar" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}