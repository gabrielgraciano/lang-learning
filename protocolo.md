# Protocolo — como portar um livro para dentro do app

Passo a passo do que foi feito para o **Nível 1** (livro-texto + caderno de
exercícios, 25 aulas, 598 exercícios), para as **Histórias** (livro de
vocabulário, 25 dias, 1245 exercícios) e para o **Nível 2** (o par seguinte dos
mesmos dois livros, 5 aulas até agora, 117 exercícios). Use este documento para
portar o próximo livro.

O que cada seção pronta cobre está em [`livros.md`](livros.md),
[`nivel2.md`](nivel2.md) e [`historias.md`](historias.md). O esquema dos dados
está detalhado lá; aqui é só o processo.

---

## 0. Regras que não se negociam

1. **Não cite título nem autores do livro** em lugar nenhum — nem no app, nem
   no código, nem em commit, nem em PR. Decisão do dono do repositório.
2. **O PDF não entra no repositório.** `.gitignore` barra `*.pdf` e `*.epub`.
   Trabalhe no scratchpad.
3. **Nada de transcrição.** Regra gramatical e significado de palavra não são
   de ninguém. O que é de autoria — texto explicativo, ordem, personagens,
   enunciados, ilustrações — se reescreve do zero em português. Frase coreana
   de exemplo pode ser a do livro quando os exercícios cobram justamente ela;
   a tradução é sua.
4. **Regra zero** (`CLAUDE.md`): sem build, sem dependência, sem TypeScript.
   Identificadores e comentários em português.
5. **Nenhuma mudança de conteúdo deve exigir mudança de código.** Se você
   precisou mexer em `src/`, ou o formato é genuinamente novo, ou você modelou
   errado.

---

## 1. Pegar o livro e extrair

O livro chega por Drive ou por histórico do git. Se for grande demais para o
resultado da ferramenta caber no contexto, o harness salva em arquivo — decodifique
de lá:

```python
import json, base64
d = json.load(open('<arquivo-salvo-pelo-harness>.txt'))
open('livro.pdf','wb').write(base64.b64decode(d['content']))
```

Extraia com `pymupdf` (já instalado), **página a página**, e guarde o resultado
num JSON para não reabrir o PDF o tempo todo:

```python
import pymupdf, json
doc = pymupdf.open('livro.pdf')
json.dump([doc[i].get_text() for i in range(doc.page_count)],
          open('paginas.json','w'), ensure_ascii=False)
```

**Ache a fórmula de página antes de escrever o parser.** Livro didático é
regular: no de vocabulário, cada dia ocupava 8 páginas fixas mais 4 de revisão
a cada dezena — `INICIO + (n-1)*8 + ((n-1)//10)*4`. Confirme a fórmula em três
pontos distantes (dia 1, 25, 50) antes de confiar nela.

**Cheque a saúde do parser antes de escrever conteúdo**, não depois. Imprima
por capítulo: quantos itens de vocabulário, quantos exercícios, quantas frases.
Buraco na contagem é bug de extração, e é mais barato consertar agora.

### Duas armadilhas de extração que já custaram tempo

- **A página de "ligar palavra ↔ significado" vem embaralhada de propósito** —
  é o exercício. Se você fizer `zip(coluna_esquerda, coluna_direita)` sai tudo
  trocado. Tire os pares da tabela de vocabulário, onde cada palavra está ao
  lado do próprio significado.
- **O PDF quebra glosa longa entre linhas e páginas**, e o casamento
  termo↔significado sai deslocado. Junte linha que termina em vírgula ou com
  parêntese aberto com a seguinte; marque o que não casar e **descarte em vez
  de adivinhar**. No livro de vocabulário, 80 de 500 combinações foram
  descartadas assim — melhor faltar do que sair errado.

---

## 2. Decidir a forma da seção

Antes de escrever conteúdo, responda: **o que muda em relação ao que já existe?**

| Se o livro é… | Faça |
|---|---|
| gramática, uma lição por ponto | seção nova, esquema de `dados/licoes.json` |
| vocabulário, blocos de palavras | seção nova, esquema de `dados/dias.json` |
| outra coisa | pare e pense: o esquema `topicos` + `grupos` cobre quase tudo |

Os dois esquemas são o mesmo por dentro. `src/licoes.js` corrige os dois sem
uma linha nova, e a tela de aula renderiza os dois sem saber qual é qual. **Um
arquivo de dados novo, uma tela de listagem nova, e nada mais.**

O que o Nível 1 e as Histórias tiveram que acrescentar em código, cada um:

- **Nível 1** (primeira seção): a tela de aula inteira, `src/licoes.js`, os sete
  tipos de exercício, `estado.licoes` no armazenamento.
- **Histórias** (segunda seção): a tela de listagem, um tipo de bloco novo
  (`combinacoes`), o botão de promoção, e `abrirAula()` passou a receber a
  coleção a que a unidade pertence. Mais nada.
- **Nível 2** (terceira seção): a tela de listagem, uma linha em `ir()`, mais um
  `fetch` no carregamento, e `abrirAula()` sabendo voltar para uma terceira
  lista. Nenhum bloco novo, nenhum exercício novo, nada em `src/licoes.js`. E a
  listagem, que era `pintarNivel1()`, virou `pintarNivel()` recebendo a coleção
  e onde pintar — um Nível 3 já não custa cópia nenhuma.

A previsão de que um terceiro livro ficaria perto do segundo caso se confirmou,
e por baixo. Se a sua leva estiver ficando perto do primeiro, releia o parágrafo
acima.

---

## 3. O esqueleto de cada capítulo

Um capítulo do livro vira um objeto no array. Campos obrigatórios (o detalhe de
cada um está em `livros.md`):

```jsonc
{
  "id": "aula-5", "numero": 5, "hanja": "五",
  "titulo": "…", "hangul": "-이에요 / -예요", "resumo": "…", "objetivo": "…",
  "ilustracao": "assets/<secao>/aula-5.svg",
  "vocabulario": [ { "ko": "학교", "pt": "escola", "hanja": "學校" } ],
  "topicos": [ { "id": "a5-t1", "titulo": "…", "grupo": "a5-g1", "corpo": [ … ] } ],
  "grupos":  [ { "id": "a5-g1", "titulo": "…", "itens": [ … ] },
               { "id": "a5-g4", "titulo": "O que você ouviu", "solto": true, "itens": [ … ] } ]
}
```

**Alvo por capítulo, medido no que já existe.** Nível 1: 3 tópicos de
explicação e 4 grupos de exercício (3 amarrados a tópicos + 1 solto de ditado),
24 exercícios em média — o menor tem 19 e o maior 35, e essa variação é a
própria lição sendo maior ou menor. Histórias: 2 tópicos e 3 grupos, ~50
exercícios, porque a unidade lá é vocabulário e não regra.

**`topicos[].grupo` é a única ligação entre explicação e exercício** e é o que
faz o botão "Praticar isto" existir. A verificação cobra: todo grupo é apontado
por um tópico **ou** tem `"solto": true`. Grupo órfão é exercício que ninguém
alcança lendo.

**Os ids de exercício são globais.** `estado.licoes` é um mapa só para o app
inteiro. Use um prefixo por seção (`a5-e3` no Nível 1, `d12-e7` nas Histórias,
`n2a1-e3` no Nível 2) e confira colisão contra os arquivos que já existem.

---

## 4. Adaptar os exercícios

Esta é a parte que mais rende. **Não invente tipo de exercício** — os sete que
existem cobriram os dois livros inteiros.

| No livro | Aqui | Regra de conversão |
|---|---|---|
| múltipla escolha de gramática | `escolha` | direto |
| escolher a palavra pela figura | `imagem` | direto, se houver SVG |
| certo/errado, "qual está correto?" | `vf` | vira uma afirmação única e checável |
| preencher lacuna | `lacuna` | `antes` + `depois` + banco de 3 |
| embaralhar palavras/sílabas | `montar` | peças na ordem certa no JSON |
| ouvir e marcar | `ditado` com `opcoes` | 4 alternativas |
| ouvir e escrever | `ditado` com `pecas` | monta o que ouviu |
| ligar vocabulário | `associar` | 4–5 pares por item |
| palavras cruzadas | `montar` por sílaba | a pista vira `dica` |
| caligrafia, traçado, "escreva 5×" | **descartar** | testa a mão, não a língua |
| resposta livre, desenho, "converse com um colega" | **descartar** | não há como corrigir |

### Exemplos reais

**Múltipla escolha de gramática → `escolha`.** O livro dá quatro frases e pede a
certa. Aqui o enunciado carrega a condição e as alternativas ficam com as duas
formas em disputa — a lição da aula 5 é exatamente escolher entre elas:

```jsonc
{ "id": "a5-e3", "tipo": "escolha",
  "enunciado": "A palavra termina em vogal. Qual terminação entra?",
  "opcoes": [{ "ko": "-예요" }, { "ko": "-이에요" }],
  "correta": 0,
  "explicacao": "Vogal final pede 예요." }
```

**Embaralhar palavras → `montar`, com peça a mais.** O livro dá exatamente as
peças da resposta. Aqui entra uma peça distratora, senão o exercício se resolve
por eliminação: com só 안 e 매워요 na tela, não há escolha a fazer.

```jsonc
{ "id": "a21-e4", "tipo": "montar",
  "enunciado": "Monte “Não é apimentado.”",
  "dica": "맵다 → 매워요",
  "pecas": ["안", "매워요.", "맵다"],
  "correta": "안매워요.",
  "explicacao": "안 매워요." }
```

A conferência dispara quando o **comprimento** do que foi montado alcança o da
resposta, não quando as peças acabam (`completou()` em `src/licoes.js`) — é o
que permite a peça sobrando existir.

**Palavras cruzadas → `montar` por sílaba.** Grade de cruzadas não cabe em tela
de telefone, e o que a pista cobra (significado → grafia) é o que o `montar`
cobra. A pista vira `dica`, as sílabas viram peças, e duas sílabas de outra
palavra do mesmo capítulo entram como distratoras.

**Preencher lacuna → `lacuna`, com a forma flexionada.** A frase da cena é
`그 친구는 너무 바빠요`, então a lacuna de 바쁘다 pede **바빠요**, não o lema. Não
digite a resposta à mão: ela é o que sobra ao casar a frase da lacuna com a
frase original. O banco de opções sai das respostas das outras lacunas do mesmo
capítulo — plausíveis, e erradas naquele buraco.

**Ouvir → `ditado`, nos dois feitios.** Distinguir 사전 de 사람 no ouvido é uma
habilidade separada de saber escrever 사전, e vem antes. Por isso cada capítulo
tem os dois: escolher entre quatro (`opcoes`) e montar o que ouviu (`pecas`).
Use `ehEscolha()` para saber de que lado um item cai — não olhe `tipo`.

**Pronúncia vira `escolha` com as quatro grafias de som.** Só funciona se você
rodar a palavra por `pronunciar()` antes: o motor é a fonte da verdade, e o
gabarito tem que bater com ele.

```jsonc
{ "id": "a12-e7", "tipo": "escolha",
  "enunciado": "Como se pronuncia 맛있어요?",
  "opcoes": [{ "ko": "[마시써요]" }, { "ko": "[맏이써요]" },
             { "ko": "[마디써요]" }, { "ko": "[맛이서요]" }],
  "correta": 0,
  "explicacao": "O ㅅ pula para a sílaba seguinte e volta a soar [s]." }
```

### Três regras que valem para todos

1. **A resposta certa é sempre índice 0 / primeira ordem no JSON.** O arquivo
   precisa ser legível e revisável à mão; quem embaralha é a tela.
2. **Toda `explicacao` aparece acertando e errando.** Ela é o ensino, não o
   castigo. Item sem explicação é item pela metade.
3. **Quase nada se digita.** Digitação é o que o baralho já cobra, com a escada
   de `niveis.js`. Na aula, digitar testaria o teclado.

---

## 5. O vocabulário vira dicionário

Toda palavra apresentada entra em `dados/palavras.json` com o esquema completo e
**`"baralho": false`** — fica no dicionário, conta para o mapa e para as famílias
de morfemas, e não ocupa a fila do dia. Marque a origem com `aula: N` ou
`dia: N`, e acrescente `nivel: N` quando o número da aula sozinho for ambíguo —
cada nível recomeça a contagem no 1, e o dicionário do mapa mostra essa marca.

Antes de escrever a entrada:

- **Reuse o que já existe.** 129 das 500 palavras do livro de vocabulário já
  estavam no banco. Compare por grafia e cheque quase-duplicata (o app tinha
  좋아요; o livro traz 좋다 — é a mesma entrada).
- **Homógrafo é entrada separada.** 눈 (olho) e 눈 (neve) são palavras
  diferentes com a mesma grafia, como 개 (cachorro) e 개 (contador). Se o livro
  numera (쓰다01, 쓰다02), a chave do léxico carrega o número e a tela mostra a
  grafia limpa.
- **`romanizacao` é da grafia, pela RR** — `hakgyo`, não `hak-kkyo`. O livro
  costuma romanizar a pronúncia; não copie. A RR reflete assimilação (비음화,
  유음화, 격음화) mas ignora tensificação.
- **`sino` é sílaba → hanja, nunca lista posicional.** E todo ideograma citado
  precisa de verbete em `dados/hanja.json`, senão a família aparece sem
  significado.
- **`exemplo` sai de uma frase que a pessoa já viu** no capítulo, não de uma
  frase inventada.

### O invariante que quebra toda leva, sem falta

`distratores()` (em `src/niveis.js`) prefere, nesta ordem: confundível
explícito → mesmo `campo` → mesmo `modulo` → mesma `classe`. **`modulo` vem
antes de `classe`**, então módulo que mistura classes devolve a classe errada
antes de chegar ao degrau que a protege.

Isso quebrou nas duas levas — 9,8% na primeira, 0,95% na segunda. O conserto é
sempre de dados, nunca de código:

- dê **`campo`** às palavras de um módulo de classe mista (`nocao` para
  substantivo abstrato, `ritmo` para advérbio, `posicao`, `sabor`);
- mova a palavra para o módulo onde a classe dela mora;
- **`confundiveis` tem que ser da mesma classe** — é o primeiro degrau, e
  cruzar classe ali faz o exercício testar sintaxe em vez de significado;
- **`par` é recíproco**: se A aponta B, B aponta A.

E o invariante vale para **os dois baralhos**: o do arquivo e o do arquivo com
tudo promovido. O segundo é um clique de distância.

---

## 6. Ilustrações

Uma por capítulo, em `assets/<secao>/`, SVG 200×200: círculo de fundo r=94,
paleta de ~5 cores, **zero texto na imagem**. Olhe 3–4 SVGs existentes antes de
desenhar — a paleta e o traço já estão estabelecidos.

Nas Histórias, cada dia junta dois capítulos do livro, e a capa mostra os dois
motivos (a mala e a televisão; o calendário e a montanha), porque a unidade é
feita de duas cenas.

---

## 7. Quando escrever à mão e quando gerar

**Gramática: à mão.** A explicação é prosa, a ordem das ideias é conteúdo e o
exercício depende do ponto sendo ensinado. Trabalhe em levas de 8 capítulos.

**Vocabulário: gerar.** A estrutura se repete 500 vezes e copiar à mão é onde o
erro entra. Separe:

```
lexico.py        português, classe, módulo, hanja — escrito à mão
historias.py     as cenas traduzidas frase a frase — escrito à mão
combinacoes.py   a coluna de palavras relacionadas — escrito à mão
gerar.py         a montagem — mecânica, sem conteúdo dentro
```

Se uma segunda leva vier depois (foi o caso: dias 1–20, depois 21–50), crie
`lexico2.py`/`historias2.py` e faça o gerador unir os dois mapas. Não reescreva
o primeiro.

---

## 8. Verificação — obrigatória antes do PR

Não há suíte no repositório (Regra zero). O que existe é esta bateria. **Tudo
tem que dar zero ou `nenhuma`.**

### 8.1 Invariantes dos exercícios (Node, sem navegador)

Use a mesma `src/licoes.js` que corrige na tela — não escreva um segundo
corretor.

```js
import fs from 'fs';
import * as licoes from './src/licoes.js';
const secao = JSON.parse(fs.readFileSync('dados/<arquivo>.json', 'utf8'));
const itens = secao.flatMap(licoes.itensDaAula);

// id único e sem colidir com as outras seções; enunciado e explicação presentes
// responder certo passa, responder o vizinho falha
// associar: 'a' e 'b' únicos dentro do item
// montar/ditado: as peças montam a resposta, e nenhum prefixo estrito dispara
//   completou() antes da hora
// todo grupo é apontado por um tópico ou tem solto:true
```

### 8.2 Integridade do banco e distratores

```js
// confundível órfão, par órfão, par sem reciprocidade
// hanja sem verbete em dados/hanja.json
// sino com sílaba que não está na palavra
// ilustração citada que não existe no disco
// distratores: 0,00% de classe errada NOS DOIS baralhos
```

Os comandos prontos estão em `CLAUDE.md`, seção "Verificação", e em
`historias.md`. Rode também os invariantes antigos (`pronunciar('학교').som`
= `학꾜`, `intervalo(21)` = `21.0000`, dica que não vaza) — palavra nova mexe
neles.

### 8.3 Fluxo no navegador (Playwright)

Chromium já está em `/opt/pw-browsers`; instale só o driver, **fora do repo**:

```sh
npm install playwright-core --no-audit --no-fund
python3 -m http.server 8811     # na raiz do repositório
```

O script tem que **responder todos os exercícios lendo as respostas do próprio
JSON** — nunca decoradas no script — e conferir: zero erro de console, o
contador da aba fechando em `N/N`, e o progresso sobrevivendo ao recarregamento.

Quatro detalhes que já quebraram o harness:

- `hasText` do Playwright é **substring**: `예요` casa com o botão `이에요`.
  Ancore com `new RegExp('^' + escapado + '$')`.
- Seletor de classe genérica (`.cartao-aula`) pega as três seções, incluindo as
  escondidas. Escope pelo id da lista (`#lista-dias .cartao-aula`).
- **Botão que existe em toda tela** — `[data-ir="hoje"]` é o de voltar, e há um
  em cada seção, quase todas escondidas. `.first()` pega uma invisível e o
  clique trava esperando visibilidade. Escope pela tela
  (`#tela-nivel2 [data-ir="hoje"]`).
- **Morfema que aparece numa palavra só não forma família.** `familias()` exige
  mais de uma, então esperar na tela a família de um hanja que você acabou de
  introduzir sozinho é esperar errado.

E um do checador, não do harness: **a busca pela ordem das peças de um `montar`
não pode chamar `normalizar()` peça a peça.** Ela apara a pontuação final, e uma
peça que termina em ponto no meio da montagem (`["아니요.", "집에", "안",
"가요."]`) perde o ponto e nunca casa com o alvo — o checador acusa insolúvel um
exercício perfeito. A poda compara só sem espaço; `normalizar()` é para a
aceitação, que é o que `conferir()` faz.

O harness **não é commitado**: cada leva precisa de um cenário um pouco
diferente, e escrever sob medida no scratchpad é mais rápido que manter um
genérico.

---

## 9. Documentar e mergear

1. Crie o `<secao>.md` no molde de `livros.md`: de onde vem o conteúdo, a tabela
   dos capítulos, o esquema, os tipos de bloco e de exercício, **o que ficou de
   fora e por quê**, e a bateria de verificação com o resultado da rodada.
2. Atualize `README.md` (parágrafo da seção, árvore de arquivos, contagens),
   `CLAUDE.md` (a seção nova no mapa, e a checagem de distratores se o baralho
   promovível mudou) e este arquivo, se o processo mudou.
3. Commit em português, primeira linha curta no imperativo, corpo explicando o
   **porquê**. PR sempre com **merge commit** — não squash, não rebase.
4. Se o PR da branch anterior já mergeou, reinicie a branch a partir da `main`
   atualizada em vez de empilhar em cima de histórico mergeado.

---

## 10. Armadilhas, em uma linha cada

- **Contagem escrita na mão no código.** `"de 200 palavras"` virou mentira na
  leva seguinte. Tire dos dados.
- **`ir()` e o cache do navegador.** `index.html` e `src/app.js` têm cache
  separado; HTML novo com JS velho já apagou a tela inteira. Destino
  desconhecido tem que cair no início, nunca esconder tudo.
- **Colisão de classe CSS.** `.ficha`, `.opcao`, `.exemplo-ko` já existiam.
  Antes de nomear, `grep` no `main.css`.
- **Renomear em massa com script.** Um `sed` de classe CSS trocou também duas
  strings de tipo de dado (`'exemplos'` → `'aula-exemplos'`). Confira o diff.
- **`git checkout <arquivo>` apaga edição não commitada.** Já custou uma seção
  inteira de documentação reescrita.
- **Módulo novo aparece sozinho no mapa** — só o nome acentuado precisa de uma
  linha em `NOME_MODULO`, e sem ela o id ainda aparece legível.
