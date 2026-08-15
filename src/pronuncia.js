/**
 * 발음: deriva o som de uma palavra a partir da escrita.
 *
 * Por que isso existe: no estudo de Isbell (2018) sobre a comunidade r/Korean,
 * pronúncia é a terceira maior fonte de dúvida (25 de 298 tópicos), e o próprio
 * artigo traz o caso de alguém aprendendo 감사합니다 como "come-sum-knee-da" por
 * causa da romanização. A regra não escrita mais forte da comunidade é "use
 * 한글, não romanize". Um app que só mostra a grafia não responde a essa dúvida;
 * um que romaniza a agrava.
 *
 * Então derivamos: 학교 se escreve com ㄱ+ㄱ mas se diz [학꾜]. As regras do
 * 표준 발음법 são determinísticas dada a sequência de jamo, do mesmo jeito que a
 * decomposição em hangul.js é aritmética. Calculado, não catalogado.
 *
 * O que este módulo cobre são as regras *regulares*. 경음화 de origem
 * morfológica (물고기 → [물꼬기], 발전 → [발쩐]) depende de informação que a
 * grafia não carrega, então essas palavras trazem `pronuncia` no banco e o
 * campo tem precedência sobre o cálculo.
 */

import { partes, montar } from './hangul.js';

/** As sete consoantes que podem de fato *soar* no fim de sílaba. */
const NEUTRALIZA = {
  'ㄲ': 'ㄱ', 'ㅋ': 'ㄱ',
  'ㅅ': 'ㄷ', 'ㅆ': 'ㄷ', 'ㅈ': 'ㄷ', 'ㅊ': 'ㄷ', 'ㅌ': 'ㄷ', 'ㅎ': 'ㄷ',
  'ㅍ': 'ㅂ',
  'ㄳ': 'ㄱ', 'ㄺ': 'ㄱ',
  'ㄵ': 'ㄴ', 'ㄶ': 'ㄴ',
  'ㄼ': 'ㄹ', 'ㄽ': 'ㄹ', 'ㄾ': 'ㄹ', 'ㅀ': 'ㄹ',
  'ㄻ': 'ㅁ',
  'ㄿ': 'ㅂ', 'ㅄ': 'ㅂ',
};

const ASPIRA = { 'ㄱ': 'ㅋ', 'ㄷ': 'ㅌ', 'ㅂ': 'ㅍ', 'ㅈ': 'ㅊ' };
const TENSA = { 'ㄱ': 'ㄲ', 'ㄷ': 'ㄸ', 'ㅂ': 'ㅃ', 'ㅅ': 'ㅆ', 'ㅈ': 'ㅉ' };
const NASALIZA = { 'ㄱ': 'ㅇ', 'ㄷ': 'ㄴ', 'ㅂ': 'ㅁ' };

/** Batchim duplo que só existe em radical de verbo/adjetivo (제24항). */
const HASTE = new Set(['ㄵ', 'ㄻ', 'ㄼ', 'ㄾ']);

/** Depois desses radicais a desinência endurece — mas ㅂ fica de fora. */
const TENSA_HASTE = { 'ㄱ': 'ㄲ', 'ㄷ': 'ㄸ', 'ㅅ': 'ㅆ', 'ㅈ': 'ㅉ' };

/** Batchim que soa como oclusiva — o gatilho de 경음화 e 비음화. */
const OBSTRUINTE = new Set(['ㄱ', 'ㄷ', 'ㅂ']);

/** Finais que carregam um ㅎ latente, e o que sobra quando ele se gasta. */
const COM_H = { 'ㅎ': '', 'ㄶ': 'ㄴ', 'ㅀ': 'ㄹ' };

const REGRAS = {
  ligacao: {
    nome: '연음',
    titulo: 'Ligação',
    explicacao: 'O batchim não fica mudo: ele atravessa e vira o som inicial da sílaba seguinte.',
  },
  tensa: {
    nome: '경음화',
    titulo: 'Tensificação',
    explicacao: 'Depois de ㄱ, ㄷ ou ㅂ, a consoante seguinte endurece — ㄱ vira ㄲ, ㄷ vira ㄸ, e assim por diante.',
  },
  nasal: {
    nome: '비음화',
    titulo: 'Nasalização',
    explicacao: 'Antes de ㄴ ou ㅁ, o batchim oclusivo vira nasal: ㄱ soa ㅇ, ㄷ soa ㄴ, ㅂ soa ㅁ.',
  },
  aspirada: {
    nome: '격음화',
    titulo: 'Aspiração',
    explicacao: 'ㅎ se funde com a consoante vizinha e produz uma aspirada: ㄱ+ㅎ vira ㅋ, ㄷ+ㅎ vira ㅌ.',
  },
  hMudo: {
    nome: 'ㅎ 탈락',
    titulo: 'Queda do ㅎ',
    explicacao: 'Entre vogais, o ㅎ simplesmente some.',
  },
  lateral: {
    nome: '유음화',
    titulo: 'Lateralização',
    explicacao: 'ㄴ encostado em ㄹ vira ㄹ — os dois lados se acomodam no mesmo som.',
  },
  palatal: {
    nome: '구개음화',
    titulo: 'Palatalização',
    explicacao: 'ㄷ e ㅌ antes de 이 deslizam para ㅈ e ㅊ, porque a língua já está na posição.',
  },
  fechamento: {
    nome: '음절의 끝소리',
    titulo: 'Fim de sílaba',
    explicacao: 'No fim da sílaba só sobrevivem sete sons. As outras consoantes desabam numa delas.',
  },
};

/**
 * @typedef {{som: string, mudou: boolean, regras: {nome: string, titulo: string, explicacao: string}[]}} Fala
 */

/**
 * @param {string} palavra grafia em 한글
 * @param {string} [override] pronúncia curada, para os casos que a grafia não prevê
 * @returns {Fala}
 */
export function pronunciar(palavra, override) {
  const silabas = [...palavra].map(partes);

  // Espaços, pontuação ou jamo solto: sem palpite, devolvemos a grafia.
  if (!silabas.length || silabas.some((s) => s === null)) {
    return { som: override ?? palavra, mudou: Boolean(override) && override !== palavra, regras: [] };
  }

  const aplicadas = new Set();
  const marcar = (chave) => aplicadas.add(chave);

  // ---- Passo 1: o que consome o batchim antes de ele se fechar ------------
  // Ligação, ㅎ e palatalização enxergam o batchim *original*. Se rodássemos o
  // fechamento antes, 밥이 viraria [받이] em vez de [바비].
  for (let i = 0; i < silabas.length - 1; i++) {
    const a = silabas[i];
    const b = silabas[i + 1];
    if (!a.final) continue;

    // 좋다 → [조타] · 많다 → [만타] · 좋아 → [조아] · 싫어 → [시러]
    if (a.final in COM_H) {
      const resto = COM_H[a.final];

      if (b.inicial in ASPIRA) {
        b.inicial = ASPIRA[b.inicial];
        a.final = resto;
        marcar('aspirada');
        continue;
      }
      if (b.inicial === 'ㅅ') { b.inicial = 'ㅆ'; a.final = resto; marcar('tensa'); continue; }
      if (b.inicial === 'ㅇ') { a.final = ''; if (resto) b.inicial = resto; marcar('hMudo'); continue; }
      if (b.inicial === 'ㄴ') { a.final = resto || 'ㄴ'; marcar('nasal'); continue; }
    }

    // 축하 → [추카] · 굳히다 → [구치다]
    if (b.inicial === 'ㅎ') {
      const base = NEUTRALIZA[a.final] ?? a.final;
      if (base in ASPIRA) {
        b.inicial = base === 'ㄷ' && b.medial === 'ㅣ' ? 'ㅊ' : ASPIRA[base];
        a.final = '';
        marcar(base === 'ㄷ' && b.medial === 'ㅣ' ? 'palatal' : 'aspirada');
        continue;
      }
    }

    // O ㅇ do batchim é o /ŋ/ de 고양이 — ele soa onde está e não atravessa.
    if (b.inicial !== 'ㅇ' || a.final === 'ㅇ') continue;

    // 같이 → [가치] · 굳이 → [구지]
    if ((a.final === 'ㄷ' || a.final === 'ㅌ') && b.medial === 'ㅣ') {
      b.inicial = a.final === 'ㄷ' ? 'ㅈ' : 'ㅊ';
      a.final = '';
      marcar('palatal');
      continue;
    }

    // 밥이 → [바비] · 읽어 → [일거] · 값이 → [갑씨]
    const duplo = DUPLOS[a.final];
    if (duplo) {
      a.final = duplo[0];
      // O ㅅ que atravessa vem sempre tenso: 값이 é [갑씨], não [갑시].
      b.inicial = duplo[1] === 'ㅅ' ? 'ㅆ' : duplo[1];
    } else {
      b.inicial = a.final;
      a.final = '';
    }
    marcar('ligacao');
  }

  // ---- Passo 2: fechamento de sílaba -------------------------------------
  for (const silaba of silabas) {
    if (silaba.final && silaba.final in NEUTRALIZA) {
      // ㄵ, ㄻ, ㄼ e ㄾ só aparecem em radical de verbo ou adjetivo (앉다, 삶다,
      // 넓다, 핥다). Isso torna a condição morfológica do 제24항 legível na
      // própria grafia: o que vem depois é desinência e endurece.
      silaba.haste = HASTE.has(silaba.final);
      silaba.final = NEUTRALIZA[silaba.final];
      marcar('fechamento');
    }
  }

  // ---- Passo 3: assimilação entre sílabas já fechadas ---------------------
  for (let i = 0; i < silabas.length - 1; i++) {
    const a = silabas[i];
    const b = silabas[i + 1];
    if (!a.final) continue;

    // 신라 → [실라] · 설날 → [설랄]
    if (a.final === 'ㄴ' && b.inicial === 'ㄹ') { a.final = 'ㄹ'; marcar('lateral'); continue; }
    if (a.final === 'ㄹ' && b.inicial === 'ㄴ') { b.inicial = 'ㄹ'; marcar('lateral'); continue; }

    if (b.inicial === 'ㄹ') {
      // 종로 → [종노] · 심리 → [심니]
      if (a.final === 'ㅁ' || a.final === 'ㅇ') { b.inicial = 'ㄴ'; marcar('nasal'); continue; }
      // 독립 → [동닙]: o ㄹ nasaliza primeiro e depois puxa o batchim junto.
      if (OBSTRUINTE.has(a.final)) {
        b.inicial = 'ㄴ';
        a.final = NASALIZA[a.final];
        marcar('nasal');
        continue;
      }
    }

    // 학년 → [항년] · 십만 → [심만] · 있는 → [인는]
    if ((b.inicial === 'ㄴ' || b.inicial === 'ㅁ') && OBSTRUINTE.has(a.final)) {
      a.final = NASALIZA[a.final];
      marcar('nasal');
      continue;
    }

    // 학교 → [학꾜] · 식당 → [식땅]
    if (OBSTRUINTE.has(a.final) && b.inicial in TENSA) {
      b.inicial = TENSA[b.inicial];
      marcar('tensa');
      continue;
    }

    // 앉다 → [안따] · 삶다 → [삼따] · 넓다 → [널따]
    if (a.haste && b.inicial in TENSA_HASTE) {
      b.inicial = TENSA_HASTE[b.inicial];
      marcar('tensa');
    }
  }

  const calculado = silabas.map((s) => montar(s) ?? '').join('');
  const som = override ?? calculado;

  return {
    som,
    mudou: som !== palavra,
    // Uma pronúncia curada não vem com derivação; não inventamos a explicação.
    regras: override && override !== calculado
      ? []
      : [...aplicadas].map((chave) => REGRAS[chave]),
  };
}

/** Batchim duplo → [o que fica, o que atravessa]. */
const DUPLOS = {
  'ㄳ': ['ㄱ', 'ㅅ'], 'ㄵ': ['ㄴ', 'ㅈ'], 'ㄶ': ['ㄴ', 'ㅎ'],
  'ㄺ': ['ㄹ', 'ㄱ'], 'ㄻ': ['ㄹ', 'ㅁ'], 'ㄼ': ['ㄹ', 'ㅂ'], 'ㄽ': ['ㄹ', 'ㅅ'],
  'ㄾ': ['ㄹ', 'ㅌ'], 'ㄿ': ['ㄹ', 'ㅍ'], 'ㅀ': ['ㄹ', 'ㅎ'], 'ㅄ': ['ㅂ', 'ㅅ'],
};
