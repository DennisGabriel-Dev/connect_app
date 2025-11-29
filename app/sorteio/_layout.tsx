import { Stack } from "expo-router";

export default function SorteioLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#2563EB" },
        headerTintColor: "white",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Painel do Sorteio" }}
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
