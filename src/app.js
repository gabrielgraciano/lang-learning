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
import * as licoes from './licoes.js';
import { ligarCampo, montarTeclado } from './teclado.js';
import { indexar, familiasDe, familias } from './sino.js';
import * as banco from './armazenamento.js';

const URL_DADOS = new URL('../dados/palavras.json', import.meta.url);
const URL_HANJA = new URL('../dados/hanja.json', import.meta.url);
const URL_LICOES = new URL('../dados/licoes.json', import.meta.url);
const URL_LICOES2 = new URL('../dados/licoes2.json', import.meta.url);
const URL_DIAS = new URL('../dados/dias.json', import.meta.url);

const $ = (seletor) => document.querySelector(seletor);

const el = {
  telas: {
    hoje: $('#tela-hoje'),
    estudo: $('#tela-estudo'),
    fim: $('#tela-fim'),
    mapa: $('#tela-mapa'),
    nivel1: $('#tela-nivel1'),
    nivel2: $('#tela-nivel2'),
    historias: $('#tela-historias'),
    aula: $('#tela-aula'),
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
  familia: $('#familia'),
  familiaLista: $('#familia-lista'),
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
  blocoDicionario: $('#bloco-dicionario'),
  listaDicionario: $('#lista-dicionario'),
  blocoFamilias: $('#bloco-familias'),
  listaFamilias: $('#lista-familias'),
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

  atalhoNivel1: $('#atalho-nivel1'),
  atalhoNivel1Progresso: $('#atalho-nivel1-progresso'),
  nivel1Progresso: $('#nivel1-progresso'),
  listaAulas: $('#lista-aulas'),

  atalhoNivel2: $('#atalho-nivel2'),
  atalhoNivel2Progresso: $('#atalho-nivel2-progresso'),
  nivel2Progresso: $('#nivel2-progresso'),
  listaAulas2: $('#lista-aulas-2'),

  atalhoHistorias: $('#atalho-historias'),
  atalhoHistoriasProgresso: $('#atalho-historias-progresso'),
  historiasProgresso: $('#historias-progresso'),
  listaDias: $('#lista-dias'),

  aulaVoltar: $('#aula-voltar'),
  aulaTitulo: $('#aula-titulo'),
  aulaIlustracao: $('#aula-ilustracao'),
  aulaSelo: $('#aula-selo'),
  aulaHangul: $('#aula-hangul'),
  aulaResumo: $('#aula-resumo'),
  aulaObjetivo: $('#aula-objetivo'),
  abaExplicacao: $('#aba-explicacao'),
  abaExercicios: $('#aba-exercicios'),
  abaExerciciosContagem: $('#aba-exercicios-contagem'),
  painelExplicacao: $('#painel-explicacao'),
  painelExercicios: $('#painel-exercicios'),
  aulaAnterior: $('#aula-anterior'),
  aulaProxima: $('#aula-proxima'),
};

/**
 * O baralho: só as palavras que entram na fila do dia.
 *
 * `dados/palavras.json` é maior que isso. Ele guarda também o vocabulário que
 * as aulas do Nível 1 e os dias das Histórias apresentam mas que ainda não vira
 * cartão — o dicionário que o app vai acumulando. Quem separa os dois é o campo
 * `baralho: false`, mais os ids que quem estuda promoveu pelo botão do dia.
 *
 * A separação existe aqui, num lugar só, para nenhuma tela precisar lembrar
 * dela — e é por isso que promover uma palavra é só recalcular esta lista.
 *
 * @type {object[]}
 */
let palavras = [];
/** Tudo que está no arquivo, baralho + dicionário. Alimenta o índice sino. */
let dicionario = [];
/** @type {object[]} As vinte e cinco aulas do Nível 1. */
let aulas = [];
/** @type {object[]} As aulas do Nível 2, que continua sendo escrito em levas. */
let aulas2 = [];
/** @type {object[]} Os vinte e cinco dias das Histórias. */
let dias = [];
/** @type {object|null} */
let aulaAberta = null;
/** A lista a que a unidade aberta pertence — é ela que o anterior/próxima percorre. */
let colecaoAberta = [];
let estado = banco.ler();
/** @type {null | ReturnType<typeof novaSessao>} */
let sessao = null;
let campo = null;
/** hanja → significado, e o índice morfema → palavras, montados no carregamento. */
let hanja = {};
let indiceSino = new Map();

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

/**
 * Troca de tela.
 *
 * O destino desconhecido cai no início em vez de esconder tudo. Isso não é
 * defensividade à toa: o `index.html` e o `src/app.js` são dois arquivos que o
 * navegador guarda em cache separado, e um deploy pode ser servido com o HTML
 * novo e o JS ainda velho. O HTML novo traz um botão `data-ir` que o JS velho
 * não conhece, e sem esta linha a tela some inteira — página em branco, sem
 * nem um erro no console para explicar. Melhor a seção nova não abrir do que o
 * app inteiro sumir.
 */
function ir(nome) {
  const destino = el.telas[nome] ? nome : 'hoje';
  for (const [chave, secao] of Object.entries(el.telas)) {
    if (secao) secao.hidden = chave !== destino;
  }
  window.scrollTo({ top: 0 });
  pararNarracao();
  if (destino === 'hoje') pintarHoje();
  if (destino === 'mapa') pintarMapa();
  if (destino === 'nivel1') pintarNivel1();
  if (destino === 'nivel2') pintarNivel2();
  if (destino === 'historias') pintarHistorias();
  if (destino === 'ajustes') pintarAjustes();
}

/**
 * Recalcula o baralho a partir do arquivo e do que já foi promovido.
 *
 * Chamado no carregamento e a cada promoção — a fila do dia sai daqui, então
 * promover é literalmente acrescentar à lista e refazer a tela inicial.
 */
function recalcularBaralho() {
  const promovidas = new Set(estado.promovidas);
  palavras = dicionario.filter((p) => p.baralho !== false || promovidas.has(p.id));
}

// -------------------------------------------------------------------- áudio

let vozes = [];
const carregarVozes = () => { vozes = window.speechSynthesis?.getVoices() ?? []; };
const vozDe = (prefixo) =>
  vozes.find((v) => v.lang?.toLowerCase().startsWith(prefixo)) ?? null;
const vozCoreana = () => vozDe('ko');
/** Para narrar a explicação. Sem voz pt, o inglês lendo português fica pior que nada. */
const vozPortuguesa = () => vozDe('pt');

function falar(texto) {
  if (!estado.preferencias.som || !window.speechSynthesis) return;
  const voz = vozCoreana();
  if (!voz) return;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(enunciado(texto, voz));
}

/**
 * Fala uma frase coreana sob demanda, ignorando a preferência de som.
 *
 * `falar` respeita a preferência porque dispara sozinho no meio do estudo — som
 * inesperado num lugar público é motivo real para desligar. Aqui quem apertou o
 * botão foi a pessoa, e recusar por causa de um ajuste de outra tela seria só um
 * botão que não faz nada.
 */
function falarAgora(texto) {
  const voz = vozCoreana();
  if (!voz || !window.speechSynthesis) return false;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(enunciado(texto, voz));
  return true;
}

function enunciado(texto, voz, taxa = 0.85) {
  const fala = new SpeechSynthesisUtterance(texto);
  fala.voice = voz;
  fala.lang = voz.lang;
  fala.rate = taxa;
  return fala;
}

/** Quem está narrando agora, para o botão de outro tópico interromper este. */
let narracao = null;

/**
 * Lê um tópico inteiro em voz alta, alternando de voz conforme o idioma do
 * trecho: a explicação em português, os exemplos em coreano. É por isso que a
 * narração não é um arquivo de áudio — o texto sabe em que língua cada pedaço
 * está, e uma gravação só saberia se alguém gravasse as duas.
 */
function narrar(segmentos, { aoMudar } = {}) {
  pararNarracao();
  if (!window.speechSynthesis) return false;

  const ko = vozCoreana();
  const pt = vozPortuguesa();
  const fila = segmentos
    .map(({ texto, lang }) => ({ texto, voz: lang === 'ko' ? ko : pt }))
    .filter((s) => s.voz && s.texto.trim());
  if (!fila.length) return false;

  narracao = { cancelada: false };
  const atual = narracao;
  let i = 0;

  const seguinte = () => {
    if (atual.cancelada) return;
    if (i >= fila.length) { narracao = null; aoMudar?.(false); return; }
    const { texto, voz } = fila[i++];
    const fala = enunciado(texto, voz, voz.lang.startsWith('ko') ? 0.8 : 1);
    fala.addEventListener('end', seguinte);
    fala.addEventListener('error', seguinte);
    window.speechSynthesis.speak(fala);
  };

  aoMudar?.(true);
  seguinte();
  return true;
}

function pararNarracao() {
  if (narracao) narracao.cancelada = true;
  narracao = null;
  window.speechSynthesis?.cancel();
  for (const botao of document.querySelectorAll('.botao-narrar[aria-pressed="true"]')) {
    botao.setAttribute('aria-pressed', 'false');
    botao.textContent = botao.dataset.rotulo ?? 'Ouvir';
  }
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

  pintarFamilia(palavra);

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

/**
 * O morfema compartilhado, e onde mais ele aparece.
 *
 * Enquanto 학교 e 학생 forem duas palavras isoladas, são duas coisas para
 * decorar. No instante em que 學 = "estudar" fica visível nas duas, vocabulário
 * vira sistema — e 학년, 대학, 유학 passam a ser dedutíveis em vez de novas.
 */
function pintarFamilia(palavra) {
  const grupos = familiasDe(palavra, indiceSino, hanja);
  el.familia.hidden = grupos.length === 0;
  if (!grupos.length) return;

  el.familiaLista.replaceChildren(...grupos.map(({ hanja: ideograma, significado, parentes }) => {
    const item = document.createElement('li');

    const glifo = document.createElement('span');
    glifo.className = 'hanja';
    glifo.lang = 'zh';
    glifo.textContent = ideograma;

    const corpo = document.createElement('span');
    corpo.className = 'familia-corpo';

    const sentido = document.createElement('span');
    sentido.className = 'familia-sig';
    sentido.textContent = significado;

    const lista = document.createElement('span');
    lista.className = 'familia-parentes';
    lista.append(...parentes.flatMap((p, i) => {
      const alvo = document.createElement('b');
      alvo.lang = 'ko';
      alvo.textContent = p.hangul;
      return i === 0 ? [alvo, ` ${p.pt}`] : [' · ', alvo, ` ${p.pt}`];
    }));

    corpo.append(sentido, lista);
    item.append(glifo, corpo);
    return item;
  }));
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

  pintarDicionario();
  pintarFamilias();
}

/**
 * O vocabulário que as aulas apresentam e o app guarda sem ainda cobrar. Fica
 * visível porque um dicionário que só existe dentro do JSON não é dicionário
 * para quem usa — é arquivo.
 */
function pintarDicionario() {
  // O que foi promovido sai daqui e passa a aparecer no mapa como cartão: a
  // palavra não está em dois lugares, ela mudou de lugar.
  const soltas = dicionario.filter((p) => p.baralho === false
    && !estado.promovidas.includes(p.id));
  el.blocoDicionario.hidden = soltas.length === 0;
  if (!soltas.length) return;

  el.listaDicionario.replaceChildren(...soltas.map((palavra) => {
    const item = document.createElement('li');
    item.className = 'dicionario-item';

    const ko = document.createElement('button');
    ko.type = 'button';
    ko.className = 'dicionario-ko';
    ko.lang = 'ko';
    ko.textContent = palavra.hangul;
    ko.title = 'Ouvir';
    ko.addEventListener('click', () => falarAgora(palavra.hangul));

    const pt = document.createElement('span');
    pt.className = 'dicionario-pt';
    pt.textContent = palavra.pt;

    item.append(ko, pt);
    // O número da aula sozinho virou ambíguo quando o Nível 2 entrou: cada
    // nível recomeça a contagem no 1. Só o segundo carrega a marca, porque o
    // primeiro é o caso de longe mais comum.
    const origem = palavra.aula
      ? (palavra.nivel === 2 ? `N2 · aula ${palavra.aula}` : `aula ${palavra.aula}`)
      : palavra.dia ? `dia ${palavra.dia}` : null;
    if (origem) {
      const marca = document.createElement('span');
      marca.className = 'dicionario-aula';
      marca.textContent = origem;
      item.append(marca);
    }
    return item;
  }));
}

function pintarFamilias() {
  const grupos = familias(indiceSino, hanja);
  el.blocoFamilias.hidden = grupos.length === 0;
  if (!grupos.length) return;

  el.listaFamilias.replaceChildren(...grupos.map(({ hanja: ideograma, significado, palavras: membros }) => {
    const item = document.createElement('li');

    const glifo = document.createElement('span');
    glifo.className = 'hanja';
    glifo.lang = 'zh';
    glifo.textContent = ideograma;

    const corpo = document.createElement('span');
    corpo.className = 'familia-corpo';

    const sentido = document.createElement('span');
    sentido.className = 'familia-sig';
    sentido.textContent = significado;

    const lista = document.createElement('span');
    lista.className = 'familia-parentes';
    lista.append(...membros.flatMap((p, i) => {
      const alvo = document.createElement('b');
      alvo.lang = 'ko';
      alvo.textContent = p.hangul;
      return i === 0 ? [alvo] : [' · ', alvo];
    }));

    corpo.append(sentido, lista);
    item.append(glifo, corpo);
    return item;
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

// ------------------------------------------------------------ tela: Nível 1

/**
 * Ajudante de DOM local. O resto do app monta elemento a elemento porque monta
 * poucos; uma aula é quase toda construída em JS a partir do JSON, e sem isto
 * a seção viraria três linhas de cerimônia por parágrafo.
 */
function nova(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

const feitos = () => estado.licoes ?? {};

/**
 * A lista de aulas de um nível.
 *
 * O Nível 1 e o Nível 2 são a mesma tela com outro arquivo por trás: mesmo
 * cartão, mesma barra de progresso, mesmo percurso de leitura. O que muda é a
 * coleção e onde o resultado é pintado, então é só isso que a função recebe —
 * o terceiro nível não deve custar uma terceira cópia disto.
 */
function pintarNivel(colecao, { progresso, lista, atalho }) {
  const geral = licoes.progressoGeral(colecao, feitos());

  progresso.textContent = geral.total
    ? `${geral.aulasCompletas} de ${geral.aulas} aulas concluídas · ${geral.acertos} de ${geral.total} exercícios`
    : '';

  lista.replaceChildren(...colecao.map((aula) => {
    const p = licoes.progressoDaAula(aula, feitos());

    const cartao = nova('button', 'cartao-aula');
    cartao.type = 'button';
    if (p.completa) cartao.classList.add('cartao-aula-completa');

    const selo = nova('span', 'selo-aula', aula.hanja);
    selo.lang = 'ko';
    selo.setAttribute('aria-hidden', 'true');
    // Da aula 11 em diante o algarismo tem dois ideogramas. Eles empilham, como
    // num selo de verdade, mas precisam de corpo menor para caber no quadrado.
    if ([...aula.hanja].length > 1) selo.classList.add('selo-aula-duplo');

    const corpo = nova('span', 'cartao-aula-corpo');
    const numero = nova('span', 'cartao-aula-numero', `Aula ${aula.numero}`);
    const hangul = nova('span', 'cartao-aula-hangul', aula.hangul);
    hangul.lang = 'ko';
    const titulo = nova('span', 'cartao-aula-titulo', aula.titulo);
    corpo.append(numero, hangul, titulo, barraProgresso(p));

    cartao.append(selo, corpo);
    cartao.addEventListener('click', () => abrirAula(aula, colecao));

    const linha = nova('li');
    linha.append(cartao);
    return linha;
  }));

  atalho.textContent = geral.total
    ? `${geral.aulasCompletas}/${geral.aulas} aulas · ${geral.acertos}/${geral.total} exercícios`
    : `${colecao.length} aulas`;
}

const pintarNivel1 = () => pintarNivel(aulas, {
  progresso: el.nivel1Progresso,
  lista: el.listaAulas,
  atalho: el.atalhoNivel1Progresso,
});

const pintarNivel2 = () => pintarNivel(aulas2, {
  progresso: el.nivel2Progresso,
  lista: el.listaAulas2,
  atalho: el.atalhoNivel2Progresso,
});

/**
 * A lista dos vinte e cinco dias.
 *
 * Um dia não é uma aula — é um bloco de vinte palavras dentro de duas cenas —
 * mas a escada é a mesma: ler, praticar, conferir. Por isso a listagem é outra
 * e a tela de dentro é a mesma; o que muda é o conteúdo, não o percurso.
 */
function pintarHistorias() {
  const geral = licoes.progressoGeral(dias, feitos());
  const promovidas = new Set(estado.promovidas);
  const totalDePalavras = new Set(dias.flatMap((dia) => dia.palavras)).size;
  const naFila = dias.flatMap((dia) => dia.palavras)
    .filter((id) => promovidas.has(id) || dicionario.find((p) => p.id === id)?.baralho !== false);

  el.historiasProgresso.textContent = geral.total
    ? `${geral.aulasCompletas} de ${geral.aulas} dias concluídos · `
      + `${geral.acertos} de ${geral.total} exercícios · `
      + `${new Set(naFila).size} de ${totalDePalavras} palavras no baralho`
    : '';

  el.listaDias.replaceChildren(...dias.map((dia) => {
    const p = licoes.progressoDaAula(dia, feitos());

    const cartao = nova('button', 'cartao-aula');
    cartao.type = 'button';
    if (p.completa) cartao.classList.add('cartao-aula-completa');

    const selo = nova('span', 'selo-aula', dia.hanja);
    selo.lang = 'ko';
    selo.setAttribute('aria-hidden', 'true');

    const corpo = nova('span', 'cartao-aula-corpo');
    const numero = nova('span', 'cartao-aula-numero', `Dia ${dia.numero}`);
    const hangul = nova('span', 'cartao-aula-hangul', dia.hangul);
    hangul.lang = 'ko';
    const titulo = nova('span', 'cartao-aula-titulo', dia.titulo);
    corpo.append(numero, hangul, titulo, barraProgresso(p));

    if (dia.palavras.every((id) => promovidas.has(id)
        || dicionario.find((w) => w.id === id)?.baralho !== false)) {
      corpo.append(nova('span', 'cartao-aula-marca', 'no baralho'));
    }

    cartao.append(selo, corpo);
    cartao.addEventListener('click', () => abrirAula(dia, dias));

    const linha = nova('li');
    linha.append(cartao);
    return linha;
  }));

  el.atalhoHistoriasProgresso.textContent = geral.total
    ? `${geral.aulasCompletas}/${geral.aulas} dias · ${geral.acertos}/${geral.total} exercícios`
    : `${dias.length} dias`;
}

function barraProgresso({ acertos, total, fracao }) {
  const barra = nova('span', 'progresso');
  const trilho = nova('span', 'progresso-trilho');
  const cheio = nova('span', 'progresso-cheio');
  cheio.style.width = `${Math.round(fracao * 100)}%`;
  trilho.append(cheio);
  barra.append(trilho, nova('span', 'progresso-conta', `${acertos}/${total}`));
  return barra;
}

/**
 * Abre uma unidade — aula do Nível 1 ou dia das Histórias.
 *
 * A tela é a mesma para as duas porque o percurso é o mesmo: ler, praticar na
 * outra aba, andar para a seguinte. `colecao` é o que diz de onde ela veio, e é
 * o que o anterior/próxima e o botão de voltar consultam.
 */
function abrirAula(aula, colecao = aulas) {
  aulaAberta = aula;
  colecaoAberta = colecao;

  const eDia = colecao === dias;
  const rotulo = eDia ? 'Dia' : 'Aula';

  el.aulaVoltar.dataset.ir = eDia ? 'historias' : colecao === aulas2 ? 'nivel2' : 'nivel1';
  el.aulaVoltar.setAttribute('aria-label',
    eDia ? 'Voltar para os dias' : 'Voltar para as aulas');
  el.aulaAnterior.textContent = `← ${rotulo} anterior`;
  el.aulaProxima.textContent = `Próximo ${rotulo.toLowerCase()} →`;

  el.aulaTitulo.textContent = `${rotulo} ${aula.numero} · ${aula.titulo}`;
  el.aulaIlustracao.src = aula.ilustracao;
  el.aulaIlustracao.alt = '';
  el.aulaSelo.textContent = aula.hanja;
  el.aulaSelo.classList.toggle('aula-selo-duplo', [...aula.hanja].length > 1);
  el.aulaHangul.textContent = aula.hangul;
  el.aulaResumo.textContent = aula.resumo;
  el.aulaObjetivo.textContent = aula.objetivo;

  const posicao = colecao.indexOf(aula);
  el.aulaAnterior.disabled = posicao <= 0;
  el.aulaProxima.disabled = posicao >= colecao.length - 1;

  pintarExplicacao(aula);
  pintarExercicios(aula);
  trocarAba('explicacao', { rolar: false });
  ir('aula');
}

// ------------------------------------------------------------ aba: explicação

function pintarExplicacao(aula) {
  const partes = [blocoVocabulario(aula)];

  for (const topico of aula.topicos) partes.push(blocoTopico(aula, topico));
  if (aula.dialogo) partes.push(blocoDialogo(aula.dialogo, 'Diálogo'));

  // Grupos soltos — o ditado — não pertencem a um tópico: treinam a aula
  // inteira. Ganham o atalho no fim da leitura para nenhum exercício ficar
  // acessível só por quem pensou em abrir a outra aba.
  for (const grupo of aula.grupos.filter((g) => g.solto)) {
    partes.push(atalhoParaGrupo(grupo));
  }

  if (aula.palavras) partes.push(blocoPromocao(aula));

  el.painelExplicacao.replaceChildren(...partes);
}

/**
 * O botão que manda as vinte palavras do dia para a fila do FSRS.
 *
 * Fica no fim da leitura, e não no começo, porque promover antes de ler seria
 * pedir para reencontrar no dia seguinte uma palavra que nunca teve contexto —
 * e é o contexto que faz a palavra colar.
 */
function blocoPromocao(dia) {
  const secao = nova('section', 'bloco-aula promocao');
  const dentro = (id) => estado.promovidas.includes(id)
    || dicionario.find((p) => p.id === id)?.baralho !== false;
  const faltam = dia.palavras.filter((id) => !dentro(id));

  secao.append(nova('h3', 'rotulo', 'Levar para o baralho'));

  if (!faltam.length) {
    secao.append(nova('p', 'topico-p',
      'As vinte palavras deste dia já estão na fila de revisão. Elas entram no '
      + 'ritmo que você definiu em Ajustes, não todas de uma vez.'));
    return secao;
  }

  secao.append(nova('p', 'topico-p',
    `Estas palavras já estão no dicionário e já contam para o mapa e para as `
    + `famílias de morfemas. Faltam ${faltam.length} delas entrarem na fila do `
    + `dia — e aí passam a ser cobradas pela escada de quatro níveis, como `
    + `qualquer outro cartão.`));

  const botao = nova('button', 'botao botao-forte',
    `Pôr ${faltam.length} palavras na fila`);
  botao.type = 'button';
  botao.addEventListener('click', () => {
    estado = banco.promover(estado, dia.palavras);
    banco.salvar(estado);
    recalcularBaralho();
    pintarExplicacao(dia);
  });

  secao.append(botao);
  return secao;
}

function blocoVocabulario(aula) {
  const secao = nova('section', 'bloco-aula');
  secao.append(nova('h3', 'rotulo',
    aula.palavras ? 'As vinte palavras deste dia' : 'Palavras desta aula'));

  const lista = nova('ul', 'vocabulario');
  for (const palavra of aula.vocabulario) {
    const linha = nova('li', 'vocabulario-item');

    if (palavra.ilustracao) {
      const figura = nova('img', 'vocabulario-figura');
      figura.src = palavra.ilustracao;
      figura.alt = '';
      figura.loading = 'lazy';
      linha.append(figura);
    }

    const ko = nova('button', 'vocabulario-ko', palavra.ko);
    ko.type = 'button';
    ko.lang = 'ko';
    ko.title = 'Ouvir';
    ko.addEventListener('click', () => falarAgora(palavra.ko));

    const pt = nova('span', 'vocabulario-pt', palavra.pt);
    linha.append(ko, pt);

    // A romanização segue a preferência global: ela é muleta, e por padrão vem
    // desligada aqui pelo mesmo motivo que vem desligada no baralho.
    if (palavra.romanizacao && estado.preferencias.romanizacao) {
      linha.append(nova('span', 'vocabulario-rom', palavra.romanizacao));
    }

    if (palavra.hanja) {
      const hanjaTexto = nova('span', 'vocabulario-hanja', palavra.hanja);
      hanjaTexto.lang = 'ko';
      linha.append(hanjaTexto);
    }

    lista.append(linha);
  }

  secao.append(lista);
  return secao;
}

function blocoTopico(aula, topico) {
  const secao = nova('section', 'bloco-aula topico');
  secao.id = topico.id;

  const cabecalho = nova('header', 'topico-cabecalho');
  const titulo = nova('h3', 'topico-titulo', topico.titulo);
  cabecalho.append(titulo, botaoNarrar(topico));
  secao.append(cabecalho);

  for (const parte of topico.corpo) secao.append(pintarParte(parte));

  const grupo = licoes.grupoDoTopico(aula, topico);
  if (grupo) secao.append(atalhoParaGrupo(grupo));

  return secao;
}

/**
 * O atalho que o brief pedia: cada trecho da explicação leva direto aos
 * exercícios que cobram aquele trecho. Ele troca de aba e rola até o grupo, em
 * vez de abrir outra tela, porque a aula é uma coisa só — sair dela para
 * praticar e ter que voltar para ler o resto quebraria a leitura no meio.
 */
function atalhoParaGrupo(grupo) {
  const feito = grupo.itens.filter((item) => feitos()[item.id]?.acertou).length;

  const nota = nova('span', 'atalho-exercicio-nota',
    `${grupo.titulo} · ${feito} de ${grupo.itens.length}`);
  nota.id = `${grupo.id}-nota`;

  const botao = nova('button', 'atalho-exercicio');
  botao.type = 'button';
  botao.append(nova('span', 'atalho-exercicio-rotulo', 'Praticar isto'), nota);
  botao.addEventListener('click', () => irParaGrupo(grupo.id));
  return botao;
}

function pintarParte(parte) {
  switch (parte.tipo) {
    case 'p':
      return nova('p', 'topico-p', parte.texto);

    case 'destaque':
      return nova('p', 'topico-destaque', parte.texto);

    case 'nota':
      return nova('p', 'topico-nota', parte.texto);

    case 'formula':
      return pintarFormula(parte);

    case 'regra': {
      const lista = nova('ul', 'regra');
      for (const linha of parte.linhas) {
        const item = nova('li', 'regra-linha');
        item.append(
          nova('span', 'regra-condicao', linha.condicao),
          nova('span', 'regra-seta', '→'),
          korean(nova('span', 'regra-resultado', linha.resultado)),
        );
        lista.append(item);
      }
      return lista;
    }

    case 'tabela':
      return pintarTabela(parte);

    case 'exemplos':
      return pintarExemplos(parte.itens);

    case 'combinacoes':
      return pintarCombinacoes(parte.itens);

    case 'dialogo':
      return blocoDialogo(parte, null);

    case 'som':
      return pintarSom(parte);

    default:
      return nova('p', 'topico-p', parte.texto ?? '');
  }
}

const korean = (elemento) => { elemento.lang = 'ko'; return elemento; };

/**
 * A companhia que a palavra costuma ter: 물을 마시다, 옷을 입다, 버스를 타다.
 *
 * Palavra sozinha vira lista, e lista se decora e se esquece. É por isso que
 * este bloco existe junto da cena e não numa tela de apoio — e por isso cada
 * linha fala quando tocada: a colocação é o que se repete em voz alta.
 */
function pintarCombinacoes(itens) {
  const figura = nova('figure', 'combinacoes-bloco');
  figura.append(nova('figcaption', 'combinacoes-rotulo', 'A companhia dessas palavras'));

  const lista = nova('ul', 'combinacoes');
  for (const item of itens) {
    const linha = nova('li', 'combinacao');

    const ko = korean(nova('button', 'combinacao-ko', item.ko));
    ko.type = 'button';
    ko.title = 'Ouvir';
    ko.addEventListener('click', () => falarAgora(item.ko));

    linha.append(ko, nova('span', 'combinacao-pt', item.pt));
    lista.append(linha);
  }

  figura.append(lista);
  return figura;
}

/**
 * A fórmula: 감사 + 합니다 = 감사합니다. É o formato em que estas oito aulas
 * ensinam quase tudo, porque quase toda frase desta fase é feita encaixando uma
 * peça no fim de outra.
 */
function pintarFormula(parte) {
  const figura = nova('figure', 'formula');
  const linha = nova('div', 'formula-linha');

  parte.partes.forEach((peca, i) => {
    if (i > 0) linha.append(nova('span', 'formula-sinal', '+'));
    const bloco = nova('span', 'formula-bloco');
    bloco.append(korean(nova('b', 'formula-ko', peca)));
    if (parte.glosas?.[i]) bloco.append(nova('small', 'formula-glosa', parte.glosas[i]));
    linha.append(bloco);
  });

  linha.append(nova('span', 'formula-sinal', '='));
  const alvo = nova('span', 'formula-bloco formula-alvo');
  alvo.append(korean(nova('b', 'formula-ko', parte.resultado)));
  if (parte.traducao) alvo.append(nova('small', 'formula-glosa', parte.traducao));
  linha.append(alvo);

  const ouvir = nova('button', 'botao-som', '♪');
  ouvir.type = 'button';
  ouvir.setAttribute('aria-label', `Ouvir ${parte.resultado}`);
  ouvir.addEventListener('click', () => falarAgora(parte.resultado));

  figura.append(linha, ouvir);
  return figura;
}

function pintarTabela(parte) {
  const tabela = nova('table', 'tabela-aula');

  if (parte.colunas?.some(Boolean)) {
    const cabecalho = nova('thead');
    const linha = nova('tr');
    for (const coluna of parte.colunas) linha.append(nova('th', null, coluna));
    cabecalho.append(linha);
    tabela.append(cabecalho);
  }

  const corpo = nova('tbody');
  for (const celulas of parte.linhas) {
    const linha = nova('tr');
    celulas.forEach((celula, i) => {
      const cel = nova('td', i === 0 ? 'tabela-chave' : null, celula);
      if (/[가-힣]/.test(celula)) cel.lang = 'ko';
      linha.append(cel);
    });
    corpo.append(linha);
  }

  tabela.append(corpo);
  const rolagem = nova('div', 'tabela-rolagem');
  rolagem.append(tabela);
  return rolagem;
}

function pintarExemplos(itens) {
  const lista = nova('ul', 'aula-exemplos');
  for (const item of itens) {
    const linha = nova('li', 'aula-exemplo');

    const ko = nova('button', 'aula-exemplo-ko', item.ko);
    ko.type = 'button';
    ko.lang = 'ko';
    ko.title = 'Ouvir';
    ko.addEventListener('click', () => falarAgora(item.ko));

    linha.append(ko, nova('span', 'aula-exemplo-pt', item.pt));
    if (item.conta) linha.append(nova('small', 'aula-exemplo-conta', item.conta));
    lista.append(linha);
  }
  return lista;
}

function blocoDialogo(dialogo, titulo) {
  const secao = nova('section', 'dialogo');
  if (titulo) secao.append(nova('h3', 'rotulo', titulo));
  if (dialogo.contexto) secao.append(nova('p', 'dialogo-contexto', dialogo.contexto));

  const lista = nova('ol', 'dialogo-falas');
  for (const fala of dialogo.falas) {
    const linha = nova('li', 'dialogo-fala');
    linha.append(nova('span', 'dialogo-quem', fala.quem));

    const corpo = nova('span', 'dialogo-corpo');
    if (fala.ko) {
      const ko = nova('button', 'dialogo-ko', fala.ko);
      ko.type = 'button';
      ko.lang = 'ko';
      ko.title = 'Ouvir';
      ko.addEventListener('click', () => falarAgora(fala.ko));
      corpo.append(ko);
    }
    corpo.append(nova('span', 'dialogo-pt', fala.pt));

    linha.append(corpo);
    lista.append(linha);
  }

  secao.append(lista);
  return secao;
}

/**
 * O quadro de pronúncia usa o mesmo motor de `pronuncia.js` que o baralho, em
 * vez de repetir a forma falada à mão no JSON: se a regra mudar no motor, a
 * aula muda junto, e nunca há duas verdades sobre a mesma palavra.
 */
function pintarSom(parte) {
  const caixa = nova('aside', 'quadro-som');
  const { som } = pronunciar(parte.grafia);

  const linha = nova('p', 'quadro-som-linha');
  linha.append(
    korean(nova('span', 'quadro-som-grafia', parte.grafia)),
    nova('span', 'quadro-som-seta', 'soa'),
    korean(nova('b', 'quadro-som-valor', `[${som}]`)),
  );

  const ouvir = nova('button', 'botao-som', '♪');
  ouvir.type = 'button';
  ouvir.setAttribute('aria-label', `Ouvir ${parte.grafia}`);
  ouvir.addEventListener('click', () => falarAgora(parte.grafia));
  linha.append(ouvir);

  caixa.append(linha, nova('p', 'quadro-som-texto', parte.texto));
  return caixa;
}

/** O botão de áudio da explicação — lê o tópico inteiro, alternando de voz. */
function botaoNarrar(topico) {
  const botao = nova('button', 'botao-narrar', 'Ouvir');
  botao.type = 'button';
  botao.dataset.rotulo = 'Ouvir';
  botao.setAttribute('aria-pressed', 'false');

  botao.addEventListener('click', () => {
    if (botao.getAttribute('aria-pressed') === 'true') { pararNarracao(); return; }
    pararNarracao();

    const tocou = narrar(segmentosDoTopico(topico), {
      aoMudar: (tocando) => {
        botao.setAttribute('aria-pressed', String(tocando));
        botao.textContent = tocando ? 'Parar' : 'Ouvir';
      },
    });

    if (!tocou) {
      botao.disabled = true;
      botao.textContent = 'Sem voz';
      botao.title = 'Nenhuma voz do sistema encontrada para narrar este trecho.';
    }
  });

  return botao;
}

/**
 * Reduz um tópico a uma fila de trechos com idioma. Tabela fica de fora de
 * propósito: lida em voz alta, uma tabela vira uma enxurrada de palavras soltas
 * sem as colunas que lhe dão sentido.
 */
function segmentosDoTopico(topico) {
  const fila = [{ texto: topico.titulo, lang: 'pt' }];

  for (const parte of topico.corpo) {
    if (parte.tipo === 'p' || parte.tipo === 'destaque' || parte.tipo === 'nota') {
      fila.push({ texto: parte.texto, lang: 'pt' });
    } else if (parte.tipo === 'som') {
      fila.push({ texto: parte.texto, lang: 'pt' });
      fila.push({ texto: parte.grafia, lang: 'ko' });
    } else if (parte.tipo === 'formula') {
      fila.push({ texto: parte.resultado, lang: 'ko' });
      if (parte.traducao) fila.push({ texto: parte.traducao, lang: 'pt' });
    } else if (parte.tipo === 'exemplos' || parte.tipo === 'combinacoes') {
      for (const item of parte.itens) {
        fila.push({ texto: item.ko, lang: 'ko' });
        fila.push({ texto: item.pt, lang: 'pt' });
      }
    } else if (parte.tipo === 'dialogo') {
      for (const fala of parte.falas) {
        if (fala.ko) fila.push({ texto: fala.ko, lang: 'ko' });
        fila.push({ texto: fala.pt, lang: 'pt' });
      }
    } else if (parte.tipo === 'regra') {
      for (const linha of parte.linhas) {
        fila.push({ texto: linha.condicao, lang: 'pt' });
        fila.push({ texto: linha.resultado, lang: 'ko' });
      }
    }
  }

  return fila;
}

// ------------------------------------------------------------ aba: exercícios

function pintarExercicios(aula) {
  let numero = 0;

  const secoes = aula.grupos.map((grupo) => {
    const secao = nova('section', 'grupo-exercicio');
    secao.id = `grupo-${grupo.id}`;
    secao.append(nova('h3', 'rotulo', grupo.titulo));

    const lista = nova('ol', 'lista-exercicios');
    for (const item of grupo.itens) lista.append(montarExercicio(item, ++numero));
    secao.append(lista);

    const voltar = nova('button', 'atalho-explicacao');
    voltar.type = 'button';
    voltar.textContent = '← Voltar à explicação';
    voltar.addEventListener('click', () => {
      const topico = aula.topicos.find((t) => t.grupo === grupo.id);
      trocarAba('explicacao');
      // Grupo solto não tem tópico de origem: a volta é para o começo da aula.
      if (topico) rolarAte(document.getElementById(topico.id));
      else window.scrollTo({ top: 0 });
    });
    secao.append(voltar);

    return secao;
  });

  el.painelExercicios.replaceChildren(...secoes);
  atualizarContagens();
}

function montarExercicio(item, numero) {
  const linha = nova('li', 'exercicio');
  linha.id = `ex-${item.id}`;
  linha.dataset.id = item.id;

  const cabecalho = nova('div', 'exercicio-cabecalho');
  cabecalho.append(nova('span', 'exercicio-numero', String(numero)));
  cabecalho.append(nova('p', 'exercicio-enunciado', item.enunciado));
  linha.append(cabecalho);

  const retorno = nova('p', 'exercicio-retorno');
  retorno.hidden = true;
  retorno.setAttribute('role', 'status');

  const concluir = (acertou) => {
    estado = banco.registrarExercicio(estado, item.id, acertou);
    banco.salvar(estado);

    linha.classList.toggle('exercicio-certo', acertou);
    linha.classList.toggle('exercicio-errado', !acertou);
    retorno.hidden = false;
    retorno.textContent = `${acertou ? '✓' : '✕'} ${item.explicacao}`;
    atualizarContagens();
  };

  linha.append(corpoDoExercicio(item, concluir), retorno);

  if (feitos()[item.id]?.acertou) linha.classList.add('exercicio-visto');
  return linha;
}

function corpoDoExercicio(item, concluir) {
  if (licoes.ehEscolha(item)) return exercicioEscolha(item, concluir);

  switch (item.tipo) {
    case 'vf':
      return exercicioVerdadeiroFalso(item, concluir);
    case 'lacuna':
      return exercicioLacuna(item, concluir);
    case 'montar':
    case 'ditado':
      return exercicioMontar(item, concluir);
    case 'associar':
      return exercicioAssociar(item, concluir);
    default:
      return nova('p', 'exercicio-retorno', 'Exercício não reconhecido.');
  }
}

/** Trava um exercício depois de respondido, deixando visível o que foi escolhido. */
function travar(container) {
  for (const botao of container.querySelectorAll('button')) botao.disabled = true;
}

function exercicioEscolha(item, concluir) {
  const caixa = nova('div', 'exercicio-corpo');

  if (item.ilustracao) {
    const figura = nova('img', 'exercicio-figura');
    figura.src = item.ilustracao;
    figura.alt = 'Ilustração da palavra a reconhecer';
    caixa.append(figura);
  }

  // Ditado por alternativa: o estímulo é o som, então o botão de tocar precisa
  // vir antes das opções — e, sem voz no aparelho, o texto entra no lugar dele
  // para o exercício não virar adivinhação.
  if (item.audio) {
    const semVoz = nova('p', 'exercicio-dica');
    semVoz.hidden = true;

    const ouvir = nova('button', 'botao-ouvir', '♪ Ouvir de novo');
    ouvir.type = 'button';
    ouvir.addEventListener('click', () => {
      if (falarAgora(item.audio)) return;
      ouvir.disabled = true;
      ouvir.textContent = 'Sem voz coreana neste aparelho';
      semVoz.hidden = false;
      semVoz.lang = 'ko';
      semVoz.textContent = `Sem áudio disponível, então aqui está o texto: ${item.audio}`;
    });

    caixa.append(ouvir, semVoz);
    window.setTimeout(() => falarAgora(item.audio), 200);
  }

  const { opcoes, correta } = licoes.alternativasEmbaralhadas(item);
  const lista = nova('ul', 'escolha-lista');

  opcoes.forEach((opcao, i) => {
    const botao = nova('button', 'escolha-opcao');
    botao.type = 'button';

    if (opcao.ko) {
      botao.append(korean(nova('span', 'escolha-ko', opcao.ko)));
      if (opcao.pt) botao.append(nova('small', 'escolha-pt', opcao.pt));
    } else {
      botao.append(nova('span', 'escolha-pt-solta', opcao.pt));
    }

    botao.addEventListener('click', () => {
      const acertou = i === correta;
      botao.classList.add(acertou ? 'escolha-certa' : 'escolha-errada');
      if (!acertou) lista.children[correta]?.querySelector('button')?.classList.add('escolha-certa');
      travar(lista);
      if (opcao.ko) falarAgora(opcao.ko);
      concluir(acertou);
    });

    const linha = nova('li');
    linha.append(botao);
    lista.append(linha);
  });

  caixa.append(lista);
  return caixa;
}

function exercicioVerdadeiroFalso(item, concluir) {
  const caixa = nova('div', 'exercicio-corpo');
  caixa.append(nova('p', 'exercicio-afirmacao', item.afirmacao));

  const lista = nova('ul', 'escolha-lista escolha-lista-dupla');
  for (const [rotulo, valor] of [['Verdadeiro', true], ['Falso', false]]) {
    const botao = nova('button', 'escolha-opcao', rotulo);
    botao.type = 'button';
    botao.addEventListener('click', () => {
      const acertou = valor === item.correta;
      botao.classList.add(acertou ? 'escolha-certa' : 'escolha-errada');
      travar(lista);
      concluir(acertou);
    });
    const linha = nova('li');
    linha.append(botao);
    lista.append(linha);
  }

  caixa.append(lista);
  return caixa;
}

function exercicioLacuna(item, concluir) {
  const caixa = nova('div', 'exercicio-corpo');

  const frase = nova('p', 'lacuna-frase');
  if (item.antes) frase.append(korean(nova('span', 'lacuna-texto', item.antes)));
  const vazio = korean(nova('span', 'lacuna-vazio'));
  frase.append(vazio);
  if (item.depois) frase.append(korean(nova('span', 'lacuna-texto', item.depois)));
  caixa.append(frase);

  const { banco: opcoes, correta } = licoes.bancoEmbaralhado(item);
  const lista = nova('ul', 'pecas');

  opcoes.forEach((texto, i) => {
    const botao = korean(nova('button', 'peca', texto));
    botao.type = 'button';
    botao.addEventListener('click', () => {
      const acertou = i === correta;
      vazio.textContent = texto;
      vazio.classList.add(acertou ? 'lacuna-certa' : 'lacuna-errada');
      botao.classList.add(acertou ? 'peca-certa' : 'peca-errada');
      travar(lista);
      if (acertou) falarAgora(`${item.antes ?? ''}${texto}`);
      concluir(acertou);
    });
    const linha = nova('li');
    linha.append(botao);
    lista.append(linha);
  });

  caixa.append(lista);
  return caixa;
}

/**
 * Montar a frase tocando nas peças. É o formato que substitui o "escreva a
 * tradução" do papel: quem está na aula 1 ainda não tem teclado coreano nem
 * ortografia, e cobrar digitação aqui testaria o teclado, não a gramática.
 * O baralho é que cobra produção escrita — cada tela testa uma coisa.
 */
function exercicioMontar(item, concluir) {
  const caixa = nova('div', 'exercicio-corpo');

  if (item.tipo === 'ditado') {
    const ouvir = nova('button', 'botao-ouvir', '♪ Ouvir de novo');
    ouvir.type = 'button';
    ouvir.addEventListener('click', () => {
      if (!falarAgora(item.audio)) {
        ouvir.disabled = true;
        ouvir.textContent = 'Sem voz coreana neste aparelho';
        pista.hidden = false;
        pista.textContent = `Sem áudio disponível, então aqui está o texto: ${item.audio}`;
      }
    });
    caixa.append(ouvir);
  } else if (item.dica) {
    caixa.append(nova('p', 'exercicio-dica', item.dica));
  }

  const pista = nova('p', 'exercicio-dica');
  pista.hidden = true;
  pista.lang = 'ko';
  caixa.append(pista);

  const linha = nova('div', 'montagem');
  linha.setAttribute('aria-live', 'polite');
  linha.lang = 'ko';

  const pecas = nova('ul', 'pecas');
  const escolhidas = [];

  const redesenhar = () => {
    linha.replaceChildren(...escolhidas.map(({ texto }, i) => {
      const ficha = korean(nova('button', 'peca peca-posta', texto));
      ficha.type = 'button';
      ficha.setAttribute('aria-label', `Tirar ${texto}`);
      ficha.addEventListener('click', () => {
        const [devolvida] = escolhidas.splice(i, 1);
        devolvida.origem.disabled = false;
        devolvida.origem.classList.remove('peca-usada');
        redesenhar();
      });
      return ficha;
    }));

    if (!escolhidas.length) linha.append(nova('span', 'montagem-vazia', 'toque nas peças abaixo'));
    if (licoes.completou(item, escolhidas.map((p) => p.texto))) conferir();
  };

  const conferir = () => {
    const acertou = licoes.conferir(item, escolhidas.map((p) => p.texto));
    linha.classList.add(acertou ? 'montagem-certa' : 'montagem-errada');
    if (acertou) {
      travar(linha);
      travar(pecas);
      falarAgora(item.correta);
      concluir(acertou);
      return;
    }

    // Errou: devolve tudo e deixa tentar de novo. Corrigir sem poder refazer
    // transformaria o exercício em prova, e ele existe para ensinar.
    concluir(false);
    window.setTimeout(() => {
      linha.classList.remove('montagem-errada');
      for (const peca of escolhidas) {
        peca.origem.disabled = false;
        peca.origem.classList.remove('peca-usada');
      }
      escolhidas.length = 0;
      redesenhar();
    }, 900);
  };

  for (const texto of licoes.embaralhar(item.pecas)) {
    const botao = korean(nova('button', 'peca', texto));
    botao.type = 'button';
    botao.addEventListener('click', () => {
      botao.disabled = true;
      botao.classList.add('peca-usada');
      escolhidas.push({ texto, origem: botao });
      redesenhar();
    });
    const li = nova('li');
    li.append(botao);
    pecas.append(li);
  }

  redesenhar();
  caixa.append(linha, pecas);

  if (item.tipo === 'ditado') window.setTimeout(() => falarAgora(item.audio), 200);
  return caixa;
}

/**
 * Associar em duas colunas: toca de um lado, toca do outro. O par certo trava
 * na hora — feedback por par, e não só no fim, é o que torna o exercício
 * legível sem instrução escrita.
 */
function exercicioAssociar(item, concluir) {
  const caixa = nova('div', 'exercicio-corpo');
  const grade = nova('div', 'associar');

  const colunaA = nova('ul', 'associar-coluna');
  const colunaB = nova('ul', 'associar-coluna');

  let selecionada = null;
  let restantes = item.pares.length;
  let errou = false;

  const botoesA = new Map();

  for (const par of licoes.embaralhar(item.pares)) {
    const botao = korean(nova('button', 'associar-item', par.a));
    botao.type = 'button';
    botao.addEventListener('click', () => {
      if (selecionada) selecionada.botao.classList.remove('associar-ativo');
      selecionada = { botao, par };
      botao.classList.add('associar-ativo');
      falarAgora(par.a);
    });
    botoesA.set(par.b, botao);
    const li = nova('li');
    li.append(botao);
    colunaA.append(li);
  }

  for (const par of licoes.embaralhar(item.pares)) {
    const botao = nova('button', 'associar-item associar-pt', par.b);
    botao.type = 'button';
    botao.addEventListener('click', () => {
      if (!selecionada) return;

      const certo = selecionada.par.b === par.b;
      if (certo) {
        selecionada.botao.classList.remove('associar-ativo');
        selecionada.botao.classList.add('associar-ligado');
        selecionada.botao.disabled = true;
        botao.classList.add('associar-ligado');
        botao.disabled = true;
        selecionada = null;
        restantes -= 1;
        if (restantes === 0) {
          concluir(true);
          if (errou) {
            caixa.append(nova('p', 'exercicio-dica',
              'Fechou. Os pares que resistiram são os que vale reler na explicação.'));
          }
        }
        return;
      }

      errou = true;
      const alvo = botoesA.get(par.b);
      botao.classList.add('associar-recusa');
      selecionada.botao.classList.add('associar-recusa');
      const anterior = selecionada;
      selecionada = null;
      window.setTimeout(() => {
        botao.classList.remove('associar-recusa');
        anterior.botao.classList.remove('associar-recusa', 'associar-ativo');
        if (alvo) alvo.classList.remove('associar-recusa');
      }, 500);
    });
    const li = nova('li');
    li.append(botao);
    colunaB.append(li);
  }

  grade.append(colunaA, colunaB);
  caixa.append(grade);
  return caixa;
}

// -------------------------------------------------------------- abas e atalhos

function trocarAba(nome, { rolar = true } = {}) {
  const explicacao = nome === 'explicacao';

  el.painelExplicacao.hidden = !explicacao;
  el.painelExercicios.hidden = explicacao;
  el.abaExplicacao.setAttribute('aria-selected', String(explicacao));
  el.abaExercicios.setAttribute('aria-selected', String(!explicacao));
  el.abaExplicacao.classList.toggle('aba-ativa', explicacao);
  el.abaExercicios.classList.toggle('aba-ativa', !explicacao);

  pararNarracao();
  if (rolar) (explicacao ? el.painelExplicacao : el.painelExercicios).focus({ preventScroll: true });
}

function irParaGrupo(grupoId) {
  trocarAba('exercicios');
  rolarAte(document.getElementById(`grupo-${grupoId}`));
}

function rolarAte(alvo) {
  if (!alvo) return;
  const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  alvo.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'start' });
  alvo.classList.add('realce');
  window.setTimeout(() => alvo.classList.remove('realce'), 1200);
}

/** Mantém os contadores das abas, dos atalhos e da lista em dia após cada resposta. */
function atualizarContagens() {
  if (!aulaAberta) return;
  const p = licoes.progressoDaAula(aulaAberta, feitos());
  el.abaExerciciosContagem.textContent = `${p.acertos}/${p.total}`;

  for (const grupo of aulaAberta.grupos) {
    const feito = grupo.itens.filter((item) => feitos()[item.id]?.acertou).length;
    const nota = document.getElementById(`${grupo.id}-nota`);
    if (nota) nota.textContent = `${grupo.titulo} · ${feito} de ${grupo.itens.length}`;
  }

  for (const item of licoes.itensDaAula(aulaAberta)) {
    if (feitos()[item.id]?.acertou) {
      document.getElementById(`ex-${item.id}`)?.classList.add('exercicio-visto');
    }
  }
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

for (const aba of document.querySelectorAll('[data-aba]')) {
  aba.addEventListener('click', () => trocarAba(aba.dataset.aba));
}

el.aulaAnterior.addEventListener('click', () => {
  const anterior = colecaoAberta[colecaoAberta.indexOf(aulaAberta) - 1];
  if (anterior) abrirAula(anterior, colecaoAberta);
});

el.aulaProxima.addEventListener('click', () => {
  const proxima = colecaoAberta[colecaoAberta.indexOf(aulaAberta) + 1];
  if (proxima) abrirAula(proxima, colecaoAberta);
});

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
  const [respostaPalavras, respostaHanja, respostaLicoes, respostaLicoes2, respostaDias] =
    await Promise.all([
      fetch(URL_DADOS), fetch(URL_HANJA), fetch(URL_LICOES), fetch(URL_LICOES2), fetch(URL_DIAS),
    ]);
  if (!respostaPalavras.ok) throw new Error(`HTTP ${respostaPalavras.status}`);
  dicionario = await respostaPalavras.json();
  recalcularBaralho();
  hanja = respostaHanja.ok ? await respostaHanja.json() : {};
  aulas = respostaLicoes.ok ? await respostaLicoes.json() : [];
  aulas2 = respostaLicoes2.ok ? await respostaLicoes2.json() : [];
  dias = respostaDias.ok ? await respostaDias.json() : [];
  // O índice sino cobre o dicionário inteiro: 의자, 모자 e 사자 dividem o 子, e
  // seria perder a família justamente por duas delas ainda não serem cartão.
  indiceSino = indexar(dicionario);

  campo = ligarCampo(el.resposta, { aoEnviar: responderDigitado });
  el.areaTeclado.append(montarTeclado(campo, responderDigitado));

  // Sem aulas o baralho continua inteiro, então o atalho some em vez de levar
  // a uma tela vazia. Vale o mesmo para o Nível 2 e para os dias.
  el.atalhoNivel1.hidden = aulas.length === 0;
  el.atalhoNivel2.hidden = aulas2.length === 0;
  el.atalhoHistorias.hidden = dias.length === 0;

  pintarHoje();
  pintarNivel1();
  pintarNivel2();
  pintarHistorias();
} catch (causa) {
  el.comecar.disabled = true;
  el.erro.hidden = false;
  el.erro.textContent =
    'O navegador bloqueia a leitura do vocabulário quando a página é aberta direto do disco. ' +
    'Rode `python3 -m http.server 8000` na pasta do projeto e abra http://localhost:8000.';
  console.error(causa);
}
