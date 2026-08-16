# Histórias — o que cada dia cobre

Este documento é o mapa da seção **Histórias** do app: as duzentas palavras dos
dez dias, as cenas em que elas aparecem, onde o conteúdo mora e por que a
entrada no baralho é uma decisão de quem estuda e não do arquivo.

`livros.md` faz o mesmo pelo **Nível 1**, que é gramática e vem de outros dois
livros. O *porquê* de o app inteiro ser como é continua em
`docs/fundamentacao.md`; as convenções de código, em `CLAUDE.md`.

---

## De onde vem o conteúdo

O material de origem é um **livro de vocabulário ilustrado** que ensina
quinhentas palavras em cinquenta dias, dez por dia. A estrutura de cada dia do
livro é sempre a mesma e é ela que faz o método funcionar: uma cena curta amarra
as dez palavras num acontecimento, a mesma cena reaparece inteira em coreano, e
os exercícios cobram justamente aquelas frases — ligar palavra e significado,
palavras cruzadas, preencher lacuna.

**Nada aqui é transcrição.** Uma palavra e o que ela significa não pertencem a
ninguém: que 주말 é fim de semana está em qualquer dicionário. O que é de autoria
— a redação das cenas, a escolha dos personagens, as ilustrações, os enunciados
— foi reescrito do zero em português. As frases coreanas das cenas são as do
livro, porque são o exemplo que os exercícios cobram e reescrevê-las quebraria a
correspondência; a tradução para o português é minha, frase a frase, e o
espaçamento (띄어쓰기) foi corrigido onde o PDF trazia espaço fora do lugar.

Por decisão do dono do repositório, **o título e os autores do livro não são
citados em lugar nenhum do app nem do código.** Se você for acrescentar
material, mantenha isso.

**O PDF não fica no repositório**, pela mesma razão que os livros do Nível 1
não ficam: versionar a obra inteira num repo público é redistribuí-la, coisa bem
diferente de aprender com ela. O `.gitignore` barra `*.pdf` e `*.epub`.

## Vinte palavras por dia, não dez

O livro ensina dez palavras por dia. Aqui cada dia junta **dois dias do livro**,
e por isso traz vinte palavras e duas cenas. Os dez dias do app cobrem os vinte
primeiros dias do livro — duzentas palavras.

Foi pedido assim e a mudança se sustenta: a cena é a unidade que faz a palavra
colar, e ela continua com dez palavras cada. O que dobra é o tamanho da sessão
de leitura, não a densidade da cena.

## Os dez dias

| # | Selo | Cenas | Palavras-chave | Palavras | Exercícios |
|---|---|---|---|---|---|
| 1 | 一 | O amigo ocupado / A manhã de sempre | 회사원 · 매일 | 20 (14 novas) | 50 |
| 2 | 二 | A mesa suja / O pão do amigo | 시험 · 음료수 | 20 (12 novas) | 50 |
| 3 | 三 | Dia das crianças sem criança / A casa da avó | 학교 · 방학 | 20 (12 novas) | 49 |
| 4 | 四 | Duas malas e uma / A briga do controle | 휴가 · 방 | 20 (16 novas) | 50 |
| 5 | 五 | Iseul / A toalha que faltou | 시간 · 수영 | 20 (13 novas) | 50 |
| 6 | 六 | A carta de aniversário / A festa na sala de aula | 선물 · 생일 | 20 (12 novas) | 50 |
| 7 | 七 | O mar com o pai / O verão detestado | 식당 · 여름 | 20 (13 novas) | 50 |
| 8 | 八 | Meia-noite sem sono / Antes do compromisso | 침대 · 화장품 | 20 (14 novas) | 50 |
| 9 | 九 | O casal do lado / O sábado do videogame | 초대 · 요일 | 20 (15 novas) | 50 |
| 10 | 十 | O círculo no calendário / Da cidade para a montanha | 모양 · 도시 | 20 (18 novas) | 50 |

**Total: 200 palavras (139 novas, 61 já no app) e 499 exercícios.**

O dia 3 tem 49 porque uma das cenas do livro traz nove lacunas em vez de dez.
O selo é o algarismo sino-coreano do dia, a mesma numeração que o baralho
ensina — enfeite que carrega informação.

As 61 palavras que já existiam entram pelo id que já tinham: 학교, 먹다, 커피 e
outras cinquenta e oito já eram cartão do baralho ou já tinham entrado pelo
Nível 1. Duas aparecem no livro na forma de dicionário e no app na forma polida
(좋다/좋아요, 맛있다/맛있어요) — é a mesma palavra, então reusa a entrada em vez
de duplicar, e a grafia mostrada é a do livro.

## O balaio de revisão é um só

Esta é a decisão central da seção e vale explicar por inteiro.

**Uma fila só.** Dois baralhos seriam duas sessões por dia, dois mapas e duas
redes de morfemas — e o 자 de 의자 nunca reencontraria o de 모자. O FSRS, a
escada de quatro níveis, a meta semanal e o mapa continuam sendo um de cada.

**Mas a entrada é por dia, e quem abre a porta é quem estuda.** As duzentas
palavras entram em `dados/palavras.json` com `baralho: false`: já contam para o
mapa, para o dicionário e para as famílias de morfemas, mas não ocupam a fila.
No fim da leitura de cada dia há um botão que promove as vinte daquele dia.

Por que não despejar tudo de uma vez: `montarFila` entrega palavra nova na ordem
do arquivo, então duzentas palavras entrando juntas numa fila calibrada para
cento e quatorze viraria uma fila de trezentos e catorze sem cara de nada — e a
ordem curada do baralho (frequência × imageabilidade) seria substituída pela
ordem de um livro que tem outro critério.

**Onde isso mora no código.** A promoção é uma lista de ids em
`estado.promovidas` no `localStorage` — não uma edição de JSON. O baralho sai de
um lugar só:

```js
// src/app.js
function recalcularBaralho() {
  const promovidas = new Set(estado.promovidas);
  palavras = dicionario.filter((p) => p.baralho !== false || promovidas.has(p.id));
}
```

Promover é acrescentar à lista e chamar isso de novo. Nenhuma tela precisa saber
que a separação existe. `banco.promover()` só acrescenta: tirar uma palavra do
baralho jogaria fora o estado FSRS dela, e o que se aprendeu não deixa de ter
sido aprendido porque a pessoa mudou de ideia sobre o dia.

## Como o conteúdo é guardado

`dados/dias.json` usa **o mesmo esquema de `dados/licoes.json`**. Isso não é
economia de digitação: significa que `src/licoes.js` corrige os exercícios dos
dias sem uma linha nova, que a tela de aula renderiza um dia sem saber que é um
dia, e que o progresso dos dois vive no mesmo `estado.licoes`.

```jsonc
{
  "id": "dia-1",
  "numero": 1,
  "hanja": "一",                       // o selo
  "titulo": "O amigo e a manhã",
  "hangul": "회사원 · 매일",             // as duas palavras-chave, uma por cena
  "resumo": "…",
  "ilustracao": "assets/historias/dia-1.svg",
  "objetivo": "…",
  "palavras": ["funcionario", "empresa", …],   // 20 ids — é o que o botão promove
  "vocabulario": [                              // 20 verbetes, na ordem do livro
    { "ko": "회사원", "pt": "funcionário de empresa",
      "romanizacao": "hoesawon", "hanja": "會社員" }
  ],
  "topicos": [ { "id": "d1-t1", "titulo": "O amigo ocupado",
                 "grupo": "d1-g1", "corpo": [ … ] } ],
  "grupos": [ { "id": "d1-g1", "titulo": "O amigo ocupado", "itens": [ … ] },
              { "id": "d1-g3", "titulo": "O que você ouviu",
                "solto": true, "itens": [ … ] } ]
}
```

Dois campos são novos em relação a `licoes.json`:

- **`palavras`** — os vinte ids que o botão promove. É a única ponte entre o dia
  e o baralho, e é por id justamente para as 61 palavras reusadas apontarem para
  a entrada que já existe.
- **`vocabulario[].romanizacao`** — mostrada só quando a preferência de
  romanização está ligada, pelo mesmo motivo que ela vem desligada no baralho
  (`docs/fundamentacao.md`, decisão 1).

### Blocos de explicação

Cada dia tem dois tópicos, um por cena, e cada um usa três blocos:

| Bloco | O que é |
|---|---|
| `p` | o parágrafo que apresenta a cena e chama atenção para o que ela ensina |
| `exemplos` | a cena inteira, frase a frase, coreano e português |
| `combinacoes` | **novo** — a companhia da palavra: 물을 마시다, 옷을 입다, 버스를 타다 |

`combinacoes` é o único tipo de bloco que esta leva acrescentou ao renderizador.
Ele existe porque palavra sozinha vira lista, e lista se decora e se esquece;
cada linha fala quando tocada, porque colocação é o que se repete em voz alta.
Os outros tipos que `licoes.json` usa (`tabela`, `formula`, `regra`, `som`,
`nota`, `destaque`, `dialogo`) continuam disponíveis e não são usados aqui — um
dia de vocabulário não tem regra para enunciar.

### Tipos de exercício

Nenhum tipo novo. Os quatro feitios do livro caíram nos que já existiam:

| No livro | Aqui | Quantos |
|---|---|---|
| ligar palavra ↔ significado (10 pares) | `associar`, em duas rodadas de 5 | 40 |
| palavras cruzadas (7 pistas) | `montar` — significado → montar a palavra por sílaba | 140 |
| preencher lacuna (10 frases) | `lacuna`, com banco de 3 | 199 |
| — | `escolha` — qual combinação existe de verdade | 40 |
| — | `ditado` — 2 palavras entre quatro + 2 frases para montar, por cena | 80 |

As palavras cruzadas viraram montagem por sílaba porque grade de cruzadas não
cabe em tela de telefone e porque o que a pista cobra — significado → grafia — é
exatamente o que o `montar` cobra.

**A lacuna se preenche com a forma flexionada.** A frase da cena é
`그 친구는 너무 바빠요`, então a lacuna de 바쁘다 pede 바빠요, não o lema. A
resposta certa não foi digitada à mão: ela é o que sobra ao casar a frase da
lacuna com a frase da cena, o que também garante que o banco de opções seja
formado por respostas de outras lacunas do mesmo dia — plausíveis, e erradas
naquele buraco.

Como em `licoes.json`, **a resposta certa está sempre no índice 0 / na primeira
ordem** dentro do arquivo, para o banco poder ser lido e revisado à mão; quem
embaralha é a tela.

## O grupo solto

Cada dia tem três grupos: um por cena e um terceiro, "O que você ouviu", marcado
`solto: true`. Ele não pertence a nenhuma cena porque treina o dia inteiro, e o
marcador é o que distingue um grupo deliberadamente sem dono de um grupo que
alguém esqueceu de ligar. A explicação põe um atalho para ele no fim da leitura,
para nenhum exercício ficar acessível só por quem pensou em abrir a outra aba.

Distinguir 수건 de 수영 no ouvido é uma habilidade separada de saber escrever
수건, e vem antes — por isso o grupo tem os dois feitios de ditado, e o de
escolher entre quatro vem primeiro.

## O dicionário que se acumula

As 139 palavras novas entram em `dados/palavras.json` com o esquema completo:

```jsonc
{
  "id": "funcionario", "hangul": "회사원", "romanizacao": "hoesawon",
  "pt": "funcionário de empresa",
  "modulo": "pessoas", "classe": "substantivo",
  "imageabilidade": 3, "topik": 1,
  "dia": 1,                                    // de que dia do app ela veio
  "sino": { "회": "會", "사": "社", "원": "員" },
  "exemplo": { "ko": "제 친구는 회사원이에요.",
               "pt": "Meu amigo é funcionário de empresa." },
  "nota": "會社員 — “membro da casa de reunião”. O mesmo 원 (員) está em 공무원.",
  "baralho": false
}
```

O campo `dia` é o análogo de `aula`, e o mapa mostra a origem na listagem do
dicionário. Três coisas valem registrar:

**O exemplo é a frase da cena, não uma frase inventada.** A palavra já foi vista
ali; reencontrá-la é meio caminho da lembrança. Para os verbos e adjetivos, que
aparecem conjugados, o casamento é feito pelo prefixo mais longo entre o lema e
a resposta da lacuna — 바쁘다 e 바빠요 não são iguais nem começam iguais depois
da primeira sílaba.

**A romanização é calculada, não copiada.** O livro romaniza a *pronúncia*
(`hak-kkyo`); o app romaniza a *grafia* pela RR (`hakgyo`), que é o que as 277
entradas anteriores já faziam. O script de romanização foi conferido contra
todas elas: bate em todas menos três, e as três são exceções conhecidas
(맛없어요, e os nomes próprios 서울 e 부산).

**O hanja subiu de 83 para 167 verbetes.** As 55 palavras sino-coreanas trazidas
por esta leva puxaram 84 ideogramas novos para `dados/hanja.json`, e o índice de
famílias passou de pouco mais de cem para 165. 學 agora liga 학교, 학생 e 방학;
室 liga 교실, 화장실 e 사무실; 子 liga 의자, 모자, 사자, 남자 e 여자.

### Um ajuste que a promoção obrigou

O invariante de `distratores` — nenhuma alternativa de classe gramatical
diferente da do alvo — valia para o baralho de 114. Assim que a promoção passou
a poder crescer o baralho para 275, ele parou de valer: 9,8% dos distratores
saíam da classe errada.

A causa não era a promoção, era o degrau do módulo. `distratores` prefere, nesta
ordem, confundível explícito → mesmo `campo` → mesmo `modulo` → mesma `classe`.
Módulo que mistura classes (`alta-frequencia` tem substantivo abstrato e
funcional; `tempo` tinha os dois) devolve a classe errada antes de chegar ao
degrau da classe. A correção foi de dados, não de código:

- campos novos que separam classe dentro do módulo: `ritmo` (advérbio de tempo),
  `posicao` (위/아래/옆/밖), `nocao` (substantivo abstrato), `sabor`;
- os substantivos de tempo que estavam em `alta-frequencia` mudaram para o
  módulo `tempo`, e os dois advérbios que estavam em `tempo` foram para
  `alta-frequencia`, onde os funcionais moram;
- 맛있어요 e 맛없어요 saíram do módulo `comida` para `qualidades`: são
  adjetivos, e sozinhos num módulo de substantivos devolviam e recebiam
  distrator da classe errada;
- oito listas de `confundiveis` que cruzavam classe foram corrigidas.

Depois disso o índice é **0,00% tanto no baralho de hoje quanto no baralho com
os dez dias promovidos**. Se você acrescentar palavra a um módulo de classe
mista, rode a checagem da seção de verificação antes de considerar terminado.

## Áudio

Nada de arquivo de som: a Web Speech API lê tudo, `pt-BR` para a prosa e `ko-KR`
para o coreano. O botão "Ouvir" do tópico narra a cena inteira alternando as duas
vozes, na ordem em que estão escritas. As linhas do bloco de combinações também
falam quando tocadas, e o ditado usa a mesma voz coreana — sem ela, o exercício
mostra o texto em vez de travar.

## Ilustrações

Uma por dia, em `assets/historias/dia-N.svg`, no mesmo formato das aulas: 200×200,
círculo de fundo, paleta de ~5 cores, **zero texto**. Cada uma junta os dois
motivos do dia — a mala e a televisão, o calendário e a montanha — porque o dia
é feito de duas cenas e a capa precisa dizer isso antes de a leitura começar.

## O que ficou de fora, e por quê

- **Os "check off the words you already know"** do começo de cada dia do livro.
  É uma caixinha de marcar que não verifica nada; o app já tem estado por palavra
  no FSRS, que mede em vez de perguntar.
- **A grade de palavras cruzadas.** Portada como `montar`, pelo motivo acima. A
  grade em si não sobrevive a uma tela de telefone.
- **As páginas de revisão a cada dez dias.** São recombinação do que já foi
  cobrado; num app com agendamento espaçado, revisão é a fila, não uma página.
- **Cerca de 26 das 200 colunas de "palavras relacionadas".** O texto do PDF
  quebra glosa longa entre páginas e o casamento com o termo sai trocado nesses
  casos. Melhor faltar a combinação do que mostrar a errada — as outras 174
  estão lá, uma por verbete.
- **Os dias 21 a 50 do livro.** Ficaram para uma próxima leva. A estrutura
  aguenta: acrescentar dias é acrescentar objetos a `dados/dias.json` e entradas
  a `dados/palavras.json`, sem tocar em código.

## Verificação

Não há suíte automatizada no repositório (site estático, sem build — ver a Regra
zero em `CLAUDE.md`). O que existe é esta bateria, que deve ser rodada antes de
abrir PR. Tudo deve imprimir zero ou `nenhum`.

### Invariantes dos dias (Node, sem navegador)

O script completo está descrito abaixo; ele usa a mesma `src/licoes.js` que
corrige na tela, então não existe segunda implementação para divergir.

```js
import fs from 'fs';
import * as licoes from './src/licoes.js';

const dias = JSON.parse(fs.readFileSync('dados/dias.json', 'utf8'));
const aulas = JSON.parse(fs.readFileSync('dados/licoes.json', 'utf8'));

// 1. id único, e sem colidir com o Nível 1 — o progresso é um mapa só
const idsAulas = new Set(aulas.flatMap(licoes.itensDaAula).map((i) => i.id));
const itens = dias.flatMap(licoes.itensDaAula);
console.log('ids repetidos:',
  itens.length - new Set(itens.map((i) => i.id)).size);
console.log('ids colidindo com as aulas:',
  itens.filter((i) => idsAulas.has(i.id)).length);

// 2. responder certo passa, responder o vizinho falha
for (const item of itens) {
  if (licoes.ehEscolha(item) || item.tipo === 'lacuna') {
    const n = (item.opcoes ?? item.banco).length;
    console.assert(licoes.conferir(item, item.correta), item.id);
    console.assert(!licoes.conferir(item, (item.correta + 1) % n), item.id);
  }
}

// 3. as peças montam a resposta, e nenhum prefixo estrito dispara antes
//    (a busca é a mesma do harness de navegador — ver e2e/dias.mjs)

// 4. todo grupo é alcançável a partir da leitura
for (const dia of dias) {
  const apontados = new Set(dia.topicos.map((t) => t.grupo));
  console.log(dia.id, 'grupos órfãos:',
    dia.grupos.filter((g) => !apontados.has(g.id) && !g.solto).map((g) => g.id));
  console.log(dia.id, 'palavras:', dia.vocabulario.length, dia.palavras.length);
}
```

### Dicionário, hanja e distratores (Node, sem navegador)

```js
import fs from 'fs';
import { distratores } from './src/niveis.js';

const banco = JSON.parse(fs.readFileSync('dados/palavras.json', 'utf8'));
const dias = JSON.parse(fs.readFileSync('dados/dias.json', 'utf8'));
const hanja = JSON.parse(fs.readFileSync('dados/hanja.json', 'utf8'));
const ids = new Set(banco.map((w) => w.id));

console.log('id promovido que não existe:',
  dias.flatMap((d) => d.palavras).filter((i) => !ids.has(i)));
console.log('confundível órfão:',
  banco.flatMap((w) => (w.confundiveis ?? []).filter((c) => !ids.has(c))));
console.log('hanja sem verbete:',
  banco.flatMap((w) => Object.values(w.sino ?? {}).filter((h) => !hanja[h])));
console.log('ilustração do dia faltando:',
  dias.filter((d) => !fs.existsSync(d.ilustracao)).map((d) => d.id));

// O invariante que a promoção obrigou a estender: vale para o baralho de hoje
// E para o baralho com os dez dias dentro.
const idsDias = new Set(dias.flatMap((d) => d.palavras));
for (const [nome, pool] of [
  ['baralho de hoje', banco.filter((p) => p.baralho !== false)],
  ['com os dez dias', banco.filter((p) => p.baralho !== false || idsDias.has(p.id))],
]) {
  let fora = 0, total = 0;
  for (let i = 0; i < 25; i++) for (const w of pool) {
    const d = distratores(w, pool);
    total += d.length;
    fora += d.filter((x) => x.classe !== w.classe).length;
  }
  console.log(nome, (100 * fora / total).toFixed(2) + '%');  // 0.00% nos dois
}
```

### Fluxo no navegador (Playwright)

O ambiente já traz Chromium em `/opt/pw-browsers`; instale só o driver numa
pasta fora do repositório:

```sh
npm install playwright-core --no-audit --no-fund
python3 -m http.server 8811    # na raiz do repositório
```

O script percorre os dez dias, confere que as duas cenas, os dois blocos de
combinações e as vinte palavras renderizam, usa o atalho de cada cena, responde
os 499 exercícios lendo as respostas do próprio `dados/dias.json` (nunca
decoradas no script), promove as vinte palavras do dia 1 e confere que o baralho
cresceu, que o dicionário do mapa encolheu na mesma medida e que o progresso
sobrevive ao recarregamento.

Ele não está commitado porque cada mudança tende a precisar de um cenário
ligeiramente diferente — escrever sob medida no scratchpad é mais rápido que
manter um harness genérico.

O resultado desta leva:

```
exercícios respondidos: 499
baralho: 114 → 130 · dicionário no mapa: 286
progresso final: 10 de 10 dias concluídos · 499 de 499 exercícios · 55 de 200 palavras no baralho
✓ os dez dias, 499 exercícios certos, promoção ao baralho e nada no console
```

E as três baterias que já existiam continuam passando sem alteração: o Nível 1
inteiro (598 exercícios), a separação baralho/dicionário e a navegação entre
aulas.
