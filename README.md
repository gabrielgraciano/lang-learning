# 한국어 flashcards

Site estático de flashcards ilustrados para aprender vocabulário de coreano.
Frente do card: a ilustração. Verso: a palavra em 한글, a decomposição da
sílaba em jamo, a romanização e o significado em português.

## Design

A interface é desenhada em cima do 원고지, o papel quadriculado em que se
aprende a escrever coreano — uma sílaba por célula. A célula é a unidade de
tudo: o título são três células, o card é uma célula, o progresso é uma fileira
de células (cheia = acertou, cortada = errou) e o verso desmonta cada sílaba nas
peças que a formam.

Essa decomposição é calculada, não catalogada: o bloco Hangul Syllables do
Unicode é gerado por fórmula, então `src/hangul.js` desmonta qualquer sílaba com
aritmética — 고양이 vira ㄱㅗ · ㅇㅑㅇ · ㅇㅣ sem nenhuma tabela de palavras.

As fontes vêm do Google Fonts (Gowun Batang para o 한글, Archivo para a
interface, DM Mono para romanização e números). Sem rede, as pilhas de fallback
seguram o layout.

## Rodar localmente

O app carrega o vocabulário com `fetch`, então precisa de um servidor HTTP —
abrir o `index.html` direto do disco (`file://`) não funciona.

```sh
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

## Publicar no GitHub Pages

Em **Settings → Pages**, escolha *Deploy from a branch*, branch `main` e pasta
`/ (root)`. Não há build: o que está no repositório é o que vai ao ar, em
`https://<usuario>.github.io/lang-learning/`.

Os caminhos são todos relativos, então o subdiretório do Pages funciona sem
configuração extra.

## Estrutura

```
index.html                 # as três telas (início, estudo, resultado)
estilos/main.css           # design tokens, células, card 3D, tema claro/escuro
src/app.js                 # orquestra a rodada de estudo
src/baralho.js             # embaralhar e montar a rodada
src/hangul.js              # decompõe sílabas 한글 em jamo
src/armazenamento.js       # preferências e última sessão (localStorage)
dados/palavras.json        # fonte da verdade do vocabulário
assets/ilustracoes/*.svg   # uma ilustração por palavra
```

## Adicionar uma palavra

1. Coloque a ilustração em `assets/ilustracoes/` (SVG de 200×200, ou uma imagem
   quadrada em PNG/WebP).
2. Acrescente uma entrada em `dados/palavras.json`:

```json
{
  "id": "leite",
  "hangul": "우유",
  "romanizacao": "uyu",
  "pt": "leite",
  "ilustracao": "assets/ilustracoes/leite.svg",
  "categoria": "substantivos-basicos"
}
```

Nenhuma mudança de código é necessária — o app lê o JSON.

## Controles

| Ação | Teclado | Toque |
| --- | --- | --- |
| Virar o card | `Espaço` ou `Enter` | tocar no card |
| Acertei | `→` | arrastar para a direita |
| Errei | `←` | arrastar para a esquerda |

## Vocabulário atual

| 한글 | Romanização | Português |
| --- | --- | --- |
| 물 | mul | água |
| 밥 | bap | arroz cozido / comida |
| 책 | chaek | livro |
| 집 | jip | casa |
| 나무 | namu | árvore |
| 고양이 | goyangi | gato |
| 개 | gae | cachorro |
| 사과 | sagwa | maçã |
| 커피 | keopi | café |
| 학교 | hakgyo | escola |

## Próximos passos

- Áudio de pronúncia
- Modo inverso (한글 → ilustração)
- Repetição espaçada (Leitner)
- Mais categorias de vocabulário
