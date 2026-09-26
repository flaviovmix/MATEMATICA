# Nota de saúde do projeto (0 a 10)

Ferramenta de diagnóstico. Não é etapa, não tem "pronto quando", e roda quando alguém quiser saber como o projeto está: antes de retomar depois de meses, antes de abrir pro primeiro usuário, ou quando bateu a sensação de que a casa desarrumou.

**Funciona em qualquer projeto**, tenha ele nascido deste molde ou não. Projeto que nunca viu o molde só vai tirar nota baixa em algumas dimensões, e é exatamente essa a informação.

---

## As três regras de quem aplica

1. **Não corrigir durante a análise.** Vale a mesma regra da Etapa 13: cada achado ganha destino decidido junto com o dono (corrigir já, pegar carona numa etapa, ou entrar na fila de erros). Quem corrige calado no meio da varredura perde a medida e não termina nenhuma das duas coisas.
2. **Nota sem evidência não vale.** Toda nota abaixo de 8 aponta arquivo e linha, ou o comando que provou. "Parece frágil" não é achado.
3. **Medir o que está lá, não o que se lembra.** Ler o código, rodar o que der pra rodar. Impressão de sessão antiga é a principal fonte de nota errada.

---

## As 8 dimensões

Cada uma vale de 0 a 10. O que cada nota significa está na régua do fim.

### 1. Segurança
Segredo versionado (senha, token, chave em arquivo do repo ou em migration). Autorização conferida rota a rota, com o padrão sendo negar. Senha com hash forte. Freio de força bruta no login. Upload validado por assinatura do arquivo, não pelo tipo declarado. Dependência com vulnerabilidade aberta.
**Prova rápida:** buscar por senha e chave no histórico do git; bater três papéis (anônimo, comum, admin) contra uma rota administrativa; conferir o alerta de dependência do repo.

### 2. Teste
Existe arnês rodando por um comando. Ele cobre o caminho crítico: autenticação, salvar com validação recusando, excluir. Roda contra banco de verdade. Bug já corrigido deixou teste que o reproduz.
**Prova rápida:** rodar a suíte. Se não roda por um comando, a nota já começa baixa, porque teste que ninguém consegue rodar não protege ninguém.

### 3. Legibilidade
Função com uma responsabilidade e tamanho que cabe na tela. Nome que dispensa comentário. HTML semântico. CSS e JS em arquivo por componente, não dentro do template. Pasta que um humano entende sem buscar.
**Prova rápida:** contar as funções maiores que ~60 linhas e as linhas de estilo e script inline dentro de template.

### 4. Duplicação
Clone do mesmo padrão (controller, modal, store, formulário, mapeador). Decisão repetida em N lugares: mudar o texto de um aviso comum exige lembrar de quantos arquivos?
**Prova rápida:** escolher um aviso ou uma regra que aparece em vários lugares e contar em quantos arquivos ela mora.

### 5. Banco e dados
Migrations versionadas e nunca editadas depois de aplicadas. Banco novo sobe do zero sem passo manual. Índice nas chaves estrangeiras e nas colunas de busca. Regra de exclusão pensada. Enum do código batendo com a restrição do banco.
**Prova rápida:** recriar o banco do zero. Se precisar de passo manual, a dimensão não passa de 5.

### 6. Deploy e operação
Procedimento de subir escrito e testado. Caminho de volta (rollback) que alguém já usou. Backup rodando, guardado fora da máquina, restaurado ao menos uma vez, com alerta quando falha. Monitoramento que avisa antes do usuário avisar.
**Prova rápida:** perguntar quando foi a última restauração de backup testada. "Nunca" é nota 3 ou menos, porque backup nunca testado não é backup.

### 7. Interface
Sem estouro horizontal nos 4 tamanhos. Acessibilidade: rótulo ligado ao campo, foco visível, alcançável por teclado. Estado vazio tratado. Imagem com dimensão declarada. Política de conteúdo (CSP) ligada.
**Prova rápida:** medir uma página pública e uma de painel num medidor de acessibilidade, e abrir as duas no tamanho de celular.

### 8. Registro
O plano (ou o README) reflete o que existe hoje. Decisões escritas com o porquê. Fila de erros viva. README ensina alguém de fora a subir o projeto do zero.
**Prova rápida:** seguir o README numa máquina limpa, ou ao menos ler se ele menciona os passos que a versão atual precisa.

---

## Como fecha a nota final

Média simples das oito, **com um freio**: se qualquer dimensão ficar em 3 ou menos, a nota final não passa de 5, por mais alto que esteja o resto. Projeto com segredo exposto em produção não é um "8 com uma ressalva", e média sozinha esconde exatamente esse tipo de buraco.

| Nota | O que significa |
|---|---|
| 9-10 | saudável. Dá pra crescer sem medo |
| 7-8 | bom, com dívida conhecida e escrita |
| 5-6 | funciona, mas cada mudança custa mais que devia |
| 3-4 | a casa desarrumou. Precisa de etapa dedicada antes de feature nova |
| 0-2 | risco real de perder dado, vazar dado ou não conseguir mudar |

---

## O que entregar

Uma tabela e três linhas de texto. Nada mais:

```markdown
| # | Dimensão | Nota | O que puxou pra baixo (arquivo:linha) |
|---|---|---|---|
| 1 | Segurança | 4 | senha no repo em V3__seed.sql:12 |
...

**Nota final: X/10** (freio aplicado: sim/não, por qual dimensão)

**As três coisas que mais sobem a nota:** ...
**O que NÃO vale mexer agora:** ...
```

A linha do que não vale mexer agora é tão importante quanto as outras. Varredura sem prioridade vira lista de 40 itens que ninguém ataca, e a casa segue desarrumada com um relatório em cima.

---

## Resultado

**Auditado em:** 26/09/2026

| # | Dimensão | Nota | O que puxou pra baixo (arquivo:linha) |
|---|---|---|---|
| 1 | Segurança | 9 | o Font Awesome vem do cdnjs sem `integrity` (`index.html:9` e nos outros 24 HTML), e o `renderTabuada` monta HTML por `innerHTML` com interpolação (`script.js:57`), hoje só com número da própria página, mas vira porta se as contas um dia vierem de JSON de fora. Medido: nenhum segredo no histórico (`git log --all -p` com senha, token, chave: zero), nenhuma dependência instalada pra ter alerta, nenhum campo de texto nem dado de usuário, repo público no GitHub sem nada sensível |
| 2 | Teste | 1 | não existe arnês nem teste nenhum: `git ls-files` só tem os 25 HTML, `script.js`, `style.css` e 3 PNG. O único roteiro de prova é a lista manual da skill `matematica` (§10), fora do repo; os 9 bugs dados como resolvidos na skill (§8) não deixaram teste, e o reset não zera o placar sem ninguém acusar (medido no navegador: "Total" segue 1 depois do reset; `script.js:696` só chama `newQuestion`) |
| 3 | Legibilidade | 4 | `showHint` tem 205 linhas com as três animações dentro (`script.js:237`) e `runGroupingAnimation` 114 (`script.js:466`); 5 de 27 funções passam de 30. Um `script.js` de 714 linhas e um `style.css` de 947 fazem tudo (a regra 5 pede um arquivo por responsabilidade). Cada um dos 25 HTML carrega 2 `<script>` inline, 1.252 linhas no total (o banco de contas em `index.html:17` a `:68` e o handler do select em `:180` a `:185`), mais 125 `onclick=` (`index.html:76` a `:96`). Zero `main`, `nav` ou `section` nos 25. Nome meio inglês, meio português (`hits`, `answered`, `showHint` ao lado de `perguntaAtualIndex`, `bancoDeContas`), conversa de sessão deixada no código (`script.js:209` e `:213`), cabeçalho que não cita a multiplicação (`script.js:2`), comentário de cor trocado (`style.css:606` e `:612`), 72 cores soltas fora das variáveis e 5 classes órfãs (`.msg.ok` em `style.css:395`, `.msg.bad` `:399`, `.nivel.ativo` `:583`, `.green` e `.green-alt` de `:188` a `:244`). A favor: as 22 funções menores são curtas e bem nomeadas, e as pastas por operação se acham sem busca |
| 4 | Duplicação | 2 | os 25 HTML são o mesmo esqueleto copiado: o `npx jscpd` (blocos de 8 linhas) acha 4.149 de 4.497 linhas de HTML repetidas, 92,26%, em 42 clones (44,18% do projeto todo). "Vamos começar!", os 5 botões de nível, o select de operação e o handler dele moram nos 25 arquivos, e a própria skill avisa que operação nova exige editar o select nos 25 à mão. Dentro do `script.js`: a conta do resultado 3 vezes (`:207`, `:256`, `:668`), o embaralhamento 2 vezes (`:88` e `:706`) e a montagem da barra de 10 2 vezes (`:160` e `:505`) |
| 5 | Banco e dados | - | não se aplica: não há banco nem persistência (nem `localStorage`); as contas são dado fixo escrito dentro de cada HTML |
| 6 | Deploy e operação | - | não se aplica: o repo não sobe pra lugar nenhum (nenhum endereço no código, sem `deploy/`, GitHub Pages de `flaviovmix/MATEMATICA` responde 404), roda abrindo o HTML do disco e não guarda dado de ninguém pra ter backup; o código já tem cópia fora da máquina (`main` igual a `origin/main`). A versão que está no ar é outra base, a cópia que evoluiu dentro do KIDS (`KIDS/site/MATEMATICA`) |
| 7 | Interface | 4 | sem estouro horizontal nos 4 tamanhos em 5 páginas medidas, elemento por elemento, e animação terminando sem erro de JS; mas no 360×800 a tela de acerto e erro some: do boneco aparecem 36 de 120 px e o título ("Observe...") fica abaixo da tela (topo 802 num viewport de 800), sem rolagem porque `html, body` têm `overflow: hidden` (`style.css:747` a `:751`) e o `.buddy` é absoluto com `bottom: -50px` (`style.css:910` a `:919`); no 768×1024 ele vira uma faixa de 91 px com o rosto cortado. No 360 o botão de reset cobre o select de operação (`elementFromPoint` no centro do `#operacao` devolve `.btn-reset`, posição absoluta em `style.css:80`). axe-core com 3 violações WCAG em toda página: `button-name` crítica (reset só com ícone, `index.html:115`), `select-name` crítica (select sem rótulo, `index.html:101`) e `color-contrast` em 10 nós (texto branco em `.muito-facil`, `.facil` e `.medio`, `style.css:592` a `:604`). Imagem sem dimensão declarada nos 25 (`index.html:169`), PNG de 479 a 697 KB exibido a 120 px no celular, nenhum CSP e `/favicon.ico` em 404. Foco visível e tudo alcançável por teclado (botões de verdade) |
| 8 | Registro | 2 | o `README.md` inteiro é uma linha, `# MATEMATICA` (`README.md:1`): não diz o que é, como abrir nem que existe outra cópia. Não há plano, decisão nem fila de erros no repo. O que existe mora fora, na skill `matematica`, e está velho: aponta `0d5e028` como último commit (há dois depois), diz que a animação roda sozinha ao responder (hoje há o botão "Exibir animação", `script.js:233`), que a ordem das contas é fixa (`script.js:712` embaralha) e que o reset zera o placar (não zera, ver Teste). E o plano 16 do KIDS já decidiu que a skill deve apontar pra `KIDS/site/MATEMATICA` (`KIDS/plano/md/16-saude-de-69-pra-8.md:68`), ou seja, este repo virou uma cópia parada desde 07/06 e nada nele diz isso |

**Nota final: 3,7/10** (freio aplicado: sim, por Teste (1), Duplicação (2) e Registro (2), que travam o teto em 5; a média já fica abaixo dele. É a média das 6 dimensões que se aplicam: Banco e Deploy ficam fora da conta)

**As três coisas que mais sobem a nota:** primeiro, decidir o destino do repo e escrever no README: se o jogo vivo é o `KIDS/site/MATEMATICA`, três linhas dizendo que este é o original parado e onde mora a versão atual, e a skill apontando pra lá, levam o Registro de 2 pra perto de 7 pelo custo de um parágrafo. Segundo, se ele seguir vivo, uma prova por um comando (Playwright abrindo os 25 HTML, respondendo, rodando a dica e conferindo placar e reset), que tira o Teste do 1 e protege a refatoração seguinte. Terceiro, um esqueleto só: o HTML escrito uma vez e as contas num JSON por página (gerador ou `?op=&nivel=`), que derruba os 92% de HTML clonado, tira os 1.252 de script inline e os 125 `onclick`, e deixa as 3 correções do axe e o boneco visível no celular pra fazer num lugar em vez de 25.

**O que NÃO vale mexer agora:** nada de refatorar este repo antes da primeira decisão. A cópia do KIDS já andou muito à frente (`script.js` de 1.138 linhas, robô, divisão) e a Etapa 5 do plano 16 do KIDS faz lá o mesmo molde de uma página só; quebrar `showHint` ou montar o gerador aqui seria fazer o trabalho duas vezes em duas bases que divergem. Segurança está em 9 e não pede nada, e Banco e Deploy não existem de propósito: criar servidor, banco ou publicação pra um jogo que abre do disco é inventar dívida.
