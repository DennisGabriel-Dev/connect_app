[33mcommit bcc1aba25f937715064faeed80939f1bede38171[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mperguntas-feat-funcionalidade-voto[m[33m, [m[1;31morigin/perguntas-feat-funcionalidade-voto[m[33m)[m
Author: Savio Henrique <saviobarradas@gmail.com>
Date:   Mon Dec 8 22:58:45 2025 -0300

    feat(app): implementar interface de votação em perguntas
    Frontend:
    - Criar telas de listagem e detalhes de perguntas
    - Implementar componente PerguntaCard reutilizável
    - Adicionar service perguntasApi com todas as chamadas
    - Atualizar types com interface Pergunta completa
    Telas implementadas:
    - app/perguntas/index.tsx - lista com ranking e filtros
    - app/perguntas/[id].tsx - detalhes da pergunta
    - app/perguntas/criar.tsx - formulário de criação
    Componentes:
    - PerguntaCard - card com estados visuais (normal/votado/limite/autor)
    - Header com contador de votos usados (X/3)
    - Botão de voto com 4 estados visuais
    Funcionalidades:
    ✅ Toggle voto com optimistic updates
    ✅ Sincronização bidirecional lista ↔ detalhes (useFocusEffect)
    ✅ Contador visual de votos (💙 Votos: X/3)
    ✅ Limite de 3 votos com feedback clicável
    ✅ Badge 'Sua pergunta' para perguntas do autor
    ✅ Validação de auto-voto com alert
    ✅ Ranking automático por número de votos
    ✅ Estado de carregamento para evitar flash visual
    UI/UX:
    - Botão desabilitado visualmente quando limite atingido
    - Alert explicativo ao clicar em botão de limite
    - Cores: azul (pode votar), vermelho (votado), cinza (limite)
    - Badges: autor (roxo), respondida (verde), top votada (dourado)
    Files modified:
    - services/perguntas/api.ts
    - services/perguntas/types.ts
    - app/perguntas/index.tsx
    - app/perguntas/[id].tsx
    - components/perguntas/PerguntaCard.tsx
    - app/programacao/[id].tsx (adicionar botão Perguntas)

[33mcommit 108cd37be87f490f7034cf542a906df2439ef653[m[33m ([m[1;32mmain[m[33m)[m
Merge: d4a2773 508732e
Author: Lauanderson Rael <100454015+lauanderson-rael@users.noreply.github.com>
Date:   Fri Dec 5 12:28:36 2025 -0300

    Merge pull request #39 from DennisGabriel-Dev/feat/melhorias-ui-e-integracoes
    
    fix: Corrige sobreposição de interface com botões de navegação do dispositivo

[33mcommit 508732e19a6da7dcb9182fad2fa458248ed12bbe[m
Author: lauanderson-rael <lauanderson38@gmail.com>
Date:   Fri Dec 5 12:24:34 2025 -0300

    fix: Corrige sobreposição de interface com botões de navegação do dispositivo

[33mcommit d4a2773f8ed063d0be9f42d4b36341e79d765331[m
Merge: b96ddf5 fce331f
Author: Lauanderson Rael <100454015+lauanderson-rael@users.noreply.github.com>
Date:   Fri Dec 5 10:33:51 2025 -0300

    Merge pull request #32 from DennisGabriel-Dev/feat/sorteio-filtros
    
    feat : adicionando filtros ao sorteio

[33mcommit b96ddf5b849420b1e9471264956bbe512a338c6e[m
Merge: d7f50a7 4d8db8a
Author: Dennis Gabriel <dennisgabr745@gmail.com>
Date:   Thu Dec 4 19:25:06 2025 -0300

    Merge pull request #38 from DennisGabriel-Dev/feat/melhorias-ui-e-integracoes
    
    Melhorias de interface e experiencia do usuário

[33mcommit 4d8db8a6955c4688f3f345b0c33cc758f1572f00[m
Author: lauanderson-rael <lauanderson38@gmail.com>
Date:   Thu Dec 4 15:54:13 2025 -0300

    fix: melhorias de interface e experiencia do usuário

[33mcommit d7f50a77ee52a99d0b22945ff298b54bd2becf90[m
Merge: aa7536c 6ae5dab
Author: Dennis Gabriel <dennisgabr745@gmail.com>
Date:   Thu Dec 4 12:25:45 2025 -0300

    Merge pull request #37 from DennisGabriel-Dev/programacao-feat-login-atividades
    
    Programacao feat login atividades

[33mcommit 6ae5dabe3c9cfabb73a681a87651493b0dceb7a7[m[33m ([m[1;31morigin/programacao-feat-login-atividades[m[33m)[m
Author: Igor Ryan <igorsonic56@gmail.com>
Date:   Thu Dec 4 11:49:06 2025 -0300

    Adicionando restrição ao painel adm

[33mcommit 8bde415b678bb9adc7e313fb751fbb1fa32b5efd[m
Author: lauanderson-rael <lauanderson38@gmail.com>
Date:   Thu Dec 4 07:17:57 2025 -0300

    feat: adiciona filtro dinâmico por dia na programação

[33mcommit 615a685f5d0b9b468c80194d9364b2d51c5ca084[m
Author: Rian Lucas <rianlucas1638@gmail.com>
Date:   Tue Dec 2 19:59:13 2025 -0300

    Agora em ambas as páginas (detalhes da atividade e ver avaliações), o usuário verá claramente quando já avaliou um evento, impedindo avaliações duplicadas.

[33mcommit 0429d8ca8ece30e53d45e7dd06497f6b94b2a93a[m
Author: Carlos William <carloswilliamwilliam7almeida@gmail.com>
Date:   Wed Dec 3 00:16:51 2025 -0300

    Adicionando botão meus quizzes no profile e criando tela de quizzes respondidos e pendentes

[33mcommit 72b64d2e26f2f33ebef60f4215f9cb8d236d1ca1[m
Author: yurepires <contato.yurepires@gmail.com>
Date:   Tue Dec 2 16:08:42 2025 -0300

    fix: Bloqueio de acesso ao quiz se a presença ainda não foi confirmada

[33mcommit aa7536cd4fafb092bc3e4a9f9d7811e87af10fbe[m
Merge: 9fcf6d2 400baaa
Author: Dennis Gabriel <dennisgabr745@gmail.com>
Date:   Thu Dec 4 07:27:58 2025 -0300

    Merge pull request #36 from DennisGabriel-Dev/feat/melhorias-ui-e-integracoes
    
    feat: Implementa filtro dinâmico de atividades por dia

[33mcommit 400baaa67479fa4a4fbb73e5cc236e3f46b0a106[m
Author: lauanderson-rael <lauanderson38@gmail.com>
Date:   Thu Dec 4 07:17:57 2025 -0300

    feat: adiciona filtro dinâmico por dia na programação

[33mcommit 9fcf6d2a28be0b4953a463a6433c067df382fd50[m
Merge: 2ca6adf 5b3bdc4
Author: Lauanderson Rael <100454015+lauanderson-rael@users.noreply.github.com>
Date:   Wed Dec 3 11:38:53 2025 -0300

    Merge pull request #33 from DennisGabriel-Dev/feature/sistema-avaliacoes-completo
    
    Agora em ambas as páginas (detalhes da atividade e ver avaliações), o…

[33mcommit 2ca6adf18dbbd415abf074a0bb233fe9053b7e4c[m
Merge: 7adaf0c 3b66430
Author: Lauanderson Rael <100454015+lauanderson-rael@users.noreply.github.com>
Date:   Wed Dec 3 11:06:21 2025 -0300

    Merge pull request #34 from DennisGabriel-Dev/feat/quizzes-in-profile
    
    Adicionando botão meus quizzes no profile e criando tela de quizzes respondidos e pendentes

[33mcommit 3b66430d6fedb763a856b4d790549d5e7df372be[m[33m ([m[1;31morigin/feat/quizzes-in-profile[m[33m)[m
Author: Carlos William <carloswilliamwilliam7almeida@gmail.com>
Date:   Wed Dec 3 00:16:51 2025 -0300

    Adicionando botão meus quizzes no profile e criando tela de quizzes respondidos e pendentes

[33mcommit 7adaf0c27b676eaa05d7ab52ff73fda0a2bcc10d[m
Merge: b4d67fa bdfe455
Author: Lauanderson Rael <100454015+lauanderson-rael@users.noreply.github.com>
Date:   Tue Dec 2 23:39:24 2025 -0300

    Merge pull request #31 from DennisGabriel-Dev/fix-quiz-sem-presenca
    
    fix: Bloqueio de acesso ao quiz se a presença ainda não foi confirmada

[33mcommit 9df4eb3eb04dc7d70ef1ee82ec3d7ca3dbebffe3[m[33m ([m[1;31morigin/feat/route-sorteio[m[33m)[m
Author: DennisGabriel-Dev <dennisgabr745@gmail.com>
Date:   Tue Dec 2 20:00:10 2025 -0300

    feat(tabs): add new "Painel" tab with chart icon

[33mcommit 5b3bdc4230b467eba00a3470ca5575187e1c077b[m[33m ([m[1;31morigin/feature/sistema-avaliacoes-completo[m[33m)[m
Author: Rian Lucas <rianlucas1638@gmail.com>
Date:   Tue Dec 2 19:59:13 2025 -0300

    Agora em ambas as páginas (detalhes da atividade e ver avaliações), o usuário verá claramente quando já avaliou um evento, impedindo avaliações duplicadas.

[33mcommit fce331f43a00bb61b5eeeba4be8d326d94cdc78c[m[33m ([m[1;31morigin/feat/sorteio-filtros[m[33m)[m
Author: Anafla03 <flavia.ana@acad.ifma.edu.br>
Date:   Tue Dec 2 19:56:32 2025 -0300

    feat : adicionando filtros ao sorteio

[33mcommit bdfe455fad5b3ddf7d31baafe38ffa1393f6ee74[m[33m ([m[1;31morigin/fix-quiz-sem-presenca[m[33m)[m
Author: yurepires <contato.yurepires@gmail.com>
Date:   Tue Dec 2 16:08:42 2025 -0300

    fix: Bloqueio de acesso ao quiz se a presença ainda não foi confirmada

[33mcommit b4d67faaa70dd8d34eb38b5a84412a99e8094552[m
Merge: 94ca167 6be8573
Author: Lauanderson Rael <100454015+lauanderson-rael@users.noreply.github.com>
Date:   Tue Dec 2 12:18:24 2025 -0300

    Merge pull request #30 from DennisGabriel-Dev/feat/melhorias-ui-e-integracoes
    
    fix: Ajustes de configuração para build e UI

[33mcommit 6be857392a3217fcac442b24e12458a4cc200b48[m
Author: lauanderson-rael <lauanderson38@gmail.com>
Date:   Tue Dec 2 12:14:14 2025 -0300

    fix: ajustes de configuração para build e UI

[33mcommit 94ca1679ba65d3a2627619635c8c1d6621888934[m
Merge: d1bbef3 1349df0
Author: Lauanderson Rael <100454015+lauanderson-rael@users.noreply.github.com>
Date:   Mon Dec 1 22:06:31 2025 -0300

    Merge pull request #29 from DennisGabriel-Dev/feat/melhorias-ui-e-integracoes
    
    feat(quiz): implementar opcao de responder quiz dentro de uma atividade""

[33mcommit 1349df02e558782c520cdb483430d38eca1e6186[m
Author: lauanderson-rael <lauanderson38@gmail.com>
Date:   Mon Dec 1 21:57:23 2025 -0300

    [200~feat(quiz): implementar indicador visual de quizzes respondidos

[33mcommit c96cd5c75b9f4a646f2fcd3acadcefab8f498d60[m[33m ([m[1;31morigin/quiz-feat-quiz-in-atividade[m[33m)[m
Author: yurepires <contato.yurepires@gmail.com>
Date:   Mon Dec 1 20:03:24 2025 -0300

    fix: Bloqueio de participante responder novamente um quiz

[33mcommit f89dbe8d9daeb54f1d262456af74e96df12622c6[m
Author: Carlos William <carloswilliamwilliam7almeida@gmail.com>
Date:   Mon Dec 1 17:17:23 2025 -0300

    Corrigindo bug do título da atividade

[33mcommit ecf7e6fcd2216bb9a74b070fed56418339ffa6db[m
Merge: 31778f4 d1bbef3
Author: Carlos William <carloswilliamwilliam7almeida@gmail.com>
Date:   Mon Dec 1 17:04:07 2025 -0300

    Merge branch 'main' of https://github.com/DennisGabriel-Dev/connect_app into quiz-feat-quiz-in-atividade

[33mcommit d1bbef3ad89d29fcc54849175036de434cdc16a9[m
Merge: 4a992f2 4b94342
Author: Lauanderson Rael <100454015+lauanderson-rael@users.noreply.github.com>
Date:   Mon Dec 1 16:49:27 2025 -0300

    Merge pull request #28 from DennisGabriel-Dev/feat/melhorias-ui-e-integracoes
    
    feat: Adiciona link de inscrição no Even ao tentar cadastrar email não registrado

[33mcommit 4b943426bb76f0d47e7e3e2ecdafee31aaf7f536[m
Author: lauanderson-rael <lauanderson38@gmail.com>
Date:   Mon Dec 1 16:39:42 2025 -0300

    feat: adiciona link de inscrição no Even para emails não cadastrados

[33mcommit 31778f45c9bce794c57350e07336bc4b9b3eba6b[m
Merge: a923e57 4a992f2
Author: Carlos William <carloswilliamwilliam7almeida@gmail.com>
Date:   Mon Dec 1 13:34:27 2025 -0300

    Removendo tab de quiz do layout e adicionando botão de responder quiz dentro da atividade

[33mcommit a923e5780dca134cb65676df00398ec3bfd6373d[m
Author: Carlos William <carloswilliamwilliam7almeida@gmail.com>
Date:   Sun Nov 30 21:33:29 2025 -0300

    Retirando tab de quiz do layout e adicioando o quiz dentro da palestra

[33mcommit 4a992f29a3bb41a51586213679be1875454b1420[m
Merge: b27d138 0e2fdbd
Author: Dennis Gabriel <dennisgabr745@gmail.com>
Date:   Sun Nov 30 19:57:11 2025 -0300

    Merge pull request #26 from DennisGabriel-Dev/feat/melhorias-ui-e-integracoes
    
    refactor: substitui emojis por ícones mapeados na tela de presenças

[33mcommit 0e2fdbdf06f9d0251dd7f85b4b2efb054dc2359d[m
Author: lauanderson-rael <lauanderson38@gmail.com>
Date:   Sun Nov 30 19:40:22 2025 -0300

    refactor: substitui emojis por ícones mapeados na tela de presenças

[33mcommit b27d138002a021aba89b2ce1b55e7edf44d47c37[m
Merge: 8cebaf9 199e418
Author: Dennis Gabriel <dennisgabr745@gmail.com>
Date:   Sun Nov 30 19:30:25 2025 -0300

    Merge pull request #25 from DennisGabriel-Dev/feat/melhorias-ui-e-integracoes
    
    feat: Melhorias de UI, ícones mapeados e fluxo de navegação

[33mcommit 199e4184c7e38b2f588583b8e9b0065beba42865[m
Merge: 9031d94 8cebaf9
Author: lauanderson-rael <lauanderson38@gmail.com>
Date:   Sun Nov 30 19:28:50 2025 -0300

    feat: resolvido conflito de merge com main

[33mcommit 9031d94f9f32b8d484e323d80758f6d00ecaa458[m
Author: lauanderson-rael <lauanderson38@gmail.com>
Date:   Sun Nov 30 19:07:30 2025 -0300

    feat: melhorias de UI, ícones e integrado funcionalidades novas

[33mcommit 6f80e5eb82915091f92283d5697e19f75cb4225c[m
Author: Rian Lucas <rianlucas1638@gmail.com>
Date:   Sun Nov 30 16:58:02 2025 -0300

    feat: Botões de avaliação após registrar presença, minhas avaliações carregando descrevendo qual avaliado ou nao, botão de avaliação em cada evento

[33mcommit 8cebaf9c3d8dda3dece1195df1beb0730f4511de[m
Merge: 0b4c459 74b83bd
Author: Dennis Gabriel <dennisgabr745@gmail.com>
Date:   Sun Nov 30 16:18:53 2025 -0300

    Merge pull request #16 from DennisGabriel-Dev/quiz-feat-responder-quizz
    
    subindo dinamicidade do id do participante

[33mcommit 0b4c459d3d5811bd01fde84cfa36c55ad5d6b1be[m
Merge: de9086b 8daca1a
Author: Dennis Gabriel <dennisgabr745@gmail.com>
Date:   Sun Nov 30 15:55:02 2025 -0300

    Merge pull request #24 from DennisGabriel-Dev/qr-code-presenca-botao-presenca-registrada
    
    refactor: remove Perguntas screen and update Profile layout;

[33mcommit 5d2a318b8bb09f2d8d184a881304584b656fb4d0[m[33m ([m[1;31morigin/feature/sistema-avaliacoes[m[33m)[m
Merge: 3ce3e08 8daca1a
Author: Rian Lucas <rianlucas1638@gmail.com>
Date:   Sun Nov 30 15:52:09 2025 -0300

    Merge remote-tracking branch 'origin/qr-code-presenca-botao-presenca-registrada' into feature/sistema-avaliacoes

[33mcommit 8daca1aa5169ce983538b1a5c2d72e0fc031bf63[m[33m ([m[1;31morigin/qr-code-presenca-botao-presenca-registrada[m[33m)[m
Author: DennisGabriel-Dev <dennisgabr745@gmail.com>
Date:   Sun Nov 30 15:44:04 2025 -0300

    refactor: remove Perguntas screen and update Profile layout; add Minhas Presenças screen with loading and empty states

[33mcommit 3ce3e08eca8c3a347a30591ac4632225f00e1166[m
Author: Rian Lucas <rianlucas1638@gmail.com>
Date:   Sun Nov 30 15:21:54 2025 -0300

    feat: correção das minhas avaliações

[33mcommit 5e1e42d22bd536fd66b88674f7bb2c14a611ae10[m
Author: Rian Lucas <rianlucas1638@gmail.com>
Date:   Sun Nov 30 15:17:56 2025 -0300

    feat: correção das minhas avaliações

[33mcommit 74b83bd8a59aa16282907f39a64a26cf299afdbe[m[33m ([m[1;31morigin/quiz-feat-responder-quizz[m[33m)[m
Merge: f02aec3 de9086b
Author: cleidi <weslensilva@acad.ifma.edu.br>
Date:   Sun Nov 30 14:53:09 2025 -0300

    subindo feedback de quiz para usuario

[33mcommit 45352c689c1cfb154ddec737aa8386d52dad5768[m
Author: Rian Lucas <rianlucas1638@gmail.com>
Date:   Sun Nov 30 14:24:51 2025 -0300

    feat: Correção das minhas avaliações

[33mcommit f02aec3f576118b1d47c1aeca67d51ab548fcc27[m
Author: cleidi <weslensilva@acad.ifma.edu.br>
Date:   Sun Nov 30 13:18:54 2025 -0300

    feat: alert com pontuação e redirect após finalizar quiz

[33mcommit de9086b92dbcc26624c20c9384162fd143efd44c[m
Merge: 975d9f5 3d0f4d3
Author: Lauanderson Rael <100454015+lauanderson-rael@users.noreply.github.com>
Date:   Sun Nov 30 10:57:02 2025 -0300

    Merge pull request #23 from DennisGabriel-Dev/integracao-telas-avaliacoes
    
    fix: Resolução de conflitos de merge + melhorias UI (quiz, ícones e navegação)

[33mcommit 3d0f4d3a54476fc48fda4b2a85d1e2b2c2ae9fdd[m[33m ([m[1;31morigin/integracao-telas-avaliacoes[m[33m)[m
Merge: 06af430 b29d033
Author: lauanderson-rael <lauanderson38@gmail.com>
Date:   Sun Nov 30 10:43:09 2025 -0300

    fix: resolve conflitos de merge e adiciona melhorias na UI do quiz e navegação

[33mcommit fbb58c4e850f97589a7546d04be32933317404fb[m
Merge: 0fe339b 9a9dde0
Author: cleidi <weslensilva@acad.ifma.edu.br>
Date:   Sun Nov 30 01:17:50 2025 -0300

    subindo id dinamico v2

[33mcommit 0fe339b09b64a7eb3d989fdf4e7779cb0383ae05[m
Merge: cbc7b66 975d9f5
Author: cleidi <weslensilva@acad.ifma.edu.br>
Date:   Sun Nov 30 01:07:27 2025 -0300

    subindo id dinamico v2

[33mcommit cbc7b667218bec122f6a83fc6463f61064c7d2bf[m
Author: cleidi <weslensilva@acad.ifma.edu.br>
Date:   Sun Nov 30 00:15:58 2025 -0300

    feat: ajustes de quiz (x-participante-id e authStorage)

[33mcommit 975d9f5d8900f1a245b26d0c44f8c603faedf525[m
Merge: eab847b 06af430
Author: Lauanderson Rael <100454015+lauanderson-rael@users.noreply.github.com>
Date:   Sun Nov 30 00:01:46 2025 -0300

    Merge pull request #21 from DennisGabriel-Dev/integracao-telas-avaliacoes
    
    feat: adiciona variáveis de ambiente para configuração da API
