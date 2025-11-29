// Serviços de QR Code para presença

/**
 * Formato do QR Code (apenas palestraId):
 * connectapp://presenca?palestraId=YYY
 * 
 * Ou formato HTTP (para testes):
 * http://192.168.3.30:5000/api/v1/presenca/qr?palestraId=YYY
 */

export interface DadosQrCode {
  palestraId: string;
}

/**
 * Gera a URL para o QR code (apenas com palestraId)
 */
export function gerarUrlQrCode(palestraId: string): string {
  // Usando deep link do app (recomendado)
  return `connectapp://presenca?palestraId=${palestraId}`;
}

/**
 * Gera a URL HTTP para o QR code (alternativa para testes)
 */
export function gerarUrlHttpQrCode(palestraId: string, baseUrl: string = 'http://192.168.3.30:5000'): string {
  return `${baseUrl}/api/v1/presenca/qr?palestraId=${palestraId}`;
}

/**
 * Extrai o palestraId do QR code lido
 * Suporta tanto deep link (connectapp://) quanto URL HTTP
 */
export function extrairPalestraIdDoQrCode(qrCodeData: string): string | null {
  try {
    // Formato deep link: connectapp://presenca?palestraId=YYY
    if (qrCodeData.startsWith('connectapp://presenca')) {
      const url = new URL(qrCodeData.replace('connectapp://', 'http://'));
      const palestraId = url.searchParams.get('palestraId');
      return palestraId;
    }

    // Formato HTTP: http://...?palestraId=YYY
    if (qrCodeData.startsWith('http://') || qrCodeData.startsWith('https://')) {
      const url = new URL(qrCodeData);
      const palestraId = url.searchParams.get('palestraId');
      return palestraId;
    }

    // Formato JSON direto (alternativa)
    if (qrCodeData.startsWith('{')) {
      const dados = JSON.parse(qrCodeData);
      if (dados.palestraId) {
        return dados.palestraId;
      }
    }

    // Se for apenas o ID direto (sem URL)
    if (qrCodeData.length > 0 && !qrCodeData.includes('://')) {
      return qrCodeData;
    }

    return null;
  } catch (erro) {
    console.error('Erro ao extrair palestraId do QR code:', erro);
    return null;
  }
}
