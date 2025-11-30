import { Stack } from "expo-router";
import React from "react";
export default function SorteioLayout() {
  return (

    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#1E88E5" },
        headerTintColor: "white",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >

    
      <Stack.Screen
        name="index"
        options={{ title: "Painel do Sorteio " }}
      />
      <Stack.Screen
        name="details"
        options={{ title: "Detalhes do Usuário" }}
      />
      <Stack.Screen
        name="modal"
        options={{
          title: "Filtros",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
