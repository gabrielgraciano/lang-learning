/**
 * Persistência local (localStorage). Tudo protegido por try/catch porque
 * navegadores em modo privado podem lançar exceção ao gravar.
 */

const CHAVE = 'coreano.flashcards.v1';

/** @returns {{preferencias?: {romanizacao: boolean}, ultimaSessao?: {acertos: number, total: number, data: string}}} */
export function lerEstado() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? '{}');
  } catch {
    return {};
  }
}

/**
 * Mescla `patch` no estado salvo.
 * @param {object} patch
 */
export function salvarEstado(patch) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify({ ...lerEstado(), ...patch }));
  } catch {
    // Sem persistência: o app continua funcionando normalmente na sessão atual.
  }
}
