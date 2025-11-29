import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../services/auth/context';
import { presencaApi } from '../../services/presenca/api';
import { extrairPalestraIdDoQrCode } from '../../services/presenca/qrcode';
import { IconSymbol } from '../ui/icon-symbol';

interface BotaoPresencaProps {
  atividadeId: string;
  onPresencaRegistrada?: (dados: any) => void;
}

export default function BotaoPresenca({ atividadeId, onPresencaRegistrada }: BotaoPresencaProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [modalVisivel, setModalVisivel] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [qrCodeScaneado, setQrCodeScaneado] = useState(false);
  const { usuario: usuarioLogado } = useAuth();

  const abrirCamera = async () => {
    if (!permission?.granted) {
      const resultado = await requestPermission();
      if (!resultado.granted) {
        Alert.alert('Permissão negada', 'É necessário permitir acesso à câmera para escanear QR codes');
        return;
      }
    }
    setModalVisivel(true);
  };

  const fecharModal = () => {
    setModalVisivel(false);
    setQrCodeScaneado(false);
    setCarregando(false);
  };

  const manipularQrCodeScaneado = async (dados: string) => {
    if (qrCodeScaneado) return;
    
    setQrCodeScaneado(true);
    setCarregando(true);

    try {
      console.log('QR Code escaneado:', dados);
      console.log('Atividade ID:', atividadeId);

      // Verificar se há usuário logado
      if (!usuarioLogado || !usuarioLogado.id) {
        Alert.alert('Erro', 'Você precisa estar logado para registrar presença.');
        fecharModal();
        return;
      }

      // Extrair palestraId do QR code
      const palestraIdDoQr = extrairPalestraIdDoQrCode(dados);

      // Usar o palestraId do QR code, ou o atividadeId como fallback
      const palestraId = palestraIdDoQr;

      if (!palestraId) {
        Alert.alert('Erro', 'QR Code inválido. Não foi possível identificar a palestra/atividade.');
        fecharModal();
        return;
      }

      // Registrar presença na API usando o ID do usuário logado
      console.log('Participante ID:', usuarioLogado.id);
      console.log('Palestra ID:', palestraId);
      const resposta = await presencaApi.registrarPresenca({
        participanteId: usuarioLogado.id,
        palestraId: palestraId,
      });

      if (resposta.error) {
        Alert.alert('Erro', resposta.error);
        fecharModal();
      } else {
        Alert.alert('Sucesso', resposta.message || 'Presença registrada com sucesso!');
        
        if (onPresencaRegistrada) {
          onPresencaRegistrada({ 
            qrCode: dados, 
            atividadeId: palestraId,
            presenca: resposta.presenca 
          });
        }

        fecharModal();
      }
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Falha ao registrar presença');
      console.error('Erro ao registrar presença:', erro);
      fecharModal();
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.botao} onPress={abrirCamera}>
        <IconSymbol name="camera.fill" size={24} color="#FFFFFF" />
        <Text style={styles.textoBotao}>Registrar Presença</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisivel}
        onRequestClose={fecharModal}
      >
        <View style={styles.container}>
          {carregando ? (
            <View style={styles.containerCarregando}>
              <ActivityIndicator size="large" color="#1e88e5" />
              <Text style={styles.textoCarregando}>Processando...</Text>
            </View>
          ) : (
            <>
              <CameraView
                style={styles.camera}
                onBarcodeScanned={({ data }) => manipularQrCodeScaneado(data)}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
              />
              <View style={styles.overlay}>
                <View style={styles.quadroQr} />
              </View>
              <View style={styles.rodape}>
                <Text style={styles.textoRodape}>Aponte a câmera para o QR code</Text>
                <TouchableOpacity
                  style={styles.botaoFechar}
                  onPress={fecharModal}
                >
                  <Text style={styles.textoBotaoFechar}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  botao: {
    backgroundColor: '#1e88e5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 12,
    flexDirection: 'row',
    gap: 8,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quadroQr: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#1e88e5',
    borderRadius: 12,
  },
  rodape: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    alignItems: 'center',
  },
  textoRodape: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  botaoFechar: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
  },
  textoBotaoFechar: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  containerCarregando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCarregando: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
  },
});
