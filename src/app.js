import { novaRodada, embaralhar } from './baralho.js';
import { lerEstado, salvarEstado } from './armazenamento.js';
import { decompor } from './hangul.js';

// Resolvido a partir do próprio módulo: funciona tanto na raiz quanto em
// subdiretório (ex.: usuario.github.io/lang-learning/).
const URL_DADOS = new URL('../dados/palavras.json', import.meta.url);

const el = {
  telas: {
    inicio: document.querySelector('#tela-inicio'),
    estudo: document.querySelector('#tela-estudo'),
    fim: document.querySelector('#tela-fim'),
  },
  comecar: document.querySelector('#comecar'),
  totalPalavras: document.querySelector('#total-palavras'),
  ultimaSessao: document.querySelector('#ultima-sessao'),
  ultimaSessaoValor: document.querySelector('#ultima-sessao-valor'),
  toggleRomanizacao: document.querySelector('#toggle-romanizacao'),
  erro: document.querySelector('#erro'),

  card: document.querySelector('#card'),
  ilustracao: document.querySelector('#ilustracao'),
  hangul: document.querySelector('#hangul'),
  jamo: document.querySelector('#jamo'),
  romanizacao: document.querySelector('#romanizacao'),
  significado: document.querySelector('#significado'),
  contador: document.querySelector('#contador'),
  trilha: document.querySelector('#trilha'),
  dica: document.querySelector('#dica'),
  respostas: document.querySelector('#respostas'),
  errei: document.querySelector('#errei'),
  acertei: document.querySelector('#acertei'),

  placar: document.querySelector('#placar'),
  trilhaFim: document.querySelector('#trilha-fim'),
  revisao: document.querySelector('#revisao'),
  listaErros: document.querySelector('#lista-erros'),
  revisarErros: document.querySelector('#revisar-erros'),
  recomecar: document.querySelector('#recomecar'),
};

/** @type {object[]} */
let palavras = [];
/** @type {ReturnType<typeof novaRodada> | null} */
let rodada = null;
let preferencias = { romanizacao: true, ...lerEstado().preferencias };

const doisDigitos = (numero) => String(numero).padStart(2, '0');

// ---------------------------------------------------------------- navegação

function mostrarTela(nome) {
  for (const [chave, secao] of Object.entries(el.telas)) {
    secao.hidden = chave !== nome;
  }
}

// ------------------------------------------------------------ tela inicial

function pintarTelaInicial() {
  el.totalPalavras.textContent = `${palavras.length} palavras`;
  el.toggleRomanizacao.checked = preferencias.romanizacao;

  const { ultimaSessao } = lerEstado();
  if (ultimaSessao) {
    const data = new Date(ultimaSessao.data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
    el.ultimaSessaoValor.textContent =
      `${ultimaSessao.acertos} de ${ultimaSessao.total} em ${data}`;
    el.ultimaSessao.hidden = false;
  }
}

// ----------------------------------------------------------------- trilha

/**
 * Uma célula por card da rodada: cheia = acertou, cortada = errou, contornada
 * em azul = a atual. Decorativa (a lista tem aria-hidden); quem lê com leitor
 * de tela se orienta pelo contador.
 */
function pintarTrilha(lista, { ate = Infinity } = {}) {
  const celulas = rodada.fila.map((_, indice) => {
    const item = document.createElement('li');
    const resultado = rodada.resultados[indice];

    if (resultado !== undefined) item.className = resultado ? 'passo-acerto' : 'passo-erro';
    else if (indice === ate) item.className = 'passo-atual';

    return item;
  });

  lista.replaceChildren(...celulas);
}

// ------------------------------------------------------------ tela estudo

function palavraAtual() {
  return rodada.fila[rodada.indice];
}

function mostrarCard() {
  const palavra = palavraAtual();

  // Desvira sem animação antes de trocar o conteúdo, senão o verso da palavra
  // anterior aparece de relance durante a rotação.
  el.card.classList.add('sem-transicao');
  virar(false);
  requestAnimationFrame(() => el.card.classList.remove('sem-transicao'));

  el.ilustracao.src = palavra.ilustracao;
  el.ilustracao.alt = `Ilustração da palavra ${rodada.indice + 1}`;
  el.hangul.textContent = palavra.hangul;
  el.romanizacao.textContent = palavra.romanizacao;
  el.romanizacao.hidden = !preferencias.romanizacao;
  el.significado.textContent = palavra.pt;
  montarJamo(palavra.hangul);

  el.contador.textContent =
    `${doisDigitos(rodada.indice + 1)} / ${doisDigitos(rodada.fila.length)}`;
  pintarTrilha(el.trilha, { ate: rodada.indice });

  // Devolve o foco ao card: os botões de resposta somem depois de respondidos e
  // levariam o foco junto, quebrando a navegação por teclado.
  el.card.focus();
  precarregarProxima();
}

/** Desmonta a palavra nas peças de cada sílaba: 고양이 → ㄱㅗ · ㅇㅑ · ㅇㅣ */
function montarJamo(hangul) {
  let ordem = 0;

  el.jamo.replaceChildren(
    ...decompor(hangul).map(({ jamo }) => {
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
    }),
  );
}

function precarregarProxima() {
  const proxima = rodada.fila[rodada.indice + 1];
  if (proxima) new Image().src = proxima.ilustracao;
}

function virar(deveVirar = !rodada.virado) {
  const palavra = palavraAtual();
  rodada.virado = deveVirar;

  el.card.classList.toggle('virado', deveVirar);
  el.card.setAttribute('aria-pressed', String(deveVirar));

  // O verso fica no DOM o tempo todo, então o rótulo é o que controla o que o
  // leitor de tela anuncia — sem ele a resposta vazaria antes da hora.
  const som = preferencias.romanizacao ? `, ${palavra.romanizacao}` : '';
  el.card.setAttribute(
    'aria-label',
    deveVirar
      ? `${palavra.hangul}${som} — ${palavra.pt}. Marque se acertou ou errou.`
      : 'Card fechado. Ative para revelar a palavra.',
  );

  el.respostas.hidden = !deveVirar;
  el.dica.hidden = deveVirar;
}

function responder(acertou) {
  if (!rodada.virado) return;

  rodada.resultados[rodada.indice] = acertou;
  if (acertou) rodada.acertos++;
  else rodada.erradas.push(palavraAtual());

  rodada.indice++;
  if (rodada.indice >= rodada.fila.length) terminarRodada();
  else mostrarCard();
}

// -------------------------------------------------------------- tela final

function terminarRodada() {
  const total = rodada.fila.length;
  const erradas = rodada.erradas.length;

  const numero = document.createElement('b');
  numero.textContent = `${rodada.acertos} de ${total}`;

  const detalhe = document.createElement('small');
  detalhe.textContent = erradas === 0
    ? 'baralho limpo'
    : `${erradas} ${erradas === 1 ? 'palavra' : 'palavras'} para revisar`;

  el.placar.replaceChildren('Você acertou ', numero, detalhe);
  pintarTrilha(el.trilhaFim);

  el.listaErros.replaceChildren(
    ...rodada.erradas.map((palavra) => {
      const item = document.createElement('li');

      const hangul = document.createElement('span');
      hangul.className = 'erro-hangul';
      hangul.lang = 'ko';
      hangul.textContent = palavra.hangul;

      const som = document.createElement('span');
      som.className = 'erro-som';
      som.textContent = palavra.romanizacao;

      const traducao = document.createElement('span');
      traducao.className = 'erro-pt';
      traducao.textContent = palavra.pt;

      item.append(hangul, som, traducao);
      return item;
    }),
  );

  el.revisao.hidden = erradas === 0;
  el.revisarErros.hidden = erradas === 0;

  salvarEstado({
    ultimaSessao: { acertos: rodada.acertos, total, data: new Date().toISOString() },
  });

  mostrarTela('fim');
}

// ------------------------------------------------------------------ início

function iniciarRodada(lista) {
  rodada = novaRodada(lista);
  mostrarTela('estudo');
  mostrarCard();
}

// ------------------------------------------------------------------ eventos

el.comecar.addEventListener('click', () => iniciarRodada(palavras));
el.recomecar.addEventListener('click', () => iniciarRodada(palavras));
el.revisarErros.addEventListener('click', () => iniciarRodada(embaralhar(rodada.erradas)));

el.toggleRomanizacao.addEventListener('change', (evento) => {
  preferencias = { ...preferencias, romanizacao: evento.target.checked };
  salvarEstado({ preferencias });
});

el.card.addEventListener('click', () => virar());
el.errei.addEventListener('click', () => responder(false));
el.acertei.addEventListener('click', () => responder(true));

document.addEventListener('keydown', (evento) => {
  if (el.telas.estudo.hidden) return;

  switch (evento.key) {
    case ' ':
    case 'Enter':
      // Se o foco está num controle, quem responde é ele: o próprio card vira
      // pelo clique nativo do <button>, e Espaço em "Acertei" marca a resposta.
      if (evento.target.closest('button, input, a')) return;
      evento.preventDefault();
      virar();
      break;
    case 'ArrowRight':
      evento.preventDefault();
      responder(true);
      break;
    case 'ArrowLeft':
      evento.preventDefault();
      responder(false);
      break;
  }
});

// Swipe no celular: só vale depois de virar o card.
let toqueInicial = null;
el.card.addEventListener('touchstart', (evento) => {
  toqueInicial = evento.changedTouches[0].clientX;
}, { passive: true });

el.card.addEventListener('touchend', (evento) => {
  if (toqueInicial === null || !rodada?.virado) return;
  const distancia = evento.changedTouches[0].clientX - toqueInicial;
  toqueInicial = null;
  if (Math.abs(distancia) > 60) responder(distancia > 0);
}, { passive: true });

// --------------------------------------------------------------- carregamento

try {
  const resposta = await fetch(URL_DADOS);
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  palavras = await resposta.json();
  pintarTelaInicial();
} catch (causa) {
  el.comecar.disabled = true;
  el.erro.hidden = false;
  el.erro.textContent =
    'O navegador bloqueia a leitura do vocabulário quando a página é aberta direto do disco. ' +
    'Rode `python3 -m http.server 8000` na pasta do projeto e abra http://localhost:8000.';
  console.error(causa);
}
