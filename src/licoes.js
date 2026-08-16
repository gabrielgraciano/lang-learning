/**
 * A lógica das aulas do Nível 1 — correção de exercício e contagem de progresso.
 *
 * O baralho de vocabulário e as aulas resolvem problemas diferentes e por isso
 * não compartilham agendador. Cartão existe para ser lembrado meses depois, e
 * por isso passa pelo FSRS; exercício de aula existe para verificar que a
 * explicação que você acabou de ler entrou, e uma vez que entrou, repetir não
 * acrescenta. Aqui o progresso é um sim/não por item — não há estabilidade,
 * não há intervalo, não há fila.
 *
 * Como em `niveis.js`, nada aqui toca DOM: a mesma função que corrige na tela
 * roda no Node para conferir o banco de exercícios.
 */

/**
 * Compara ignorando espaço e pontuação de borda.
 *
 * Os exercícios de montar entregam as peças prontas e cobram a ordem; o que
 * está sendo testado é a estrutura da frase, não o 띄어쓰기 — a separação de
 * palavras, que tem regras próprias e não é ensinada em nenhuma destas oito
 * aulas. Exigir o espaço aqui reprovaria por algo que o app não ensinou.
 */
export const normalizar = (texto) =>
  String(texto ?? '').replace(/\s+/g, '').replace(/[.?!]+$/, '').trim();

/** As peças que o exercício embaralha, na ordem em que quem responde as encaixou. */
export const montado = (pecas) => pecas.join('');

/**
 * Corrige uma resposta. `resposta` tem forma diferente por tipo de exercício:
 * índice para os de escolher, booleano para verdadeiro/falso, lista de peças
 * para os de montar. Devolve sempre um booleano — a explicação de por quê fica
 * no próprio item, e aparece acertando ou errando.
 */
export function conferir(item, resposta) {
  switch (item.tipo) {
    case 'escolha':
    case 'imagem':
    case 'lacuna':
      return resposta === item.correta;

    case 'vf':
      return resposta === item.correta;

    // Ditado vem em dois feitios. Montar o que se ouviu cobra a grafia inteira;
    // escolher entre quatro cobra só distinguir o que entrou no ouvido. O
    // segundo existe porque discriminar 사전 de 사람 é uma habilidade separada
    // de saber escrever 사전, e a primeira vem antes.
    case 'ditado':
      if (ehEscolha(item)) return resposta === item.correta;
      return normalizar(montado(resposta)) === normalizar(item.correta);

    case 'montar':
      return normalizar(montado(resposta)) === normalizar(item.correta);

    case 'associar':
      return item.pares.every((par, i) => resposta[i] === par.b);

    default:
      return false;
  }
}

/**
 * Se a montagem já tem material suficiente para ser corrigida.
 *
 * Não dá para esperar que todas as peças sejam usadas: vários exercícios
 * oferecem peças a mais de propósito — escolher entre 이에요 e 예요 é a lição
 * inteira da aula 5, e ela desapareceria se as duas tivessem que entrar. O
 * gatilho é o comprimento do que foi montado alcançar o da resposta, o que
 * cobre os dois casos com uma regra só, e continua disparando quando a escolha
 * errada deixa a frase maior que o alvo.
 */
export const completou = (item, pecas) =>
  normalizar(montado(pecas)).length >= normalizar(item.correta).length;

/** Se o item se responde tocando numa alternativa em vez de montando. */
export const ehEscolha = (item) =>
  item.tipo === 'escolha' || item.tipo === 'imagem' ||
  (item.tipo === 'ditado' && Array.isArray(item.opcoes));

/** Todos os exercícios de uma aula, achatados na ordem em que aparecem. */
export const itensDaAula = (aula) => aula.grupos.flatMap((grupo) => grupo.itens);

/**
 * O grupo de exercícios que um tópico da explicação aponta — é o que faz o
 * atalho "praticar isto" existir sem a tela precisar procurar nada.
 */
export const grupoDoTopico = (aula, topico) =>
  aula.grupos.find((grupo) => grupo.id === topico.grupo) ?? null;

/**
 * Progresso de uma aula. `feitos` é o mapa id → { acertou } que vem do
 * armazenamento; só conta como feito o item respondido corretamente, porque um
 * item errado volta a valer pergunta na próxima passada.
 */
export function progressoDaAula(aula, feitos = {}) {
  const itens = itensDaAula(aula);
  const acertos = itens.filter((item) => feitos[item.id]?.acertou).length;
  return {
    acertos,
    total: itens.length,
    fracao: itens.length ? acertos / itens.length : 0,
    completa: itens.length > 0 && acertos === itens.length,
  };
}

/** O mesmo, somado sobre as oito aulas — o que a tela de abertura mostra. */
export function progressoGeral(aulas, feitos = {}) {
  const parciais = aulas.map((aula) => progressoDaAula(aula, feitos));
  return {
    aulasCompletas: parciais.filter((p) => p.completa).length,
    aulas: aulas.length,
    acertos: parciais.reduce((soma, p) => soma + p.acertos, 0),
    total: parciais.reduce((soma, p) => soma + p.total, 0),
  };
}

/**
 * Embaralha uma cópia (Fisher–Yates). As alternativas e as peças estão em
 * ordem correta no JSON, para o arquivo continuar legível e conferível à mão —
 * embaralhar é responsabilidade de quem monta a tela, não do dado.
 */
export function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Embaralha as alternativas devolvendo também onde a correta foi parar. Sem
 * isto a resposta certa seria sempre a primeira — no JSON ela é, de propósito,
 * para o banco poder ser lido e revisado sem decodificar índice.
 */
export function alternativasEmbaralhadas(item) {
  const comIndice = item.opcoes.map((opcao, indice) => ({ opcao, indice }));
  const misturadas = embaralhar(comIndice);
  return {
    opcoes: misturadas.map((x) => x.opcao),
    correta: misturadas.findIndex((x) => x.indice === item.correta),
  };
}

/** O mesmo para o banco de palavras dos exercícios de lacuna. */
export function bancoEmbaralhado(item) {
  const comIndice = item.banco.map((texto, indice) => ({ texto, indice }));
  const misturadas = embaralhar(comIndice);
  return {
    banco: misturadas.map((x) => x.texto),
    correta: misturadas.findIndex((x) => x.indice === item.correta),
  };
}
