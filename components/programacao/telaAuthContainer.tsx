import React, { useState } from 'react';
import { View } from 'react-native';
import LoginUsuario from './loginUsuario';
import CadastroUsuario from './cadastroUsuario';

interface TelaAuthContainerProps {
  onLoginSucesso?: () => void;
  onFechar?: () => void;
}

export default function TelaAuthContainer({ onLoginSucesso, onFechar }: TelaAuthContainerProps) {
  const [telaAtual, setTelaAtual] = useState<'login' | 'cadastro'>('login');

  const alternarParaCadastro = () => {
    setTelaAtual('cadastro');
  };

  const alternarParaLogin = () => {
    setTelaAtual('login');
  };

  return (
    <View style={{ flex: 1 }}>
      {telaAtual === 'login' ? (
        <LoginUsuario
          onLoginSucesso={onLoginSucesso}
          onFechar={onFechar}
          onAlternarParaCadastro={alternarParaCadastro}
        />
      ) : (
        <CadastroUsuario
          onCadastroSucesso={onLoginSucesso} // Reutiliza o mesmo callback
          onFechar={onFechar}
          onAlternarParaLogin={alternarParaLogin}
        />
      )}
    </View>
  );
}