import { Stack } from "expo-router";

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
      <Text>oii</Text>
    
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
