// app/sorteio/details.tsx
import { useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView } from "react-native";

export default function AdminUserDetailScreen() {
  const { data: usuarioString } = useLocalSearchParams<{ data: string }>();

  if (!usuarioString) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F3F4F6",
        }}
      >
        <Text style={{ fontSize: 16 }}>Usuário não encontrado.</Text>
      </View>
    );
  }

  const usuario = JSON.parse(usuarioString);

  const detalhes = usuario.detalhes ?? {};
  const feedbacks = detalhes.feedbacksList ?? [];
  const perguntas = detalhes.perguntasList ?? [];
  const presencas = detalhes.presencasList ?? [];
  const quizzes = detalhes.quizzesList ?? [];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F3F4F6", padding: 20 }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* CARD DO PERFIL */}
      <View
        style={{
          backgroundColor: "white",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111827" }}>
          {usuario.nome}
        </Text>
        <Text style={{ color: "#6B7280", marginTop: 4 }}>{usuario.email}</Text>
      </View>

      {/* CARD DO RESUMO */}
      <View
        style={{
          backgroundColor: "white",
          padding: 20,
          borderRadius: 12,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
          Resumo
        </Text>

        <Text>Total feedbacks: {usuario.feedbacks ?? 0}</Text>
        <Text>Total perguntas: {usuario.perguntas ?? 0}</Text>
        <Text>Total votos: {usuario.votosPerguntas ?? 0}</Text>
        <Text>Presenças: {usuario.presencas ?? 0}</Text>
        <Text>Score Quiz: {usuario.quizScore ?? 0}</Text>

        {/* FEEDBACKS */}
        <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 20 }}>
          Feedbacks
        </Text>
        {feedbacks.length === 0 ? (
          <Text style={{ color: "#6B7280" }}>Nenhum feedback.</Text>
        ) : (
          feedbacks.map((f: any, i: number) => <Text key={i}>• {f.comentario}</Text>)
        )}

        {/* PERGUNTAS */}
        <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 20 }}>
          Perguntas
        </Text>
        {perguntas.length === 0 ? (
          <Text style={{ color: "#6B7280" }}>Nenhuma pergunta.</Text>
        ) : (
          perguntas.map((p: any, i: number) => (
            <Text key={i}>
              • {p.texto} ({p.votos} votos)
            </Text>
          ))
        )}

        {/* PRESENÇAS */}
        <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 20 }}>
          Presenças
        </Text>
        {presencas.length === 0 ? (
          <Text style={{ color: "#6B7280" }}>Nenhuma presença registrada.</Text>
        ) : (
          presencas.map((p: any, i: number) => (
            <Text key={i}>• {p.palestraTitulo}</Text>
          ))
        )}

        {/* QUIZZES */}
        <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 20 }}>
          Quizzes
        </Text>
        {quizzes.length === 0 ? (
          <Text style={{ color: "#6B7280" }}>Nenhum quiz respondido.</Text>
        ) : (
          quizzes.map((q: any, i: number) => (
            <Text key={i}>• Score: {q.score}</Text>
          ))
        )}
      </View>
    </ScrollView>
  );
}
