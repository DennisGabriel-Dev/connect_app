// app/sorteio/index.tsx
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
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

  async function gerarPDF() {
    if (usuarios.length === 0) {
      Alert.alert("Aviso", "Não há dados para gerar o PDF.");
      return;
    }

    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Relatório de Usuários</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                color: #333;
              }
              h1 {
                color: #1E88E5;
                border-bottom: 2px solid #1E88E5;
                padding-bottom: 10px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th {
                background-color: #1E88E5;
                color: white;
                padding: 12px;
                text-align: left;
                font-weight: bold;
              }
              td {
                padding: 10px;
                border-bottom: 1px solid #ddd;
              }
              tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              .header {
                margin-bottom: 30px;
              }
              .date {
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Relatório de Usuários - Painel Administrativo</h1>
              <p class="date">Gerado em: ${new Date().toLocaleString("pt-BR")}</p>
              <p>Total de usuários: ${usuarios.length}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Tipo</th>
                  <th>Feedbacks</th>
                  <th>Perguntas</th>
                  <th>Premiadas</th>
                  <th>Votos</th>
                  <th>Presenças</th>
                </tr>
              </thead>
              <tbody>
                ${usuarios
                  .map(
                    (user) => `
                  <tr>
                    <td>${user.nome || "-"}</td>
                    <td>${user.email || "-"}</td>
                    <td>${
                      user.tipoUsuario === "docente"
                        ? "Docente"
                        : user.tipoUsuario === "discente"
                        ? "Discente"
                        : user.tipoUsuario === "publico_externo"
                        ? "Público Externo"
                        : "-"
                    }</td>
                    <td>${user.feedbacks || 0}</td>
                    <td>${user.perguntas || 0}</td>
                    <td>${user.perguntasPremiadas || 0}</td>
                    <td>${user.votosPerguntas || 0}</td>
                    <td>${user.presencas || 0}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      // Verificar se o dispositivo suporta compartilhamento
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        // Compartilhar/baixar o PDF (permite salvar no dispositivo)
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Salvar relatório PDF',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert(
          "Aviso",
          "A funcionalidade de compartilhamento não está disponível neste dispositivo.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      Alert.alert("Erro", "Não foi possível gerar o PDF.");
    }
  }

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
      {/* Título + Botões — sem header duplicado */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111827" }}>
          Usuários
        </Text>

        <View style={{ flexDirection: "row", gap: 12 }}>
          {usuarios.length > 0 && (
            <TouchableOpacity
              onPress={gerarPDF}
              style={{
                backgroundColor: "#10B981",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <IconSymbol name="doc.text.fill" size={18} color="white" />
              <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
                PDF
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => router.push("/sorteio/modal")}
            style={{
              padding: 8,
              borderRadius: 8,
            }}
          >
            <IconSymbol name="line.3.horizontal.decrease.circle" size={24} color="#1E88E5" />
          </TouchableOpacity>
        </View>
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
              <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 4 }}>
                Feedbacks: {item.feedbacks}
              </Text>
              <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 4 }}>
                Perguntas: {item.perguntas}
              </Text>
              {item.perguntasPremiadas > 0 && (
                <Text style={{ fontSize: 14, color: "#F59E0B", marginBottom: 4, fontWeight: "600" }}>
                  Perguntas Premiadas: {item.perguntasPremiadas}
                </Text>
              )}
              <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 4 }}>
                Votos: {item.votosPerguntas}
              </Text>
              <Text style={{ fontSize: 14, color: "#6B7280" }}>
                Presenças: {item.presencas}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
