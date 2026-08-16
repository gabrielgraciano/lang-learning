# 한국어

Site estático para aprender vocabulário de coreano com recuperação ativa,
agendamento espaçado FSRS e a pronúncia derivada da escrita.

Você olha o desenho e **produz** a palavra em 한글. A tradução só aparece
depois — para desfazer dúvida, nunca para entregar a resposta.

Metade do vocabulário mais frequente do coreano não se ilustra sem ambiguidade
(것, 수, 때, 하다, 있다). Para essas, o estímulo é uma frase com lacuna. Mesmo
baralho, mesma fila, mesma escada de dificuldade — só o estímulo muda.

## O que ele faz de diferente

**A pronúncia é calculada, não catalogada.** 학교 se escreve com dois ㄱ e se diz
[학꾜]. 옷 termina em ㅅ e soa [옫]. O app aplica as regras do 표준 발음법 —
경음화, 비음화, 연음, 격음화, 유음화, 구개음화 — e mostra o som **junto com o
nome e a explicação da regra que agiu**, mas só quando ele contradiz a grafia,
que é quando isso ensina alguma coisa.

**Dá para digitar 한글 sem ter teclado coreano.** Três caminhos no mesmo campo:
o IME do sistema, se você tiver; a transliteração 두벌식 ao vivo, em que
`gkrry` vira 학교 num teclado ABNT; ou o teclado de tela. A composição é a
decomposição em jamo invertida — mesma aritmética do bloco Unicode.

**Nada de "revelar e me avaliar".** Cada palavra sobe uma escada de quatro
níveis conforme a memória estabiliza — apresentação, reconhecimento entre
quatro, recall com dica, recall pleno digitado. O nível é derivado da
estabilidade FSRS, então errar rebaixa a palavra sozinho.

**Adjetivo se aprende em par, e o alvo tem ênfase.** 크다 e 작다 são o mesmo
desenho com as opacidades trocadas: o contraste desambigua "grande" de "bola", e
a ênfase desambigua qual dos dois lados está sendo pedido. Verbo se ilustra com
figura em ação — sempre o mesmo personagem, que vira mascote de graça.

**Vocabulário vira sistema.** Cerca de 70% do coreano é sino-coreano. Quando
você acerta 학생, o gabarito mostra que o 학 é o mesmo de 학교 (學, "estudar") e
que o 생 é o mesmo de 선생님 (生, "viver") — o que era lista de palavras passa a
ser rede de morfemas. O índice se monta sozinho a partir dos dados.

**O progresso é memória medida.** No mapa, cada palavra é uma célula cuja cor é
o estado real do cartão. Quando a palavra fica firme, a célula revela a
ilustração — a grade vira álbum.

**A gramática é lida, não adivinhada.** Além do baralho, o Nível 1 traz oito
aulas com explicação em texto e em áudio e 213 exercícios — sendo 49 de ouvir e
responder. Dentro de cada trecho da explicação há um atalho para os exercícios
daquele trecho, para praticar sem perder o lugar da leitura. O que cada aula
cobre está em [`livros.md`](livros.md).

**O vocabulário das aulas vira dicionário antes de virar cartão.** Toda palavra
apresentada no Nível 1 entra em `dados/palavras.json` com o esquema completo —
romanização, morfemas sino-coreanos, exemplo, nota — mas marcada `baralho:
false`, fora da fila do dia. Ela já conta para as famílias de morfemas e aparece
no mapa; virar cartão é apagar uma linha do JSON.

Sem streak, sem vidas, sem ranking. Meta semanal com folga e ritmo ajustável.

O porquê de cada uma dessas escolhas está em [`docs/fundamentacao.md`](docs/fundamentacao.md).

## Design

A interface é desenhada em cima do 원고지, o papel quadriculado em que se
aprende a escrever coreano — uma sílaba por célula. A célula é a unidade de
tudo: o título são três células, a trilha da sessão é uma fileira, o mapa é uma
grade, e o gabarito desmonta cada sílaba nas peças que a formam.

Essa decomposição é calculada: o bloco Hangul Syllables do Unicode é gerado por
fórmula, então `src/hangul.js` desmonta 고양이 em ㄱㅗ · ㅇㅑㅇ · ㅇㅣ sem
nenhuma tabela de palavras — e remonta pelo mesmo caminho quando você digita.

As fontes vêm do Google Fonts (Gowun Batang para o 한글, Archivo para a
interface, DM Mono para números e rótulos). Sem rede, as pilhas de fallback
seguram o layout.

## Rodar localmente

O app carrega o vocabulário com `fetch`, então precisa de um servidor HTTP —
abrir o `index.html` direto do disco (`file://`) não funciona.

```sh
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

Não há build, nem dependências, nem `node_modules`. O que está no repositório é
o que vai ao ar.

## Publicar no GitHub Pages

Em **Settings → Pages**, escolha *Deploy from a branch*, branch `main` e pasta
`/ (root)`. Os caminhos são todos relativos, então o subdiretório do Pages
funciona sem configuração extra.

## Estrutura

```
index.html                 # hoje, estudo, fim, mapa, nível 1, aula, ajustes
estilos/main.css           # tokens, células, temas claro e escuro
src/app.js                 # orquestra as telas, o laço de estudo e as aulas
src/hangul.js              # decompõe e compõe sílabas 한글
src/pronuncia.js           # deriva o som a partir da escrita
src/fsrs.js                # FSRS-5 (pesos padrão) e estados de memória
src/niveis.js              # a escada de 4 níveis, distratores, dicas
src/agenda.js              # a fila do dia
src/licoes.js              # correção dos exercícios e progresso das aulas
src/sino.js                # morfemas sino-coreanos e famílias de palavras
src/teclado.js             # transliteração 두벌식 e teclado de tela
src/armazenamento.js       # progresso, registro, exportar/importar
dados/palavras.json        # o dicionário: baralho + vocabulário das aulas
dados/hanja.json           # morfema → significado
dados/licoes.json          # fonte da verdade das aulas do Nível 1
assets/ilustracoes/*.svg   # uma ilustração por palavra
assets/licoes/*.svg        # uma ilustração por aula
docs/fundamentacao.md      # por que o app é assim
livros.md                  # o que cada aula do Nível 1 cobre
```

## Adicionar uma palavra

1. Coloque a ilustração em `assets/ilustracoes/` — SVG de 200×200, sujeito
   isolado sobre um círculo de fundo, paleta reduzida, **sem texto** na imagem.
2. Acrescente uma entrada em `dados/palavras.json`:

Card ilustrado:

```json
{
  "id": "escola",
  "hangul": "학교",
  "romanizacao": "hakgyo",
  "pt": "escola",
  "ilustracao": "assets/ilustracoes/escola.svg",
  "modulo": "lugares",
  "imageabilidade": 5,
  "topik": 1,
  "sino": { "학": "學", "교": "校" },
  "confundiveis": ["estudante", "restaurante"],
  "exemplo": { "ko": "학교에 다녀요.", "pt": "Frequento a escola." },
  "nota": "Escreve-se com dois ㄱ seguidos, mas o segundo endurece: [학꾜]."
}
```

Card de frase, para o que não se ilustra:

```json
{
  "id": "possibilidade",
  "hangul": "수",
  "pt": "poder, saber fazer",
  "tipo": "frase",
  "classe": "funcional",
  "modulo": "alta-frequencia",
  "frase": { "ko": "저는 수영할 {} 있어요.", "pt": "Eu sei nadar." },
  "padrao": "-(으)ㄹ 수 있다 / 없다",
  "confundiveis": ["coisa", "quando", "caso"],
  "nota": "수 só existe dentro dessa construção. Fora dela, a palavra não significa nada."
}
```

Nenhuma mudança de código é necessária. Um módulo novo aparece sozinho no mapa —
só o nome acentuado precisa de uma linha em `NOME_MODULO`, e sem ela o id ainda
aparece legível.

| Campo | Para quê |
|---|---|
| `hangul`, `pt`, `ilustracao` | obrigatórios |
| `confundiveis` | vira distrator da múltipla escolha — é assim que se constrói a fronteira de significado |
| `exemplo`, `nota` | o gabarito de especialista; uma tradução seca não basta |
| `imageabilidade` | 1 a 5, curadoria manual — o critério de entrada no baralho |
| `pronuncia` | só quando a regra não dá conta (물고기 → 물꼬기); o normal é deixar em branco e o motor derivar |
| `sino` | mapa sílaba → hanja (`{"학":"學","교":"校"}`); alimenta as famílias. Por sílaba e não por posição, porque em 빨간색 só o 색 é sino-coreano |
| `baralho` | `false` guarda a palavra no dicionário sem pôr na fila do dia. É como o vocabulário do Nível 1 entra antes de virar cartão; ausente significa `true` |
| `aula` | de qual aula do Nível 1 a palavra veio, quando veio de alguma |
| `classe` | `substantivo`, `verbo`, `adjetivo`, `numeral` ou `funcional` — impede que a múltipla escolha ofereça um substantivo onde só cabe um verbo |
| `campo` | subgrupo dentro do módulo; é o que mantém os distratores dentro do mesmo sistema (nativo vs. sino nos números) |
| `par` | id do antônimo; obrigatório em adjetivo, que só se aprende em par |
| `tipo` | `frase` transforma o card: o estímulo passa a ser a frase com lacuna |
| `frase` | `{ ko, pt }`, com `{}` marcando onde a palavra entra |
| `resposta` | a forma que a lacuna pede, quando difere do lema (하다 → 해요) |
| `padrao` | a construção em que a palavra vive (`-(으)ㄹ 수 있다`) |

## Controles

| Ação | Teclado | Toque |
| --- | --- | --- |
| Escolher alternativa | `1`–`4` | tocar |
| Responder o que digitou | `Enter` | botão **Responder** |
| Avançar do gabarito | `Enter` | botão **Continuar** |
| Digitar 한글 sem IME | layout 두벌식 (`gkrry` → 학교) | teclado de tela |

## O baralho

| Módulo | Palavras | Formato |
|---|---|---|
| Substantivos concretos (9 campos) | 34 | ilustrado |
| Ações | 20 | ilustrado, figura em ação |
| Qualidades | 12 | ilustrado, par antônimo com ênfase |
| Alta frequência | 16 | frase com lacuna |
| Números nativos | 10 | ilustrado, fichas contáveis |
| Números sino-coreanos | 10 | frase com lacuna |
| Cores | 6 | ilustrado |
| Contadores | 6 | frase com lacuna |
| **Total** | **114** | |

O coreano tem dois sistemas de número, e um desenho de três fichas ilustra 셋 e
삼 igualmente bem. Por isso o nativo é ilustrado (contar coisas *é* o domínio
dele) e o sino-coreano vem em frase, onde o contexto — 월, 층, 분 — força o
sistema. Contador também é frase, porque contador nunca aparece sozinho.

## Próximos passos

- Tela interna com os itens de maior taxa de erro — detector de ilustração ambígua
- Palavras de tempo: 오늘, 내일, 어제, 아침, 저녁, 주말
- Mais vocabulário de alta frequência no formato de frase
- Alinhamento explícito com os níveis TOPIK
