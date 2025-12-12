// app/sorteio/details.tsx
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { buscarDetalhesUsuario } from "../../services/sorteio/api";

export default function AdminUserDetailScreen() {
  const { data: usuarioString } = useLocalSearchParams<{ data: string }>();
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDetalhes() {
      if (!usuarioString) {
        setLoading(false);
        return;
      }

      try {
        const usuarioInicial = JSON.parse(usuarioString);
        
        // Se já tem detalhes, usa os dados passados
        if (usuarioInicial.detalhes) {
          setUsuario(usuarioInicial);
          setLoading(false);
          return;
        }

        // Caso contrário, busca os detalhes do backend
        // Isso garante que temos todos os dados, incluindo perguntasPremiadas
        const detalhesCompletos = await buscarDetalhesUsuario(usuarioInicial.id);
        // Mescla os dados iniciais com os detalhes completos para manter consistência
        setUsuario({
          ...usuarioInicial,
          ...detalhesCompletos,
          // Garante que perguntasPremiadas esteja presente
          perguntasPremiadas: detalhesCompletos.perguntasPremiadas ?? usuarioInicial.perguntasPremiadas ?? 0,
        });
      } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
        // Em caso de erro, tenta usar os dados básicos
        if (usuarioString) {
          setUsuario(JSON.parse(usuarioString));
        }
      } finally {
        setLoading(false);
      }
    }

    carregarDetalhes();
  }, [usuarioString]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F3F4F6",
        }}
      >
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={{ marginTop: 16, color: "#6B7280" }}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (!usuario) {
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
        
        {/* Informações de perfil */}
        {usuario.tipoUsuario && (
          <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
            <Text style={{ color: "#374151", fontSize: 14, fontWeight: "600" }}>
              Tipo: {usuario.tipoUsuario === 'publico_externo' && 'Público Externo'}
              {usuario.tipoUsuario === 'docente' && 'Docente'}
              {usuario.tipoUsuario === 'discente' && 'Discente'}
            </Text>
            {usuario.tipoUsuario === 'discente' && usuario.turma && (
              <Text style={{ color: "#374151", fontSize: 14, marginTop: 4 }}>
                Turma: {usuario.turma}
              </Text>
            )}
          </View>
        )}
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

        <View style={{ gap: 12 }}>
          {usuario.feedbacks > 0 && (
            <Text style={{ fontSize: 15, color: "#374151" }}>
              Feedbacks: <Text style={{ fontWeight: "600" }}>{usuario.feedbacks}</Text>
            </Text>
          )}
          {usuario.perguntas > 0 && (
            <Text style={{ fontSize: 15, color: "#374151" }}>
              Perguntas: <Text style={{ fontWeight: "600" }}>{usuario.perguntas}</Text>
            </Text>
          )}
          {(usuario.perguntasPremiadas ?? 0) > 0 && (
            <Text style={{ fontSize: 15, color: "#F59E0B" }}>
              Perguntas Premiadas: <Text style={{ fontWeight: "600" }}>{usuario.perguntasPremiadas || 0}</Text>
            </Text>
          )}
          {usuario.votosPerguntas > 0 && (
            <Text style={{ fontSize: 15, color: "#374151" }}>
              Votos: <Text style={{ fontWeight: "600" }}>{usuario.votosPerguntas}</Text>
            </Text>
          )}
          {usuario.presencas > 0 && (
            <Text style={{ fontSize: 15, color: "#374151" }}>
              Presenças: <Text style={{ fontWeight: "600" }}>{usuario.presencas}</Text>
            </Text>
          )}
          {usuario.quizScore > 0 && (
            <Text style={{ fontSize: 15, color: "#374151" }}>
              Score Quiz: <Text style={{ fontWeight: "600" }}>{usuario.quizScore}</Text>
            </Text>
          )}
        </View>

        {/* PRESENÇAS DETALHADAS - apenas se houver */}
        {presencas.length > 0 && (
          <>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 24, marginBottom: 12 }}>
              Presenças Registradas
            </Text>
            {presencas.map((p: any, i: number) => (
              <View key={i} style={{ 
                marginBottom: 12, 
                padding: 12, 
                backgroundColor: "#F9FAFB",
                borderRadius: 8,
                borderLeftWidth: 3, 
                borderLeftColor: "#1E88E5" 
              }}>
                <Text style={{ fontSize: 15, color: "#111827", fontWeight: "600" }}>
                  {p.palestraTitulo || `Palestra ${i + 1}`}
                </Text>
                {p.dataHora && (
                  <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
                    {new Date(p.dataHora).toLocaleString("pt-BR")}
                  </Text>
                )}
              </View>
            ))}
          </>
        )}

        {/* FEEDBACKS DETALHADOS - apenas se houver */}
        {feedbacks.length > 0 && (
          <>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 24, marginBottom: 12 }}>
              Feedbacks Enviados
            </Text>
            {feedbacks.map((f: any, i: number) => (
              <View key={i} style={{ 
                marginBottom: 12, 
                padding: 12, 
                backgroundColor: "#F9FAFB",
                borderRadius: 8,
                borderLeftWidth: 3, 
                borderLeftColor: "#10B981" 
              }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 4 }}>
                  {f.palestraTitulo || "Palestra não identificada"}
                </Text>
                {f.comentario && (
                  <Text style={{ fontSize: 14, color: "#374151", marginBottom: 4 }}>
                    {f.comentario}
                  </Text>
                )}
                {f.estrelas !== undefined && (
                  <Text style={{ fontSize: 12, color: "#6B7280" }}>
                    ⭐ {f.estrelas} estrelas
                  </Text>
                )}
              </View>
            ))}
          </>
        )}

        {/* PERGUNTAS DETALHADAS - apenas se houver */}
        {perguntas.length > 0 && (
          <>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 24, marginBottom: 12 }}>
              Perguntas Feitas
            </Text>
            {perguntas.map((p: any, i: number) => (
              <View key={i} style={{ 
                marginBottom: 12, 
                padding: 12, 
                backgroundColor: "#F9FAFB",
                borderRadius: 8,
                borderLeftWidth: 3, 
                borderLeftColor: p.status === 'premiada' ? "#F59E0B" : "#6366F1" 
              }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827", flex: 1 }}>
                    {p.palestraTitulo || "Palestra não identificada"}
                  </Text>
                  {p.status === 'premiada' && (
                    <View style={{ 
                      backgroundColor: "#FEF3C7", 
                      paddingHorizontal: 8, 
                      paddingVertical: 2, 
                      borderRadius: 4 
                    }}>
                      <Text style={{ fontSize: 11, color: "#F59E0B", fontWeight: "600" }}>
                        ⭐ PREMIADA
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 14, color: "#374151", marginBottom: 4, fontWeight: p.status === 'premiada' ? '600' : 'normal' }}>
                  {p.texto}
                </Text>
                {p.status === 'premiada' && (
                  <Text style={{ fontSize: 12, color: "#F59E0B", fontWeight: "600", marginTop: 4 }}>
                    ⭐ Esta pergunta foi premiada!
                  </Text>
                )}
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {p.votos !== undefined && (
                    <Text style={{ fontSize: 12, color: "#6B7280" }}>
                      👍 {p.votos} votos
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </>
        )}

        {/* QUIZZES DETALHADOS - apenas se houver */}
        {quizzes.length > 0 && (
          <>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 24, marginBottom: 12 }}>
              Quizzes Respondidos
            </Text>
            {quizzes.map((q: any, i: number) => (
              <View key={i} style={{ 
                marginBottom: 12, 
                padding: 12, 
                backgroundColor: "#F9FAFB",
                borderRadius: 8,
                borderLeftWidth: 3, 
                borderLeftColor: "#8B5CF6" 
              }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 4 }}>
                  {q.quizTitulo || "Quiz não identificado"}
                </Text>
                {q.palestraTitulo && (
                  <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
                    Palestra: {q.palestraTitulo}
                  </Text>
                )}
                <Text style={{ fontSize: 14, color: "#374151", fontWeight: "600" }}>
                  Score: {q.score || q.pontosObtidos || 0} pontos
                </Text>
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}