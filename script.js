// ===== Estado do Jogo =====
let perguntaAtualIndex = 0;
let a = 0, b = 0, op = "+";
let hits = 0, miss = 0;
let answered = false;
let hintRunning = false;

// Seleção de elementos
const elN1 = document.getElementById("n1"), elN2 = document.getElementById("n2"), elOp = document.getElementById("op");
const elOpBadge = document.getElementById("opBadge"), elStageCounter = document.getElementById("stageCounter");
const elFinalQuestionText = document.getElementById("finalQuestionText"), elBuddyImg = document.getElementById("buddyImg");
const elDotsA = document.getElementById("dotsA"), elDotsB = document.getElementById("dotsB"), stageInner = document.getElementById("stageInner");
const elMsg = document.getElementById("message"), elHintText = document.getElementById("hintText");
const btnReset = document.getElementById("btnReset"), btnHint = document.getElementById("btnHint"), btnNext = document.getElementById("btnNext");
const buttonsDiv = document.getElementById("buttons"), animLayer = document.getElementById("animLayer");

const wait = (ms) => new Promise(r => setTimeout(r, ms));

// Criação dos botões numéricos
const answerButtons = [];
for (let i = 0; i <= 10; i++) {
  const btn = document.createElement("button");
  btn.textContent = i;
  btn.addEventListener("click", () => checkAnswer(i));
  buttonsDiv.appendChild(btn);
  answerButtons.push(btn);
}

function setBuddy(state, title, text) {
  elBuddyImg.src = `${state}.png`;
  document.getElementById("buddyTitle").textContent = title;
  document.getElementById("buddyText").textContent = text;
}

// Layout de grupos de 3 (Baseado na image_03cc3d.png)
// Layout compacto e contínuo, igual ao das zonas superiores
// Layout de grupos de 3 (igual ao espaçamento do 1º número)
function getStageSlot(index) {
  // pega do CSS pra palco ficar 1:1 com .dots
  const css = getComputedStyle(document.documentElement);
  const dotSize = parseFloat(css.getPropertyValue("--dot")) || 22;
  const gap = parseFloat(css.getPropertyValue("--dotGap")) || 10;

  const hGap = gap;          // horizontal igual ao .dots
  const vGap = gap;          // vertical igual ao .dots  ✅ aqui é a chave
  const groupGap = gap * 2;  // espaço extra entre grupos de 3 (ajustável)

  const perRow = 6; // 6 por linha (2 grupos de 3)
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

// Funções de auxílio para animação
function createGhost(dotEl, colorClass) {
  const r = dotEl.getBoundingClientRect();
  const g = document.createElement("div");
  g.className = "ghost " + colorClass;
  g.style.left = r.left + "px"; g.style.top = r.top + "px";
  g.dataset.baseLeft = r.left; g.dataset.baseTop = r.top;
  animLayer.appendChild(g);
  return g;
}

function moveGhost(ghost, slot) {
  const stageR = stageInner.getBoundingClientRect();
  const dx = (stageR.left + slot.x) - parseFloat(ghost.dataset.baseLeft);
  const dy = (stageR.top + slot.y) - parseFloat(ghost.dataset.baseTop);
  ghost.style.transform = `translate(${dx}px, ${dy}px)`;
}

async function checkAnswer(value) {
  if (answered || hintRunning) return;
  const correct = (op === "+") ? (a + b) : (a - b);
  answered = true;
  answerButtons.forEach(b => b.disabled = true);
  
  elFinalQuestionText.textContent = value;
  elFinalQuestionText.style.color = (value === correct) ? "#16a34a" : "#dc2626";

  if (value === correct) {
    hits++;
    elMsg.textContent = "Acertou! 🎉";
    setBuddy("acertou", "Incrível!", "Você domina tudo!");

    // ✅ roda a animação mesmo acertando
    await wait(400);     // opcional: dá tempo de ver o "Acertou!"
    await showHint();    // chama a animação das bolinhas
  } else {
    miss++;
    elMsg.textContent = "Ops! Vamos ver?";
    setBuddy("errou", "Observe...", "Vou te ensinar o caminho.");
    await wait(1000);
    showHint();
  }
  document.getElementById("hits").textContent = hits;
  document.getElementById("miss").textContent = miss;
}

async function showHint() {
  if (hintRunning) return;
  hintRunning = true;
  btnHint.disabled = true;
  stageInner.innerHTML = ""; elStageCounter.textContent = "0";

  const result = (op === "+") ? (a + b) : (a - b);
  const dtsA = [...elDotsA.querySelectorAll(".dot")], dtsB = [...elDotsB.querySelectorAll(".dot")];

  if (op === "+") {
    const ghosts = [...dtsA.map(d => createGhost(d, "")), ...dtsB.map(d => createGhost(d, "blue"))];
    ghosts.forEach((g, i) => setTimeout(() => moveGhost(g, getStageSlot(i)), i * 50));
    await wait(ghosts.length * 50 + 600);
    animLayer.innerHTML = "";
    const stageDots = [];
    for(let i=0; i<a; i++) stageDots.push(putFixedDot(i, ""));
    for(let i=0; i<b; i++) stageDots.push(putFixedDot(a+i, "blue"));
    await countPulse(stageDots);
// ... dentro da função showHint(), no bloco do else (op === "-") ...
  } else {
    //elHintText.textContent = "O resultado ficou negativo, muitas bolinhas vermelhas.";
    
    // 1. Move as pretas (Número A) para o palco (0, 1, 2...)
    const ghostsA = dtsA.map(d => createGhost(d, ""));
    ghostsA.forEach((g, i) => setTimeout(() => moveGhost(g, getStageSlot(i)), i * 50));
    await wait(a * 50 + 600);
    
    animLayer.innerHTML = "";
    const fixedA = [];
    for(let i=0; i<a; i++) fixedA.push(putFixedDot(i, ""));
    await wait(500);

    // 2. Move as vermelhas (Número B) para anular as pretas do FIM para o COMEÇO
    const ghostsB = dtsB.map((d, i) => {
      const g = createGhost(d, "red");
      
      // Se i for menor que 'a', ela vai anular a bolinha preta na posição (a - 1 - i)
      // Se i for maior ou igual a 'a', ela vai sobrar como negativa na posição (i)
      const isNegativeBalance = (i >= a);
      const targetIndex = isNegativeBalance ? i : (a - 1 - i);
      const slot = getStageSlot(targetIndex);
      
      setTimeout(async () => {
        moveGhost(g, slot);
        await wait(550);
        
        g.style.opacity = "0";
        if (!isNegativeBalance) {
          // Anula a bolinha preta existente
          if(fixedA[targetIndex]) fixedA[targetIndex].style.opacity = "0";
        } else {
          // Cria a bolinha de saldo negativo
          putFixedDot(targetIndex, "negative-result");
        }
      }, i * 200);
      return g;
    });

    await wait(b * 200 + 800);
    
    // 3. Limpeza e Contagem Final
    stageInner.innerHTML = "";
    const remain = [];
    
    if (result >= 0) {
      for(let i=0; i<result; i++) remain.push(putFixedDot(i, ""));
      await countPulse(remain);
    } else {
      // Caso negativo: Mostra o saldo devedor
      const numNegativos = Math.abs(result);
      elStageCounter.classList.add("negative");
      for(let i=0; i<numNegativos; i++) {
        // As bolinhas negativas aparecem nas primeiras posições para facilitar a contagem
        remain.push(putFixedDot(i, "negative-result"));
      }
      
      // Contagem pulsante com sinal de menos
      for (let i = 0; i < remain.length; i++) {
        remain[i].classList.add("pulse");
        elStageCounter.textContent = "-" + (i + 1);
        await wait(400);
        remain[i].classList.remove("pulse");
      }
    }
  }
  
  // Voo final com o valor (positivo ou negativo)
  await animateNumberToEquation(result);
  elStageCounter.classList.remove("negative"); // Reseta para a próxima
  hintRunning = false; btnHint.disabled = false;
}

function putFixedDot(i, cls) {
  const d = document.createElement("div");
  d.className = "stageDot " + cls;
  const s = getStageSlot(i); d.style.left = s.x+"px"; d.style.top = s.y+"px";
  stageInner.appendChild(d); return d;
}

async function countPulse(dots) {
  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.add("pulse");
    elStageCounter.textContent = i + 1;
    await wait(350); dots[i].classList.remove("pulse");
  }
}

async function animateNumberToEquation(finalValue) {
  const start = elStageCounter.getBoundingClientRect(), end = elFinalQuestionText.getBoundingClientRect();
  const flyer = document.createElement("div");
  flyer.className = "flying-number"; flyer.textContent = finalValue;
  flyer.style.width = start.width + "px"; flyer.style.height = start.height + "px";
  flyer.style.left = start.left + "px"; flyer.style.top = start.top + "px";
  flyer.style.fontSize = window.getComputedStyle(elStageCounter).fontSize;
  document.body.appendChild(flyer);

  elFinalQuestionText.style.visibility = "hidden"; // Mantém o espaço para não mover a conta
  await wait(20);

  const moveX = (end.left + end.width/2) - (start.left + start.width/2);
  const moveY = (end.top + end.height/2) - (start.top + start.height/2);
  const scale = parseFloat(window.getComputedStyle(elFinalQuestionText).fontSize) / parseFloat(window.getComputedStyle(elStageCounter).fontSize);

  flyer.style.transform = `translate(${moveX}px, ${moveY}px) scale(${scale})`;
  await wait(850);
  
  elFinalQuestionText.textContent = finalValue;
  elFinalQuestionText.style.visibility = "visible";
  elFinalQuestionText.style.color = "#111827";
  elFinalQuestionText.style.transform = "scale(1.3)";
  await wait(150); elFinalQuestionText.style.transform = "scale(1)";
  flyer.remove();
}

function newQuestion() {
  answered = false; hintRunning = false;
  elMsg.textContent = ""; elHintText.textContent = "";
  elFinalQuestionText.textContent = "?"; elFinalQuestionText.style.color = "#9ca3af";
  elFinalQuestionText.style.visibility = "visible"; elStageCounter.textContent = "?";
  stageInner.innerHTML = ""; animLayer.innerHTML = "";
  answerButtons.forEach(b => b.disabled = false);

  const conta = bancoDeContas.contas[perguntaAtualIndex];
  a = conta.a; b = conta.b; op = conta.operacao;
  elN1.textContent = a; elN2.textContent = b; elOp.textContent = op; elOpBadge.textContent = op;

  renderDots(elDotsA, a, "");
  renderDots(elDotsB, b, (op === "+" ? "blue" : "red"));
  setBuddy("espera", `Nível ${conta.nivel}`, "Quanto dá?");

  perguntaAtualIndex = (perguntaAtualIndex + 1) % bancoDeContas.contas.length;
}

btnNext.addEventListener("click", newQuestion);
btnReset.addEventListener("click", () => { hits=0; miss=0; perguntaAtualIndex=0; newQuestion(); });
btnHint.addEventListener("click", showHint);
newQuestion();