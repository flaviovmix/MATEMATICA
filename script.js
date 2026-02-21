// ===== Estado =====
let a = 0, b = 0, op = "+";
let hits = 0, miss = 0;
let answered = false;
let hintRunning = false;

// ===== Elementos =====
const elN1 = document.getElementById("n1");
const elN2 = document.getElementById("n2");
const elOp = document.getElementById("op");
const elOpBadge = document.getElementById("opBadge");
const elStageCounter = document.getElementById("stageCounter");
const elFinalQuestionText = document.getElementById("finalQuestionText");

const elDotsA = document.getElementById("dotsA");
const elDotsB = document.getElementById("dotsB");

const stageInner = document.getElementById("stageInner");

const elMsg = document.getElementById("message");
const elHintText = document.getElementById("hintText");

const elHits = document.getElementById("hits");
const elMiss = document.getElementById("miss");
const elTotal = document.getElementById("total");

const elAvatar = document.getElementById("avatarState");
const elBuddyTitle = document.getElementById("buddyTitle");
const elBuddyText = document.getElementById("buddyText");

const btnReset = document.getElementById("btnReset");
const btnHint = document.getElementById("btnHint");
const btnNext = document.getElementById("btnNext");

const buttonsDiv = document.getElementById("buttons");
const answerButtons = [];

const animLayer = document.getElementById("animLayer");

// ===== Botões 0..10 =====
for (let i = 0; i <= 10; i++) {
  const btn = document.createElement("button");
  btn.textContent = i;
  btn.addEventListener("click", () => checkAnswer(i));
  buttonsDiv.appendChild(btn);
  answerButtons.push(btn);
}

// ===== Utils =====
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function setBuddy(state, title, text) {
  elAvatar.classList.remove("happy", "sad", "neutral");
  elAvatar.classList.add(state);
  elBuddyTitle.textContent = title;
  elBuddyText.textContent = text;
}

function updateStats() {
  elHits.textContent = hits;
  elMiss.textContent = miss;
  elTotal.textContent = hits + miss;
}

function setAnswerButtonsEnabled(enabled) {
  answerButtons.forEach(b => b.disabled = !enabled);
}
function setControlsEnabled(enabled) {
  btnHint.disabled = !enabled;
  btnNext.disabled = !enabled;
}

function clearStage() {
  stageInner.innerHTML = "";
  animLayer.innerHTML = "";
  elStageCounter.textContent = "?";
  elStageCounter.style.color = "#94a3b8";
}

// ATUALIZADO: Suporte para cor azul
function renderDots(container, count, colorClass) {
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const d = document.createElement("div");
    d.className = "dot" + (colorClass ? " " + colorClass : "");
    container.appendChild(d);
  }
}

function correctAnswer() {
  return (op === "+") ? (a + b) : (a - b);
}

function getStageSlot(index) {
  const step = 26;
  const groupGap = 14;
  const padX = 12;
  const padY = 8;
  const innerW = stageInner.clientWidth || 300;
  const perRow = Math.max(3, Math.floor((innerW - padX * 2) / step));
  const col = index % perRow;
  const row = Math.floor(index / perRow);
  const groupsBefore = Math.floor(col / 3);
  const x = padX + col * step + groupsBefore * groupGap;
  const y = padY + row * step;
  return { x, y };
}

// ATUALIZADO: Ghost agora aceita classe de cor flexível
function createGhostFromDot(dotEl, colorClass) {
  const r = dotEl.getBoundingClientRect();
  const size = r.width || 18;
  const half = size / 2;
  const g = document.createElement("div");
  g.className = "ghost" + (colorClass ? " " + colorClass : "");
  g.style.left = (r.left + half - (size / 2)) + "px";
  g.style.top = (r.top + half - (size / 2)) + "px";
  g.dataset.baseLeft = g.style.left;
  g.dataset.baseTop = g.style.top;
  animLayer.appendChild(g);
  return g;
}

function moveGhostToStageSlot(ghost, slot) {
  const stageR = stageInner.getBoundingClientRect();
  const destX = stageR.left + slot.x;
  const destY = stageR.top + slot.y;
  const baseLeft = parseFloat(ghost.dataset.baseLeft);
  const baseTop = parseFloat(ghost.dataset.baseTop);
  const dx = destX - baseLeft;
  const dy = destY - baseTop;
  ghost.style.transform = `translate(${dx}px, ${dy}px)`;
}

// ATUALIZADO: Suporte para cor no palco
function putFixedDot(slot, colorClass) {
  const d = document.createElement("div");
  d.className = "stageDot" + (colorClass ? " " + colorClass : "");
  d.style.left = slot.x + "px";
  d.style.top = slot.y + "px";
  stageInner.appendChild(d);
  return d;
}

function drawFinalResultDots(count) {
  stageInner.innerHTML = "";
  const dots = [];
  for (let i = 0; i < count; i++) {
    dots.push(putFixedDot(getStageSlot(i), "")); // Resultado final volta a ser preto
  }
  return dots;
}

async function countPulse(dots) {
  elStageCounter.textContent = "0";
  elStageCounter.style.color = "#111827";

  for (let i = 0; i < dots.length; i++) {
    const d = dots[i];
    d.classList.add("pulse");
    elStageCounter.textContent = i + 1;
    await wait(250);
    d.classList.remove("pulse");
    await wait(250);
  }
}

function newQuestion() {
  if (hintRunning) return;

  answered = false;
  hintRunning = false;

  elMsg.textContent = "";
  elMsg.className = "msg";
  elHintText.textContent = "";

  elFinalQuestionText.textContent = "?";
  elFinalQuestionText.style.color = "#9ca3af";

  setAnswerButtonsEnabled(true);
  setControlsEnabled(true);
  clearStage();

  op = (randInt(0, 1) === 0) ? "+" : "-";

  if (op === "+") {
    a = randInt(0, 10);
    b = randInt(0, 10 - a);
  } else {
    a = randInt(0, 10);
    b = randInt(0, a);
  }

  elN1.textContent = a;
  elN2.textContent = b;
  elOp.textContent = op;
  elOpBadge.textContent = op;

  renderDots(elDotsA, a, "");
  // SE FOR SOMA, B É AZUL. SE FOR SUBTRAÇÃO, B É VERMELHO.
  renderDots(elDotsB, b, (op === "+" ? "blue" : "red"));

  setBuddy("neutral", "Sua vez! 🙂", "Use a Dica se precisar.");
}

function checkAnswer(value) {
  if (answered || hintRunning) return;

  const correct = correctAnswer();
  answered = true;
  setAnswerButtonsEnabled(false);

  elFinalQuestionText.textContent = value;
  elFinalQuestionText.style.color = "#111827";

  elStageCounter.textContent = correct;
  elStageCounter.style.color = "#111827";

  if (value === correct) {
    hits++;
    elMsg.textContent = "Acertou! 🎉";
    elMsg.className = "msg ok";
    setBuddy("happy", "Uhuu! 😄", "Mandou bem! Aperte Próxima.");
  } else {
    miss++;
    elMsg.textContent = `Quase! A resposta é ${correct}.`;
    elMsg.className = "msg bad";
    setBuddy("sad", "Ahh 😢", "Tudo bem! Aperte Próxima.");
  }
  updateStats();
}

async function showHint() {
  if (hintRunning) return;
  if (answered) return;

  hintRunning = true;
  setControlsEnabled(false);
  setAnswerButtonsEnabled(false);
  clearStage();

  const result = correctAnswer();
  const dotsA = [...elDotsA.querySelectorAll(".dot")];
  const dotsB = [...elDotsB.querySelectorAll(".dot")];

  dotsA.forEach(d => d.style.opacity = "0.15");
  dotsB.forEach(d => d.style.opacity = "0.15");

  if (op === "+") {
    elHintText.textContent = "Dica: juntando os grupos no palco…";
    const ghosts = [];
    // A é preto, B é azul
    dotsA.forEach(d => ghosts.push(createGhostFromDot(d, "")));
    dotsB.forEach(d => ghosts.push(createGhostFromDot(d, "blue")));

    ghosts.forEach((g, i) => {
      const slot = getStageSlot(i);
      setTimeout(() => moveGhostToStageSlot(g, slot), 40 + i * 25);
    });

    await wait(40 + ghosts.length * 25 + 650);
    animLayer.innerHTML = "";
    
    // Mostra as bolinhas no palco respeitando as cores iniciais antes de virarem resultado
    stageInner.innerHTML = "";
    const tempDots = [];
    for(let i=0; i<a; i++) tempDots.push(putFixedDot(getStageSlot(i), ""));
    for(let i=0; i<b; i++) tempDots.push(putFixedDot(getStageSlot(a+i), "blue"));

    elHintText.textContent = `Viu? ${a} pretas e ${b} azuis dão ${result}!`;
    await wait(200);
    await countPulse(tempDots);

  } else {
    elHintText.textContent = "Dica: vermelho mostra o que sai (−)…";
    const ghostsBlack = dotsA.map(d => createGhostFromDot(d, ""));
    ghostsBlack.forEach((g, i) => {
      const slot = getStageSlot(i);
      setTimeout(() => moveGhostToStageSlot(g, slot), 40 + i * 22);
    });
    await wait(40 + ghostsBlack.length * 22 + 650);

    const ghostsRed = dotsB.map(d => createGhostFromDot(d, "red"));
    ghostsRed.forEach((g, i) => {
      const slotIndex = result + i;
      const slot = getStageSlot(slotIndex);
      setTimeout(() => moveGhostToStageSlot(g, slot), 60 + i * 45);
    });
    await wait(60 + ghostsRed.length * 45 + 650);

    animLayer.innerHTML = "";
    stageInner.innerHTML = "";
    const fixedRed = [];
    const tempDotsSub = [];
    for (let i = 0; i < result; i++) {
      tempDotsSub.push(putFixedDot(getStageSlot(i), ""));
    }
    for (let i = 0; i < b; i++) {
      fixedRed.push(putFixedDot(getStageSlot(result + i), "red"));
    }

    elHintText.textContent = "Veja: preto fica, vermelho sai…";
    await wait(700);

    fixedRed.forEach((d, i) => setTimeout(() => d.style.opacity = "0", 40 + i * 35));
    await wait(40 + fixedRed.length * 35 + 250);

    elHintText.textContent = `Restaram apenas ${result} pretas!`;
    await wait(200);
    await countPulse(tempDotsSub);
  }

  hintRunning = false;
  setControlsEnabled(true);
  setAnswerButtonsEnabled(true);
  setBuddy("neutral", "Agora tenta 🙂", "Escolha o número certo!");
}

function resetGame() {
  hits = 0; miss = 0;
  updateStats();
  setBuddy("neutral", "Recomeçou 🙂", "Vamos de novo!");
  newQuestion();
}

btnReset.addEventListener("click", resetGame);
btnNext.addEventListener("click", newQuestion);
btnHint.addEventListener("click", showHint);

resetGame();