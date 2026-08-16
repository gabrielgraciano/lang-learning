/**
 * Persistência local. Não há conta, não há servidor: o progresso mora no
 * navegador e sai daqui por exportação. É o que permite o app ser um site
 * estático — e o que torna o botão de exportar uma obrigação, não um extra.
 *
 * O `registro` é append-only e nunca é apagado por operação normal. Ele é o que
 * permitiria reajustar os parâmetros do FSRS ao histórico real de quem usa, e é
 * o que denuncia ilustração ambígua: palavra com erro muito acima da média do
 * módulo quase nunca é palavra difícil, é desenho ruim.
 */

const CHAVE = 'coreano.flashcards.v2';
const CHAVE_ANTIGA = 'coreano.flashcards.v1';

/** Teto de segurança: o localStorage tem alguns MB e o registro cresce sempre. */
const TETO_REGISTRO = 20_000;

const VAZIO = {
  versao: 2,
  preferencias: {
    /** Desligada por padrão — ver docs/fundamentacao.md, decisão 1. */
    romanizacao: false,
    som: true,
    novasPorDia: 8,
    metaSemanal: 5,
    tetoRevisao: 40,
  },
  /** id da palavra → estado FSRS. */
  cartoes: {},
  /** Uma linha por resposta, em ordem. */
  registro: [],
  /** 'AAAA-MM-DD' → contagem do dia, para a meta semanal. */
  dias: {},
  /**
   * id do exercício → { acertou, em }. Separado de `cartoes` de propósito: aula
   * não é cartão. O exercício confere que a explicação entrou e depois não tem
   * mais o que agendar, então aqui basta um sim/não — sem estabilidade, sem
   * intervalo, sem entrar na fila do dia.
   */
  licoes: {},
  /**
   * Ids de palavras que estavam fora do baralho (`baralho: false` no JSON) e
   * que quem estuda mandou entrar na fila.
   *
   * Existe uma fila só, e é de propósito: dois baralhos seriam duas sessões por
   * dia, dois mapas e duas redes de morfemas, e 자 de 의자 nunca reencontraria o
   * de 모자. O que não podia era despejar duzentas palavras de uma vez numa
   * fila calibrada para cento e quatorze. Então a porta é a mesma — só que quem
   * abre é quem estuda, um dia de cada vez, e o teto de `novasPorDia` continua
   * regulando a vazão.
   */
  promovidas: [],
};

const clonar = (valor) => JSON.parse(JSON.stringify(valor));

export const hoje = (data = new Date()) =>
  `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;

export function ler() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) {
      const salvo = JSON.parse(bruto);
      return {
        ...VAZIO,
        ...salvo,
        preferencias: { ...VAZIO.preferencias, ...salvo.preferencias },
        cartoes: salvo.cartoes ?? {},
        registro: salvo.registro ?? [],
        dias: salvo.dias ?? {},
        licoes: salvo.licoes ?? {},
        promovidas: salvo.promovidas ?? [],
      };
    }
    return migrar();
  } catch {
    return clonar(VAZIO);
  }
}

/**
 * A v1 guardava só preferências e a última rodada — não havia estado por
 * palavra para converter. Trazemos o que existia e seguimos.
 */
function migrar() {
  const estado = clonar(VAZIO);
  try {
    const antigo = JSON.parse(localStorage.getItem(CHAVE_ANTIGA) ?? '{}');
    if (typeof antigo.preferencias?.romanizacao === 'boolean') {
      estado.preferencias.romanizacao = antigo.preferencias.romanizacao;
    }
  } catch {
    // Sem histórico aproveitável: começa limpo.
  }
  return estado;
}

export function salvar(estado) {
  try {
    const enxuto = estado.registro.length > TETO_REGISTRO
      ? { ...estado, registro: estado.registro.slice(-TETO_REGISTRO) }
      : estado;
    localStorage.setItem(CHAVE, JSON.stringify(enxuto));
    return true;
  } catch {
    // Modo privado ou cota estourada: a sessão atual continua funcionando.
    return false;
  }
}

/** Grava uma resposta: estado novo do cartão + a linha no registro. */
export function registrar(estado, { id, cartao, nota, nivel, ms, usouDica }) {
  const dia = hoje();
  const contagem = estado.dias[dia] ?? { revisoes: 0, novas: 0 };

  return {
    ...estado,
    cartoes: { ...estado.cartoes, [id]: cartao },
    registro: [...estado.registro, {
      id,
      em: new Date().toISOString(),
      nota,
      nivel,
      ms,
      dica: usouDica ? 1 : 0,
    }],
    dias: {
      ...estado.dias,
      [dia]: {
        revisoes: contagem.revisoes + 1,
        novas: contagem.novas + (cartao.revisoes === 1 ? 1 : 0),
      },
    },
  };
}

/**
 * Grava o resultado de um exercício de aula. Um item já acertado não é
 * rebaixado por uma passada errada depois: refazer para conferir se ainda sabe
 * é uso legítimo, e apagar o progresso por causa disso desencorajaria revisar.
 */
export function registrarExercicio(estado, id, acertou) {
  const antes = estado.licoes[id];
  return {
    ...estado,
    licoes: {
      ...estado.licoes,
      [id]: {
        acertou: acertou || Boolean(antes?.acertou),
        em: new Date().toISOString(),
      },
    },
  };
}

/**
 * Manda as palavras de um dia para a fila.
 *
 * Só acrescenta: tirar do baralho o que já foi visto jogaria fora o estado
 * FSRS da palavra, e o que se aprendeu não deixa de ter sido aprendido porque
 * a pessoa mudou de ideia sobre o dia.
 */
export function promover(estado, ids) {
  const juntas = new Set([...estado.promovidas, ...ids]);
  return { ...estado, promovidas: [...juntas] };
}

export const comPreferencias = (estado, patch) => ({
  ...estado,
  preferencias: { ...estado.preferencias, ...patch },
});

/**
 * Dias com pelo menos uma resposta nos últimos 7 dias.
 *
 * É de propósito que isto não seja um streak. Streak é motivador controlado:
 * funciona por medo de perder, colide com um produto que se vende como
 * self-paced e produz abandono na primeira quebra. Meta semanal com folga
 * ("5 de 7") deixa um dia perdido ser um dia perdido.
 */
export function semana(estado, data = new Date()) {
  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(data);
    d.setDate(d.getDate() - i);
    const chave = hoje(d);
    dias.push({ dia: chave, contagem: estado.dias[chave]?.revisoes ?? 0 });
  }
  return dias;
}

export function exportar(estado) {
  return JSON.stringify({ ...estado, exportadoEm: new Date().toISOString() }, null, 2);
}

/**
 * Importa um arquivo exportado. Rejeita qualquer coisa que não tenha a forma
 * esperada em vez de gravar lixo por cima de um progresso real.
 */
export function importar(texto) {
  const dados = JSON.parse(texto);
  if (typeof dados !== 'object' || dados === null) throw new Error('Arquivo vazio ou inválido.');
  if (typeof dados.cartoes !== 'object' || dados.cartoes === null) {
    throw new Error('Arquivo sem a seção de cartões.');
  }

  return {
    ...VAZIO,
    ...dados,
    versao: 2,
    preferencias: { ...VAZIO.preferencias, ...dados.preferencias },
    registro: Array.isArray(dados.registro) ? dados.registro : [],
    dias: dados.dias ?? {},
    licoes: dados.licoes ?? {},
    promovidas: Array.isArray(dados.promovidas) ? dados.promovidas : [],
  };
}
