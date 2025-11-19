# Bem vindo(a) ao Connect app 👋

Este repositório foi construído usando o expo.

## Para começar:
1. Clone o projeto:

   ```bash
   git clone git@github.com:DennisGabriel-Dev/connect_app.git
   ```

2. Instale as depedências:

   ```bash
   npm install
   ```

3. Startando o projeto

   ```bash
   npm run start
   ```

## Importante:
Para contribuir com a aplicação, abra apenas um PR com todo o código produzido pela equipe.<br>
Sugestão de nomeclatura das branchs: se seu grupo for de QRCode por exemplo, você pode usar a seguinte nomeclatura na branch e PR: ```qr_code-feat-xpto```<br>
Por favor, ao abrir o PR, faça uma descrição clara do que foi feito com fotos(se tratando de telas construídas). Isso vai facilitar a revisão de código e agilizar o merge.<br>


### Estrutura Detalhada Recomendada:
```
/app
  /(tabs)              # Navegação principal (coordenador)
    _layout.tsx
    index.tsx          # Home com links para funcionalidades
    explore.tsx
  /perguntas           # Grupo Perguntas
    _layout.tsx        # Layout do grupo (opcional)
    index.tsx          # Lista de perguntas
    criar.tsx          # Criar nova pergunta
    [id].tsx           # Detalhes da pergunta (dynamic route)
  /sorteio             # Grupo Sorteio
    index.tsx
    realizar.tsx
  /presenca            # Grupo Presença
    index.tsx
    qrcode.tsx
  /feedback            # Grupo Feedback
    index.tsx
    enviar.tsx
  /quiz                # Grupo Quiz
    index.tsx
    [id].tsx
  /programacao         # Grupo Programação
    index.tsx
    [id].tsx

/services
  /perguntas
    api.ts             # Chamadas API
    storage.ts         # Armazenamento local
    types.ts           # Tipos TypeScript
  /sorteio
    api.ts
    utils.ts
  /presenca
    qrcode.ts
    api.ts
  ...

/components
  /perguntas           # Componentes específicos do grupo
    PerguntaCard.tsx
  /sorteio
    SorteioButton.tsx
  /shared              # Componentes compartilhados
    Button.tsx
    Input.tsx
    ...
```

## Regras para os Grupos

1. **Cada grupo trabalha apenas em sua pasta** (`/app/[seu-grupo]` e `/services/[seu-grupo]`)
2. **Não modificar arquivos de outros grupos** sem coordenação
3. **Componentes compartilhados** vão em `/components/shared`
4. **Nomenclatura**: Usar nomes descritivos e consistentes

Pensando no mínimo de conflitos possível, cada grupo vai criar o seu diretório de telas e serviços(se necessário). Isso irá facilitar o merge. Os nomes são meramente ilustrativos, você pode mudar o nome, mas se preocupe em separar o código.

## Bom desenvolvimento a todos :)
