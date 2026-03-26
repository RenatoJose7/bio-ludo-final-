/**
 * BioLudo — Versão Final com Alinhamento Perfeito
 * Grid 15x15 sincronizado com a imagem do tabuleiro
 */

const PLAYER_COLORS = [
  { name: 'Vermelho', hex: '#E63946', index: 0 },
  { name: 'Azul', hex: '#457B9D', index: 1 },
  { name: 'Amarelo', hex: '#F4A261', index: 2 },
  { name: 'Verde', hex: '#2A9D8F', index: 3 }
];

const SAFE_CELLS = [0, 8, 13, 21, 26, 34, 39, 47]; 
const BOARD_SIZE = 15;

const GameState = {
  gameActive: false,
  currentPlayerIndex: 0,
  diceValue: 0,
  diceRolled: false,
  canRollAgain: false,
  players: [],
  selectedPawn: null,
  currentQuestion: null,
  currentLevel: 1,
  pendingMove: null
};

class Pawn {
  constructor(id, pawnIndex, playerIndex) {
    this.id = id;
    this.pawnIndex = pawnIndex;
    this.playerIndex = playerIndex;
    this.position = -1;
    this.finished = false;
  }
  reset() {
    this.position = -1;
    this.finished = false;
  }
}

class Player {
  constructor(index, color, name) {
    this.index = index;
    this.color = color;
    this.name = name || `Explorador ${index + 1}`;
    this.pawns = Array.from({ length: 4 }, (_, i) => new Pawn(`p${index}_${i}`, i, index));
    this.score = 0;
  }
}

class GameUI {
  constructor() {
    this.boardWrapper = document.querySelector('.board-wrapper');
    this.pawnsContainer = document.getElementById('pawns-container');
    this.diceDisplay = document.getElementById('dice-display');
    this.actionLog = document.getElementById('action-log');
    this.currentPlayerName = document.getElementById('current-player-name');
    this.pawnSelection = document.getElementById('pawn-selection');
    this.pawnButtonsContainer = document.getElementById('pawn-buttons-container');
    this.playersList = document.getElementById('players-list');
    this.questionModal = document.getElementById('question-modal');
    this.qText = document.getElementById('q-text');
    this.qLevel = document.getElementById('q-level');
    this.qType = document.getElementById('q-type');
    this.qOptions = document.getElementById('q-options');
    this.qMultiple = document.getElementById('q-multiple');
    this.qTrueFalse = document.getElementById('q-truefalse');
    this.qOrder = document.getElementById('q-order');
    this.qOrderItems = document.getElementById('q-order-items');
    this.qFeedback = document.getElementById('q-feedback');
    this.btnContinue = document.getElementById('btn-continue-game');
    this.initDice3D();
  }

  initDice3D() {
    this.diceDisplay.innerHTML = `
      <div class="dice-cube" id="dice-cube">
        <div class="face front">1</div>
        <div class="face back">6</div>
        <div class="face right">2</div>
        <div class="face left">5</div>
        <div class="face top">3</div>
        <div class="face bottom">4</div>
      </div>
    `;
    this.diceCube = document.getElementById('dice-cube');
  }

  updateActionLog(message) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const logItem = document.createElement('div');
    logItem.className = 'mb-2 animate__animated animate__fadeInLeft';
    logItem.innerHTML = `<span class="text-[10px] font-bold text-slate-300 mr-2">${time}</span> ${message}`;
    this.actionLog.appendChild(logItem);
    this.actionLog.scrollTop = this.actionLog.scrollHeight;
  }

  renderPlayers(players, currentIndex) {
    this.playersList.innerHTML = '';
    players.forEach((player, i) => {
      const isActive = i === currentIndex;
      const card = document.createElement('div');
      card.className = `p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
        isActive ? 'bg-slate-50 border-ludoBlue shadow-lg' : 'bg-white border-slate-50 opacity-60'
      }`;
      card.innerHTML = `
        <div class="h-10 w-10 rounded-full flex items-center justify-center text-white shadow-md" style="background: ${player.color.hex}">
          <i class="fas fa-user-astronaut text-sm"></i>
        </div>
        <div class="flex-1 overflow-hidden">
          <div class="font-black text-slate-800 truncate text-sm">${player.name}</div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${player.score} Pontos</div>
        </div>
      `;
      this.playersList.appendChild(card);
    });
    this.currentPlayerName.textContent = players[currentIndex].name;
    this.currentPlayerName.style.color = players[currentIndex].color.hex;
  }

  updatePawns(players) {
    const boardWidth = this.boardWrapper.clientWidth;
    const cellSize = boardWidth / BOARD_SIZE;
    const positionMap = new Map();

    players.forEach(player => {
      player.pawns.forEach(pawn => {
        let el = document.getElementById(pawn.id);
        if (!el) {
          el = document.createElement('div');
          el.id = pawn.id;
          el.className = 'pawn animate__animated animate__bounceIn';
          el.style.backgroundColor = player.color.hex;
          el.innerHTML = `<i class="fas fa-dna text-[10px]"></i>`;
          this.pawnsContainer.appendChild(el);
        }

        let gridX, gridY;
        if (pawn.position === -1) {
          // Coordenadas das bases sincronizadas com a imagem
          const bases = [
            { x: 1.5, y: 1.5 },   // Vermelho (superior esquerdo)
            { x: 10.5, y: 1.5 },  // Azul (superior direito)
            { x: 10.5, y: 10.5 }, // Amarelo (inferior direito)
            { x: 1.5, y: 10.5 }   // Verde (inferior esquerdo)
          ];
          const b = bases[player.index];
          // Distribuição dos 4 peões em 2x2 dentro da base
          gridX = b.x + (pawn.pawnIndex % 2) * 2;
          gridY = b.y + Math.floor(pawn.pawnIndex / 2) * 2;
        } else if (pawn.finished) {
          gridX = 7; gridY = 7; // Centro do tabuleiro
        } else {
          const pos = this.getGridCoordinates(pawn.position, player.index);
          gridX = pos.x; gridY = pos.y;
        }

        const key = `${gridX},${gridY}`;
        if (!positionMap.has(key)) positionMap.set(key, []);
        positionMap.get(key).push({ el, pawn });
      });
    });

    positionMap.forEach((peons, key) => {
      const [gx, gy] = key.split(',').map(Number);
      const count = peons.length;
      peons.forEach((item, index) => {
        let offsetX = 0, offsetY = 0;
        if (count > 1) {
          const spacing = boardWidth * 0.015;
          offsetX = (index % 2) * spacing - (spacing / 2);
          offsetY = Math.floor(index / 2) * spacing - (spacing / 2);
        }
        item.el.style.left = `${(gx + 0.5) * cellSize + offsetX}px`;
        item.el.style.top = `${(gy + 0.5) * cellSize + offsetY}px`;
        item.el.style.transform = 'translate(-50%, -50%)';
      });
    });
  }

  getGridCoordinates(pos, playerIndex) {
    const path = [
      {x:1,y:6},{x:2,y:6},{x:3,y:6},{x:4,y:6},{x:5,y:6},
      {x:6,y:5},{x:6,y:4},{x:6,y:3},{x:6,y:2},{x:6,y:1},{x:6,y:0},
      {x:7,y:0},{x:8,y:0},
      {x:8,y:1},{x:8,y:2},{x:8,y:3},{x:8,y:4},{x:8,y:5},
      {x:9,y:6},{x:10,y:6},{x:11,y:6},{x:12,y:6},{x:13,y:6},{x:14,y:6},
      {x:14,y:7},{x:14,y:8},
      {x:13,y:8},{x:12,y:8},{x:11,y:8},{x:10,y:8},{x:9,y:8},
      {x:8,y:9},{x:8,y:10},{x:8,y:11},{x:8,y:12},{x:8,y:13},{x:8,y:14},
      {x:7,y:14},{x:6,y:14},
      {x:6,y:13},{x:6,y:12},{x:6,y:11},{x:6,y:10},{x:6,y:9},
      {x:5,y:8},{x:4,y:8},{x:3,y:8},{x:2,y:8},{x:1,y:8},{x:0,y:8},
      {x:0,y:7},{x:0,y:6}
    ];
    const startOffsets = [0, 13, 26, 39];
    const index = (pos + startOffsets[playerIndex]) % 52;
    return path[index];
  }

  rollDice(value, callback) {
    if (soundGen) soundGen.playDiceRoll();
    this.diceCube.className = 'dice-cube rolling';
    const rotations = {
      1: 'rotateX(0deg) rotateY(0deg)',
      2: 'rotateX(0deg) rotateY(-90deg)',
      3: 'rotateX(-90deg) rotateY(0deg)',
      4: 'rotateX(90deg) rotateY(0deg)',
      5: 'rotateX(0deg) rotateY(90deg)',
      6: 'rotateX(0deg) rotateY(180deg)'
    };
    setTimeout(() => {
      this.diceCube.classList.remove('rolling');
      this.diceCube.style.transform = rotations[value];
      if (callback) callback();
    }, 800);
  }

  showPawnSelection(pawns, callback) {
    this.pawnButtonsContainer.innerHTML = '';
    const color = PLAYER_COLORS[pawns[0].playerIndex].hex;
    pawns.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'p-4 rounded-xl border-2 font-black text-xs transition-all flex flex-col items-center gap-2 hover:-translate-y-1 active:scale-95';
      btn.style.borderColor = `${color}20`;
      btn.style.backgroundColor = `${color}05`;
      btn.style.color = color;
      btn.innerHTML = `<div class="h-8 w-8 rounded-full flex items-center justify-center text-white shadow-sm" style="background: ${color}"><i class="fas fa-dna"></i></div>Peão ${p.pawnIndex + 1}`;
      btn.onclick = () => {
        this.pawnSelection.classList.add('hidden');
        callback(p);
      };
      this.pawnButtonsContainer.appendChild(btn);
    });
    this.pawnSelection.classList.remove('hidden');
  }

  showQuestion(question, level, onAnswer) {
    this.qLevel.textContent = `Nível ${level}`;
    this.qType.textContent = question.type === 'multiple' ? 'Múltipla Escolha' : question.type === 'truefalse' ? 'Verdadeiro ou Falso' : 'Ordenar';
    this.qText.textContent = question.text;
    this.qMultiple.classList.add('hidden');
    this.qTrueFalse.classList.add('hidden');
    this.qOrder.classList.add('hidden');
    this.qFeedback.classList.add('hidden');
    this.btnContinue.classList.add('hidden');
    
    if (question.type === 'multiple') {
      this.qOptions.innerHTML = '';
      question.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'btn-option group flex items-center';
        btn.innerHTML = `<span class="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center mr-4 text-slate-400 group-hover:bg-ludoBlue group-hover:text-white transition-colors">${String.fromCharCode(65 + i)}</span> ${opt}`;
        btn.onclick = () => onAnswer(i);
        this.qOptions.appendChild(btn);
      });
      this.qMultiple.classList.remove('hidden');
    } else if (question.type === 'truefalse') {
      document.querySelectorAll('.btn-tf').forEach(btn => {
        btn.onclick = () => onAnswer(btn.dataset.answer === 'true');
      });
      this.qTrueFalse.classList.remove('hidden');
    } else if (question.type === 'order') {
      this.qOrderItems.innerHTML = '';
      let items = [...question.sequence].sort(() => Math.random() - 0.5);
      const renderOrderItems = () => {
        this.qOrderItems.innerHTML = '';
        items.forEach((text, index) => {
          const div = document.createElement('div');
          div.className = 'order-item flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-100 rounded-xl mb-2 cursor-pointer hover:border-ludoBlue transition-all';
          div.innerHTML = `<div class="flex items-center"><span class="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold mr-3">${index + 1}</span><span class="text-sm font-bold text-slate-600">${text}</span></div><div class="flex gap-2"><button class="move-up h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-ludoBlue hover:border-ludoBlue" ${index === 0 ? 'disabled style="opacity:0.3"' : ''}><i class="fas fa-chevron-up"></i></button><button class="move-down h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-ludoBlue hover:border-ludoBlue" ${index === items.length - 1 ? 'disabled style="opacity:0.3"' : ''}><i class="fas fa-chevron-down"></i></button></div>`;
          div.querySelector('.move-up')?.addEventListener('click', (e) => { e.stopPropagation(); if (index > 0) { [items[index], items[index - 1]] = [items[index - 1], items[index]]; renderOrderItems(); } });
          div.querySelector('.move-down')?.addEventListener('click', (e) => { e.stopPropagation(); if (index < items.length - 1) { [items[index], items[index + 1]] = [items[index + 1], items[index]]; renderOrderItems(); } });
          this.qOrderItems.appendChild(div);
        });
      };
      renderOrderItems();
      document.getElementById('btn-confirm-order').onclick = () => onAnswer([...items]);
      this.qOrder.classList.remove('hidden');
    }
    this.questionModal.classList.remove('hidden');
  }

  showFeedback(isCorrect, explanation, onContinue) {
    this.qFeedback.innerHTML = `<div class="text-3xl mb-2">${isCorrect ? '🧬 Excelente!' : '🔬 Quase lá...'}</div><div class="text-sm opacity-80">${explanation || ""}</div>`;
    this.qFeedback.className = `question-feedback mt-6 p-6 rounded-2xl text-center animate__animated animate__fadeIn ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`;
    this.qFeedback.classList.remove('hidden');
    this.btnContinue.classList.remove('hidden');
    this.btnContinue.onclick = () => {
      this.questionModal.classList.add('hidden');
      onContinue();
    };
    if (soundGen) isCorrect ? soundGen.playCorrect() : soundGen.playWrong();
  }
}

class GameController {
  constructor() {
    this.ui = new GameUI();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('btn-start-game').addEventListener('click', () => this.startGame());
    document.getElementById('btn-roll-dice').addEventListener('click', () => this.handleDiceRoll());
    window.addEventListener('resize', () => this.ui.updatePawns(GameState.players));
  }

  startGame() {
    const count = parseInt(document.querySelector('.btn-count.active').dataset.count);
    GameState.players = Array.from({ length: count }, (_, i) => new Player(i, PLAYER_COLORS[i]));
    GameState.currentPlayerIndex = 0;
    GameState.gameActive = true;
    document.getElementById('screen-intro').classList.add('hidden');
    document.getElementById('screen-game').classList.remove('hidden');
    this.ui.renderPlayers(GameState.players, GameState.currentPlayerIndex);
    this.ui.updatePawns(GameState.players);
    this.ui.updateActionLog("Expedição iniciada!");
  }

  handleDiceRoll() {
    if (!GameState.gameActive || GameState.diceRolled) return;
    const value = Math.floor(Math.random() * 6) + 1;
    GameState.diceValue = value;
    GameState.diceRolled = true;
    this.ui.rollDice(value, () => {
      const player = GameState.players[GameState.currentPlayerIndex];
      const movable = this.getMovablePawns(player, value);
      if (movable.length === 0) {
        this.ui.updateActionLog(`Sem movimentos.`);
        setTimeout(() => this.nextTurn(), 1000);
      } else if (movable.length === 1) {
        this.prepareMove(movable[0]);
      } else {
        this.ui.showPawnSelection(movable, (p) => this.prepareMove(p));
      }
    });
  }

  getMovablePawns(player, value) {
    return player.pawns.filter(p => {
      if (p.finished) return false;
      if (p.position === -1) return value === 6;
      if (p.position + value > 52) return false;
      return true;
    });
  }

  prepareMove(pawn) {
    GameState.pendingMove = pawn;
    this.triggerQuestion();
  }

  executeMove() {
    const pawn = GameState.pendingMove;
    if (pawn.position === -1) pawn.position = 0;
    else pawn.position += GameState.diceValue;
    if (pawn.position === 52) {
      pawn.finished = true;
      GameState.players[GameState.currentPlayerIndex].score += 100;
    }
    this.ui.updatePawns(GameState.players);
    this.checkCapture(pawn);
    GameState.canRollAgain = (GameState.diceValue === 6);
    GameState.pendingMove = null;
    this.checkWinCondition();
  }

  checkCapture(movedPawn) {
    if (movedPawn.position === -1 || movedPawn.finished || SAFE_CELLS.includes(movedPawn.position)) return;
    GameState.players.forEach(player => {
      if (player.index === GameState.currentPlayerIndex) return;
      player.pawns.forEach(pawn => {
        if (pawn.position === movedPawn.position) pawn.reset();
      });
    });
  }

  triggerQuestion() {
    const level = Math.min(3, Math.floor(GameState.players[GameState.currentPlayerIndex].score / 300) + 1);
    const questions = QUESTIONS[level];
    const question = questions[Math.floor(Math.random() * questions.length)];
    GameState.currentQuestion = question;
    this.ui.showQuestion(question, level, (answer) => this.validateAnswer(answer));
  }

  validateAnswer(answer) {
    const q = GameState.currentQuestion;
    let isCorrect = false;
    if (q.type === 'multiple') isCorrect = (answer === q.answer);
    else if (q.type === 'truefalse') isCorrect = (answer === q.answer);
    else if (q.type === 'order') isCorrect = (JSON.stringify(answer) === JSON.stringify(q.sequence));
    
    if (isCorrect) {
      GameState.players[GameState.currentPlayerIndex].score += 50;
      this.ui.showFeedback(isCorrect, q.explanation, () => this.executeMove());
    } else {
      this.ui.showFeedback(isCorrect, q.explanation, () => {
        GameState.pendingMove = null;
        this.nextTurn();
      });
    }
  }

  checkWinCondition() {
    const player = GameState.players[GameState.currentPlayerIndex];
    if (player.pawns.every(p => p.finished)) {
      alert(`${player.name} Venceu!`);
      location.reload();
    } else {
      if (GameState.canRollAgain) {
        GameState.diceRolled = false;
        GameState.canRollAgain = false;
        this.ui.renderPlayers(GameState.players, GameState.currentPlayerIndex);
      } else {
        this.nextTurn();
      }
    }
  }

  nextTurn() {
    GameState.currentPlayerIndex = (GameState.currentPlayerIndex + 1) % GameState.players.length;
    GameState.diceRolled = false;
    this.ui.renderPlayers(GameState.players, GameState.currentPlayerIndex);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.game = new GameController();
  document.body.addEventListener('click', () => { if (window.soundGen && window.soundGen.init) window.soundGen.init(); }, { once: true });
  
  // Adicionar evento aos botões de seleção de jogadores
  document.querySelectorAll('.btn-count').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      document.querySelectorAll('.btn-count').forEach(b => {
        b.classList.remove('active', 'bg-ludoBlue', 'text-white', 'border-ludoBlue');
        b.classList.add('border-slate-200');
      });
      this.classList.add('active', 'bg-ludoBlue', 'text-white', 'border-ludoBlue');
      this.classList.remove('border-slate-200');
    });
  });
});
