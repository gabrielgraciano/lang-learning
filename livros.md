# Nível 1 — o que cada aula cobre

Este documento é o mapa da seção **Nível 1** do app: o que cada uma das
vinte e cinco aulas ensina, onde o conteúdo mora, como acrescentar a próxima, e o
que foi deliberadamente deixado de fora.

O *porquê* de o app inteiro ser como é continua em `docs/fundamentacao.md`; as
convenções de código continuam em `CLAUDE.md`. Aqui é só o Nível 1.

---

## De onde vem o conteúdo

O material de origem são dois livros de gramática coreana para iniciantes que
estão na pasta de estudo: um **livro-texto**, que explica cada ponto e traz um
punhado de exercícios no fim de cada lição, e um **caderno de exercícios**, que
não explica nada e só cobra — vocabulário, compreensão, ditado, tradução,
embaralhamento de sílabas. Os dois cobrem exatamente a mesma
sequência de vinte e cinco lições, então cada aula daqui junta os dois: a explicação
sai do livro-texto, os exercícios saem dos dois somados.

**Nada aqui é transcrição.** Os pontos gramaticais não pertencem a ninguém —
que 이에요 vai depois de consoante e 예요 depois de vogal é fato do idioma, e
está em qualquer gramática. O que é de autoria (o texto, a ordem das piadas, os
personagens, as ilustrações, os diálogos de exemplo) foi reescrito do zero em
português, com exemplos próprios, na voz que o resto do app já usa. Os
exercícios seguem os mesmos *formatos* pedagógicos e cobram os mesmos itens de
vocabulário, mas os enunciados são novos e as respostas foram conferidas contra
o gabarito, não copiadas dele.

Por decisão do dono do repositório, **o título e os autores dos livros não são
citados em lugar nenhum do app nem do código.** Se você for acrescentar
material, mantenha isso.

**Os PDFs não ficam no repositório.** Eles estiveram versionados na raiz por um
tempo e foram removidos: versionar a obra inteira num repo público é
redistribuí-la, coisa bem diferente de aprender com ela e escrever conteúdo
próprio a partir dela. O `.gitignore` barra `*.pdf` e `*.epub` para não
voltarem por descuido. Guarde os livros na pasta de estudo, fora daqui.

> **Ainda em aberto.** Remover no commit tira os arquivos da ponta, mas eles
> continuam recuperáveis no histórico, no commit que os adicionou. Sumir de vez
> exige reescrever o histórico (`git filter-repo` ou equivalente) e um
> force-push na `main` — operação destrutiva, que invalida qualquer clone
> existente. Decisão do dono do repositório.

---

## As vinte e cinco aulas

Cada aula tem: uma capa (selo, frase-título, resumo, objetivo), uma lista de
vocabulário, **três tópicos** de explicação, um diálogo de fecho, e **quatro
grupos** de exercícios — um por tópico, mais um de ditado que treina a aula
inteira. São **598 exercícios** no total — o Nível 1 inteiro.

| Aula | Palavras | Exercícios | Por grupo | Ditado |
|---|---|---|---|---|
| 1 | 8 | 25 | 8 + 6 + 6 + 5 | 5 |
| 2 | 5 | 21 | 7 + 4 + 6 + 4 | 4 |
| 3 | 6 | 20 | 4 + 9 + 3 + 4 | 4 |
| 4 | 6 | 21 | 4 + 5 + 8 + 4 | 4 |
| 5 | 7 | 33 | 4 + 15 + 8 + 6 | 6 |
| 6 | 6 | 29 | 9 + 7 + 8 + 5 | 5 |
| 7 | 6 | 29 | 7 + 6 + 11 + 5 | 5 |
| 8 | 6 | 35 | 7 + 12 + 10 + 6 | 6 |
| 9 | 8 | 23 | 9 + 5 + 4 + 5 | 5 |
| 10 | 6 | 21 | 5 + 5 + 6 + 5 | 5 |
| 11 | 7 | 22 | 6 + 6 + 4 + 6 | 6 |
| 12 | 9 | 22 | 6 + 4 + 6 + 6 | 6 |
| 13 | 6 | 19 | 7 + 3 + 4 + 5 | 5 |
| 14 | 9 | 22 | 4 + 7 + 6 + 5 | 5 |
| 15 | 14 | 24 | 7 + 8 + 4 + 5 | 5 |
| 16 | 8 | 28 | 10 + 6 + 6 + 6 | 6 |
| 17 | 6 | 24 | 8 + 6 + 5 + 5 | 5 |
| 18 | 6 | 21 | 6 + 6 + 4 + 5 | 5 |
| 19 | 7 | 19 | 5 + 4 + 5 + 5 | 5 |
| 20 | 9 | 27 | 8 + 8 + 5 + 6 | 6 |
| 21 | 6 | 22 | 6 + 6 + 5 + 5 | 5 |
| 22 | 9 | 23 | 6 + 7 + 5 + 5 | 5 |
| 23 | 7 | 22 | 5 + 7 + 5 + 5 | 5 |
| 24 | 8 | 22 | 5 + 7 + 5 + 5 | 5 |
| 25 | 8 | 24 | 5 + 8 + 6 + 5 | 5 |

### Aula 1 · 안녕하세요. 감사합니다. — “Oi e obrigado”
*8 palavras · 25 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| 안녕하세요 serve para o dia inteiro | 안녕 (paz) + 하세요 (você faz?); uma saudação só, sem faixa de horário; a resposta é a mesma frase; ponto ou interrogação, tanto faz | A saudação (8) |
| 감사합니다 não tem “você” dentro | 감사 (gratidão) + 합니다 (eu faço); coreano dispensa sujeito e objeto óbvios; 합니다 soa [함니다] por nasalização | O agradecimento (6) |
| 존댓말 e 반말 | os dois registros; regra de bolso: termina em -요 ou -니다 → 존댓말; errar para o formal não ofende, para o informal ofende | Formal ou informal (6) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (5) |

### Aula 2 · 네. 아니요. — “Sim, não, como?”
*5 palavras · 21 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| 네 e 아니요 respondem à pessoa, não ao fato | concordância, não valor de verdade; a inversão aparente diante de pergunta negativa (커피 안 좋아해요? → 네 = “isso, não gosto”) | Concordar e discordar (7) |
| 네 sozinho quase nunca é “sim” | 네 como marcador de escuta (“sei”, “ahã”) e como resposta a ser chamado | Os outros usos de 네 (4) |
| 네, 맞아요 e 네? | 맞아요 para concordar sem ambiguidade; 네? como “como?”, pedido de repetição e surpresa | Reforçar e pedir repetição (6) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (4) |

### Aula 3 · 안녕히 계세요. 안녕히 가세요. — “Tchau — mas quem está indo?”
*6 palavras · 20 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| A mesma palavra 안녕 de novo | 안녕히 계세요 = “fique em paz”, 안녕히 가세요 = “vá em paz” | As peças (4) |
| Quem sai diz uma, quem fica diz a outra | a escolha é pela cena, não pela formalidade; os dois saindo → ambos dizem 가세요 | Quem sai, quem fica (9) |
| Na rua ninguém pronuncia tudo | frase frequente encurta; o que sobra ao ouvido costuma ser 세요 | Ouvir de verdade (3) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (4) |

### Aula 4 · 죄송합니다. 저기요. — “Desculpa e licença”
*6 palavras · 21 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| 죄송합니다 é a mesma fôrma de 감사합니다 | 죄송 (culpa) + 합니다; mesma nasalização | A construção (4) |
| 죄송합니다 não é “sinto muito” | só assume culpa; nunca serve para lamentar notícia ruim | O falso amigo (5) |
| 저기요 chama; 죄송합니다 abre caminho | 저기 = “ali”; a divisão entre chamar alguém, chamar o garçom e passar no meio de gente (잠시만요 / 잠깐만요) | Chamar e passar (8) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (4) |

### Aula 5 · -이에요 / -예요 — “É isso”
*7 palavras · 33 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| A ordem é invertida | o “ser” vem depois do substantivo e colado; sem artigo, sem sujeito obrigatório | Vocabulário da aula (4) |
| 이에요 ou 예요: olhe a última letra | consoante final (받침) → 이에요; vogal → 예요; a ligação 연음 (물이에요 → [무리에요]) | 이에요 ou 예요 (15) |
| Pergunta é a mesma frase, subindo | sem inversão nem palavra extra; 뭐예요? | Afirmar e perguntar (8) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (6) |

### Aula 6 · 이거. 이거 뭐예요? — “Isto aqui”
*6 palavras · 29 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| 이거 = 이 (este) + 것 (coisa) | a forma antiga 이것 e o encurtamento para 이거 | Vocabulário da aula (9) |
| 이거 + substantivo + 이에요/예요 | a frase da aula 5 com o demonstrativo na frente; a terminação continua sendo decidida pelo substantivo | Isto é… (7) |
| 이거 뭐예요? | a pergunta que transforma qualquer pessoa por perto em professor de vocabulário; respostas com 네, 맞아요 / 아니요 | Perguntar e responder (8) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (5) |

### Aula 7 · 이 / 그 / 저 + 거·것 — “Este, esse, aquele”
*6 palavras · 29 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| Três posições, não duas | 이 perto de quem fala, 그 perto de quem ouve, 저 longe dos dois; 그 não é “meio longe” | As três posições (7) |
| 그 também serve para o que não está à vista | o que foi mencionado, o que ninguém vê | Modificador e pronome (6) |
| 이, 그, 저 não andam sozinhos | são modificadores; viram pronome com 거/것; com gente é 사람, nunca 거 | Traduzir (11) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (5) |

### Aula 8 · 아니에요 — “Não é isso”
*6 palavras · 35 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| Substantivo + 아니에요 | a negação de “ser”; forma única, sem variação por 받침 | Vocabulário e forma (7) |
| A ordem completa da frase | 이거 책 아니에요 = “isto livro não-é”; o que se nega fica no fim | Montar a negação (12) |
| 아니에요 vem de 아니다 | a forma de dicionário; todo verbo coreano termina em -다 | Revisão das oito aulas (10) |

### Aula 9 · -은/는, -이/가 — “Do que a frase está falando”
*8 palavras · 23 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| Duas partículas, duas perguntas diferentes | marca de tópico (-은/-는) e de sujeito (-이/-가); 받침 → 은/이, vogal → 는/가 | Qual partícula entra (9) |
| -은/는 carrega um “ao contrário das outras coisas” | o contraste que 은/는 acrescenta sem estar escrito: 오늘은 vs 오늘 날씨는 | O contraste do 은/는 (5) |
| -이/가 responde “qual deles?” | 이/가 seleciona um item entre vários — responde “qual deles?” | Selecionar com 이/가 (4) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (5) |

### Aula 10 · 있어요. 없어요. — “Ter e existir são a mesma palavra”
*6 palavras · 21 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| Uma palavra para “ter” e para “existir” | existir e possuir na mesma palavra; a coisa vem antes do verbo | Ter e perguntar (5) |
| 없어요 é palavra própria, não 있어요 negado | 없어요 é verbo próprio, não 있어요 negado; e não se confunde com 아니에요 | A ausência tem palavra própria (5) |
| 있어요 vira peça de outras palavras | 재미있어요 e a combinação com as partículas da aula 9 | Composições e partículas (6) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (5) |

### Aula 11 · 주세요 — “Me vê um, por favor”
*7 palavras · 22 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| 주세요 vem de “dar” | 주세요 vem de 주다 (dar); objeto primeiro, pedido no fim; sem plural obrigatório | Vocabulário e a construção (6) |
| 있어요? para saber, 주세요 para pedir | 있어요? para saber se tem, 주세요 para pedir — a conversa inteira de um balcão | A conversa do balcão (6) |
| 주세요 não tem versão informal para estranho | 주세요 está sempre em 존댓말, com qualquer interlocutor | Quando usar (4) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (6) |

### Aula 12 · 맛있어요. 맛없어요. — “Está gostoso”
*9 palavras · 22 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| 맛 + 있어요 — a mesma fôrma de 재미있어요 | 맛 + 있어요 / 없어요 — a mesma fôrma de 재미있어요 | Gostoso e ruim (6) |
| O ㅅ de 맛 muda de som três vezes | o ㅅ de 맛 soa [t], [s] ou [d] conforme o que vem depois | O som que a letra esconde (4) |
| O que se diz antes e depois de comer | 잘 먹겠습니다 antes de comer, 잘 먹었습니다 depois | À mesa (6) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (6) |

### Aula 13 · -고 싶어요 — “Quero”
*6 palavras · 19 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| Tire o -다, ponha -고 싶어요 | tire o -다 do dicionário e encaixe -고 싶어요; não varia nunca | Montar o “quero” (7) |
| 보고 싶어요 também é “estou com saudade” | 보고 싶어요 é “quero ver” e também “estou com saudade” | Os dois sentidos de 보고 싶어요 (3) |
| 더 = mais | 더 = mais, antes do verbo: 더 먹고 싶어요, 더 주세요 | Mais um pouco (4) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (5) |

### Aula 14 · 뭐 하고 싶어요? — “O que você quer fazer?”
*9 palavras · 22 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| 뭐 + verbo + 고 싶어요? | 뭐 + verbo + 고 싶어요? — 뭐 ocupa o lugar da resposta | A pergunta (4) |
| Dez verbos que cobrem um dia inteiro | dez verbos do dia a dia, e o padrão substantivo + 하다 | Os verbos (7) |
| Responder é repetir o verbo da pergunta | responde-se repetindo o verbo da pergunta, não com 네 sozinho | Perguntar e responder (6) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (5) |

### Aula 15 · 일 이 삼 사 오 육 칠 팔 구 십 — “Contar com dez sílabas”
*14 palavras · 24 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| Dez sílabas, e o resto é encaixe | 일이삼사오육칠팔구십 e o encaixe: dezena primeiro, unidade depois | De um a dez, e o encaixe (7) |
| 백, 천, 만 — e a virada em dez mil | 백, 천, 만 — e o agrupamento de quatro em quatro zeros | Centenas, milhares e a virada (8) |
| Você já conhece estes morfemas | os mesmos morfemas já estavam em 삼겹살, 일요일, 만원 | Os números já estavam nas palavras (4) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (5) |

### Aula 16 · -아요 / -어요 / -여요 — “O presente, enfim”
*8 palavras · 28 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| Tire o -다 e olhe a última vogal | tire o -다 e olhe a última vogal do radical: ㅏ/ㅗ → 아요, resto → 어요, 하 → 해요 | A regra das três terminações (10) |
| 하 + 여요 virou 해요, e outras contrações | 하 + 여요 = 해요, e as contrações 보아요 → 봐요, 오아요 → 와요 | 해요 e as contrações (6) |
| Você já vinha usando isto | 있어요, 없어요, 좋아요, 맞아요 sempre foram esta conjugação | O círculo se fecha (6) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (6) |
### Aula 17 · -았어요 / -었어요 / -였어요 — “O que já aconteceu”
*6 palavras · 24 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| Troque o 요 por -ㅆ어요 | troque o 요 do presente por -ㅆ어요; as três terminações são as da aula 16 com 从 dentro | Do presente para o passado (8) |
| As contrações continuam valendo | as contrações valem igual: 사요→샀어요, 와요→왔어요, 해요→했어요 | As contrações (6) |
| Um passado, vários usos | um passado só cobre “comi”, “comia” e “tinha comido”; e o 었 já estava em 잘 먹었습니다 | Usar o passado (5) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (5) |

### Aula 18 · 어디, -에, -에서 — “Onde, e para onde”
*6 palavras · 21 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| -에 marca onde a coisa está e para onde ela vai | -에 marca destino e posição — com 가다, 오다 e 있다 | A partícula -에 (6) |
| -에서 marca onde a ação acontece | -에서 marca onde a ação acontece, e também o ponto de partida | A partícula -에서 (6) |
| 어디 precisa da partícula | 어디 leva a mesma partícula que a resposta levaria; na fala ela cai | Perguntar com 어디 (4) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (5) |

### Aula 19 · 언제 — “Quando”
*7 palavras · 19 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| 언제 anda sozinho | 언제 é a interrogativa que dispensa partícula — o contraste com 어디 | 언제 sem partícula (5) |
| As palavras de tempo | 어제, 오늘, 내일, 지금, 아까, 나중에 — e o 아까 que o português não tem numa palavra | As palavras de tempo (4) |
| Perguntar e responder no tempo certo | a interrogativa ocupa o lugar onde a resposta entra, no presente e no passado | Perguntar e responder (5) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (5) |

### Aula 20 · 하나, 둘, 셋, 넷… — “O outro sistema de números”
*9 palavras · 27 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| Dez números novos, e as dezenas têm nome próprio | 하나 a 열, e cada dezena com nome próprio até 아흔; o sistema para em 99 | Os números nativos (8) |
| Contador obrigatório, e cinco números que se encolhem | contador obrigatório, e os cinco números que encolhem antes dele (한, 두, 세, 네, 스무) | Contadores e as formas curtas (8) |
| Qual sistema usar | que sistema em que situação — e a hora do relógio, que mistura os dois | Qual sistema, em que situação (5) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (6) |

### Aula 21 · 안 …, -지 않다 — “Negar qualquer coisa”
*6 palavras · 22 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| 안 na frente do verbo | 안 antes do verbo, sem mexer na conjugação | A negação curta (6) |
| -지 않다, o jeito comprido | -지 않다 na terminação, mais formal; as duas significam o mesmo | A negação comprida (6) |
| Responder “não” a uma pergunta | 아니요 + frase negada, e o 아직 que deixa a porta aberta | Responder que não (5) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (5) |

### Aula 22 · 하다 — “A fábrica de verbos”
*9 palavras · 23 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| Substantivo + 하다 = verbo | substantivo + 하다 = verbo, e todos conjugam pelo 하다 | Como a fábrica funciona (6) |
| Quinze substantivos, trinta palavras | quinze substantivos que rendem trinta palavras; 사랑해요 é um deles | Os pares (7) |
| Negar um verbo de 하다 | a negação curta entra no meio: 공부 안 해요, não “안 공부해요” | Negar no meio (5) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (5) |

### Aula 23 · 누구? 누가? — “Quem”
*7 palavras · 22 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| 누구 pergunta quem é | 누구예요? para identidade — vogal final, então 예요 | 누구 e identidade (5) |
| Quando “quem” é o sujeito, vira 누가 | 누구 + 가 contrai em 누가, obrigatório quando “quem” é o sujeito | 누가 e a ação (7) |
| Na porta e no telefone | 누구세요? na porta, 여보세요? no telefone — e trocar soa mal | Porta e telefone (5) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (5) |

### Aula 24 · 왜? 어떻게? 얼마? 얼마나? — “Por quê e como”
*8 palavras · 22 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| 왜 e 어떻게 | 왜 e 어떻게 entram sem partícula; 어떻게 soa [어떠케] por 격음화 | 왜 e 어떻게 (5) |
| 얼마 é dinheiro; 얼마나 é grau | 얼마 é preço, 얼마나 é grau e pede adjetivo ou advérbio depois | 얼마 e 얼마나 (7) |
| O quadro completo | o quadro das oito 의문사 do Nível 1, e quais precisam de partícula | O quadro completo (5) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (5) |

### Aula 25 · -에서/-부터 … -까지 — “De um ponto a outro”
*8 palavras · 24 exercícios*

| Tópico | O que ensina | Grupo de exercícios |
|---|---|---|
| -까지 fecha os dois lados | -까지 fecha lugar e tempo com uma forma só | A partícula -까지 (5) |
| -에서 para lugar, -부터 para tempo | -에서 para lugar, -부터 para tempo — 지금부터, nunca 지금에서 | -에서 ou -부터 (8) |
| O Nível 1 fecha aqui | o balanço do Nível 1: o que as vinte e cinco aulas entregaram | Fechando o Nível 1 (6) |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (5) |
---

## Como o conteúdo é guardado

Tudo em **`dados/licoes.json`** — um array de vinte e cinco objetos. Como em
`dados/palavras.json`, nenhuma mudança de conteúdo exige tocar em código.

```jsonc
{
  "id": "aula-5",
  "numero": 5,
  "hanja": "五",                    // o algarismo do selo
  "titulo": "É isso — a primeira frase de verdade",
  "hangul": "-이에요 / -예요",        // a frase-título da capa
  "resumo": "…",                    // uma linha, aparece na lista e na capa
  "objetivo": "…",                  // o que a pessoa sabe fazer ao terminar
  "ilustracao": "assets/licoes/aula-5.svg",

  "vocabulario": [
    { "ko": "학교", "pt": "escola", "hanja": "學校",
      "ilustracao": "assets/ilustracoes/escola.svg" }   // hanja e ilustracao são opcionais
  ],

  "topicos": [
    { "id": "a5-t1", "titulo": "…", "grupo": "a5-g2", "corpo": [ … ] }
  ],

  "dialogo": { "contexto": "…", "falas": [ { "quem": "A", "ko": "…", "pt": "…" } ] },

  "grupos": [
    { "id": "a5-g2", "titulo": "이에요 ou 예요", "itens": [ … ] }
  ]
}
```

O campo **`topicos[].grupo`** é o que faz o atalho “Praticar isto” existir: é a
única ligação entre a explicação e o exercício, e a checagem exige que cada
grupo seja apontado por **exatamente um** tópico — grupo órfão seria um
exercício que ninguém alcança pela leitura.

### Blocos de explicação (`topicos[].corpo`)

| `tipo` | Campos | Vira |
|---|---|---|
| `p` | `texto` | parágrafo |
| `destaque` | `texto` | caixa com barra lateral, para a frase que resume o ponto |
| `nota` | `texto` | observação de rodapé, menor e recuada |
| `formula` | `partes[]`, `glosas[]`, `resultado`, `traducao` | 감사 + 합니다 = 감사합니다, com botão de ouvir |
| `regra` | `linhas[{condicao, resultado}]` | condição → forma |
| `tabela` | `colunas[]`, `linhas[][]` | tabela com rolagem horizontal |
| `exemplos` | `itens[{ko, pt, conta?}]` | lista de frases clicáveis (`conta` é a justificativa curta) |
| `dialogo` | `falas[{quem, ko?, pt}]` | diálogo dentro do tópico |
| `som` | `grafia`, `texto` | quadro grafia → pronúncia |

O bloco `som` **não** guarda a forma falada: ele chama `pronunciar()` de
`src/pronuncia.js` na hora de desenhar. Se a regra mudar no motor, a aula muda
junto, e nunca existem duas verdades sobre a mesma palavra.

> **Uma lacuna conhecida do motor.** Quando um 받침 é seguido de outra
> **palavra** começada por vogal, a norma manda neutralizar primeiro e só então
> ligar: 맛없어요 é [마덥써요], porque o ㅅ vira ㄷ antes de ligar. `pronunciar()`
> liga direto e devolve [마섭써요]. Ele não tem como saber, olhando só a cadeia
> de sílabas, se o que vem depois é uma palavra ou um sufixo — e antes de
> sufixo (맛이 → [마시]) ligar direto é que está certo.
>
> Uma segunda lacuna apareceu nas aulas 17–25, e é ainda mais estreita.
> Depois de radical em ㅁ (inclusive o ㄻ que se reduz a ㅁ), o 제24항 manda
> tensificar a consoante da terminação — mas abre exceção explícita para o
> sufixo causativo/passivo **-기-**. `pronunciar()` aplica a regra e ignora a
> exceção: devolve [옴끼다] para 옮기다, quando o certo é [옴기다]. O mesmo vale
> para 굶기다. Verbos com ㄴ/ㅁ simples (안기다, 남기다) ele acerta.
>
> São essas duas as **únicas** entradas de `dados/palavras.json` que usam o campo
> `pronuncia`: 맛없어요 e 옮기다. Se você escrever um bloco `som` sobre uma palavra
> nesses contextos, confira o resultado à mão antes — o motor vai errar.
> Consertar de verdade exigiria o motor saber onde termina cada palavra e
> reconhecer sufixos, o que é mudança de escopo maior que uma leva de aulas.

### Tipos de exercício (`grupos[].itens`)

Todos têm `id`, `tipo`, `enunciado` e `explicacao`. A `explicacao` aparece
acertando *e* errando — ela é o ensino, não o castigo.

| `tipo` | Campos próprios | Como se responde |
|---|---|---|
| `escolha` | `opcoes[{ko?, pt?}]`, `correta` | toca numa alternativa |
| `imagem` | idem + `ilustracao` | reconhece o desenho e toca na palavra |
| `vf` | `afirmacao`, `correta` (booleano) | Verdadeiro / Falso |
| `lacuna` | `antes`, `depois`, `banco[]`, `correta` | toca na peça que preenche o buraco |
| `montar` | `dica?`, `pecas[]`, `correta` | toca nas peças na ordem; tocar numa peça posta a devolve |
| `ditado` | `audio`, `pecas[]`, `correta` | ouve e monta |
| `associar` | `pares[{a, b}]` | toca de um lado, toca do outro; o par certo trava na hora |
| *(a aula inteira)* | reconhecer e escrever o que se ouve | O que você ouviu (6) |

**`ditado` vem em dois feitios.** Com `pecas`, você monta o que ouviu — cobra a
grafia inteira. Com `opcoes`, você escolhe entre quatro — cobra só distinguir o
que entrou no ouvido. O segundo existe porque separar 사전 de 사람 é uma
habilidade diferente de saber escrever 사전, e vem antes dela. Nos dois casos o
campo `audio` é o texto que a voz lê, e ele toca sozinho ao abrir o exercício.
Use `ehEscolha()` de `src/licoes.js` para saber de que lado um item cai, em vez
de olhar `tipo` — é o que a tela e o checador fazem.

**No JSON a resposta certa é sempre o índice 0 / a primeira ordem**, para o
arquivo poder ser lido e revisado à mão. Quem embaralha é a tela
(`alternativasEmbaralhadas`, `bancoEmbaralhado`, `embaralhar`).

**Grupo solto.** Os três primeiros grupos de cada aula pertencem a um tópico e
são alcançados pelo “Praticar isto” dele. O quarto — o ditado — treina a aula
inteira e não tem tópico dono: leva `"solto": true` e ganha um atalho próprio no
fim da explicação. A regra que a checagem cobra não é “todo grupo tem um
tópico”, e sim **todo grupo é alcançável a partir da leitura** — a marca `solto`
é o que distingue um grupo deliberadamente sem dono de um esquecido.

**`montar` e `ditado` aceitam peça distratora.** Escolher entre 이에요 e 예요 é
a lição inteira da aula 5, e ela sumiria se as duas tivessem que ser usadas.
Por isso a conferência dispara quando o comprimento do que foi montado alcança
o da resposta — não quando todas as peças acabam (`completou()` em
`src/licoes.js`).

**Por que quase nada se digita.** Quem está na aula 1 ainda não tem teclado
coreano nem ortografia; cobrar digitação aqui testaria o teclado, não a
gramática. Produção escrita é o que o baralho já cobra, com a escada de
`niveis.js`. Cada tela testa uma coisa.

---

## Explicação em áudio

Não há arquivo de som no repositório. A narração usa a `SpeechSynthesis` do
navegador, alternando de voz conforme o idioma do trecho: a prosa em pt-BR, os
exemplos em ko-KR (`narrar()` em `src/app.js`). É por isso que a narração é
sintetizada e não gravada — o texto sabe em que língua cada pedaço está, e uma
gravação só saberia se alguém gravasse as duas.

Há dois caminhos de áudio, de propósito diferentes:

- `falar()` — o do baralho. Respeita a preferência “ler a palavra em voz alta”,
  porque dispara sozinho no meio do estudo.
- `falarAgora()` — o das aulas. Ignora a preferência, porque quem apertou o
  botão foi a pessoa.

Sem voz do sistema instalada, o botão de narrar se desabilita dizendo “sem voz”,
e o ditado revela o texto em vez de virar um exercício impossível.

---

## Ilustrações

Mesmas regras de `CLAUDE.md`: 200×200, sujeito isolado, paleta de ~5 cores,
**zero texto na imagem**.

- **`assets/licoes/aula-N.svg`** — uma por aula, vinte e cinco no total. Como o assunto é gramática e
  não objeto, estas são diagramáticas: dois quadros somando num terceiro para
  `-이에요`, três quadros a distâncias diferentes para 이/그/저, o sinal de
  igual cortado para 아니에요. Sem texto continua valendo — os sinais são
  geometria, não tipografia.
- **`assets/ilustracoes/`** — cinco objetos novos entraram para os exercícios
  de reconhecimento: `camera.svg`, `celular.svg`, `dicionario.svg`,
  `chapeu.svg`, `escritorio.svg`. Os outros (livro, água, leite, gato,
  estudante, bolsa, escola, café) já existiam e são reusados.

---

## O vocabulário vira dicionário

Toda palavra que aparece na seção de vocabulário de uma aula está também em
**`dados/palavras.json`**, com o mesmo esquema das palavras do baralho:
romanização, módulo, classe, `sino` quando é sino-coreana, exemplo e nota. São
**277 entradas** hoje — 114 no baralho, 163 só no dicionário.

O que separa as duas metades é um campo:

```jsonc
{ "id": "sorvete", "hangul": "아이스크림", "pt": "sorvete",
  "aula": 7, "baralho": false }
```

`baralho: false` quer dizer “está no dicionário, ainda não é cartão”. O filtro
mora num lugar só, no carregamento de `src/app.js`:

```js
dicionario = await respostaPalavras.json();
palavras   = dicionario.filter((p) => p.baralho !== false);
```

Daí para baixo, tudo que fala em `palavras` — a fila do dia, os contadores, a
grade do mapa, os distratores — vê só o baralho, sem precisar saber que a
separação existe. Promover uma palavra a cartão é apagar uma linha do JSON.

Uma exceção deliberada: **o índice sino-coreano cobre o dicionário inteiro.**
의자 (cadeira) está no baralho, 모자 (chapéu) e 사자 (leão) não — e as três
dividem o 子. Indexar só o baralho perderia a família justamente por duas delas
ainda não serem cartão, e a família é a melhor coisa que o app tem a dizer sobre
vocabulário.

O que está no dicionário e fora do baralho aparece na tela do **Mapa**, numa
lista própria com a aula de origem. Em texto, não em células: célula no mapa
significa estado de memória, e estas palavras não têm nenhum — pintá-las todas
de “não vista” seria afirmar algo falso.

Ao acrescentar palavra ao dicionário, valem as mesmas regras do `CLAUDE.md` que
valem para o baralho — `sino` por sílaba e nunca posicional, `confundiveis`
recíprocos, `pronuncia` só quando a regra não é recuperável da grafia — e
acrescente em `dados/hanja.json` qualquer ideograma novo que você citar, senão a
família aparece sem significado.

## Progresso

Fica em `localStorage`, na mesma chave do baralho (`coreano.flashcards.v2`),
numa seção própria: `licoes: { "a5-e7": { acertou, em } }`. Sai e volta pelo
mesmo botão de exportar/importar dos Ajustes.

**Aula não é cartão.** O baralho passa pelo FSRS porque uma palavra precisa ser
lembrada meses depois; o exercício de aula confere que a explicação entrou, e
uma vez que entrou, repetir não acrescenta. Por isso aqui é um sim/não por
item — sem estabilidade, sem intervalo, sem entrar na fila do dia. Um item já
acertado não é rebaixado por uma passada errada depois: refazer para conferir
se ainda sabe é uso legítimo.

---

## O que ficou de fora, e por quê

Do caderno de exercícios, três categorias não foram portadas:

- **Treino de caligrafia** (“escreva 안 cinco vezes”). É metade do caderno.
  Numa tela sem caneta não sobra exercício nenhum — vira copiar e colar.
- **“Desenhe algo que te ajude a lembrar”**. Não tem resposta conferível, e o
  app inteiro é construído sobre recuperação com resposta certa.
- **“Escreva um diálogo curto”** / resposta discursiva. Mesma razão: sem
  gabarito automático, o app não tem como dar retorno, e retorno é o ponto.

O que essas atividades faziam de bom — repetir a forma até a mão saber —
aparece de outro jeito: montando a frase peça por peça, e no baralho, que cobra
a palavra digitada em 한글.

**Tudo o mais foi portado.** Vale registrar que a primeira leva não tinha feito
isso: ela compactava sete definições de vocabulário numa associação de quatro
pares, trazia um item de ditado onde o caderno traz quatro, e os exercícios do
livro-texto — que são de outro feitio, quase todos situacionais — não tinham
entrado. Não havia um princípio por trás disso, era só volume. A leva seguinte
levou o total de 88 para 213 e o ditado de 9 para 49, cobrindo as 26 faixas de
ditado do caderno e acrescentando reconhecimento auditivo das palavras de cada
seção de vocabulário.

Os dois livros se somam bem porque cobram de jeitos diferentes: o caderno é
mecânico (definir, desembaralhar, traduzir, ouvir e escrever) e o livro-texto é
situacional (“você pisou no pé de alguém no metrô; o que diz?”). Onde os dois
cobriam o mesmo ponto, ficou um exercício só.

As aulas 9 a 16 já nasceram nesse padrão, e as 17 a 25 também: 204 exercícios
nesta última leva, dos quais 46 de ditado. Somando as três levas, o Nível 1
fechou com 598 exercícios cobrindo todas as faixas de ditado do caderno e as
questões situacionais do livro-texto.

---

## Verificação

Não há suíte commitada (ver `CLAUDE.md`, Regra zero). O que se roda antes de
abrir PR, além das checagens que já existem lá:

### Invariantes das aulas (Node, sem navegador)

```js
import fs from 'fs';
import { conferir, normalizar, montado, completou, itensDaAula, grupoDoTopico } from './src/licoes.js';
const aulas = JSON.parse(fs.readFileSync('dados/licoes.json', 'utf8'));
```

Confira, para cada item:

1. **id único** em todo o arquivo, e `enunciado` + `explicacao` preenchidos.
2. **Cada tópico aponta um grupo que existe**; cada grupo é apontado por
   **exatamente um** tópico, **ou** está marcado `"solto": true`.
3. **Toda ilustração citada existe em disco** (capa, vocabulário, exercício).
4. `escolha`/`imagem`/`ditado` com `opcoes`: `correta` dentro do intervalo,
   opções sem repetição, `conferir()` aceita a certa e recusa a errada. Use
   `ehEscolha()` para decidir de que lado o item cai, não o `tipo`.
5. `lacuna`: `correta` dentro do banco, banco sem repetição.
6. `vf`: `correta` é booleano.
7. `associar`: sem repetição em nenhum dos dois lados.
8. `ditado`: `audio` preenchido, nos dois feitios.
9. **`montar`/`ditado` de montar: existe uma ordem das peças que produz
   `correta`.** Esta
   é a que pega erro de verdade — peça faltando ou sílaba trocada torna o
   exercício insolúvel, e nada na tela denuncia isso. Faça a busca por
   subconjunto ordenado (não permutação total, por causa das distratoras) e
   confirme que `completou()` dispara na montagem certa e **não** dispara num
   prefixo dela.

Tudo deve dar zero problema. Hoje: **25 aulas, 598 exercícios** — escolha 175, montar 138, ditado 138, vf 49, associar 46, lacuna 42, imagem 10.

### Dicionário e baralho (Node, sem navegador)

1. **O baralho não muda de tamanho** — 114 palavras — quando você só acrescenta
   dicionário (`p.filter((w) => w.baralho !== false).length`) — é o que garante que nenhuma
   palavra nova entrou na fila do dia sem querer.
2. **Todo hanja citado em algum `sino` tem verbete em `dados/hanja.json`**,
   senão a família aparece sem significado.
3. **Todo o vocabulário das aulas existe no dicionário**: para cada `ko` de
   `licoes.json`, um `hangul` correspondente em `palavras.json`.
4. As checagens de integridade que já estão no `CLAUDE.md` (ilustração faltando,
   confundível órfão, par órfão) valem para o arquivo inteiro, não só para o
   baralho.

### Fluxo no navegador (Playwright)

Mesma receita de `CLAUDE.md` (Chromium em `/opt/pw-browsers`, `python3 -m
http.server`). O roteiro específico daqui: abrir as oito aulas, conferir que o
número de tópicos e de atalhos bate com o JSON, clicar num “Praticar isto” e
verificar que ele troca de aba **e** revela o grupo certo, responder os 598
exercícios **lendo as respostas de `dados/licoes.json`** (nunca decoradas no
script), e conferir ao final: zero erro de console, contador de cada aba em
`n/n`, resumo em “8 de 8 aulas”, e o progresso sobrevivendo a um `reload`. Os
atalhos são um por tópico **mais** um por grupo solto.

Um segundo roteiro cobre a separação dicionário/baralho, e é o que impede a
regressão mais fácil de cometer aqui: a ficha da tela inicial conta só o
baralho, nenhuma palavra com `baralho: false` aparece numa sessão de estudo, a
grade do mapa tem uma célula por palavra do baralho, a lista do dicionário tem
uma linha por palavra fora dele, e a família 子 mostra 의자, 모자 e 사자 —
prova de que o índice sino atravessa a fronteira de propósito.

Duas armadilhas que já custaram tempo:

- `hasText` do Playwright é **substring**: `네` casa com o botão `네?`, e `예요`
  casa com `이에요`. Use âncora (`^…$`) em qualquer clique por texto coreano.
- A folha do Google Fonts não carrega em ambiente sem rede externa. A pilha de
  fontes do CSS já tem fallback local, então esse 404 não é falha do app —
  filtre-o antes de contar erros de console.

---

## O Nível 1 está completo

As vinte e cinco lições dos dois livros estão portadas. O que vem depois — futuro,
obrigação, permissão, conexão entre orações — é outro nível, e vai pedir uma
seção nova, não mais aulas nesta.

Se for esse o caso, quase tudo aqui se reaproveita: o esquema de `licoes.json`, os
sete tipos de exercício, o grupo solto de ditado, a separação dicionário/baralho e
os roteiros de verificação. O que muda é o número no `id` e o conteúdo.

## Acrescentar uma aula

1. Escreva a entrada em `dados/licoes.json` seguindo o esquema acima: três
   tópicos, três grupos com dono, e um grupo de ditado marcado `"solto": true`.
2. Desenhe `assets/licoes/aula-N.svg` (200×200, sem texto). Olhe as vinte e cinco
   existentes antes — as de gramática são diagramáticas, não figurativas.
3. Acrescente o vocabulário da aula a `dados/palavras.json` com
   `"baralho": false` e `"aula": N`, e os hanja novos a `dados/hanja.json`.
4. Se o vocabulário novo precisar de objeto ilustrado que ainda não existe,
   desenhe em `assets/ilustracoes/` seguindo as regras do `CLAUDE.md`.
5. Rode as invariantes acima e os dois roteiros do navegador.
6. Atualize as tabelas deste documento.

Nada disso exige tocar em `src/`. Se parecer que exige, provavelmente o formato
novo cabe num `tipo` de bloco ou de exercício que já existe — vale conferir
antes de criar mais um.
