# Fundamentação

Por que o app é assim e não de outro jeito. Cada decisão aqui tem uma origem
rastreável — e várias delas parecem erradas se você não souber de onde vêm.

As duas fontes:

- **Isbell, D. R. (2018).** *Online informal language learning: Insights from a
  Korean learning community.* Language Learning & Technology, 22(3), 82–102.
  <https://doi.org/10125/44658> — netnografia de sete semanas em r/Korean e no
  chat #korean, com 298 tópicos, 2.600 comentários e 165 mil palavras
  analisadas.
- **APPCO1** — documento de estratégia de produto, com a revisão de literatura
  sobre dupla codificação, imageabilidade, prática de recuperação, FSRS e
  motivação por autodeterminação.

O PDF do artigo não está no repositório: é material com direito autoral. O que
está aqui é a leitura dele aplicada a decisões de produto.

---

## 1. O que o artigo mede, e por que isso muda o app

Isbell foi observar uma comunidade de aprendizes de coreano esperando encontrar
o que a literatura de aprendizagem informal online costuma encontrar:
gente usando a língua-alvo para se comunicar. Encontrou o contrário.

| Achado | Número |
|---|---|
| Inglês no fórum | 92,9% das palavras (153.536 contra 11.701 em coreano) |
| Inglês no chat | 81,2% |
| Tópicos sobre *conhecimento* da língua | maioria absoluta — 131 pedidos e 21 compartilhamentos |
| Dentro deles: gramática / vocabulário / pronúncia | 51 / 49 / **25** |
| Tópicos de *prática* da língua | 40, os menos frequentes de todos |
| Membros que postaram | 660 em sete semanas; só 25 com 20 posts ou mais |

A conclusão do autor é dura: *"ir à internet com o objetivo geral de aprender uma
L2 não garante input e interação significativos."* Quem está começando não
consegue entrar nas comunidades reais — falta proficiência — e acaba fazendo,
sozinho e em inglês, exatamente o "aprender sobre a língua" que se atribui à
sala de aula.

**O que isso posiciona:** este app é uma ferramenta de "aprender sobre" e não
tem por que fingir que não é. O que ele pode fazer é ser honesto sobre o
objetivo — levar alguém ao ponto em que o coreano de verdade fica acessível — e
ser muito melhor naquilo que a comunidade faz mal.

---

## 2. As decisões

### Decisão 1 — Romanização desligada por padrão

> A regra não escrita mais forte de r/Korean. A família da palavra *romanize*
> aparece 52 vezes no recorte analisado, e **em todas elas** é para dizer para
> não usar, ou para explicar por que ela confunde. Dois apps de idioma foram
> criticados na comunidade especificamente por romanizar.

O artigo traz o caso concreto: alguém aprendeu 감사합니다 pelo guia de viagem e
falou "come-sum-knee-da" no aeroporto de Incheon. A vogal está errada — é [ㅏ],
não [ʌ] — e a pessoa foi recebida com um sorriso torto que não entendeu. Quando
membros da comunidade precisam explicar som, preferem ancorar numa palavra
inglesa ou usar AFI. Nunca romanização.

**O que mudou:** o campo `romanizacao` continua no banco e continua acessível,
mas o interruptor nasce desligado e o texto ao lado diz por quê. No lugar dela,
o gabarito mostra a **pronúncia em 한글**.

Isso é uma reversão consciente: a romanização era uma coluna de destaque no
README da versão anterior.

### Decisão 2 — Motor de pronúncia derivada

> Pronúncia é a terceira maior fonte de dúvida da comunidade (25 de 298
> tópicos), atrás só de gramática e vocabulário.

Nenhum app de flashcard responde a essa dúvida, porque ela não cabe num campo de
texto: 학교 se escreve com dois ㄱ e se diz [학꾜]; 옷 termina em ㅅ e soa [옫];
좋다 vira [조타]. A relação entre grafia e som é regular, e por ser regular é
**calculável**.

`src/pronuncia.js` implementa as regras do 표준 발음법 que a sequência de jamo já
determina — 연음, 경음화, 비음화, 격음화, ㅎ 탈락, 유음화, 구개음화 e o
fechamento de sílaba. O gabarito só mostra a pronúncia **quando ela contradiz a
escrita**, que é exatamente quando ela ensina alguma coisa, e mostra junto o nome
e a explicação da regra que agiu.

É a mesma filosofia do `hangul.js`, que já existia: o bloco Hangul Syllables do
Unicode é gerado por fórmula, então dá para desmontar sílaba com aritmética em
vez de tabela. A pronúncia segue o mesmo princípio — calculada, não catalogada.

**Limite honesto:** o motor cobre a fonologia regular. 경음화 de origem
morfológica (물고기 → [물꼬기], 발전 → [발쩐]) depende de informação que a grafia
não carrega. Para esses casos o banco tem o campo `pronuncia`, que tem
precedência sobre o cálculo. As 34 palavras atuais não precisam de nenhum
override.

### Decisão 3 — O gabarito é uma resposta de especialista, não uma tradução

> Duas das três regras não escritas de r/Korean: **"seja preciso"** e **"dê
> esforço suficiente"**. Resposta de baixo esforço — uma definição que se acharia
> no dicionário, uma lista seca de formas — é ignorada ou recebe downvote, mesmo
> quando está correta. O artigo documenta um comentário tecnicamente certo levado
> a −1 só por ser preguiçoso.

O que a comunidade recompensa com upvote é a resposta que **explica, exemplifica
e contextualiza**. Um membro respondeu a uma dúvida simples de vocabulário com 94
palavras e três exemplos, e virou o primeiro comentário do tópico.

O verso do card na versão anterior era `물 = água`. Isso é a resposta de baixo
esforço. Agora o gabarito traz, em ordem: a palavra, a decomposição em jamo, a
pronúncia com a regra que a produz, a tradução (pequena, secundária), uma frase
de uso com tradução, e uma nota que desfaz a confusão específica daquela palavra.

Os campos `exemplo` e `nota` em `dados/palavras.json` existem por causa desta
decisão. Numa comunidade, esse trabalho é feito por falantes avançados e nativos
— o artigo chama isso de divisão de trabalho entre aprendizes e especialistas, e
registra que ela cansa quem responde. Num app solo não há especialista: o
conteúdo precisa carregar essa resposta embutida.

### Decisão 4 — Nada de "revelar e me avaliar"

O loop anterior era o do Anki: virar o card e clicar em "Acertei" ou "Errei".
É exatamente onde o viés de excesso de confiança se instala. A vantagem da imagem
sobre a tradução **só apareceu**, nos estudos que o APPCO1 reúne, depois que esse
viés foi eliminado por prática de recuperação — a imagem produz fluência
ilusória, e a autoavaliação transforma essa ilusão em nota.

No lugar entrou a escada de quatro níveis, e o nível sobe conforme a
estabilidade FSRS cresce:

| Nível | Quando | Formato |
|---|---|---|
| 0 · Apresentação | primeira vez | imagem + palavra, sem teste |
| 1 · Reconhecimento | estabilidade < 1 dia | imagem → 4 opções em 한글 |
| 2 · Recall assistido | 1–7 dias | imagem + degrau de dica → digitar |
| 3 · Recall pleno | > 7 dias | só a imagem → digitar |

O nível é **derivado** da estabilidade, nunca armazenado como progresso à parte.
Assim um lapso rebaixa a palavra sozinho: a estabilidade cai, o formato afrouxa,
e ela sobe de novo quando a memória segurar.

Os distratores do nível 1 vêm, em ordem de preferência, do campo `confundiveis`,
depois do mesmo campo semântico, depois do módulo. Contrastar 물 com 우유 e 커피
constrói fronteira de significado; contrastar com uma palavra aleatória só testa
reconhecimento de forma.

### Decisão 5 — Digitação em 한글 sem exigir IME

Exigir produção em 한글 é o que a comunidade defende e o que a escada precisa. O
problema é prático: num desktop sem teclado coreano instalado não dá para digitar
nada, e a exigência viraria barreira.

`src/teclado.js` resolve por três caminhos que convivem no mesmo campo:

1. **IME de verdade** — o campo é um `<input>` comum, então quem tem teclado
   coreano simplesmente usa (com tratamento de `compositionend` para não
   atrapalhar a composição).
2. **Transliteração 두벌식 ao vivo** — quem digita `gkrry` num teclado ABNT vê
   학교 aparecer. É o mapa de teclas do teclado coreano real, então quem aprende
   aqui aprende o layout de verdade.
3. **Teclado na tela** — os mesmos jamo como botões, com Shift para as tensas.

A composição é o `hangul.js` invertido. O app já sabia desmontar 고양이 em
ㄱㅗ · ㅇㅑㅇ · ㅇㅣ; montar de volta é a mesma aritmética, mais a migração de
batchim que faz 각 + ㅏ virar 가가.

### Decisão 6 — A escada de dica nunca entrega a resposta

Um detalhe pequeno com consequência real. "Revelar a primeira sílaba" funciona
para 사과 (`사_`), mas numa palavra de uma sílaba só entregaria tudo: 옷 → 옷.

Por isso a dica é uma escada explícita (`graus()` em `src/niveis.js`), e o degrau
do meio de uma monossílaba é a sílaba **sem o batchim** — 옷 → `오`, 꽃 → `꼬`.
O batchim é justamente a parte difícil, porque é ele que muda na pronúncia. E
quando nem batchim existe, o degrau é só a consoante inicial: 비 → `ㅂ_`.

Usar a dica registra a resposta como **difícil** no FSRS, não como erro. A
palavra veio, mas não veio sozinha — e é isso que o agendamento precisa saber.

### Decisão 7 — FSRS, e a sessão sempre fecha

`src/fsrs.js` é a transcrição das fórmulas publicadas do FSRS-5 com os pesos
padrão. Não é algoritmo próprio. A implementação de referência é a
[`ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs), e a interface
daqui espelha a dela de propósito, para que trocar uma pela outra seja um import.
Ela não é usada direto porque o app não tem etapa de build e precisa funcionar
offline.

Junto vem a regra que evita a espiral de dívida do Anki: **se a fila de revisão
passa do teto, o app segura as palavras novas sozinho e avisa.** Uma semana sem
estudar vira 300 cards atrasados, e 300 cards atrasados viram a decisão de nunca
mais abrir o app.

### Decisão 8 — Meta semanal com folga, não streak

Streak é motivador controlado: funciona por aversão à perda. Colide com um
produto que se vende como self-paced e produz abandono na primeira quebra. A
pesquisa de motivação que o APPCO1 reúne aponta que quem usa esses apps o faz por
motivação autônoma, e que gamificação sustenta motivação intrínseca quando
satisfaz competência, autonomia e vínculo.

Então: **competência** é o mapa, onde a cor de cada célula é a estabilidade real
da memória e não pontos arbitrários. **Autonomia** é a meta semanal ("5 de 7
dias") mais o ritmo ajustável, com o custo declarado — mais palavras novas hoje
significa mais revisões daqui a quatro dias. **Vínculo** fica de fora, e no lugar
dele o mapa vira álbum: a ilustração só aparece na grade quando a palavra fica
firme.

---

## 3. O que foi deliberadamente deixado de fora

| Cortado | Motivo |
|---|---|
| Contas, login, sync | Local-first + exportar/importar resolve. Backend é escopo que ainda não se pagou. |
| Áudio pré-gerado | Usamos a voz coreana do sistema via Web Speech API. Sem pipeline de TTS, sem megabytes de assets, e desaparece com elegância onde não houver voz instalada. |
| Gramática e conjugação | Outro produto. |
| Ranking, amigos, social | O artigo mostra que a comunidade é cara e depende de massa crítica de gente proficiente. Não dá para simular isso. |
| Sino-coreano como sistema | Fase 3. O campo `sino` já está no banco e 11 palavras já o preenchem, então a migração não vai existir. |
| Vidas, corações, punição | Punem exatamente o erro produtivo que gera aprendizado. |

---

## 4. O que ainda é risco

1. **Ambiguidade de ilustração.** É o risco número um do formato inteiro. O
   `registro` append-only existe em parte para isso: palavra com taxa de erro
   muito acima da média do módulo quase nunca é palavra difícil, é desenho ruim.
   Falta a tela interna que lista os piores itens.
2. **O teto do formato.** Cerca de metade do vocabulário TOPIK I não é ilustrável
   sem ambiguidade — 것, 수, 때, 하다, 되다, 있다. Essas palavras precisam de
   card de frase com lacuna, que é outro formato. As 34 palavras atuais são todas
   substantivos concretos, o terreno mais seguro que existe.
3. **Atrito de digitação no celular.** O `registro` guarda `ms` e `nivel` por
   resposta justamente para responder isso com dado. Se as sessões morrerem no
   nível 3, o caminho é autoavaliação como saída opcional — não como padrão.
4. **A ponte para o uso real.** O achado central do artigo é que conhecimento
   sobre a língua não vira uso sozinho. Este app não fecha essa distância; no
   máximo encurta o caminho até ela. Vale dizer isso ao usuário em algum
   momento, em vez de deixar implícito.

---

## 5. Mapa do código

```
src/hangul.js        decompor (jamo) · compor (IME) · as tabelas
src/pronuncia.js     regras fonológicas → som, com a regra nomeada
src/fsrs.js          FSRS-5 e os quatro estados de memória
src/niveis.js        a escada de 4 níveis, distratores, escada de dica
src/agenda.js        fila do dia: revisão antes de nova, teto, sessão que fecha
src/teclado.js       transliteração 두벌식 + teclado de tela
src/armazenamento.js estado, registro append-only, exportar/importar
src/app.js           orquestração das telas
dados/palavras.json  vocabulário — inclui imageabilidade, confundíveis, nota
```
