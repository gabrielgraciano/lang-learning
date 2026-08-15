/**
 * A fila do dia.
 *
 * Duas decisões moram aqui, e as duas existem para a sessão poder terminar.
 *
 * 1. Revisão vem antes de palavra nova. O que já foi aprendido tem prioridade
 *    sobre o que ainda não foi — é o que o agendamento espaçado significa.
 * 2. Se a fila de revisão estourar o teto, o app segura as palavras novas
 *    sozinho e avisa. É a espiral de dívida que mata usuário de Anki: uma
 *    semana sem estudar vira 300 cards atrasados, e 300 cards atrasados viram
 *    a decisão de nunca mais abrir o app.
 *
 * A sessão sempre fecha. Nunca "restam 137 cards".
 */

import { cartaoNovo, estadoDe } from './fsrs.js';
import { nivelDe, embaralhar } from './niveis.js';

/**
 * @param {object[]} banco vocabulário completo
 * @param {object} estado estado persistido
 * @param {{agora?: Date}} [opcoes]
 */
export function montarFila(banco, estado, { agora = new Date() } = {}) {
  const { novasPorDia, tetoRevisao } = estado.preferencias;
  const limite = agora.getTime();

  const vistas = banco.filter((p) => estado.cartoes[p.id]?.revisoes);
  const ineditas = banco.filter((p) => !estado.cartoes[p.id]?.revisoes);

  const vencidas = vistas
    .filter((p) => new Date(estado.cartoes[p.id].vencimento).getTime() <= limite)
    .sort((a, b) =>
      new Date(estado.cartoes[a.id].vencimento) - new Date(estado.cartoes[b.id].vencimento));

  const atrasadas = vencidas.length > tetoRevisao;
  const revisoes = vencidas.slice(0, tetoRevisao);

  // Palavra nova entra na ordem curada (frequência × imageabilidade), não
  // sorteada: os módulos foram ordenados por alguém, e essa ordem é conteúdo.
  const novas = atrasadas ? [] : ineditas.slice(0, novasPorDia);

  return {
    revisoes,
    novas,
    fila: [...revisoes, ...novas],
    /** Verdadeiro quando o app segurou palavras novas para dar vazão ao atraso. */
    segurou: atrasadas,
    pendentes: Math.max(0, vencidas.length - tetoRevisao),
  };
}

/**
 * Quantas palavras ainda esperam, para a tela inicial poder dizer o tamanho do
 * dia antes de a pessoa começar.
 */
export function resumo(banco, estado, { agora = new Date() } = {}) {
  const contagem = { novo: 0, aprendendo: 0, estavel: 0, dominado: 0 };
  for (const palavra of banco) contagem[estadoDe(estado.cartoes[palavra.id])]++;

  const { revisoes, novas, segurou, pendentes } = montarFila(banco, estado, { agora });

  return {
    ...contagem,
    total: banco.length,
    revisoes: revisoes.length,
    novas: novas.length,
    sessao: revisoes.length + novas.length,
    segurou,
    pendentes,
    /** A métrica de valor: palavras que a memória já segura sozinha. */
    firmes: contagem.estavel + contagem.dominado,
  };
}

/**
 * Monta os itens da sessão: cada palavra com o nível em que vai ser cobrada.
 * Palavra nova entra no nível 0 (apresentação) e é imediatamente cobrada no
 * nível 1 — a apresentação não é exposição passiva, é o prefácio do teste.
 */
export function montarSessao(banco, estado, opcoes = {}) {
  const { revisoes, novas, segurou, pendentes } = montarFila(banco, estado, opcoes);

  const itens = [
    ...embaralhar(revisoes).map((palavra) => ({
      palavra,
      nivel: nivelDe(estado.cartoes[palavra.id]),
      estreia: false,
    })),
    ...novas.flatMap((palavra) => [
      { palavra, nivel: 0, estreia: true },
      { palavra, nivel: 1, estreia: false },
    ]),
  ];

  return { itens, segurou, pendentes, revisoes: revisoes.length, novas: novas.length };
}

/** O cartão de uma palavra, criando um zerado quando ela nunca foi vista. */
export const cartaoDe = (estado, id) => estado.cartoes[id] ?? cartaoNovo();
