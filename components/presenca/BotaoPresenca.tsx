import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { showAlert } from '../../utils/alert';
import { useAuth } from '../../services/auth/context';
import { presencaApi, PresencaCompleta } from '../../services/presenca/api';
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
  const [temPresenca, setTemPresenca] = useState(false);
  const [carregandoPresenca, setCarregandoPresenca] = useState(true);
  const { usuario: usuarioLogado } = useAuth();

  // Verificar se o usuário já tem presença registrada nesta atividade
  useEffect(() => {
    const verificarPresenca = async () => {
      if (!usuarioLogado?.id) {
        setCarregandoPresenca(false);
        return;
      }

      try {
        setCarregandoPresenca(true);
        const presencas = await presencaApi.listarPresencas(usuarioLogado.id);
        
        // Verificar se há presença para esta atividade/palestra
        const possuiPresenca = presencas.some(
          (presenca: PresencaCompleta) => presenca.palestraId === atividadeId
        );
        
        setTemPresenca(possuiPresenca);
      } catch (erro) {
        console.error('Erro ao verificar presença:', erro);
        setTemPresenca(false);
      } finally {
        setCarregandoPresenca(false);
      }
    };

    verificarPresenca();
  }, [usuarioLogado?.id, atividadeId]);

  const abrirCamera = async () => {
    if (!permission?.granted) {
      const resultado = await requestPermission();
      if (!resultado.granted) {
        showAlert('Permissão negada', 'É necessário permitir acesso à câmera para escanear QR codes');
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
        showAlert('Erro', 'Você precisa estar logado para registrar presença.');
        fecharModal();
        return;
      }

      // Extrair palestraId do QR code
      const palestraIdDoQr = extrairPalestraIdDoQrCode(dados);

      // Usar o palestraId do QR code, ou o atividadeId como fallback
      const palestraId = palestraIdDoQr;

      if (!palestraId) {
        showAlert('Erro', 'QR Code inválido. Não foi possível identificar a palestra/atividade.');
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
        showAlert('Erro', resposta.error);
        fecharModal();
      } else {
        showAlert('Sucesso', resposta.message || 'Presença registrada com sucesso!');
        
        // Atualizar estado para indicar que agora tem presença
        setTemPresenca(true);
        
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
      showAlert('Erro', erro.message || 'Falha ao registrar presença');
      console.error('Erro ao registrar presença:', erro);
      fecharModal();
    }
  };

  // Se estiver carregando a verificação de presença, mostrar loading
  if (carregandoPresenca) {
    return (
      <View style={[styles.botao, styles.botaoCarregando]}>
        <ActivityIndicator size="small" color="#FFFFFF" />
        <Text style={styles.textoBotao}>Verificando presença...</Text>
      </View>
    );
  }

  // Se já tiver presença, mostrar aviso verde
  if (temPresenca) {
    return (
      <View style={[styles.botao, styles.botaoComPresenca]}>
        <IconSymbol name="checkmark.seal.fill" size={24} color="#10B981" />
        <Text style={styles.textoBotaoPresenca}>Presença Registrada</Text>
      </View>
    );
  }

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
  botaoCarregando: {
    opacity: 0.8,
  },
  botaoComPresenca: {
    backgroundColor: '#E8F5E9',
    borderWidth: 0,
    borderColor: '#10B981',
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  textoBotaoPresenca: {
    color: '#10B981',
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
