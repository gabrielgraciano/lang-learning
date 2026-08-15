/**
 * FSRS-5 — o agendador de revisões.
 *
 * O SM-2 (1987, o algoritmo do Anki clássico) guarda um único "fator de
 * facilidade" por card e aplica fórmula fixa. O FSRS modela três variáveis
 * separadas — dificuldade, estabilidade e recuperabilidade — e por isso prevê
 * o intervalo com bem mais precisão: análises independentes sobre milhões de
 * revisões mostram a mesma retenção com 20–30% menos revisões.
 *
 * Isto é uma transcrição das fórmulas publicadas do FSRS-5 com os pesos padrão,
 * não um algoritmo próprio. A implementação de referência é a `ts-fsrs`
 * (open-spaced-repetition); ela não é usada aqui porque o app não tem etapa de
 * build nem rede garantida — o site é estático e precisa funcionar offline.
 * A interface abaixo (`cartaoNovo`, `agendar`) espelha a dela de propósito,
 * para que trocar uma pela outra seja um import.
 *
 * Uma propriedade útil pra ler o resto do código: com retenção-alvo em 0.9, o
 * intervalo em dias *é* a estabilidade. "Estabilidade 21" quer dizer "daqui a
 * 21 dias você ainda tem 90% de chance de lembrar".
 */

export const PARAMETROS_PADRAO = [
  0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575,
  0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621,
];

const DECAY = -0.5;
const FATOR = 19 / 81;          // 0.9^(1/DECAY) − 1
const DIA = 86_400_000;
const S_MIN = 0.01;
const S_MAX = 36_500;

/** As quatro respostas possíveis a um card. */
export const NOTA = { DENOVO: 1, DIFICIL: 2, BOM: 3, FACIL: 4 };

const limitar = (valor, min, max) => Math.min(Math.max(valor, min), max);

/** Chance de lembrar depois de `dias` sem ver o card. */
export function recuperabilidade(dias, estabilidade) {
  if (estabilidade <= 0) return 0;
  return (1 + FATOR * dias / estabilidade) ** DECAY;
}

/** Quantos dias até a chance de lembrar cair para `retencao`. */
export function intervalo(estabilidade, retencao = 0.9) {
  return (estabilidade / FATOR) * (retencao ** (1 / DECAY) - 1);
}

export function cartaoNovo() {
  return {
    dificuldade: 0,
    estabilidade: 0,
    vencimento: null,
    revisoes: 0,
    lapsos: 0,
    ultimaRevisao: null,
    primeiraVez: null,
  };
}

const dificuldadeInicial = (w, nota) => limitar(w[4] - Math.exp(w[5] * (nota - 1)) + 1, 1, 10);

function proximaDificuldade(w, dificuldade, nota) {
  const delta = -w[6] * (nota - 3);
  const linear = dificuldade + delta * (10 - dificuldade) / 9;
  // Reversão à média: sem isso um card marcado "difícil" muitas vezes trava
  // num extremo e nunca mais sai de lá.
  return limitar(w[7] * dificuldadeInicial(w, NOTA.BOM + 1) + (1 - w[7]) * linear, 1, 10);
}

function estabilidadeAposAcerto(w, dificuldade, estabilidade, chance, nota) {
  const penalidade = nota === NOTA.DIFICIL ? w[15] : 1;
  const bonus = nota === NOTA.FACIL ? w[16] : 1;

  // Quanto mais improvável era lembrar, maior o ganho por ter lembrado — é a
  // "dificuldade desejável" de Bjork escrita como fórmula.
  const ganho = Math.exp(w[8])
    * (11 - dificuldade)
    * estabilidade ** -w[9]
    * (Math.exp(w[10] * (1 - chance)) - 1)
    * penalidade
    * bonus;

  return limitar(estabilidade * (1 + ganho), S_MIN, S_MAX);
}

function estabilidadeAposErro(w, dificuldade, estabilidade, chance) {
  const esquecida = w[11]
    * dificuldade ** -w[12]
    * ((estabilidade + 1) ** w[13] - 1)
    * Math.exp(w[14] * (1 - chance));

  // Esquecer nunca pode aumentar a estabilidade.
  return limitar(Math.min(esquecida, estabilidade), S_MIN, S_MAX);
}

const estabilidadeMesmoDia = (w, estabilidade, nota) =>
  limitar(estabilidade * Math.exp(w[17] * (nota - 3 + w[18])), S_MIN, S_MAX);

/**
 * Aplica uma resposta e devolve o cartão atualizado. Função pura: não altera
 * o cartão recebido.
 *
 * @param {ReturnType<typeof cartaoNovo>} cartao
 * @param {1|2|3|4} nota
 * @param {{agora?: Date, retencao?: number, parametros?: number[], intervaloMaximo?: number}} [opcoes]
 */
export function agendar(cartao, nota, opcoes = {}) {
  const {
    agora = new Date(),
    retencao = 0.9,
    parametros: w = PARAMETROS_PADRAO,
    intervaloMaximo = 365 * 5,
  } = opcoes;

  const estreia = !cartao.ultimaRevisao;
  const decorridos = estreia ? 0 : (agora - new Date(cartao.ultimaRevisao)) / DIA;
  const chance = estreia ? 0 : recuperabilidade(decorridos, cartao.estabilidade);

  let dificuldade;
  let estabilidade;

  if (estreia) {
    dificuldade = dificuldadeInicial(w, nota);
    estabilidade = limitar(w[nota - 1], S_MIN, S_MAX);
  } else {
    dificuldade = proximaDificuldade(w, cartao.dificuldade, nota);
    if (decorridos < 1) {
      // Revisão no mesmo dia mede memória de curto prazo, não consolidação.
      estabilidade = estabilidadeMesmoDia(w, cartao.estabilidade, nota);
    } else if (nota === NOTA.DENOVO) {
      estabilidade = estabilidadeAposErro(w, dificuldade, cartao.estabilidade, chance);
    } else {
      estabilidade = estabilidadeAposAcerto(w, dificuldade, cartao.estabilidade, chance, nota);
    }
  }

  const dias = intervalo(estabilidade, retencao);
  const emDias = Math.round(limitar(dias, 1, intervaloMaximo));

  return {
    ...cartao,
    dificuldade,
    estabilidade,
    revisoes: cartao.revisoes + 1,
    lapsos: cartao.lapsos + (!estreia && nota === NOTA.DENOVO ? 1 : 0),
    ultimaRevisao: agora.toISOString(),
    primeiraVez: cartao.primeiraVez ?? agora.toISOString(),
    // Abaixo de um dia o card não sai da sessão: ele volta no fim da fila.
    vencimento: new Date(agora.getTime() + (dias < 1 ? 10 * 60_000 : emDias * DIA)).toISOString(),
    intervaloDias: dias < 1 ? 0 : emDias,
  };
}

/**
 * Os quatro estados que a grade do mapa pinta. São as faixas de estabilidade
 * do APPCO1 §7: o progresso é ancorado em memória medida, não em pontos.
 *
 * @returns {'novo'|'aprendendo'|'estavel'|'dominado'}
 */
export function estadoDe(cartao) {
  if (!cartao || !cartao.revisoes) return 'novo';
  if (cartao.estabilidade < 21) return 'aprendendo';
  if (cartao.estabilidade < 90) return 'estavel';
  return 'dominado';
}
