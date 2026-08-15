import { novaRodada, embaralhar } from './baralho.js';
import { lerEstado, salvarEstado } from './armazenamento.js';

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
  toggleRomanizacao: document.querySelector('#toggle-romanizacao'),
  erro: document.querySelector('#erro'),

  card: document.querySelector('#card'),
  ilustracao: document.querySelector('#ilustracao'),
  hangul: document.querySelector('#hangul'),
  romanizacao: document.querySelector('#romanizacao'),
  significado: document.querySelector('#significado'),
  contador: document.querySelector('#contador'),
  barra: document.querySelector('#barra'),
  dica: document.querySelector('#dica'),
  respostas: document.querySelector('#respostas'),
  errei: document.querySelector('#errei'),
  acertei: document.querySelector('#acertei'),

  placar: document.querySelector('#placar'),
  listaErros: document.querySelector('#lista-erros'),
  revisarErros: document.querySelector('#revisar-erros'),
  recomecar: document.querySelector('#recomecar'),
};

/** @type {object[]} */
let palavras = [];
/** @type {ReturnType<typeof novaRodada> | null} */
let rodada = null;
let preferencias = { romanizacao: true, ...lerEstado().preferencias };

// ---------------------------------------------------------------- navegação

function mostrarTela(nome) {
  for (const [chave, secao] of Object.entries(el.telas)) {
    secao.hidden = chave !== nome;
  }
}

// ------------------------------------------------------------ tela inicial

function pintarTelaInicial() {
  el.totalPalavras.textContent = `${palavras.length} palavras no baralho`;
  el.toggleRomanizacao.checked = preferencias.romanizacao;

  const { ultimaSessao } = lerEstado();
  if (ultimaSessao) {
    const data = new Date(ultimaSessao.data).toLocaleDateString('pt-BR');
    el.ultimaSessao.textContent =
      `Última rodada: ${ultimaSessao.acertos} de ${ultimaSessao.total} em ${data}`;
    el.ultimaSessao.hidden = false;
  }
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

  el.contador.textContent = `${rodada.indice + 1} / ${rodada.fila.length}`;
  el.barra.style.width = `${(rodada.indice / rodada.fila.length) * 100}%`;

  precarregarProxima();
}

function precarregarProxima() {
  const proxima = rodada.fila[rodada.indice + 1];
  if (proxima) new Image().src = proxima.ilustracao;
}

function virar(deveVirar = !rodada.virado) {
  rodada.virado = deveVirar;
  el.card.classList.toggle('virado', deveVirar);
  el.card.setAttribute('aria-pressed', String(deveVirar));
  el.card.setAttribute(
    'aria-label',
    deveVirar ? 'Card revelado. Marque se acertou ou errou.' : 'Card. Ative para revelar a palavra.',
  );
  el.respostas.hidden = !deveVirar;
  el.dica.hidden = deveVirar;
}

function responder(acertou) {
  if (!rodada.virado) return;

  if (acertou) rodada.acertos++;
  else rodada.erradas.push(palavraAtual());

  rodada.indice++;
  if (rodada.indice >= rodada.fila.length) terminarRodada();
  else mostrarCard();
}

// -------------------------------------------------------------- tela final

function terminarRodada() {
  const total = rodada.fila.length;
  el.placar.textContent = `Você acertou ${rodada.acertos} de ${total}`;
  el.barra.style.width = '100%';

  el.listaErros.replaceChildren(
    ...rodada.erradas.map((palavra) => {
      const item = document.createElement('li');

      const hangul = document.createElement('span');
      hangul.className = 'erro-hangul';
      hangul.lang = 'ko';
      hangul.textContent = palavra.hangul;

      const traducao = document.createElement('span');
      traducao.className = 'erro-pt';
      traducao.textContent = palavra.pt;

      item.append(hangul, traducao);
      return item;
    }),
  );

  el.revisarErros.hidden = rodada.erradas.length === 0;

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
  el.card.focus();
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
    'Não consegui carregar o vocabulário. Se estiver abrindo o arquivo direto do disco, ' +
    'rode um servidor local (python3 -m http.server) e acesse via http://localhost:8000.';
  console.error(causa);
}
