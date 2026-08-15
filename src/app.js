/**
 * Orquestração das telas e do laço de estudo.
 *
 * O laço é sempre o mesmo: mostra a ilustração → cobra uma resposta no nível em
 * que a palavra está → mostra o gabarito completo → grava e agenda. Não existe
 * modo de folhear passivamente, porque a ilustração produz sensação de saber
 * mesmo sem retenção; a única forma de a imagem valer mais que a tradução é ela
 * vir acompanhada de recuperação e de feedback.
 */

import { decompor } from './hangul.js';
import { pronunciar } from './pronuncia.js';
import { agendar, estadoDe } from './fsrs.js';
import { NIVEL, DESCRICAO_NIVEL, nivelDe, molde, proximaDica, dicaEsgotada, alternativas, conferir, notaPara, partirFrase, respostaDe } from './niveis.js';
import { montarSessao, cartaoDe, resumo } from './agenda.js';
import { ligarCampo, montarTeclado } from './teclado.js';
import * as banco from './armazenamento.js';

const URL_DADOS = new URL('../dados/palavras.json', import.meta.url);

const $ = (seletor) => document.querySelector(seletor);

const el = {
  telas: {
    hoje: $('#tela-hoje'),
    estudo: $('#tela-estudo'),
    fim: $('#tela-fim'),
    mapa: $('#tela-mapa'),
    ajustes: $('#tela-ajustes'),
  },

  fichaHoje: $('#ficha-hoje'),
  fichaFirmes: $('#ficha-firmes'),
  fichaTotal: $('#ficha-total'),
  comecar: $('#comecar'),
  avisoFila: $('#aviso-fila'),
  semana: $('#semana'),
  semanaResumo: $('#semana-resumo'),
  erro: $('#erro'),

  contador: $('#contador'),
  trilha: $('#trilha'),
  sair: $('#sair'),
  etiquetaNivel: $('#etiqueta-nivel'),
  quadroImagem: $('#quadro-imagem'),
  ilustracao: $('#ilustracao'),
  quadroFrase: $('#quadro-frase'),
  fraseKo: $('#frase-ko'),
  frasePt: $('#frase-pt'),

  provaIntro: $('#prova-intro'),
  introHangul: $('#intro-hangul'),
  introPt: $('#intro-pt'),
  introSeguir: $('#intro-seguir'),

  provaEscolha: $('#prova-escolha'),
  alternativas: $('#alternativas'),

  provaDigitar: $('#prova-digitar'),
  perguntaDigitar: $('#pergunta-digitar'),
  molde: $('#molde'),
  resposta: $('#resposta'),
  botaoDica: $('#botao-dica'),
  areaTeclado: $('#area-teclado'),

  gabarito: $('#gabarito'),
  veredito: $('#veredito'),
  gabaritoPalavra: $('#gabarito-palavra'),
  jamo: $('#jamo'),
  padrao: $('#padrao'),
  parAntonimo: $('#par-antonimo'),
  blocoSom: $('#bloco-som'),
  somValor: $('#som-valor'),
  somRegra: $('#som-regra'),
  ouvir: $('#ouvir'),
  romanizacao: $('#romanizacao'),
  gabaritoPt: $('#gabarito-pt'),
  exemplo: $('#exemplo'),
  exemploKo: $('#exemplo-ko'),
  exemploPt: $('#exemplo-pt'),
  nota: $('#nota'),
  seguir: $('#seguir'),

  placar: $('#placar'),
  trilhaFim: $('#trilha-fim'),
  blocoSubiram: $('#bloco-subiram'),
  listaSubiram: $('#lista-subiram'),
  blocoTropecos: $('#bloco-tropecos'),
  listaTropecos: $('#lista-tropecos'),
  proxima: $('#proxima'),
  voltarHoje: $('#voltar-hoje'),

  mapa: $('#mapa'),
  detalhe: $('#detalhe'),

  ritmo: $('#ritmo'),
  ritmoValor: $('#ritmo-valor'),
  meta: $('#meta'),
  metaValor: $('#meta-valor'),
  toggleRomanizacao: $('#toggle-romanizacao'),
  toggleSom: $('#toggle-som'),
  notaSom: $('#nota-som'),
  exportar: $('#exportar'),
  importar: $('#importar'),
  arquivo: $('#arquivo'),
  avisoDados: $('#aviso-dados'),
};

/** @type {object[]} */
let palavras = [];
let estado = banco.ler();
/** @type {null | ReturnType<typeof novaSessao>} */
let sessao = null;
let campo = null;

const doisDigitos = (n) => String(n).padStart(2, '0');

/**
 * Nome de exibição dos módulos. Só existe por causa dos acentos — um módulo
 * novo que não esteja aqui ainda aparece legível, só que sem acentuação, então
 * acrescentar vocabulário continua não exigindo mexer em código.
 */
const NOME_MODULO = {
  comida: 'Comida e bebida',
  acoes: 'Ações',
  'alta-frequencia': 'Alta frequência',
};

const rotuloModulo = (id) =>
  NOME_MODULO[id] ?? id.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

// ------------------------------------------------------------------ navegação

function ir(nome) {
  for (const [chave, secao] of Object.entries(el.telas)) secao.hidden = chave !== nome;
  window.scrollTo({ top: 0 });
  if (nome === 'hoje') pintarHoje();
  if (nome === 'mapa') pintarMapa();
  if (nome === 'ajustes') pintarAjustes();
}

// -------------------------------------------------------------------- áudio

let vozes = [];
const carregarVozes = () => { vozes = window.speechSynthesis?.getVoices() ?? []; };
const vozCoreana = () => vozes.find((v) => v.lang?.toLowerCase().startsWith('ko')) ?? null;

function falar(texto) {
  if (!estado.preferencias.som || !window.speechSynthesis) return;
  const voz = vozCoreana();
  if (!voz) return;

  window.speechSynthesis.cancel();
  const fala = new SpeechSynthesisUtterance(texto);
  fala.voice = voz;
  fala.lang = voz.lang;
  fala.rate = 0.85;
  window.speechSynthesis.speak(fala);
}

// -------------------------------------------------------------- tela: hoje

function pintarHoje() {
  const r = resumo(palavras, estado);

  el.fichaHoje.textContent = r.sessao === 0
    ? 'nada vencido'
    : [
        r.revisoes ? `${r.revisoes} ${r.revisoes === 1 ? 'revisão' : 'revisões'}` : null,
        r.novas ? `${r.novas} ${r.novas === 1 ? 'nova' : 'novas'}` : null,
      ].filter(Boolean).join(' + ');

  el.fichaFirmes.textContent = `${r.firmes} de ${r.total}`;
  el.fichaTotal.textContent = `${r.total} palavras`;

  el.comecar.disabled = r.sessao === 0;
  el.comecar.textContent = r.sessao === 0 ? 'Tudo em dia' : `Começar — ${r.sessao} ${r.sessao === 1 ? 'card' : 'cards'}`;

  el.avisoFila.hidden = !r.segurou;
  if (r.segurou) {
    el.avisoFila.textContent = `A fila de revisão passou do teto, então as palavras novas ficam pausadas até ela baixar. Faltam ${r.pendentes} além das de hoje.`;
  }

  pintarSemana();
}

function pintarSemana() {
  const dias = banco.semana(estado);
  const feitos = dias.filter((d) => d.contagem > 0).length;
  const meta = estado.preferencias.metaSemanal;

  el.semana.replaceChildren(...dias.map(({ dia, contagem }) => {
    const item = document.createElement('li');
    item.className = contagem > 0 ? 'dia dia-feito' : 'dia';
    item.title = `${dia}: ${contagem} ${contagem === 1 ? 'resposta' : 'respostas'}`;
    return item;
  }));

  el.semanaResumo.textContent = feitos >= meta
    ? `${feitos} de 7 dias — meta da semana cumprida.`
    : `${feitos} de 7 dias. A meta é ${meta}.`;
}

// ------------------------------------------------------------ tela: estudo

function novaSessao() {
  const { itens, segurou, pendentes } = montarSessao(palavras, estado);

  return {
    fila: itens,
    indice: 0,
    /** true/false por item pontuado, na ordem em que foram respondidos. */
    resultados: [],
    acertos: 0,
    total: itens.filter((i) => !i.estreia).length,
    subiram: new Map(),
    tropecos: new Map(),
    usouDica: false,
    grau: 0,
    inicio: 0,
    segurou,
    pendentes,
  };
}

const itemAtual = () => sessao.fila[sessao.indice];

function comecar() {
  sessao = novaSessao();
  if (!sessao.fila.length) return;
  ir('estudo');
  mostrarItem();
}

function esconderProvas() {
  el.provaIntro.hidden = true;
  el.provaEscolha.hidden = true;
  el.provaDigitar.hidden = true;
  el.gabarito.hidden = true;
}

function mostrarItem() {
  const item = itemAtual();
  if (!item) return terminar();

  const { palavra, nivel } = item;
  sessao.usouDica = false;
  sessao.grau = 0;
  sessao.inicio = performance.now();

  esconderProvas();
  pintarEstimulo(palavra, { revelar: nivel === NIVEL.INTRODUCAO });

  const descricao = DESCRICAO_NIVEL[nivel];
  const detalhe = (ehFrase(palavra) && descricao.detalheFrase) || descricao.detalhe;
  el.etiquetaNivel.textContent = `${descricao.rotulo} · ${detalhe}`;

  el.contador.textContent = `${doisDigitos(Math.min(sessao.resultados.length + 1, sessao.total))} / ${doisDigitos(sessao.total)}`;
  pintarTrilha(el.trilha, sessao.resultados.length);

  if (nivel === NIVEL.INTRODUCAO) return mostrarIntro(palavra);
  if (nivel === NIVEL.RECONHECIMENTO) return mostrarEscolha(palavra);
  return mostrarDigitacao(palavra, nivel);
}

const ehFrase = (palavra) => palavra.tipo === 'frase';

/**
 * O estímulo do card. É o único ponto onde os dois formatos divergem: palavra
 * ilustrável mostra o desenho, palavra que não se ilustra mostra a frase com a
 * lacuna. Da pergunta para baixo — escada, dica, FSRS, gabarito — tudo é igual.
 */
function pintarEstimulo(palavra, { revelar = false } = {}) {
  const frase = ehFrase(palavra);
  el.quadroImagem.hidden = frase;
  el.quadroFrase.hidden = !frase;

  if (frase) return pintarFrase(palavra, revelar);

  el.ilustracao.src = palavra.ilustracao;
  // A imagem não pode entregar a resposta pelo alt: quem usa leitor de tela
  // recebe a mesma pergunta que quem enxerga.
  el.ilustracao.alt = revelar
    ? `Ilustração de ${palavra.pt}`
    : 'Ilustração da palavra a adivinhar';
}

function pintarFrase(palavra, revelar) {
  const { antes, depois } = partirFrase(palavra.frase.ko);

  const lacuna = document.createElement('span');
  lacuna.className = revelar ? 'lacuna lacuna-cheia' : 'lacuna';
  lacuna.textContent = revelar ? respostaDe(palavra) : '';

  el.fraseKo.replaceChildren(antes, lacuna, depois);
  // O buraco é desenhado em CSS, então quem ouve a página precisa que ele seja
  // dito em palavra.
  el.fraseKo.setAttribute('aria-label', revelar
    ? palavra.frase.ko.replace('{}', respostaDe(palavra))
    : `${antes} lacuna ${depois}`);

  el.frasePt.textContent = palavra.frase.pt;
}

function mostrarIntro(palavra) {
  el.provaIntro.hidden = false;
  el.introHangul.textContent = palavra.hangul;
  el.introPt.textContent = palavra.pt;
  falar(palavra.hangul);
  el.introSeguir.focus();
}

function mostrarEscolha(palavra) {
  el.provaEscolha.hidden = false;

  el.alternativas.replaceChildren(...alternativas(palavra, palavras).map((opcao) => {
    const item = document.createElement('li');
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'alternativa';
    botao.lang = 'ko';
    botao.textContent = respostaDe(opcao);
    botao.addEventListener('click', () => avaliar(opcao.id === palavra.id));
    item.append(botao);
    return item;
  }));

  el.alternativas.querySelector('button')?.focus();
}

function mostrarDigitacao(palavra, nivel) {
  el.provaDigitar.hidden = false;
  campo.limpar();

  el.perguntaDigitar.textContent = ehFrase(palavra)
    ? 'Complete a frase em 한글'
    : 'Escreva a palavra em 한글';

  const assistido = nivel === NIVEL.ASSISTIDO;

  // O nível 2 já começa com um degrau de apoio; o 3 começa do zero.
  sessao.grau = assistido ? 1 : 0;
  atualizarMolde(palavra);
  el.resposta.focus();
}

function atualizarMolde(palavra) {
  const alvo = respostaDe(palavra);
  el.molde.hidden = sessao.grau === 0;
  el.molde.textContent = sessao.grau === 0 ? '' : molde(alvo, sessao.grau);
  el.botaoDica.hidden = dicaEsgotada(alvo, sessao.grau);
}

function pedirDica() {
  const { palavra } = itemAtual();
  sessao.usouDica = true;
  sessao.grau = proximaDica(respostaDe(palavra), sessao.grau);
  atualizarMolde(palavra);
  el.resposta.focus();
}

function responderDigitado() {
  const { palavra } = itemAtual();
  if (!el.resposta.value.trim()) return;
  avaliar(conferir(el.resposta.value, respostaDe(palavra)));
}

// ------------------------------------------------------------------ gabarito

function avaliar(acertou) {
  const { palavra, nivel } = itemAtual();
  const antes = cartaoDe(estado, palavra.id);
  const ms = Math.round(performance.now() - sessao.inicio);

  const nota = notaPara({ acertou, usouDica: sessao.usouDica, nivel });
  const depois = agendar(antes, nota);

  estado = banco.registrar(estado, {
    id: palavra.id,
    cartao: depois,
    nota,
    nivel,
    ms,
    usouDica: sessao.usouDica,
  });
  banco.salvar(estado);

  sessao.resultados.push(acertou);
  if (acertou) sessao.acertos++;
  else sessao.tropecos.set(palavra.id, palavra);

  if (nivelDe(depois) > nivelDe(antes)) sessao.subiram.set(palavra.id, palavra);

  // Errou: a palavra volta ao fim da fila desta sessão. Sair da sessão sem ter
  // acertado uma vez é sair sem ter aprendido. A trilha cresce junto, para o
  // contador não mentir sobre quanto falta.
  if (!acertou) {
    sessao.fila.push({ palavra, nivel, estreia: false, repescagem: true });
    sessao.total++;
  }

  mostrarGabarito(palavra, acertou);
}

function mostrarGabarito(palavra, acertou) {
  esconderProvas();
  el.gabarito.hidden = false;
  pintarEstimulo(palavra, { revelar: true });

  el.veredito.textContent = acertou ? 'Acertou' : 'Ainda não';
  el.veredito.className = `veredito ${acertou ? 'veredito-acerto' : 'veredito-erro'}`;

  el.gabaritoPalavra.textContent = palavra.hangul;
  montarJamo(palavra.hangul);

  // 수 e 것 não existem soltas — só dentro de uma construção. Mostrar o padrão
  // é o que evita o aprendiz memorizar uma palavra que ele nunca vai usar
  // sozinha.
  const forma = respostaDe(palavra);
  const partes = [palavra.padrao, forma === palavra.hangul ? null : `na frase: ${forma}`]
    .filter(Boolean);
  el.padrao.hidden = partes.length === 0;
  el.padrao.textContent = partes.join('   ·   ');

  // Adjetivo se aprende em par: 크다 só significa alguma coisa contra 작다.
  const par = palavra.par ? palavras.find((p) => p.id === palavra.par) : null;
  el.parAntonimo.hidden = !par;
  if (par) {
    const oposto = document.createElement('b');
    oposto.lang = 'ko';
    oposto.textContent = par.hangul;
    el.parAntonimo.replaceChildren('o oposto é ', oposto, ` — ${par.pt}`);
  }

  // A pronúncia só aparece quando ela contradiz a escrita — que é exatamente
  // quando ela ensina alguma coisa.
  const fala = pronunciar(palavra.hangul, palavra.pronuncia);
  el.blocoSom.hidden = !fala.mudou;
  if (fala.mudou) {
    el.somValor.textContent = `[${fala.som}]`;
    el.somRegra.textContent = fala.regras
      .map((r) => `${r.nome} · ${r.titulo}: ${r.explicacao}`)
      .join('  ');
    el.somRegra.hidden = fala.regras.length === 0;
  }

  el.romanizacao.hidden = !estado.preferencias.romanizacao;
  el.romanizacao.textContent = palavra.romanizacao;

  el.gabaritoPt.textContent = palavra.pt;

  el.exemplo.hidden = !palavra.exemplo;
  if (palavra.exemplo) {
    el.exemploKo.textContent = palavra.exemplo.ko;
    el.exemploPt.textContent = palavra.exemplo.pt;
  }

  el.nota.hidden = !palavra.nota;
  if (palavra.nota) el.nota.textContent = palavra.nota;

  falar(palavra.hangul);
  el.seguir.focus();
}

/** Desmonta a palavra nas peças de cada sílaba: 고양이 → ㄱㅗ · ㅇㅑㅇ · ㅇㅣ */
function montarJamo(hangul) {
  let ordem = 0;

  el.jamo.replaceChildren(...decompor(hangul).map(({ jamo }) => {
    const grupo = document.createElement('span');
    grupo.className = 'jamo-silaba';

    grupo.append(...jamo.map((peca) => {
      const celula = document.createElement('span');
      celula.className = 'jamo-peca';
      celula.style.setProperty('--i', String(ordem++));
      celula.textContent = peca;
      return celula;
    }));

    return grupo;
  }));
}

function seguir() {
  sessao.indice++;
  mostrarItem();
}

// --------------------------------------------------------------- trilha

function pintarTrilha(lista, ate = Infinity) {
  const celulas = Array.from({ length: sessao.total }, (_, indice) => {
    const item = document.createElement('li');
    const resultado = sessao.resultados[indice];

    if (resultado !== undefined) item.className = resultado ? 'passo-acerto' : 'passo-erro';
    else if (indice === ate) item.className = 'passo-atual';

    return item;
  });

  lista.replaceChildren(...celulas);
}

// ---------------------------------------------------------------- tela: fim

function terminar() {
  const respondidas = sessao.resultados.length;

  const numero = document.createElement('b');
  numero.textContent = `${sessao.acertos} de ${respondidas}`;

  const detalhe = document.createElement('small');
  const firmes = resumo(palavras, estado).firmes;
  detalhe.textContent = `${firmes} ${firmes === 1 ? 'palavra firme' : 'palavras firmes'} na memória`;

  el.placar.replaceChildren(
    ...(respondidas === 0 ? ['Nada respondido hoje'] : ['Você acertou ', numero]),
    detalhe,
  );
  pintarTrilha(el.trilhaFim);

  preencherLista(el.blocoSubiram, el.listaSubiram, [...sessao.subiram.values()]);
  preencherLista(el.blocoTropecos, el.listaTropecos, [...sessao.tropecos.values()]);

  const proximo = proximaRevisao();
  el.proxima.textContent = proximo
    ? `Próxima revisão ${proximo}.`
    : 'Sem revisões agendadas ainda.';

  banco.salvar(estado);
  ir('fim');
}

function preencherLista(bloco, lista, itens) {
  bloco.hidden = itens.length === 0;
  if (!itens.length) return;

  lista.replaceChildren(...itens.map((palavra) => {
    const item = document.createElement('li');

    const hangul = document.createElement('span');
    hangul.className = 'lista-hangul';
    hangul.lang = 'ko';
    hangul.textContent = palavra.hangul;

    const traducao = document.createElement('span');
    traducao.className = 'lista-pt';
    traducao.textContent = palavra.pt;

    item.append(hangul, traducao);
    return item;
  }));
}

function proximaRevisao() {
  const vencimentos = Object.values(estado.cartoes)
    .map((c) => c.vencimento)
    .filter(Boolean)
    .map((v) => new Date(v))
    .filter((d) => d > new Date())
    .sort((a, b) => a - b);

  if (!vencimentos.length) return null;

  const dias = Math.round((vencimentos[0] - new Date()) / 86_400_000);
  if (dias <= 0) return 'hoje mesmo';
  if (dias === 1) return 'amanhã';
  return `em ${dias} dias`;
}

// --------------------------------------------------------------- tela: mapa

function pintarMapa() {
  el.detalhe.hidden = true;

  const grupos = new Map();
  for (const palavra of palavras) {
    if (!grupos.has(palavra.modulo)) grupos.set(palavra.modulo, []);
    grupos.get(palavra.modulo).push(palavra);
  }

  el.mapa.replaceChildren(...[...grupos].map(([modulo, lista]) => {
    const secao = document.createElement('section');
    secao.className = 'mapa-grupo';

    const titulo = document.createElement('h3');
    titulo.className = 'rotulo';
    titulo.textContent = rotuloModulo(modulo);

    const grade = document.createElement('ul');
    grade.className = 'grade';

    grade.append(...lista.map((palavra) => {
      const cartao = estado.cartoes[palavra.id];
      const nome = estadoDe(cartao);

      const item = document.createElement('li');
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = `celula estado-${nome}`;
      botao.setAttribute('aria-label', `${palavra.hangul} — ${nome}`);

      const firme = nome === 'estavel' || nome === 'dominado';

      // A ilustração só aparece na grade quando a palavra está firme: a grade
      // vira álbum à medida que a memória segura. Palavra de frase não tem
      // desenho, então o prêmio dela é a própria palavra, escrita por inteiro.
      if (firme && palavra.ilustracao) {
        const miniatura = document.createElement('img');
        miniatura.src = palavra.ilustracao;
        miniatura.alt = '';
        miniatura.loading = 'lazy';
        botao.append(miniatura);
      } else if (nome !== 'novo') {
        botao.lang = 'ko';
        botao.textContent = palavra.ilustracao ? palavra.hangul[0] : palavra.hangul;
        if (!palavra.ilustracao) botao.classList.add('celula-texto');
        if (firme) botao.classList.add('celula-firme');
      }

      botao.addEventListener('click', () => mostrarDetalhe(palavra));
      item.append(botao);
      return item;
    }));

    secao.append(titulo, grade);
    return secao;
  }));
}

function mostrarDetalhe(palavra) {
  const cartao = estado.cartoes[palavra.id];
  const nome = estadoDe(cartao);
  const fala = pronunciar(palavra.hangul, palavra.pronuncia);

  const linhas = [
    ['significado', palavra.pt],
    fala.mudou ? ['som', `[${fala.som}]`] : null,
    ['estado', nome === 'novo' ? 'ainda não vista' : nome],
    cartao?.revisoes ? ['estabilidade', `${Math.round(cartao.estabilidade)} dias`] : null,
    cartao?.revisoes ? ['revisões', `${cartao.revisoes}${cartao.lapsos ? ` · ${cartao.lapsos} lapso(s)` : ''}`] : null,
  ].filter(Boolean);

  const titulo = document.createElement('p');
  titulo.className = 'detalhe-hangul';
  titulo.lang = 'ko';
  titulo.textContent = palavra.hangul;

  const ficha = document.createElement('dl');
  ficha.className = 'ficha';
  for (const [rotulo, valor] of linhas) {
    const linha = document.createElement('div');
    linha.className = 'ficha-linha';
    const dt = document.createElement('dt');
    dt.textContent = rotulo;
    const dd = document.createElement('dd');
    dd.textContent = valor;
    linha.append(dt, dd);
    ficha.append(linha);
  }

  el.detalhe.replaceChildren(titulo, ficha);

  if (palavra.nota) {
    const nota = document.createElement('p');
    nota.className = 'nota';
    nota.textContent = palavra.nota;
    el.detalhe.append(nota);
  }

  el.detalhe.hidden = false;
  falar(palavra.hangul);
}

// ------------------------------------------------------------ tela: ajustes

function pintarAjustes() {
  const p = estado.preferencias;

  el.ritmo.value = p.novasPorDia;
  el.ritmoValor.textContent = `${p.novasPorDia} por dia`;
  el.meta.value = p.metaSemanal;
  el.metaValor.textContent = `${p.metaSemanal} de 7 dias`;
  el.toggleRomanizacao.checked = p.romanizacao;
  el.toggleSom.checked = p.som;

  const temVoz = Boolean(vozCoreana());
  el.toggleSom.disabled = !temVoz;
  el.notaSom.textContent = temVoz
    ? 'Usa a voz coreana instalada no seu sistema.'
    : 'Nenhuma voz coreana encontrada neste aparelho. Instale um pacote de voz do sistema para ativar.';
}

function mudarPreferencia(patch) {
  estado = banco.comPreferencias(estado, patch);
  banco.salvar(estado);
}

function baixarProgresso() {
  const blob = new Blob([banco.exportar(estado)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `coreano-progresso-${banco.hoje()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  el.avisoDados.textContent = 'Arquivo gerado.';
}

async function carregarProgresso(arquivo) {
  try {
    estado = banco.importar(await arquivo.text());
    banco.salvar(estado);
    pintarAjustes();
    el.avisoDados.textContent = `Progresso importado: ${Object.keys(estado.cartoes).length} palavras.`;
  } catch (causa) {
    el.avisoDados.textContent = `Não deu para importar: ${causa.message}`;
  }
}

// ------------------------------------------------------------------ eventos

el.comecar.addEventListener('click', comecar);
el.voltarHoje.addEventListener('click', () => ir('hoje'));
el.sair.addEventListener('click', terminar);
el.introSeguir.addEventListener('click', seguir);
el.seguir.addEventListener('click', seguir);
el.botaoDica.addEventListener('click', pedirDica);
el.ouvir.addEventListener('click', () => falar(itemAtual().palavra.hangul));

for (const botao of document.querySelectorAll('[data-ir]')) {
  botao.addEventListener('click', () => ir(botao.dataset.ir));
}

el.ritmo.addEventListener('input', () => {
  const valor = Number(el.ritmo.value);
  el.ritmoValor.textContent = `${valor} por dia`;
  mudarPreferencia({ novasPorDia: valor });
});

el.meta.addEventListener('input', () => {
  const valor = Number(el.meta.value);
  el.metaValor.textContent = `${valor} de 7 dias`;
  mudarPreferencia({ metaSemanal: valor });
});

el.toggleRomanizacao.addEventListener('change', (e) => mudarPreferencia({ romanizacao: e.target.checked }));
el.toggleSom.addEventListener('change', (e) => mudarPreferencia({ som: e.target.checked }));

el.exportar.addEventListener('click', baixarProgresso);
el.importar.addEventListener('click', () => el.arquivo.click());
el.arquivo.addEventListener('change', (e) => {
  const arquivo = e.target.files?.[0];
  if (arquivo) carregarProgresso(arquivo);
  e.target.value = '';
});

document.addEventListener('keydown', (evento) => {
  if (el.telas.estudo.hidden) return;

  if (evento.key === 'Enter' && !el.gabarito.hidden) {
    evento.preventDefault();
    seguir();
    return;
  }

  // Atalho de 1 a 4 na múltipla escolha, para não obrigar a tirar a mão do
  // teclado entre um card digitado e outro.
  if (!el.provaEscolha.hidden && /^[1-4]$/.test(evento.key)) {
    const botao = el.alternativas.querySelectorAll('button')[Number(evento.key) - 1];
    if (botao) { evento.preventDefault(); botao.click(); }
  }
});

if (window.speechSynthesis) {
  carregarVozes();
  window.speechSynthesis.addEventListener('voiceschanged', carregarVozes);
}

// -------------------------------------------------------------- carregamento

try {
  const resposta = await fetch(URL_DADOS);
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  palavras = await resposta.json();

  campo = ligarCampo(el.resposta, { aoEnviar: responderDigitado });
  el.areaTeclado.append(montarTeclado(campo, responderDigitado));

  pintarHoje();
} catch (causa) {
  el.comecar.disabled = true;
  el.erro.hidden = false;
  el.erro.textContent =
    'O navegador bloqueia a leitura do vocabulário quando a página é aberta direto do disco. ' +
    'Rode `python3 -m http.server 8000` na pasta do projeto e abra http://localhost:8000.';
  console.error(causa);
}
