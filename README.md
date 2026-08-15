# 한국어

Site estático para aprender vocabulário de coreano por ilustração, com
recuperação ativa, agendamento espaçado FSRS e a pronúncia derivada da escrita.

Você olha o desenho e **produz** a palavra em 한글. A tradução só aparece
depois — para desfazer dúvida, nunca para entregar a resposta.

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

**O progresso é memória medida.** No mapa, cada palavra é uma célula cuja cor é
o estado real do cartão. Quando a palavra fica firme, a célula revela a
ilustração — a grade vira álbum.

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
index.html                 # hoje, estudo, fim, mapa, ajustes
estilos/main.css           # tokens, células, temas claro e escuro
src/app.js                 # orquestra as telas e o laço de estudo
src/hangul.js              # decompõe e compõe sílabas 한글
src/pronuncia.js           # deriva o som a partir da escrita
src/fsrs.js                # FSRS-5 (pesos padrão) e estados de memória
src/niveis.js              # a escada de 4 níveis, distratores, dicas
src/agenda.js              # a fila do dia
src/teclado.js             # transliteração 두벌식 e teclado de tela
src/armazenamento.js       # progresso, registro, exportar/importar
dados/palavras.json        # fonte da verdade do vocabulário
assets/ilustracoes/*.svg   # uma ilustração por palavra
docs/fundamentacao.md      # por que o app é assim
```

## Adicionar uma palavra

1. Coloque a ilustração em `assets/ilustracoes/` — SVG de 200×200, sujeito
   isolado sobre um círculo de fundo, paleta reduzida, **sem texto** na imagem.
2. Acrescente uma entrada em `dados/palavras.json`:

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
  "sino": ["學", "校"],
  "confundiveis": ["estudante", "restaurante"],
  "exemplo": { "ko": "학교에 다녀요.", "pt": "Frequento a escola." },
  "nota": "Escreve-se com dois ㄱ seguidos, mas o segundo endurece: [학꾜]."
}
```

Nenhuma mudança de código é necessária.

| Campo | Para quê |
|---|---|
| `hangul`, `pt`, `ilustracao` | obrigatórios |
| `confundiveis` | vira distrator da múltipla escolha — é assim que se constrói a fronteira de significado |
| `exemplo`, `nota` | o gabarito de especialista; uma tradução seca não basta |
| `imageabilidade` | 1 a 5, curadoria manual — o critério de entrada no baralho |
| `pronuncia` | só quando a regra não dá conta (물고기 → 물꼬기); o normal é deixar em branco e o motor derivar |
| `sino` | hanja dos morfemas, para as famílias de palavras mais adiante |

## Controles

| Ação | Teclado | Toque |
| --- | --- | --- |
| Escolher alternativa | `1`–`4` | tocar |
| Responder o que digitou | `Enter` | botão **Responder** |
| Avançar do gabarito | `Enter` | botão **Continuar** |
| Digitar 한글 sem IME | layout 두벌식 (`gkrry` → 학교) | teclado de tela |

## Próximos passos

- Tela interna com os itens de maior taxa de erro — detector de ilustração ambígua
- Cards de frase com lacuna, para o vocabulário que não é ilustrável
- Famílias de palavras por morfema sino-coreano (o campo `sino` já está lá)
- Mais módulos: verbos de ação, adjetivos em pares antônimos, sistemas fechados
