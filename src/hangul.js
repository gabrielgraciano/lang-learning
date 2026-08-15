/**
 * 한글: desmontar e remontar sílabas.
 *
 * O bloco Hangul Syllables (U+AC00–U+D7A3) é gerado por fórmula: cada sílaba é
 * (inicial × 21 + medial) × 28 + final. Dá para desmontar *e* remontar qualquer
 * sílaba com aritmética, sem tabela de palavras.
 *
 * `decompor` é a ida — o verso do card mostra 고양이 como ㄱㅗ · ㅇㅑㅇ · ㅇㅣ.
 * `compor` é a volta — o teclado da tela junta os jamo digitados de novo em
 * sílabas, que é o que permite exigir digitação em 한글 sem IME instalado.
 */

export const INICIAIS = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

export const MEDIAIS = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ',
  'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ',
];

// A posição 0 é a ausência de consoante final.
export const FINAIS = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ',
  'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

const PRIMEIRA = 0xac00;
const ULTIMA = 0xd7a3;
const POR_MEDIAL = FINAIS.length;               // 28
const POR_INICIAL = MEDIAIS.length * POR_MEDIAL; // 588

/** Vogais compostas: ㅗ + ㅏ = ㅘ. */
const MEDIAIS_COMPOSTAS = {
  'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ',
  'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ',
  'ㅡㅣ': 'ㅢ',
};

/** Batchim duplo: ㄹ + ㄱ = ㄺ. */
const FINAIS_COMPOSTAS = {
  'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ',
  'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ',
  'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ',
};

/**
 * O inverso das compostas. Serve para apagar uma peça de cada vez no teclado e
 * para ressilabificar: em 읽어, o ㄺ se parte — ㄹ fica, ㄱ atravessa.
 */
export const PARTES_FINAL = Object.fromEntries(
  Object.entries(FINAIS_COMPOSTAS).map(([par, junto]) => [junto, [...par]]),
);

const PARTES_MEDIAL = Object.fromEntries(
  Object.entries(MEDIAIS_COMPOSTAS).map(([par, junto]) => [junto, [...par]]),
);

const ehMedial = (jamo) => MEDIAIS.includes(jamo);

/** Uma sílaba do bloco composto, ou null para qualquer outro caractere. */
export function partes(silaba) {
  const codigo = silaba.codePointAt(0);
  if (codigo < PRIMEIRA || codigo > ULTIMA) return null;

  const indice = codigo - PRIMEIRA;
  return {
    inicial: INICIAIS[Math.floor(indice / POR_INICIAL)],
    medial: MEDIAIS[Math.floor((indice % POR_INICIAL) / POR_MEDIAL)],
    final: FINAIS[indice % POR_MEDIAL],
  };
}

/** O caminho de volta. Devolve null se as peças não formarem uma sílaba válida. */
export function montar({ inicial = '', medial = '', final = '' }) {
  const i = INICIAIS.indexOf(inicial);
  const m = MEDIAIS.indexOf(medial);
  const f = FINAIS.indexOf(final);
  if (i < 0 || m < 0 || f < 0) return null;

  return String.fromCodePoint(PRIMEIRA + i * POR_INICIAL + m * POR_MEDIAL + f);
}

/**
 * Quebra uma palavra em sílabas e cada sílaba nos jamo que a compõem.
 * Caracteres fora do bloco de sílabas (pontuação, jamo solto) voltam inteiros.
 *
 * @param {string} palavra ex.: '고양이'
 * @returns {{silaba: string, jamo: string[]}[]} ex.: [{silaba:'고', jamo:['ㄱ','ㅗ']}, …]
 */
export function decompor(palavra) {
  const silabas = [];

  for (const silaba of palavra) {
    if (!silaba.trim()) continue;

    const peca = partes(silaba);
    silabas.push(peca
      ? { silaba, jamo: [peca.inicial, peca.medial, peca.final].filter(Boolean) }
      : { silaba, jamo: [silaba] });
  }

  return silabas;
}

/**
 * Junta uma sequência de jamo em sílabas, como faz um IME coreano.
 *
 * A regra que não é óbvia é a migração do batchim: 각 + ㅏ não vira 각아, vira
 * 가가 — a consoante final se solta e passa a ser o ataque da sílaba seguinte.
 * É por isso que dá para digitar 학교 direto, sem pensar em fronteira de sílaba.
 *
 * @param {readonly string[]} jamos
 * @returns {string}
 */
export function compor(jamos) {
  const saida = [];
  /** @type {{inicial: string, medial: string, final: string} | null} */
  let atual = null;

  const fechar = () => {
    if (!atual) return;
    saida.push(montar(atual) ?? atual.inicial + atual.medial + atual.final);
    atual = null;
  };

  for (const jamo of jamos) {
    if (!atual) {
      atual = ehMedial(jamo)
        ? { inicial: '', medial: jamo, final: '' }
        : { inicial: jamo, medial: '', final: '' };
      continue;
    }

    if (ehMedial(jamo)) {
      // 그 + ㅣ = 긔? Não: ㅡ e ㅣ se fundem em ㅢ enquanto não houver batchim.
      if (!atual.medial && atual.inicial) { atual.medial = jamo; continue; }

      if (atual.medial && !atual.final) {
        const junta = MEDIAIS_COMPOSTAS[atual.medial + jamo];
        if (junta) { atual.medial = junta; continue; }
      }

      if (atual.final) {
        const duplo = PARTES_FINAL[atual.final];
        const migra = duplo ? duplo[1] : atual.final;
        atual.final = duplo ? duplo[0] : '';
        fechar();
        atual = { inicial: migra, medial: jamo, final: '' };
        continue;
      }

      fechar();
      atual = { inicial: '', medial: jamo, final: '' };
      continue;
    }

    // Consoante: vira batchim se houver núcleo, senão abre sílaba nova.
    if (atual.inicial && atual.medial) {
      if (!atual.final && FINAIS.includes(jamo)) { atual.final = jamo; continue; }

      const junta = FINAIS_COMPOSTAS[atual.final + jamo];
      if (junta) { atual.final = junta; continue; }
    }

    fechar();
    atual = { inicial: jamo, medial: '', final: '' };
  }

  fechar();
  return saida.join('');
}

/**
 * A lista de jamo de um texto já composto — o estado que o teclado edita.
 * `compor(paraJamo(t)) === t` para qualquer t em 한글.
 *
 * @param {string} texto
 * @returns {string[]}
 */
export function paraJamo(texto) {
  const jamos = [];

  for (const caractere of texto) {
    const peca = partes(caractere);
    if (!peca) { jamos.push(caractere); continue; }

    jamos.push(peca.inicial, ...(PARTES_MEDIAL[peca.medial] ?? [peca.medial]));
    if (peca.final) jamos.push(...(PARTES_FINAL[peca.final] ?? [peca.final]));
  }

  return jamos;
}
