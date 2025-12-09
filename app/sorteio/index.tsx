// app/sorteio/index.tsx
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../../components/ui/icon-symbol";
import { listarTudo } from "../../services/sorteio/api";

export default function AdminUserListScreen() {
  const { filtros } = useLocalSearchParams();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregar(filtrosAplicados: any = {}) {
    try {
      setLoading(true);
      const data = await listarTudo(filtrosAplicados);
      setUsuarios(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (filtros) {
      const filtrosString = Array.isArray(filtros) ? filtros[0] : filtros;
      carregar(JSON.parse(filtrosString));
    } else {
      carregar({});
    }
  }, [filtros]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F3F4F6",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="#2563EB" size="large" />
        <Text>Carregando usuários...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F4F6", padding: 20 }}>
      {/* Título + Botão — sem header duplicado */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111827" }}>
          Usuários
        </Text>



        <TouchableOpacity
          onPress={() => router.push("/sorteio/modal")}
          style={{
            backgroundColor: "#1E88E5'",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <IconSymbol name="line.3.horizontal.decrease.circle" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* LISTA */}
      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/sorteio/details",
                params: { data: JSON.stringify(item) },
              })
            }
            style={{
              backgroundColor: "white",
              padding: 16,
              marginBottom: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>
              {item.nome}
            </Text>
            <Text style={{ color: "#6B7280" }}>{item.email}</Text>

            {/* Informações de perfil */}
            {item.tipoUsuario && (
              <Text style={{ color: "#4B5563", marginTop: 6, fontSize: 13 }}>
                {item.tipoUsuario === 'publico_externo' && 'Público Externo'}
                {item.tipoUsuario === 'docente' && 'Docente'}
                {item.tipoUsuario === 'discente' && 'Discente'}
                {item.tipoUsuario === 'discente' && item.turma && ` - ${item.turma}`}
              </Text>
            )}

            <View style={{ marginTop: 10 }}>
              <Text>Feedbacks: {item.feedbacks}</Text>
              <Text>Perguntas: {item.perguntas}</Text>
              <Text>Votos: {item.votosPerguntas}</Text>
              <Text>Presenças: {item.presencas}</Text>
              <Text style={{ fontWeight: "bold", marginTop: 4 }}>
                Pontuação total: {item.scoreTotal}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
