/**
 * A escada de dificuldade — o coração pedagógico do app.
 *
 * Uma palavra não é "sabida ou não sabida". Ela atravessa quatro formatos, e o
 * formato sobe conforme a estabilidade FSRS cresce. A ordem importa: teste fácil
 * cedo (reconhecimento) reduz carga cognitiva enquanto a memória é frágil;
 * teste difícil depois (recall pleno) produz o efeito de teste maior justamente
 * quando ele se sustenta.
 *
 * O que a escada existe para *impedir* é o modo "revelar e me avaliar". A imagem
 * produz fluência ilusória — reconheço, logo acho que sei — e a autoavaliação
 * transforma esse viés em nota. Como o público já lê 한글, dá para exigir
 * produção de verdade e medir em vez de perguntar.
 */

import { partes, montar } from './hangul.js';

export const NIVEL = {
  INTRODUCAO: 0,
  RECONHECIMENTO: 1,
  ASSISTIDO: 2,
  PLENO: 3,
};

/**
 * O rótulo do nível. `detalheFrase` cobre os cards sem ilustração — dizer
 * "só a imagem" numa tela que não tem imagem nenhuma confunde de graça.
 */
export const DESCRICAO_NIVEL = {
  0: { rotulo: 'Apresentação', detalhe: 'Primeiro encontro. Sem teste.' },
  1: { rotulo: 'Reconhecimento', detalhe: 'Escolha entre quatro.' },
  2: { rotulo: 'Recall assistido', detalhe: 'Com parte da palavra à mostra.' },
  3: { rotulo: 'Recall pleno', detalhe: 'Só a imagem.', detalheFrase: 'Só a frase.' },
};

/**
 * O nível é derivado da estabilidade, não armazenado como progresso separado.
 * Assim um lapso rebaixa a palavra automaticamente: a estabilidade cai, o
 * formato afrouxa, e ela sobe de novo quando a memória segurar.
 */
export function nivelDe(cartao) {
  if (!cartao?.revisoes) return NIVEL.INTRODUCAO;
  if (cartao.estabilidade < 1) return NIVEL.RECONHECIMENTO;
  if (cartao.estabilidade < 7) return NIVEL.ASSISTIDO;
  return NIVEL.PLENO;
}

/**
 * A escada de revelação de uma palavra, do totalmente oculto ao inteiro.
 *
 *   사과   → ['__', '사_', '사과']
 *   고양이 → ['___', '고__', '고양_', '고양이']
 *   옷     → ['_', '오', '옷']
 *   비     → ['_', 'ㅂ_', '비']
 *
 * O caso de uma sílaba só é o que obriga a escada a existir. "Revelar a
 * primeira sílaba" de 옷 entregaria a palavra inteira, então o degrau do meio
 * mostra a sílaba sem o batchim — e o batchim é exatamente a parte difícil,
 * porque é ele que 옷 [옫] e 꽃 [꼳] escondem na pronúncia. Quando nem batchim
 * existe (비, 개), o degrau é só a consoante inicial.
 */
export function graus(hangul) {
  const silabas = [...hangul];
  const oculto = silabas.map(() => '_').join('');

  if (silabas.length === 1) {
    const semBatchim = esqueleto(hangul);
    const meio = semBatchim === hangul ? `${partes(hangul)?.inicial ?? ''}_` : semBatchim;
    return [oculto, meio, hangul];
  }

  return [
    oculto,
    ...silabas.map((_, i) => silabas.map((s, j) => (j <= i ? s : '_')).join('')),
  ];
}

/** O molde exibido num grau da escada. */
export function molde(hangul, grau) {
  const escada = graus(hangul);
  return escada[Math.min(Math.max(grau, 0), escada.length - 1)];
}

/**
 * Sobe um degrau. É o botão de dica: em vez de travar o usuário na frente de
 * uma palavra que não vem, ele abre caminho — e a resposta entra no FSRS como
 * "difícil", que é exatamente o que ela foi.
 */
export const proximaDica = (hangul, grau) => Math.min(grau + 1, graus(hangul).length - 1);

/** Verdadeiro quando não há mais o que revelar sem mostrar a palavra. */
export const dicaEsgotada = (hangul, grau) => grau >= graus(hangul).length - 2;

/**
 * Distratores para a múltipla escolha do nível 1.
 *
 * A ordem de preferência não é estética. Palavras marcadas como confundíveis
 * (뛰다/달리다, 보다/읽다) vêm primeiro de propósito: é contrastando com o
 * vizinho quase-certo que o aprendiz constrói a fronteira semântica. Um
 * distrator aleatório testa reconhecimento de forma; o confundível testa
 * significado.
 */
export function distratores(alvo, banco, quantidade = 3) {
  const disponivel = banco.filter((p) => p.id !== alvo.id);
  const escolhidos = [];
  const jaTem = (p) => escolhidos.some((e) => e.id === p.id);

  const adicionar = (lista) => {
    for (const palavra of embaralhar(lista)) {
      if (escolhidos.length >= quantidade) return;
      if (!jaTem(palavra)) escolhidos.push(palavra);
    }
  };

  adicionar(disponivel.filter((p) => alvo.confundiveis?.includes(p.id)));
  adicionar(disponivel.filter((p) => p.campo && p.campo === alvo.campo));
  adicionar(disponivel.filter((p) => p.modulo === alvo.modulo));
  // A classe gramatical vem antes do resto porque um substantivo entre quatro
  // verbos se elimina sozinho: a alternativa errada precisa ser *possível*,
  // senão a múltipla escolha testa sintaxe em vez de significado. Vale ainda
  // mais na lacuna de frase, onde só uma classe cabe no buraco.
  adicionar(disponivel.filter((p) => p.classe === alvo.classe));
  adicionar(disponivel);

  return escolhidos;
}

/** As quatro opções do nível 1, já embaralhadas. */
export const alternativas = (alvo, banco) => embaralhar([alvo, ...distratores(alvo, banco)]);

/**
 * Compara a resposta digitada com o gabarito.
 *
 * Tolera espaço sobrando e sílaba incompleta que o IME deixou pendurada
 * (digitar 사과 e parar com o ㅏ ainda solto é acerto, não erro de vocabulário).
 */
export function conferir(resposta, esperado) {
  const limpa = resposta.replace(/\s+/g, '');
  const alvo = esperado.replace(/\s+/g, '');
  if (limpa === alvo) return true;

  // 사과 digitado como 사고ㅏ — mesma sequência de jamo, sílaba mal fechada.
  return limpa.normalize('NFC') === alvo.normalize('NFC');
}

/**
 * Nota FSRS a partir do que aconteceu, sem perguntar nada ao usuário.
 *
 * Errar é DENOVO. Precisar de dica é DIFICIL — a palavra veio, mas não sozinha.
 * Acertar de primeira num nível alto é FACIL; nos níveis baixos é só BOM,
 * porque reconhecer entre quatro não é a mesma evidência que produzir.
 */
export function notaPara({ acertou, usouDica, nivel }) {
  if (!acertou) return 1;
  if (usouDica) return 2;
  return nivel >= NIVEL.PLENO ? 4 : 3;
}

/**
 * O que precisa ser digitado — que nem sempre é a palavra do dicionário.
 *
 * 하다, 되다, 있다 e 없다 estão entre as palavras mais frequentes do coreano e
 * são justamente as que **não cabem** numa frase na forma de dicionário: ninguém
 * diz "지금 뭐 하다?", diz "지금 뭐 해요?". Forçar a forma de dicionário na lacuna
 * ensinaria uma frase que não existe.
 *
 * Então a palavra guarda as duas coisas: `hangul` é o lema — o que o FSRS
 * agenda, o que o mapa mostra, o que se procura no dicionário — e `resposta` é a
 * forma que a frase pede. O gabarito mostra as duas lado a lado, que é
 * exatamente a informação que falta a quem está aprendendo.
 */
export const respostaDe = (palavra) => palavra.resposta ?? palavra.hangul;

/**
 * Parte uma frase-modelo na lacuna. `{}` marca onde a palavra entra.
 *
 *   '이건 제 {}이에요.' → { antes: '이건 제 ', depois: '이에요.' }
 *
 * O estímulo do card de frase é o par frase-com-lacuna + tradução. A tradução
 * aparece *durante* o teste, ao contrário do card ilustrado — e não entrega a
 * resposta justamente porque essas palavras não têm correspondente de um para
 * um em português. É por não terem que elas não são ilustráveis.
 */
export function partirFrase(modelo) {
  const [antes = '', depois = ''] = modelo.split('{}');
  return { antes, depois };
}

/** Fisher-Yates numa cópia. */
export function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** A primeira sílaba com o batchim removido, para a dica sonora do nível 2. */
export function esqueleto(hangul) {
  const peca = partes([...hangul][0]);
  if (!peca) return hangul[0];
  return montar({ inicial: peca.inicial, medial: peca.medial, final: '' }) ?? hangul[0];
}
