/**
 * script.js — BioLudo (Tabuleiro 15x15 + Dado com Faces + Pop-up Feedback)
 */

const BOARD_SIZE = 15;
const CELL_SIZE_RATIO = 1 / BOARD_SIZE;
const BOARD_POSITIONS = 52;
const HOME_POSITIONS = 4;
const LEVELS = [1, 2, 3];
const PLAYER_COLORS = [
  { name: 'Vermelho', hex: '#e74c3c', rgb: 'rgb(231,76,60)' },
  { name: 'Azul', hex: '#3498db', rgb: 'rgb(52,152,219)' },
  { name: 'Verde', hex: '#2ecc71', rgb: 'rgb(46,204,113)' },
  { name: 'Amarelo', hex: '#f39c12', rgb: 'rgb(243,156,18)' }
];

const GameState = {
  screen: 'intro',
  players: [],
  currentPlayerIndex: 0,
  gameActive: false,
  diceValue: 0,
  diceRolled: false,
  questionAnswered: false,
  questionCorrect: false,
  currentLevel: 1,
  currentQuestion: null,
  pawnsToMove: [],
  selectedPawn: null,
  scores: {},
  levelProgress: {},

  reset() {
    this.screen = 'intro';
    this.players = [];
    this.currentPlayerIndex = 0;
    this.gameActive = false;
    this.diceValue = 0;
    this.diceRolled = false;
    this.questionAnswered = false;
    this.questionCorrect = false;
    this.currentLevel = 1;
    this.currentQuestion = null;
    this.pawnsToMove = [];
    this.selectedPawn = null;
    this.scores = {};
    this.levelProgress = {};
  }
};

class Player {
  constructor(index, name, color) {
    this.index = index;
    this.name = name;
    this.color = color;
    this.pawns = [];
    this.score = 0;
    this.finished = false;

    for (let i = 0; i < HOME_POSITIONS; i++) {
      this.pawns.push({
        id: `p${index}-${i}`,
        playerIndex: index,
        pawnIndex: i,
        position: -1,
        finished: false
      });
    }
  }

  getPawnsInHome() {
    return this.pawns.filter(p => p.position === -1);
  }

  getPawnsFinished() {
    return this.pawns.filter(p => p.finished);
  }

  isWinner() {
    return this.pawns.every(p => p.finished);
  }
}

class BoardRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.setupCanvas();
    this.generateBoardPath();
  }

  setupCanvas() {
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    this.width = rect.width;
    this.height = rect.height;
    
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    this.cellSize = this.width / BOARD_SIZE;
  }

  generateBoardPath() {
    // Tabuleiro Ludo 15x15 com 52 casas
    this.cells = [];
    const cs = this.cellSize;

    // Quadrante Vermelho (Topo) - Casas 0-12
    for (let i = 0; i < 13; i++) {
      this.cells.push({
        x: (6 + i) * cs,
        y: 6 * cs,
        size: cs,
        player: 0,
        type: i === 0 ? 'start' : 'normal'
      });
    }

    // Quadrante Azul (Direita) - Casas 13-25
    for (let i = 0; i < 13; i++) {
      this.cells.push({
        x: (12 + 3) * cs,
        y: (6 + i) * cs,
        size: cs,
        player: 1,
        type: i === 0 ? 'start' : 'normal'
      });
    }

    // Quadrante Verde (Baixo) - Casas 26-38
    for (let i = 0; i < 13; i++) {
      this.cells.push({
        x: (12 - i) * cs,
        y: (12 + 3) * cs,
        size: cs,
        player: 2,
        type: i === 0 ? 'start' : 'normal'
      });
    }

    // Quadrante Amarelo (Esquerda) - Casas 39-51
    for (let i = 0; i < 13; i++) {
      this.cells.push({
        x: 0,
        y: (12 - i) * cs,
        size: cs,
        player: 3,
        type: i === 0 ? 'start' : 'normal'
      });
    }
  }

  draw(players) {
    // Fundo branco
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const cs = this.cellSize;

    // Desenhar quadrantes com cores de fundo
    const quadrants = [
      { x: 6, y: 0, color: PLAYER_COLORS[0].hex, player: 0 },
      { x: 12, y: 6, color: PLAYER_COLORS[1].hex, player: 1 },
      { x: 6, y: 12, color: PLAYER_COLORS[2].hex, player: 2 },
      { x: 0, y: 6, color: PLAYER_COLORS[3].hex, player: 3 }
    ];

    quadrants.forEach(q => {
      this.ctx.fillStyle = q.color;
      this.ctx.globalAlpha = 0.12;
      this.ctx.fillRect(q.x * cs, q.y * cs, 6 * cs, 6 * cs);
      this.ctx.globalAlpha = 1;
    });

    // Desenhar casas do tabuleiro
    this.cells.forEach((cell, idx) => {
      const isStart = cell.type === 'start';
      
      this.ctx.fillStyle = isStart ? cell.player === 0 ? '#ffe8e8' : cell.player === 1 ? '#e8f4ff' : cell.player === 2 ? '#e8ffe8' : '#fffee8' : '#ffffff';
      this.ctx.fillRect(cell.x, cell.y, cell.size, cell.size);

      this.ctx.strokeStyle = isStart ? PLAYER_COLORS[cell.player].hex : '#e0e6ed';
      this.ctx.lineWidth = isStart ? 2.5 : 1;
      this.ctx.strokeRect(cell.x, cell.y, cell.size, cell.size);

      // Números nas casas (exceto start)
      if (idx > 0 && idx % 13 !== 0) {
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.font = 'bold 9px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(idx, cell.x + cell.size / 2, cell.y + cell.size / 2);
      }
    });

    // Desenhar meta (centro)
    const centerX = 7.5 * cs;
    const centerY = 7.5 * cs;
    const metaSize = 3 * cs;

    this.ctx.fillStyle = '#fff9e6';
    this.ctx.fillRect(centerX - metaSize / 2, centerY - metaSize / 2, metaSize, metaSize);
    this.ctx.strokeStyle = '#f39c12';
    this.ctx.lineWidth = 2.5;
    this.ctx.strokeRect(centerX - metaSize / 2, centerY - metaSize / 2, metaSize, metaSize);

    // Ícone da meta
    this.ctx.fillStyle = '#f39c12';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('★', centerX, centerY);
  }

  getCellPosition(cellIndex) {
    if (cellIndex < 0 || cellIndex >= this.cells.length) return null;
    const cell = this.cells[cellIndex];
    return {
      x: cell.x + cell.size / 2,
      y: cell.y + cell.size / 2
    };
  }
}

class PawnManager {
  constructor(pawnsLayerId, boardRenderer) {
    this.container = document.getElementById(pawnsLayerId);
    this.boardRenderer = boardRenderer;
    this.pawnElements = new Map();
  }

  createPawnElement(pawn, player) {
    const div = document.createElement('div');
    div.className = 'pawn';
    div.id = pawn.id;
    div.dataset.pawnId = pawn.id;
    div.style.background = player.color.hex;
    div.innerHTML = '●';

    this.container.appendChild(div);
    this.pawnElements.set(pawn.id, div);

    return div;
  }

  updatePawnPosition(pawn, player) {
    const element = this.pawnElements.get(pawn.id);
    if (!element) return;

    let x, y;
    const cs = this.boardRenderer.cellSize;
    const w = this.boardRenderer.width;
    const h = this.boardRenderer.height;

    if (pawn.position === -1) {
      // Na base (canto do jogador)
      const basePositions = [
        { x: 1.5, y: 1.5 },
        { x: 12.5, y: 1.5 },
        { x: 12.5, y: 12.5 },
        { x: 1.5, y: 12.5 }
      ];
      const base = basePositions[player.index];
      const offsetX = (pawn.pawnIndex % 2) * 2;
      const offsetY = Math.floor(pawn.pawnIndex / 2) * 2;
      x = (base.x + offsetX) * cs;
      y = (base.y + offsetY) * cs;
    } else if (pawn.finished) {
      // Na meta
      const centerX = 7.5 * cs;
      const centerY = 7.5 * cs;
      const offsetX = (pawn.pawnIndex % 2 - 0.5) * 1.2 * cs;
      const offsetY = (Math.floor(pawn.pawnIndex / 2) - 0.5) * 1.2 * cs;
      x = centerX + offsetX;
      y = centerY + offsetY;
    } else {
      // No tabuleiro
      const pos = this.boardRenderer.getCellPosition(pawn.position);
      if (pos) {
        x = pos.x;
        y = pos.y;
      }
    }

    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.transform = 'translate(-50%, -50%)';
  }

  updateAllPawns(players) {
    players.forEach(player => {
      player.pawns.forEach(pawn => {
        if (!this.pawnElements.has(pawn.id)) {
          this.createPawnElement(pawn, player);
        }
        this.updatePawnPosition(pawn, player);
      });
    });
  }

  setPawnSelectable(pawnId, selectable) {
    const element = this.pawnElements.get(pawnId);
    if (element) {
      if (selectable) {
        element.classList.add('selectable');
      } else {
        element.classList.remove('selectable');
      }
    }
  }

  animatePawnMove(pawnId) {
    const element = this.pawnElements.get(pawnId);
    if (element) {
      element.classList.remove('moving');
      void element.offsetWidth;
      element.classList.add('moving');
    }
  }
}

class QuestionManager {
  constructor() {
    this.currentQuestion = null;
    this.usedQuestions = new Set();
  }

  getNextQuestion(level) {
    const pool = QUESTIONS[level].filter(q => !this.usedQuestions.has(q.id));
    if (pool.length === 0) {
      this.usedQuestions.clear();
      return this.getNextQuestion(level);
    }
    const question = pool[Math.floor(Math.random() * pool.length)];
    this.usedQuestions.add(question.id);
    this.currentQuestion = question;
    return question;
  }

  reset() {
    this.usedQuestions.clear();
    this.currentQuestion = null;
  }
}

class UIManager {
  constructor() {
    this.screens = {
      intro: document.getElementById('screen-intro'),
      rules: document.getElementById('screen-rules'),
      game: document.getElementById('screen-game')
    };
    this.currentScreen = 'intro';
  }

  switchScreen(screenName) {
    Object.values(this.screens).forEach(s => s.classList.remove('active'));
    this.screens[screenName].classList.add('active');
    this.currentScreen = screenName;
  }

  updateCurrentPlayer(player) {
    const avatar = document.getElementById('current-player-avatar');
    const name = document.getElementById('current-player-name');
    const score = document.getElementById('current-player-score');

    avatar.innerHTML = '●';
    avatar.style.borderColor = player.color.hex;
    avatar.style.background = player.color.hex;
    avatar.style.color = 'white';
    name.textContent = player.name;
    name.style.color = player.color.hex;
    score.textContent = `⭐ ${player.score} pts`;

    document.documentElement.style.setProperty('--current-player-color', player.color.hex);
  }

  setDiceResult(value) {
    document.getElementById('dice-result').textContent = value;
  }

  updateActionLog(text, color = 'var(--text-light)') {
    const log = document.getElementById('log-text');
    log.textContent = text;
    log.style.color = color;
  }

  showDiceRoll() {
    const dice = document.getElementById('dice');
    dice.classList.add('rolling');
    setTimeout(() => dice.classList.remove('rolling'), 600);
  }

  showQuestionModal(question) {
    const modal = document.getElementById('question-modal');
    const levelBadge = document.getElementById('q-level-badge');
    const typeBadge = document.getElementById('q-type-badge');
    const text = document.getElementById('q-text');

    levelBadge.textContent = `NÍVEL ${GameState.currentLevel}`;
    typeBadge.textContent = this.getQuestionTypeLabel(question.type);
    text.textContent = question.text;

    document.getElementById('q-multiple').classList.add('hidden');
    document.getElementById('q-truefalse').classList.add('hidden');
    document.getElementById('q-order').classList.add('hidden');
    document.getElementById('q-feedback').classList.add('hidden');
    document.getElementById('btn-continue').classList.add('hidden');

    if (question.type === 'multiple') {
      this.renderMultipleChoice(question);
    } else if (question.type === 'truefalse') {
      this.renderTrueFalse(question);
    } else if (question.type === 'order') {
      this.renderOrderQuestion(question);
    }

    modal.classList.remove('hidden');
  }

  getQuestionTypeLabel(type) {
    const labels = {
      'multiple': 'MÚLTIPLA ESCOLHA',
      'truefalse': 'VERDADEIRO/FALSO',
      'order': 'ORDENAR SEQUÊNCIA'
    };
    return labels[type] || type;
  }

  renderMultipleChoice(question) {
    const section = document.getElementById('q-multiple');
    const options = document.getElementById('q-options');
    options.innerHTML = '';

    question.options.forEach((option, idx) => {
      const btn = document.createElement('button');
      btn.className = 'q-option';
      btn.textContent = option;
      btn.onclick = () => this.handleMultipleChoiceAnswer(idx, question);
      options.appendChild(btn);
    });

    section.classList.remove('hidden');
  }

  renderTrueFalse(question) {
    document.getElementById('q-truefalse').classList.remove('hidden');
  }

  renderOrderQuestion(question) {
    const section = document.getElementById('q-order');
    const itemsContainer = document.getElementById('q-order-items');
    const slotsContainer = document.getElementById('q-order-slots');

    itemsContainer.innerHTML = '';
    slotsContainer.innerHTML = '';

    const shuffled = [...question.items].sort(() => Math.random() - 0.5);

    shuffled.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'order-item';
      div.draggable = true;
      div.dataset.index = idx;
      div.dataset.value = item;
      div.textContent = item;

      div.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.target.classList.add('dragging');
      });

      div.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
      });

      itemsContainer.appendChild(div);
    });

    question.items.forEach((_, idx) => {
      const slot = document.createElement('div');
      slot.className = 'order-slot';
      slot.dataset.slotIndex = idx;
      slot.textContent = `${idx + 1}`;

      slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        slot.classList.add('drag-over');
      });

      slot.addEventListener('dragleave', () => {
        slot.classList.remove('drag-over');
      });

      slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.classList.remove('drag-over');

        const draggedElement = document.querySelector('.order-item.dragging');

        if (draggedElement) {
          slot.textContent = draggedElement.textContent;
          slot.dataset.value = draggedElement.dataset.value;
          slot.classList.add('filled');
          draggedElement.classList.add('placed');
        }
      });

      slotsContainer.appendChild(slot);
    });

    section.classList.remove('hidden');
  }

  handleMultipleChoiceAnswer(selectedIdx, question) {
    const correct = selectedIdx === question.answer;
    this.hideQuestionModal();
    this.showFeedbackPopup(correct, question);
  }

  handleTrueFalseAnswer(answer, question) {
    const correct = answer === question.answer;
    this.hideQuestionModal();
    this.showFeedbackPopup(correct, question);
  }

  handleOrderAnswer(question) {
    const slots = document.querySelectorAll('.order-slot');
    const userAnswer = Array.from(slots).map(s => s.dataset.value);
    const correct = JSON.stringify(userAnswer) === JSON.stringify(question.answer);
    this.hideQuestionModal();
    this.showFeedbackPopup(correct, question);
  }

  hideQuestionModal() {
    document.getElementById('question-modal').classList.add('hidden');
  }

  showFeedbackPopup(correct, question) {
    const popup = document.getElementById('feedback-popup');
    const icon = document.getElementById('feedback-icon');
    const title = document.getElementById('feedback-title');
    const message = document.getElementById('feedback-message');
    const score = document.getElementById('feedback-score');

    GameState.questionCorrect = correct;

    if (correct) {
      icon.textContent = '✅';
      title.textContent = 'ACERTOU!';
      title.className = 'feedback-title correct';
      message.textContent = question.explanation;
      score.textContent = '+10 pontos!';
    } else {
      icon.textContent = '❌';
      title.textContent = 'ERROU!';
      title.className = 'feedback-title wrong';
      message.textContent = question.explanation;
      score.textContent = 'Turno perdido!';
    }

    popup.classList.add('active');
  }

  hideFeedbackPopup() {
    document.getElementById('feedback-popup').classList.remove('active');
  }

  showVictoryModal(winner, players) {
    const modal = document.getElementById('victory-modal');
    const playerName = document.getElementById('victory-player-name');
    const score = document.getElementById('victory-score');
    const ranking = document.getElementById('victory-ranking');

    playerName.textContent = `${winner.name}`;
    playerName.style.color = winner.color.hex;
    score.textContent = `Pontuação: ${winner.score} ⭐`;

    const sorted = [...players].sort((a, b) => b.score - a.score);
    let rankingHTML = '<h3>Ranking Final</h3>';
    sorted.forEach((p, idx) => {
      rankingHTML += `
        <div class="ranking-row">
          <div class="ranking-pos">${idx + 1}º</div>
          <div class="ranking-name"><span style="color: ${p.color.hex}; font-size: 1.1rem;">●</span> ${p.name}</div>
          <div class="ranking-score">${p.score} pts</div>
        </div>
      `;
    });
    ranking.innerHTML = rankingHTML;

    modal.classList.remove('hidden');
  }
}

class Game {
  constructor() {
    this.ui = new UIManager();
    this.boardRenderer = null;
    this.pawnManager = null;
    this.questionManager = new QuestionManager();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('btn-start').addEventListener('click', () => this.startGame());
    document.getElementById('btn-rules').addEventListener('click', () => this.ui.switchScreen('rules'));
    document.getElementById('btn-back-rules').addEventListener('click', () => this.ui.switchScreen('intro'));

    document.querySelectorAll('.player-count-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.selectPlayerCount(parseInt(e.target.dataset.count)));
    });

    document.getElementById('btn-roll').addEventListener('click', () => this.rollDice());
    document.getElementById('btn-menu').addEventListener('click', () => this.returnToMenu());
    document.getElementById('btn-feedback-continue').addEventListener('click', () => this.continueTurn());

    document.getElementById('btn-play-again').addEventListener('click', () => this.resetGame());
    document.getElementById('btn-victory-menu').addEventListener('click', () => this.returnToMenu());

    document.querySelectorAll('.btn-tf').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const answer = e.target.dataset.answer === 'true';
        this.ui.handleTrueFalseAnswer(answer, GameState.currentQuestion);
      });
    });

    document.getElementById('btn-confirm-order').addEventListener('click', () => {
      this.ui.handleOrderAnswer(GameState.currentQuestion);
    });

    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('pawn') && e.target.classList.contains('selectable')) {
        this.selectPawnToMove(e.target.id);
      }
    });
  }

  selectPlayerCount(count) {
    document.querySelectorAll('.player-count-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const container = document.getElementById('player-names-container');
    container.innerHTML = '';

    for (let i = 0; i < count; i++) {
      const div = document.createElement('div');
      div.className = 'player-name-input';
      div.innerHTML = `
        <label><span style="color: ${PLAYER_COLORS[i].hex}; font-size: 1.1rem;">●</span> Jogador ${i + 1}:</label>
        <input type="text" placeholder="Nome" value="${PLAYER_COLORS[i].name}" data-index="${i}" />
      `;
      container.appendChild(div);
    }
  }

  startGame() {
    const inputs = document.querySelectorAll('.player-name-input input');
    const players = [];

    inputs.forEach((input, idx) => {
      const name = input.value.trim() || PLAYER_COLORS[idx].name;
      players.push(new Player(idx, name, PLAYER_COLORS[idx]));
      GameState.scores[idx] = 0;
      GameState.levelProgress[idx] = 1;
    });

    GameState.players = players;
    GameState.gameActive = true;
    GameState.currentPlayerIndex = 0;

    this.ui.switchScreen('game');
    this.initializeGame();
  }

  initializeGame() {
    this.boardRenderer = new BoardRenderer('board-canvas');
    this.boardRenderer.draw(GameState.players);

    this.pawnManager = new PawnManager('pawns-layer', this.boardRenderer);
    this.pawnManager.updateAllPawns(GameState.players);

    this.ui.updateCurrentPlayer(GameState.players[GameState.currentPlayerIndex]);
    this.ui.updateActionLog('Clique em "ROLAR DADO" para começar!');

    window.addEventListener('resize', () => {
      this.boardRenderer.setupCanvas();
      this.boardRenderer.draw(GameState.players);
      this.pawnManager.updateAllPawns(GameState.players);
    });
  }

  rollDice() {
    if (!GameState.gameActive || GameState.diceRolled) return;

    GameState.diceValue = Math.floor(Math.random() * 6) + 1;
    GameState.diceRolled = true;

    this.ui.showDiceRoll();
    this.ui.setDiceResult(GameState.diceValue);
    this.ui.updateActionLog(`Dado rolado: ${GameState.diceValue}`);

    setTimeout(() => this.showQuestion(), 900);
  }

  showQuestion() {
    const currentPlayer = GameState.players[GameState.currentPlayerIndex];
    const level = GameState.levelProgress[currentPlayer.index] || 1;
    GameState.currentLevel = Math.min(level, 3);

    const question = this.questionManager.getNextQuestion(GameState.currentLevel);
    GameState.currentQuestion = question;

    this.ui.showQuestionModal(question);
  }

  continueTurn() {
    this.ui.hideFeedbackPopup();

    if (GameState.questionCorrect) {
      const currentPlayer = GameState.players[GameState.currentPlayerIndex];
      currentPlayer.score += 10;

      if (currentPlayer.score % 30 === 0 && GameState.currentLevel < 3) {
        GameState.currentLevel += 1;
        GameState.levelProgress[currentPlayer.index] = GameState.currentLevel;
      }

      this.selectPawnToMove();
    } else {
      this.ui.updateActionLog('Turno perdido!');
      setTimeout(() => this.nextTurn(), 1500);
    }
  }

  selectPawnToMove() {
    const currentPlayer = GameState.players[GameState.currentPlayerIndex];
    const diceValue = GameState.diceValue;

    const movablePawns = currentPlayer.pawns.filter(pawn => {
      if (pawn.finished) return false;
      if (pawn.position === -1) return diceValue === 6;
      return true;
    });

    if (movablePawns.length === 0) {
      this.ui.updateActionLog('Nenhum peão pode se mover. Turno perdido.');
      setTimeout(() => this.nextTurn(), 2000);
      return;
    }

    if (movablePawns.length === 1) {
      this.movePawn(movablePawns[0]);
    } else {
      this.showPawnSelection(movablePawns);
    }
  }

  showPawnSelection(pawns) {
    const area = document.getElementById('pawn-select-area');
    const buttons = document.getElementById('pawn-buttons');
    buttons.innerHTML = '';

    pawns.forEach(pawn => {
      const btn = document.createElement('button');
      btn.className = 'btn-pawn-select';
      btn.textContent = `Peão ${pawn.pawnIndex + 1}`;
      btn.onclick = () => this.movePawn(pawn);
      buttons.appendChild(btn);
    });

    area.style.display = 'block';

    pawns.forEach(pawn => {
      this.pawnManager.setPawnSelectable(pawn.id, true);
    });
  }

  selectPawnToMove(pawnId) {
    const currentPlayer = GameState.players[GameState.currentPlayerIndex];
    const pawn = currentPlayer.pawns.find(p => p.id === pawnId);

    if (pawn) {
      this.movePawn(pawn);
      document.getElementById('pawn-select-area').style.display = 'none';
    }
  }

  movePawn(pawn) {
    const diceValue = GameState.diceValue;

    if (pawn.position === -1 && diceValue === 6) {
      pawn.position = 0;
    } else if (pawn.position !== -1) {
      pawn.position += diceValue;

      if (pawn.position >= BOARD_POSITIONS) {
        pawn.position = BOARD_POSITIONS;
        pawn.finished = true;

        const currentPlayer = GameState.players[GameState.currentPlayerIndex];
        currentPlayer.score += 50;

        if (currentPlayer.isWinner()) {
          this.endGame(currentPlayer);
          return;
        }
      }
    }

    this.pawnManager.animatePawnMove(pawn.id);
    this.pawnManager.updatePawnPosition(pawn, GameState.players[GameState.currentPlayerIndex]);

    this.ui.updateActionLog(`Peão movido!`);

    document.getElementById('pawn-select-area').style.display = 'none';

    setTimeout(() => this.nextTurn(), 1000);
  }

  nextTurn() {
    GameState.currentPlayerIndex = (GameState.currentPlayerIndex + 1) % GameState.players.length;
    GameState.diceRolled = false;
    GameState.questionAnswered = false;
    GameState.questionCorrect = false;

    this.ui.updateCurrentPlayer(GameState.players[GameState.currentPlayerIndex]);
    this.ui.updateActionLog('Clique em "ROLAR DADO"');
    this.ui.setDiceResult('—');
  }

  endGame(winner) {
    GameState.gameActive = false;
    this.ui.showVictoryModal(winner, GameState.players);
  }

  resetGame() {
    GameState.reset();
    this.questionManager.reset();
    this.ui.switchScreen('intro');
  }

  returnToMenu() {
    if (confirm('Tem certeza que deseja voltar ao menu? O jogo será perdido.')) {
      this.resetGame();
    }
  }
}

let game;

document.addEventListener('DOMContentLoaded', () => {
  game = new Game();
  const btn2 = document.querySelector('[data-count="2"]');
  btn2.click();
});
