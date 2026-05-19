// =========================
//   JOGO: Adição/Subtração
//   script.js (refeito)
// =========================

// Base path (pasta onde este script.js mora). Funciona em qualquer HTML que carregue
// o script via "./script.js" ou "../script.js" — assets png ficam ao lado do JS.
const SCRIPT_BASE = new URL('.', document.currentScript.src).href;

// ===== Estado do Jogo =====
let perguntaAtualIndex = 0;
let a = 0, b = 0, op = "+";
let hits = 0, miss = 0;

let answered = false;     // já clicou numa resposta?
let hintRunning = false;  // animação rolando?

// ===== Seleção de elementos =====
const elN1 = document.getElementById("n1");
const elN2 = document.getElementById("n2");
const elOp = document.getElementById("op");
const elOpBadge = document.getElementById("opBadge");
const elStageCounter = document.getElementById("stageCounter");
const elFinalQuestionText = document.getElementById("finalQuestionText");
const elBuddyImg = document.getElementById("buddyImg");

const elDotsA = document.getElementById("dotsA");
const elDotsB = document.getElementById("dotsB");
const stageInner = document.getElementById("stageInner");

const elMsg = document.getElementById("message");
const elHintText = document.getElementById("hintText");

const btnReset = document.getElementById("btnReset");
const btnHint = document.getElementById("btnHint");
const btnNext = document.getElementById("btnNext");

const buttonsDiv = document.getElementById("buttons");
const animLayer = document.getElementById("animLayer");

const wait = (ms) => new Promise(r => setTimeout(r, ms));

// ===== Botões numéricos (0..10) =====
const answerButtons = [];
for (let i = 0; i <= 10; i++) {
  const btn = document.createElement("button");
  btn.textContent = i;
  btn.addEventListener("click", () => checkAnswer(i));
  buttonsDiv.appendChild(btn);
  answerButtons.push(btn);
}

// ===== Helpers UI =====
function setBuddy(state, title, text) {
  elBuddyImg.src = `${SCRIPT_BASE}${state}.png`;
  document.getElementById("buddyTitle").textContent = title;
  document.getElementById("buddyText").textContent = text;
}

function setStats() {
  document.getElementById("hits").textContent = hits;
  document.getElementById("miss").textContent = miss;
  document.getElementById("total").textContent = hits + miss;
}

function setAnswerButtonsDisabled(disabled) {
  answerButtons.forEach(btn => btn.disabled = disabled);
}

function updateControls() {
  // Dica fica travada se animação rolando
  btnHint.disabled = hintRunning;

  // Próxima:
  // - só ativa se já respondeu E não está em animação
  btnNext.disabled = (!answered) || hintRunning;
}

// ===== Layout do palco (igual ao espaçamento do 1º número) =====
function getStageSlot(index) {
  const css = getComputedStyle(document.documentElement);
  const dotSize = parseFloat(css.getPropertyValue("--dot")) || 22;
  const gap = parseFloat(css.getPropertyValue("--dotGap")) || 10;

  const hGap = gap;
  const vGap = gap;
  const groupGap = gap * 2;

  const perRow = 6;
  const row = Math.floor(index / perRow);
  const colInRow = index % perRow;
  const groupInRow = Math.floor(colInRow / 3);

  const x = colInRow * (dotSize + hGap) + (groupInRow * groupGap);
  const y = row * (dotSize + vGap);

  return { x, y };
}

function renderDots(container, count, colorClass) {
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const d = document.createElement("div");
    d.className = "dot" + (colorClass ? " " : "") + colorClass;
    container.appendChild(d);
  }
}

// ===== Animação (ghosts) =====
function createGhost(dotEl, colorClass) {
  const r = dotEl.getBoundingClientRect();
  const g = document.createElement("div");
  g.className = "ghost " + colorClass;
  g.style.left = r.left + "px";
  g.style.top = r.top + "px";
  g.dataset.baseLeft = r.left;
  g.dataset.baseTop = r.top;
  animLayer.appendChild(g);
  return g;
}

function moveGhost(ghost, slot) {
  const stageR = stageInner.getBoundingClientRect();
  const dx = (stageR.left + slot.x) - parseFloat(ghost.dataset.baseLeft);
  const dy = (stageR.top + slot.y) - parseFloat(ghost.dataset.baseTop);
  ghost.style.transform = `translate(${dx}px, ${dy}px)`;
}

// ===== Lógica de resposta =====
async function checkAnswer(value) {
  if (answered || hintRunning) return;

  const correct = (op === "+") ? (a + b) : (a - b);

  // AQUI é o ponto que você pediu:
  // desativa os botões numéricos e ativa o Próxima
  answered = true;
  setAnswerButtonsDisabled(true);
  btnNext.disabled = false; // ✅ EXATAMENTE aqui
  // (mas updateControls vai garantir o bloqueio durante animação)
  
  elFinalQuestionText.textContent = value;
  elFinalQuestionText.style.color = (value === correct) ? "#16a34a" : "#dc2626";

  if (value === correct) {
    hits++;
    elMsg.textContent = "Acertou! 🎉";
    setBuddy("acertou", "Incrível!", "Você domina tudo!");

    setStats();
    updateControls();

    // mesmo acertando, roda a animação
    await wait(350);
    await showHint();

  } else {
    miss++;
    elMsg.textContent = "Ops! Vamos ver?";
    setBuddy("errou", "Observe...", "Vou te ensinar o caminho.");

    setStats();
    updateControls();

    await wait(700);
    await showHint();
  }
}

// ===== Dica/Explicar (animação) =====
async function showHint() {
  if (hintRunning) return;

  // guarda se já tinha respondido antes de iniciar a dica
  const alreadyAnswered = answered;

  hintRunning = true;

  // durante animação: trava dica e próxima, e trava os botões numéricos
  setAnswerButtonsDisabled(true);
  updateControls();

  // limpa palco
  stageInner.innerHTML = "";
  animLayer.innerHTML = "";
  elStageCounter.textContent = "0";
  elStageCounter.classList.remove("negative");

  const result = (op === "+") ? (a + b) : (a - b);

  const dtsA = [...elDotsA.querySelectorAll(".dot")];
  const dtsB = [...elDotsB.querySelectorAll(".dot")];

  if (op === "+") {
    // move A (pretas) + B (azuis) pro palco
    const ghosts = [
      ...dtsA.map(d => createGhost(d, "")),
      ...dtsB.map(d => createGhost(d, "blue"))
    ];

    ghosts.forEach((g, i) => setTimeout(() => moveGhost(g, getStageSlot(i)), i * 50));
    await wait(ghosts.length * 50 + 600);

    animLayer.innerHTML = "";

    const stageDots = [];
    for (let i = 0; i < a; i++) stageDots.push(putFixedDot(i, ""));
    for (let i = 0; i < b; i++) stageDots.push(putFixedDot(a + i, "blue"));

    await countPulse(stageDots);

  } else {
    // SUBTRAÇÃO
    // 1) Move A pro palco
    const ghostsA = dtsA.map(d => createGhost(d, ""));
    ghostsA.forEach((g, i) => setTimeout(() => moveGhost(g, getStageSlot(i)), i * 50));
    await wait(a * 50 + 600);

    animLayer.innerHTML = "";

    const fixedA = [];
    for (let i = 0; i < a; i++) fixedA.push(putFixedDot(i, ""));
    await wait(400);

    // 2) Move B (vermelhas) anulando do fim pro começo
    dtsB.forEach((d, i) => {
      const g = createGhost(d, "red");

      const isNegativeBalance = (i >= a);
      const targetIndex = isNegativeBalance ? i : (a - 1 - i);
      const slot = getStageSlot(targetIndex);

      setTimeout(async () => {
        moveGhost(g, slot);
        await wait(550);

        g.style.opacity = "0";
        if (!isNegativeBalance) {
          if (fixedA[targetIndex]) fixedA[targetIndex].style.opacity = "0";
        } else {
          putFixedDot(targetIndex, "negative-result");
        }
      }, i * 200);
    });

    await wait(b * 200 + 900);

    // 3) Contagem final
    stageInner.innerHTML = "";
    const remain = [];

    if (result >= 0) {
      for (let i = 0; i < result; i++) remain.push(putFixedDot(i, ""));
      await countPulse(remain);
    } else {
      const numNegativos = Math.abs(result);
      elStageCounter.classList.add("negative");

      for (let i = 0; i < numNegativos; i++) {
        remain.push(putFixedDot(i, "negative-result"));
      }

      for (let i = 0; i < remain.length; i++) {
        remain[i].classList.add("pulse");
        elStageCounter.textContent = "-" + (i + 1);
        await wait(400);
        remain[i].classList.remove("pulse");
      }
    }
  }

  // número voando pro resultado
  await animateNumberToEquation(result);

  // terminou animação
  elStageCounter.classList.remove("negative");
  hintRunning = false;

  // se o usuário AINDA não respondeu (clicou dica antes):
  // reativa botões numéricos e mantém Próxima desativado
  if (!alreadyAnswered) {
    setAnswerButtonsDisabled(false);
  }

  updateControls();
}

// ===== Palco: bolinhas fixas =====
function putFixedDot(i, cls) {
  const d = document.createElement("div");
  d.className = "stageDot " + cls;
  const s = getStageSlot(i);
  d.style.left = s.x + "px";
  d.style.top = s.y + "px";
  stageInner.appendChild(d);
  return d;
}

async function countPulse(dots) {
  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.add("pulse");
    elStageCounter.textContent = i + 1;
    await wait(350);
    dots[i].classList.remove("pulse");
  }
}

async function animateNumberToEquation(finalValue) {
  const start = elStageCounter.getBoundingClientRect();
  const end = elFinalQuestionText.getBoundingClientRect();

  const flyer = document.createElement("div");
  flyer.className = "flying-number";
  flyer.textContent = finalValue;

  flyer.style.width = start.width + "px";
  flyer.style.height = start.height + "px";
  flyer.style.left = start.left + "px";
  flyer.style.top = start.top + "px";
  flyer.style.fontSize = window.getComputedStyle(elStageCounter).fontSize;

  document.body.appendChild(flyer);

  elFinalQuestionText.style.visibility = "hidden";
  await wait(20);

  const moveX = (end.left + end.width / 2) - (start.left + start.width / 2);
  const moveY = (end.top + end.height / 2) - (start.top + start.height / 2);

  const scale =
    parseFloat(window.getComputedStyle(elFinalQuestionText).fontSize) /
    parseFloat(window.getComputedStyle(elStageCounter).fontSize);

  flyer.style.transform = `translate(${moveX}px, ${moveY}px) scale(${scale})`;
  await wait(850);

  elFinalQuestionText.textContent = finalValue;
  elFinalQuestionText.style.visibility = "visible";
  elFinalQuestionText.style.color = "#111827";
  elFinalQuestionText.style.transform = "scale(1.3)";
  await wait(150);
  elFinalQuestionText.style.transform = "scale(1)";

  flyer.remove();
}

// ===== Nova pergunta =====
function newQuestion() {
  answered = false;
  hintRunning = false;

  // reset textos
  elMsg.textContent = "";
  elHintText.textContent = "";

  // reset resultado
  elFinalQuestionText.textContent = "?";
  elFinalQuestionText.style.color = "#9ca3af";
  elFinalQuestionText.style.visibility = "visible";

  // reset palco
  elStageCounter.textContent = "?";
  elStageCounter.classList.remove("negative");
  stageInner.innerHTML = "";
  animLayer.innerHTML = "";

  // botões numéricos ativos
  setAnswerButtonsDisabled(false);

  // carrega conta
  const conta = bancoDeContas.contas[perguntaAtualIndex];
  a = conta.a;
  b = conta.b;
  op = conta.operacao;

  elN1.textContent = a;
  elN2.textContent = b;
  elOp.textContent = op;
  elOpBadge.textContent = op;

  renderDots(elDotsA, a, "");
  renderDots(elDotsB, b, (op === "+" ? "blue" : "red"));

  setBuddy("espera", `Nível ${conta.nivel}`, "Quanto dá?");

  // avança índice
  perguntaAtualIndex = (perguntaAtualIndex + 1) % bancoDeContas.contas.length;

  // Próxima deve começar travado até responder
  updateControls();
}

// ===== Eventos =====
btnNext.addEventListener("click", () => {
  if (hintRunning) return;
  newQuestion();
});

btnReset.addEventListener("click", () => {
  hits = 0;
  miss = 0;
  perguntaAtualIndex = 0;
  setStats();
  newQuestion();
});

btnHint.addEventListener("click", async () => {
  if (hintRunning) return;
  await showHint();
});

// ===== Start =====
setStats();
newQuestion();