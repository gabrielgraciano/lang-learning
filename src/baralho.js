/**
 * Utilidades do baralho de flashcards.
 */

/**
 * Devolve uma nova lista embaralhada (Fisher-Yates). Não modifica a original.
 * @template T
 * @param {readonly T[]} lista
 * @returns {T[]}
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
 * Cria o estado de uma nova rodada a partir de uma lista de palavras.
 * @param {readonly object[]} palavras
 */
export function novaRodada(palavras) {
  return {
    fila: embaralhar(palavras),
    indice: 0,
    virado: false,
    acertos: 0,
    erradas: [],
    /** true/false por card já respondido, na ordem da fila. */
    resultados: [],
  };
}
