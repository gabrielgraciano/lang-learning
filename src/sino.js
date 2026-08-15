/**
 * Famílias de palavras por morfema sino-coreano.
 *
 * Cerca de 70% do vocabulário coreano é sino-coreano, e essa é a alavanca de
 * médio prazo do app: enquanto 학교 e 학생 forem duas palavras isoladas, o
 * aprendiz decora duas coisas. No momento em que ele vê que 學 quer dizer
 * "estudar" e que é o mesmo 학 nas duas, o vocabulário deixa de ser lista e vira
 * sistema — 학년, 학기, 대학, 유학 passam a ser dedutíveis em vez de novas.
 *
 * A pesquisa que o APPCO1 reúne mostra que aprendizes de coreano recorrem
 * predominantemente à memorização e quase não usam estratégia metacognitiva.
 * Mostrar o morfema é oferecer essa estratégia de graça, no momento em que ela
 * tem a quem se agarrar.
 *
 * O mapeamento é por sílaba, não por posição, porque nem toda palavra é
 * inteiramente sino-coreana: em 빨간색 só o 색 (色) é, e 빨간 é nativo.
 */

/**
 * Índice morfema → palavras que o contêm.
 * @param {readonly object[]} banco
 * @returns {Map<string, object[]>}
 */
export function indexar(banco) {
  const familias = new Map();

  for (const palavra of banco) {
    for (const hanja of Object.values(palavra.sino ?? {})) {
      if (!familias.has(hanja)) familias.set(hanja, []);
      familias.get(hanja).push(palavra);
    }
  }

  return familias;
}

/**
 * As famílias de que uma palavra participa, já sem ela mesma e já sem os
 * morfemas que não levam a lugar nenhum. Um morfema com uma palavra só não é
 * família — é curiosidade, e no gabarito seria ruído.
 *
 * @returns {{hanja: string, silaba: string, significado: string, parentes: object[]}[]}
 */
export function familiasDe(palavra, indice, significados = {}) {
  return Object.entries(palavra.sino ?? {})
    .map(([silaba, hanja]) => ({
      hanja,
      silaba,
      significado: significados[hanja] ?? '',
      parentes: (indice.get(hanja) ?? []).filter((p) => p.id !== palavra.id),
    }))
    .filter((familia) => familia.parentes.length > 0);
}

/**
 * Todas as famílias com mais de uma palavra, da maior para a menor. É o que a
 * tela do mapa lista — e o que cresce sozinho conforme o baralho cresce.
 */
export function familias(indice, significados = {}) {
  return [...indice]
    .filter(([, palavras]) => palavras.length > 1)
    .map(([hanja, palavras]) => ({
      hanja,
      significado: significados[hanja] ?? '',
      palavras,
    }))
    .sort((a, b) => b.palavras.length - a.palavras.length || a.hanja.localeCompare(b.hanja));
}
