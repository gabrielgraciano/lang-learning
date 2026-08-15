/**
 * Entrada em 한글 sem depender de IME instalado.
 *
 * A regra não escrita mais forte da comunidade r/Korean, no estudo de Isbell
 * (2018), é "use 한글, não romanize" — e o artigo registra dois apps de idioma
 * sendo criticados exatamente por romanizar. Exigir digitação em 한글 é o certo
 * pedagogicamente e é onde a maioria dos apps desiste, porque num desktop sem
 * teclado coreano instalado não dá para digitar nada.
 *
 * Aqui há três caminhos para a mesma resposta, e os três convivem:
 *
 *   1. IME de verdade (celular com teclado coreano, desktop configurado) — o
 *      campo é um <input> comum, então isso simplesmente funciona.
 *   2. Transliteração 두벌식 ao vivo — quem digita "gkrry" num teclado ABNT vê
 *      학교 aparecer. É o mesmo mapa de teclas do teclado coreano padrão, então
 *      quem aprende aqui aprende o layout de verdade.
 *   3. Teclado na tela — os mesmos jamo como botões, para o celular sem
 *      teclado coreano.
 *
 * A composição é a de hangul.js invertida: o app já sabia desmontar sílaba em
 * jamo para mostrar no verso do card; montar de volta é a mesma aritmética.
 */

import { compor, paraJamo } from './hangul.js';

/** Layout 두벌식 — o mesmo mapa de um teclado coreano de verdade. */
const MAPA = {
  q: 'ㅂ', w: 'ㅈ', e: 'ㄷ', r: 'ㄱ', t: 'ㅅ', y: 'ㅛ', u: 'ㅕ', i: 'ㅑ', o: 'ㅐ', p: 'ㅔ',
  a: 'ㅁ', s: 'ㄴ', d: 'ㅇ', f: 'ㄹ', g: 'ㅎ', h: 'ㅗ', j: 'ㅓ', k: 'ㅏ', l: 'ㅣ',
  z: 'ㅋ', x: 'ㅌ', c: 'ㅊ', v: 'ㅍ', b: 'ㅠ', n: 'ㅜ', m: 'ㅡ',
  Q: 'ㅃ', W: 'ㅉ', E: 'ㄸ', R: 'ㄲ', T: 'ㅆ', O: 'ㅒ', P: 'ㅖ',
};

/** As três fileiras, como aparecem no teclado físico. */
const FILEIRAS = [
  ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
  ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
  ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ'],
];

/** As tensas, que no teclado físico moram no Shift. */
const TENSAS = { 'ㅂ': 'ㅃ', 'ㅈ': 'ㅉ', 'ㄷ': 'ㄸ', 'ㄱ': 'ㄲ', 'ㅅ': 'ㅆ', 'ㅐ': 'ㅒ', 'ㅔ': 'ㅖ' };

/**
 * Converte o que o usuário digitou para 한글, deixando intacto o que já é
 * 한글. É isso que faz os três caminhos conviverem no mesmo campo.
 */
export function transliterar(texto) {
  const jamos = [];
  for (const caractere of texto) {
    if (caractere in MAPA) jamos.push(MAPA[caractere]);
    else jamos.push(...paraJamo(caractere));
  }
  return compor(jamos);
}

/**
 * Liga um <input> à transliteração ao vivo e devolve os controles do teclado
 * de tela.
 *
 * @param {HTMLInputElement} campo
 * @param {{aoMudar?: (valor: string) => void, aoEnviar?: () => void}} [ganchos]
 */
export function ligarCampo(campo, { aoMudar, aoEnviar } = {}) {
  const aplicar = (valor, posicaoNoFim = true) => {
    const convertido = transliterar(valor);
    if (convertido !== campo.value) {
      campo.value = convertido;
      if (posicaoNoFim) campo.setSelectionRange(convertido.length, convertido.length);
    }
    aoMudar?.(campo.value);
  };

  campo.addEventListener('input', (evento) => {
    // Durante a composição de um IME real o valor é provisório; mexer nele
    // agora quebra a digitação de quem tem teclado coreano de verdade.
    if (evento.isComposing) return;
    aplicar(campo.value);
  });

  campo.addEventListener('compositionend', () => aplicar(campo.value));

  campo.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      aoEnviar?.();
    }
  });

  return {
    /** Acrescenta um jamo — o que os botões da tela fazem. */
    digitar(jamo) {
      const jamos = [...paraJamo(campo.value), jamo];
      campo.value = compor(jamos);
      aoMudar?.(campo.value);
    },
    /** Apaga uma *peça*, não uma sílaba: 학 → 하 → ㅎ → vazio. */
    apagar() {
      const jamos = paraJamo(campo.value);
      jamos.pop();
      campo.value = compor(jamos);
      aoMudar?.(campo.value);
    },
    limpar() {
      campo.value = '';
      aoMudar?.('');
    },
  };
}

/**
 * Constrói o teclado de tela. Devolve o elemento; quem chama decide onde põe.
 *
 * @param {{digitar: (j: string) => void, apagar: () => void}} controles
 * @param {() => void} aoEnviar
 */
export function montarTeclado(controles, aoEnviar) {
  const raiz = document.createElement('div');
  raiz.className = 'teclado';
  let tensoAtivo = false;

  const teclas = [];

  const botao = (rotulo, classe, acao, { rotuloAcessivel } = {}) => {
    const tecla = document.createElement('button');
    tecla.type = 'button';
    tecla.className = classe;
    tecla.textContent = rotulo;
    if (rotuloAcessivel) tecla.setAttribute('aria-label', rotuloAcessivel);
    // O mousedown com preventDefault evita o campo perder o foco a cada tecla.
    tecla.addEventListener('mousedown', (evento) => evento.preventDefault());
    tecla.addEventListener('click', acao);
    return tecla;
  };

  const sincronizarTensas = () => {
    for (const { elemento, jamo } of teclas) {
      const tensa = TENSAS[jamo];
      elemento.textContent = tensoAtivo && tensa ? tensa : jamo;
    }
  };

  for (const fileira of FILEIRAS) {
    const linha = document.createElement('div');
    linha.className = 'teclado-fileira';

    for (const jamo of fileira) {
      const tecla = botao(jamo, 'tecla', () => {
        controles.digitar(tensoAtivo && TENSAS[jamo] ? TENSAS[jamo] : jamo);
        if (tensoAtivo) { tensoAtivo = false; sincronizarTensas(); atualizarShift(); }
      });
      teclas.push({ elemento: tecla, jamo });
      linha.append(tecla);
    }

    raiz.append(linha);
  }

  const shift = botao('⇧', 'tecla tecla-larga', () => {
    tensoAtivo = !tensoAtivo;
    sincronizarTensas();
    atualizarShift();
  }, { rotuloAcessivel: 'Consoantes tensas' });

  const atualizarShift = () => {
    shift.classList.toggle('tecla-ativa', tensoAtivo);
    shift.setAttribute('aria-pressed', String(tensoAtivo));
  };
  atualizarShift();

  const rodape = document.createElement('div');
  rodape.className = 'teclado-fileira';
  rodape.append(
    shift,
    botao('⌫', 'tecla tecla-larga', () => controles.apagar(), { rotuloAcessivel: 'Apagar' }),
    botao('Responder', 'tecla tecla-enviar', () => aoEnviar()),
  );
  raiz.append(rodape);

  return raiz;
}
