# CLAUDE.md

Guia para quem (humano ou agente) for trabalhar neste repositório depois. O
racional de produto — por que o app é assim e não de outro jeito — está em
`docs/fundamentacao.md` e não é repetido aqui. Este documento é sobre como
mexer no código sem quebrar as invariantes que ele depende.

## O que é este projeto

App de vocabulário de coreano por ilustração, com recuperação ativa,
agendamento espaçado (FSRS-5) e pronúncia derivada da escrita — não catalogada.
Site estático, zero dependências, zero build. O que está no repositório é o
que vai ao ar via GitHub Pages.

Antes de tocar em qualquer coisa, leia o `README.md` (visão geral e como
adicionar palavra) e `docs/fundamentacao.md` (por que cada decisão existe,
numeradas 1–14). Uma mudança que pareça óbvia — "por que a romanização vem
desligada?", "por que o card de frase não é uma tela separada?" — quase sempre
tem uma decisão documentada por trás. Leia antes de reverter.

Além do baralho há duas seções de conteúdo, cada uma com o seu próprio mapa:
**Nível 1** (gramática, 25 aulas) em `livros.md`, e **Histórias** (vocabulário,
25 dias de 20 palavras) em `historias.md`. As duas rodam na mesma tela e são
corrigidas pelo mesmo `src/licoes.js`; o que muda é o arquivo de dados.

Se a tarefa for **portar mais um livro**, leia `protocolo.md` antes de começar:
é o passo a passo do que foi feito nas duas seções, com as armadilhas que já
custaram tempo e a bateria de verificação que precisa passar.

## Regra zero: sem build, sem dependências

Não há `package.json`, não há bundler, não há linter configurado, não há
`node_modules`. Módulos ES nativos, importados direto pelo navegador. Isso é
deliberado (offline-first, deploy = git push). Não introduza:

- um bundler ou transpilador
- uma dependência de runtime (nem o `ts-fsrs`, que `src/fsrs.js` deliberadamente
  reimplementa em vez de importar — ver o comentário no topo do arquivo)
- TypeScript (os JSDoc `@typedef`/`@param` já dão tipo onde importa)

Se uma tarefa parecer exigir isso, pare e pergunte antes de adicionar.

## Convenções de código

- **Identificadores em português**, em todo o codebase — funções, variáveis,
  nomes de campo no JSON. Comentários em português. Strings de interface em
  português. Não é meia-tradução: `hangul`, `pt`, `ko` são as únicas siglas em
  inglês, porque nomeiam o idioma, não o conceito.
- Aspas simples, ponto-e-vírgula, indentação de 2 espaços, `const`/`let` (nunca
  `var`), arrow function para tudo que não precise de método de objeto.
- **Comentários explicam por quê, nunca o quê.** Um bloco JSDoc no topo do
  arquivo carrega o racional da existência do módulo (com números, quando a
  fonte tem números — "20–30% menos revisões", "52 vezes no recorte"), e
  comentários inline só aparecem onde uma regra não é óbvia de só ler o código.
  Se você apagar o comentário e o código continua claro, o comentário não devia
  existir. Olhe qualquer arquivo em `src/` antes de escrever o primeiro — o tom
  importa tanto quanto a lógica.
- Funções pequenas e puras onde dá. `src/fsrs.js` e `src/niveis.js` não tocam
  DOM; `src/app.js` é a única camada que lê/escreve elementos — mantenha essa
  separação ao adicionar tela ou lógica nova.

## O modelo mental do app

Tudo gira em torno de uma abstração: **estímulo → resposta → gabarito**. Um
card não é "uma imagem com um verso"; é um item de `dados/palavras.json` que
atravessa a mesma escada de 4 níveis (`src/niveis.js`), o mesmo agendador
(`src/fsrs.js`), a mesma fila (`src/agenda.js`), independente de qual é o
estímulo.

Isso importa porque **há dois formatos de card hoje, e um terceiro é
questão de tempo:**

| | Ilustrado | Frase (`tipo: "frase"`) |
|---|---|---|
| Estímulo | `ilustracao` (SVG) | `frase.ko` com `{}` de lacuna + `frase.pt` |
| Tudo mais | idêntico | idêntico |

Se você for adicionar um formato novo (áudio, vídeo, o que for), a pergunta
certa não é "que tela eu crio" — é "o que muda no estímulo, e o resto do loop
continua servindo?". `pintarEstimulo()` em `src/app.js` é o único ponto de
ramificação; se seu formato novo precisar tocar em `mostrarGabarito`,
`avaliar`, ou no agendador, provavelmente está sendo modelado errado.

Duas outras separações que a base já resolveu e que vale reusar em vez de
reinventar:

- **Lema vs. forma de resposta** (`respostaDe()` em `src/niveis.js`). 하다 não
  cabe numa frase na forma de dicionário — a resposta certa é 해요. `hangul` é
  o que o FSRS agenda e o mapa mostra; `resposta`, quando presente, é o que a
  escada de dica, a múltipla escolha e a conferência usam. Ignorar isso e
  comparar contra `hangul` direto quebra qualquer palavra irregular.
- **Score de imageabilidade e confundíveis não são decoração.** `confundiveis`
  alimenta o distrator da múltipla escolha nesta ordem de prioridade:
  confundível explícito → mesmo `campo` → mesmo `modulo` → mesma `classe`
  gramatical → qualquer um. Um substantivo entre quatro verbos se elimina
  sozinho, então a camada de `classe` existe para a alternativa errada
  continuar sendo *possível*.

  Repare que `modulo` vem **antes** de `classe`: módulo que mistura classes
  devolve a classe errada antes de chegar ao degrau que a protege. É para isso
  que serve o `campo` — `nocao`, `ritmo`, `posicao`, `sabor`, `bebida` existem
  porque `alta-frequencia`, `tempo` e `comida` misturam. Ao acrescentar palavra
  a um módulo misto, dê `campo` a ela e rode a checagem de distratores.

- **O baralho não é o arquivo.** `baralho: false` guarda a palavra no dicionário
  sem pôr na fila, e `estado.promovidas` (localStorage) é o que quem estuda
  acrescenta pelo botão de cada dia das Histórias. Os dois se juntam em
  `recalcularBaralho()`, em `src/app.js` — um lugar só, de propósito. Qualquer
  invariante do baralho precisa valer também para o baralho **depois** de
  promover todos os dias, porque isso é um estado que o app alcança sozinho.

## Vocabulário (`dados/palavras.json`)

Fonte única de verdade — nenhuma mudança de card exige tocar em código. O
README documenta cada campo com exemplo (card ilustrado e card de frase); não
duplicado aqui. Ao adicionar palavra:

1. **Ilustração primeiro, se houver.** SVG 200×200, sujeito isolado sobre
   círculo de fundo, paleta de ~5 cores, **zero texto na imagem** (modelo
   generativo produz pseudo-hangul; à mão, texto quebra o estilo). Olhe 3–4
   SVGs existentes do mesmo tipo de conteúdo antes de desenhar — substantivo é
   objeto isolado, verbo é sempre o mesmo personagem em ação, adjetivo é o
   *mesmo arquivo* do par com opacidade trocada (veja `grande.svg` /
   `pequeno.svg`).
2. **`sino` é sílaba → hanja, nunca lista posicional.** Nem toda palavra é
   inteiramente sino-coreana (`빨간색` só tem `색` sino-coreano); mapear por
   posição atribuiria o hanja errado à sílaba errada. O índice de famílias
   (`src/sino.js`) se monta sozinho a partir disso — não crie família manual em
   lugar nenhum.
3. **`pronuncia` só quando a regra morfológica não é recuperável da grafia**
   (ex.: `물고기` → `물꼬기`). Antes de preencher esse campo, rode a palavra
   por `pronunciar()` (`src/pronuncia.js`) e confira se ela já acerta sozinha —
   hoje nenhuma das 114 palavras do baralho precisa do override.
4. **`confundiveis` precisa ser recíproco em espírito**, mesmo que não em
   código: se A lista B como confundível, normalmente B deveria listar A. Isso
   não é validado automaticamente — confira à mão. E precisa ser da **mesma
   classe gramatical**: é o primeiro degrau da escada de distratores, e cruzar
   classe ali faz o exercício testar sintaxe em vez de significado.
5. Depois de editar o JSON, rode as checagens de invariante da seção seguinte
   antes de considerar terminado.

## Verificação — não existe suite automatizada no repo

Não há testes commitados (é site estático sem build; adicionar um framework de
teste contradiria a Regra zero). O que existe é uma bateria de checagens ad hoc
que qualquer sessão deveria rodar antes de abrir PR. Nenhuma delas precisa de
dependência nova além de Node e, para o e2e, um Chromium local.

**Lógica pura (Node, sem navegador) — rode isto sempre que mexer em
`hangul.js`, `pronuncia.js`, `fsrs.js` ou `niveis.js`:**

```js
// pronúncia: confira alguns pares grafia→som conhecidos
import { pronunciar } from './src/pronuncia.js';
console.log(pronunciar('학교').som);  // 학꾜
console.log(pronunciar('앉다').som);  // 안따

// FSRS: a propriedade que precisa continuar valendo —
// com retenção-alvo 0.9, intervalo(dias) == estabilidade
import { intervalo, recuperabilidade } from './src/fsrs.js';
console.log(intervalo(21).toFixed(4));           // 21.0000
console.log(recuperabilidade(21, 21).toFixed(3)); // 0.900

// escada de dica: nunca pode entregar a resposta, nem em monossílabo
import { graus, respostaDe } from './src/niveis.js';
import palavras from './dados/palavras.json' with { type: 'json' };
const vaza = palavras.filter((w) => {
  const a = respostaDe(w), g = graus(a);
  return g.slice(1, -1).includes(a);
});
console.log('dica que vaza a resposta:', vaza.length ? vaza.map(w => w.hangul) : 'nenhuma');

// distratores: nunca repetido, nunca de classe gramatical diferente.
// Roda nos DOIS baralhos que o app alcança: o do arquivo e o do arquivo com os
// vinte e cinco dias das Histórias promovidos, que é um clique de distância.
import { distratores, alternativas } from './src/niveis.js';
import dias from './dados/dias.json' with { type: 'json' };
const idsDias = new Set(dias.flatMap((d) => d.palavras));
for (const [nome, banco] of [
  ['baralho de hoje', palavras.filter((p) => p.baralho !== false)],
  ['com os 25 dias', palavras.filter((p) => p.baralho !== false || idsDias.has(p.id))],
]) {
  let fora = 0, tot = 0, dup = 0, rodadas = 0;
  for (let i = 0; i < 15; i++) for (const w of banco) {
    const alts = alternativas(w, banco).map(respostaDe);
    rodadas++; if (alts.length !== new Set(alts).size) dup++;
    const d = distratores(w, banco);
    tot += d.length; fora += d.filter((x) => x.classe !== w.classe).length;
  }
  console.log(nome, '| rodadas com repetição:', dup, 'de', rodadas,
    '| distratores de classe errada:', (100 * fora / tot).toFixed(2) + '%');
}
```

Todas devem dar exatamente os valores comentados / zero. Se `dup`, `fora`, ou
`vaza` não forem zero depois de adicionar palavra, o problema quase sempre é
`confundiveis` faltando ou `classe` errada na entrada nova.

**Integridade do banco (Node, sem navegador):**

```js
import fs from 'fs';
const p = JSON.parse(fs.readFileSync('dados/palavras.json', 'utf8'));
const ids = new Set(p.map((w) => w.id));
console.log('ilustração faltando:',
  p.filter((w) => w.ilustracao && !fs.existsSync(w.ilustracao)).map((w) => w.id));
console.log('confundíveis órfãos:',
  p.flatMap((w) => (w.confundiveis || []).filter((c) => !ids.has(c)).map((c) => w.id + '→' + c)));
console.log('par órfão:', p.filter((w) => w.par && !ids.has(w.par)).map((w) => w.id));
console.log('frase sem {}:',
  p.filter((w) => w.tipo === 'frase' && !w.frase.ko.includes('{}')).map((w) => w.id));

const hanja = JSON.parse(fs.readFileSync('dados/hanja.json', 'utf8'));
console.log('hanja sem verbete:',
  [...new Set(p.flatMap((w) => Object.values(w.sino || {})).filter((h) => !hanja[h]))]);
const dias = JSON.parse(fs.readFileSync('dados/dias.json', 'utf8'));
console.log('id promovido que não existe:',
  dias.flatMap((d) => d.palavras).filter((i) => !ids.has(i)));
```

**Fluxo completo no navegador (Playwright).** O ambiente de execução já traz
Chromium em `/opt/pw-browsers`; instale só o driver:

```sh
npm install playwright-core --no-audit --no-fund   # numa pasta fora do repo
python3 -m http.server 8811 &                       # serve o app na raiz do repo
```

Depois, um script que abre `chromium.launch({ executablePath:
'/opt/pw-browsers/<versão>/chrome-linux/chrome' })`, semeia
`localStorage['coreano.flashcards.v2']` com cartões em estados de estabilidade
conhecidos (para forçar cada um dos 4 níveis sem esperar dias reais), e
percorre a sessão inteira clicando/digitando pelas respostas certas (lidas do
próprio `dados/palavras.json`, nunca hardcoded). Confira ao final: zero erro de
console, os quatro níveis exercitados, mapa e ajustes renderizando, e o
registro (`localStorage`) crescendo uma linha por resposta.

Isso não está commitado como arquivo porque cada mudança tende a precisar de
um cenário de sessão ligeiramente diferente (que estado semear, que tela
conferir) — escrever o script sob medida no scratchpad é mais rápido que
manter um harness genérico. Se esse padrão mudar (por exemplo, se surgir uma
suíte de regressão estável que vale reusar sempre), aí sim vale commitar em
`scripts/` ou similar.

## Git

- Branch de trabalho: `claude/level-1-lessons-exercises-y38u8e`.
- Mensagem de commit em português, primeira linha curta e no imperativo,
  corpo explicando o *porquê* — os commits já no histórico
  (`git log --oneline`) são o padrão a seguir, não um genérico "update files".
- PR sempre com merge commit (não squash, não rebase) — é a convenção que o
  histórico deste repo já usa desde antes desta leva de trabalho.
- Nunca force-push sobre uma branch cujo PR já foi mergeado. Se o PR de
  `claude/level-1-lessons-exercises-y38u8e` mergeou, a próxima leva
  reinicia a branch a partir da `main` atualizada
  (`git checkout main && git pull && git checkout -B
  claude/level-1-lessons-exercises-y38u8e`) em vez de empilhar em
  cima de histórico já mergeado.
