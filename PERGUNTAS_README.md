# Sistema de Perguntas para Palestras

## Funcionalidades Implementadas

### 1. **Tipos e Estruturas (services/perguntas/types.ts)**
- Adicionado enum `StatusPergunta` com estados: PENDENTE, APROVADA, REJEITADA
- Interface `Pergunta` atualizada com campo `status`
- Nova interface `AprovarRejeitarPerguntaDTO`

### 2. **API de Perguntas (services/perguntas/api.ts)**
- Sistema de curtidas com limite de 3 perguntas diferentes por usuário
- Gerenciamento local usando AsyncStorage
- Funções implementadas:
  - `obterCurtidasUsuario()` - busca curtidas do usuário
  - `adicionarCurtida()` - adiciona curtida com validação de limite
  - `removerCurtida()` - remove curtida
  - `verificarPodeCurtir()` - valida se usuário pode curtir
  - `aprovarPergunta()` - aprova pergunta (admin)
  - `rejeitarPergunta()` - rejeita pergunta (admin)

### 3. **Tela de Perguntas da Palestra (app/perguntas/palestra/[id].tsx)**
**Características:**
- ✅ Usa `useState` para gerenciar estado (perguntas, curtidas, modais)
- ✅ Usa `useEffect` para carregar dados
- ✅ Usa `FlatList` para listar perguntas
- ✅ Ordenação automática por número de curtidas (ranking)
- ✅ Contador de curtidas usadas (0/3)
- ✅ Modal para adicionar nova pergunta
- ✅ Sistema de curtidas com feedback visual
- ✅ Limite de 3 curtidas por usuário
- ✅ Perguntas aguardam aprovação antes de aparecer

**Componentes:**
- Lista de perguntas ordenada por curtidas
- Badge de ranking (#1, #2, #3...)
- Botão de curtir com ícone de coração
- Informações do autor
- Visualização de respostas (se houver)
- Botão flutuante para nova pergunta

### 4. **Tela de Gerenciamento Admin (app/perguntas/admin/gerenciar.tsx)**
**Características:**
- ✅ Filtros por status (Pendente, Aprovada, Rejeitada)
- ✅ Usa `FlatList` para listar perguntas
- ✅ Botões de aprovar/rejeitar
- ✅ Verificação de permissão de admin
- ✅ Confirmação antes de ações

**Funcionalidades:**
- Visualizar todas as perguntas pendentes
- Aprovar perguntas (tornam-se visíveis para todos)
- Rejeitar perguntas
- Ver histórico de perguntas aprovadas/rejeitadas

### 5. **Integração na Tela de Palestra (app/programacao/[id].tsx)**
- Botão "Ver Perguntas" adicionado
- Design roxo para destacar do botão de avaliação
- Navegação para tela de perguntas específica da palestra

## Como Funciona

### Fluxo do Usuário:
1. Usuário entra na palestra
2. Clica em "Ver Perguntas"
3. Vê perguntas aprovadas ordenadas por curtidas
4. Pode curtir até 3 perguntas diferentes
5. Pode adicionar nova pergunta (vai para aprovação)

### Fluxo do Admin:
1. Acessa tela de gerenciamento
2. Vê perguntas pendentes
3. Aprova ou rejeita cada pergunta
4. Perguntas aprovadas aparecem para todos

### Sistema de Curtidas:
- Máximo 3 curtidas por usuário
- Pode descurtir para curtir outra
- Perguntas ordenadas automaticamente por número de curtidas
- Ranking visual com badges

## Tecnologias Usadas
- ✅ **useState** - gerenciamento de estado
- ✅ **useEffect** - carregamento de dados
- ✅ **FlatList** - listagem eficiente
- ✅ AsyncStorage - persistência local
- ✅ React Native Modal
- ✅ Expo Router para navegação

## Observações
- Sistema de aprovação/rejeição simulado localmente (backend não tem endpoints específicos)
- Curtidas armazenadas localmente no dispositivo
- Design responsivo e acessível
- Feedback visual em todas as ações
