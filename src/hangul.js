/**
 * Decomposição de sílabas 한글 em jamo.
 *
 * O bloco Hangul Syllables (U+AC00–U+D7A3) é gerado por fórmula: cada sílaba é
 * (inicial × 21 + medial) × 28 + final. Dá para desmontar qualquer sílaba com
 * aritmética, sem tabela de palavras.
 */

const INICIAIS = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

const MEDIAIS = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ',
  'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ',
];

// A posição 0 é a ausência de consoante final.
const FINAIS = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ',
  'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

const PRIMEIRA = 0xac00;
const ULTIMA = 0xd7a3;
const POR_MEDIAL = FINAIS.length;              // 28
const POR_INICIAL = MEDIAIS.length * POR_MEDIAL; // 588

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

    const codigo = silaba.codePointAt(0);
    if (codigo < PRIMEIRA || codigo > ULTIMA) {
      silabas.push({ silaba, jamo: [silaba] });
      continue;
    }

    const indice = codigo - PRIMEIRA;
    const inicial = Math.floor(indice / POR_INICIAL);
    const medial = Math.floor((indice % POR_INICIAL) / POR_MEDIAL);
    const final = indice % POR_MEDIAL;

    silabas.push({
      silaba,
      jamo: [INICIAIS[inicial], MEDIAIS[medial], FINAIS[final]].filter(Boolean),
    });
  }

  return silabas;
}
