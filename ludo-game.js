/**
 * ludo-game.js — Motor do Jogo Ludo Oficial (Corrigido)
 * Regras: saída com 6, captura, jogada extra, casas seguras, tabuleiro oficial
 */

const BOARD_SIZE = 15;
const TOTAL_POSITIONS = 52;
const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];
const PAWN_COUNT = 4;

const PLAYER_COLORS = [
  { name: 'Vermelho', hex: '#e74c3c', rgb: 'rgb(231,76,60)' },
  { name: 'Azul', hex: '#3498db', rgb: 'rgb(52,152,219)' },
  { name: 'Verde', hex: '#2ecc71', rgb: 'rgb(46,204,113)' },
  { name: 'Amarelo', hex: '#f39c12', rgb: 'rgb(243,156,18)' }
];

const GameState = {
  players: [],
  currentPlayerIndex: 0,
  gameActive: false,
  diceValue: 0,
  diceRolled: false,
  selectingPawn: false,
  currentQuestion: null,
  questionAnswered: false,
  questionCorrect: false,
  currentLevel: 1,
  pawnMoved: false,

  reset() {
    this.players = [];
    this.currentPlayerIndex = 0;
    this.gameActive = false;
    this.diceValue = 0;
    this.diceRolled = false;
    this.selectingPawn = false;
    this.currentQuestion = null;
    this.questionAnswered = false;
    this.questionCorrect = false;
    this.currentLevel = 1;
    this.pawnMoved = false;
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

    for (let i = 0; i < PAWN_COUNT; i++) {
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

  getMovablePawns(diceValue) {
    return this.pawns.filter(pawn => {
      if (pawn.finished) return false;
      if (pawn.position === -1) return diceValue === 6;
      return true;
    });
  }
}

class LudoBoard {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.setupCanvas();
    this.generateBoardLayout();
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

  generateBoardLayout() {
    this.cells = [];
    const cs = this.cellSize;

    // Caminho do Vermelho (0-12): Topo (esquerda para direita)
    for (let i = 0; i < 13; i++) {
      this.cells.push({
        x: (6 + i) * cs,
        y: 6 * cs,
        playerColor: 0,
        isSafe: SAFE_POSITIONS.includes(i)
      });
    }

    // Caminho do Azul (13-25): Direita (cima para baixo)
    for (let i = 0; i < 13; i++) {
      this.cells.push({
        x: 12 * cs,
        y: (6 + i) * cs,
        playerColor: 1,
        isSafe: SAFE_POSITIONS.includes(13 + i)
      });
    }

    // Caminho do Verde (26-38): Baixo (direita para esquerda)
    for (let i = 0; i < 13; i++) {
      this.cells.push({
        x: (12 - i) * cs,
        y: 12 * cs,
        playerColor: 2,
        isSafe: SAFE_POSITIONS.includes(26 + i)
      });
    }

    // Caminho do Amarelo (39-51): Esquerda (baixo para cima)
    for (let i = 0; i < 13; i++) {
      this.cells.push({
        x: 6 * cs,
        y: (12 - i) * cs,
        playerColor: 3,
        isSafe: SAFE_POSITIONS.includes(39 + i)
      });
    }
  }

  draw(players) {
    const cs = this.cellSize;

    // Fundo branco
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Desenhar bases (6x6 em cada canto)
    const bases = [
      { x: 0, y: 0, color: PLAYER_COLORS[0].hex },
      { x: 12 * cs, y: 0, color: PLAYER_COLORS[1].hex },
      { x: 12 * cs, y: 12 * cs, color: PLAYER_COLORS[2].hex },
      { x: 0, y: 12 * cs, color: PLAYER_COLORS[3].hex }
    ];

    bases.forEach(base => {
      this.ctx.fillStyle = base.color;
      this.ctx.globalAlpha = 0.15;
      this.ctx.fillRect(base.x, base.y, 6 * cs, 6 * cs);
      this.ctx.globalAlpha = 1;

      this.ctx.strokeStyle = base.color;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(base.x, base.y, 6 * cs, 6 * cs);
    });

    // Desenhar casas do tabuleiro
    this.cells.forEach((cell, idx) => {
      const color = PLAYER_COLORS[cell.playerColor].hex;

      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(cell.x, cell.y, cs, cs);

      // Borda com cor do jogador
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 1;
      this.ctx.globalAlpha = 0.3;
      this.ctx.strokeRect(cell.x, cell.y, cs, cs);
      this.ctx.globalAlpha = 1;

      // Marca segura (estrela)
      if (cell.isSafe) {
        this.drawStar(cell.x + cs / 2, cell.y + cs / 2, 5, color);
      }
    });

    // Desenhar meta central
    const centerX = 7.5 * cs;
    const centerY = 7.5 * cs;
    const metaSize = 3 * cs;

    this.ctx.fillStyle = '#fff9e6';
    this.ctx.fillRect(centerX - metaSize / 2, centerY - metaSize / 2, metaSize, metaSize);
    this.ctx.strokeStyle = '#f39c12';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(centerX - metaSize / 2, centerY - metaSize / 2, metaSize, metaSize);

    this.drawStar(centerX, centerY, 12, '#f39c12');
  }

  drawStar(cx, cy, size, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = cx + size * Math.cos(angle);
      const y = cy + size * Math.sin(angle);
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  getCellPosition(cellIndex) {
    if (cellIndex < 0 || cellIndex >= this.cells.length) return null;
    const cell = this.cells[cellIndex];
    const cs = this.cellSize;
    return {
      x: cell.x + cs / 2,
      y: cell.y + cs / 2
    };
  }

  isSafeCell(cellIndex) {
    if (cellIndex < 0 || cellIndex >= this.cells.length) return false;
    return this.cells[cellIndex].isSafe;
  }
}

class PawnRenderer {
  constructor(containerId, board) {
    this.container = document.getElementById(containerId);
    this.board = board;
    this.pawnElements = new Map();
  }

  createPawn(pawn, player) {
    const div = document.createElement('div');
    div.className = 'pawn';
    div.id = pawn.id;
    div.style.background = player.color.hex;
    div.innerHTML = '●';

    this.container.appendChild(div);
    this.pawnElements.set(pawn.id, div);

    return div;
  }

  updatePosition(pawn, player) {
    const element = this.pawnElements.get(pawn.id);
    if (!element) return;

    let x, y;
    const cs = this.board.cellSize;

    if (pawn.position === -1) {
      const basePositions = [
        { x: 1.5, y: 1.5 },
        { x: 13.5, y: 1.5 },
        { x: 13.5, y: 13.5 },
        { x: 1.5, y: 13.5 }
      ];
      const base = basePositions[player.index];
      const offsetX = (pawn.pawnIndex % 2) * 2;
      const offsetY = Math.floor(pawn.pawnIndex / 2) * 2;
      x = (base.x + offsetX) * cs;
      y = (base.y + offsetY) * cs;
    } else if (pawn.finished) {
      const centerX = 7.5 * cs;
      const centerY = 7.5 * cs;
      const offsetX = (pawn.pawnIndex % 2 - 0.5) * 1.2 * cs;
      const offsetY = (Math.floor(pawn.pawnIndex / 2) - 0.5) * 1.2 * cs;
      x = centerX + offsetX;
      y = centerY + offsetY;
    } else {
      const pos = this.board.getCellPosition(pawn.position);
      if (pos) {
        x = pos.x;
        y = pos.y;
      }
    }

    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.transform = 'translate(-50%, -50%)';
  }

  updateAll(players) {
    players.forEach(player => {
      player.pawns.forEach(pawn => {
        if (!this.pawnElements.has(pawn.id)) {
          this.createPawn(pawn, player);
        }
        this.updatePosition(pawn, player);
      });
    });
  }

  setSelectable(pawnId, selectable) {
    const element = this.pawnElements.get(pawnId);
    if (element) {
      if (selectable) {
        element.classList.add('selectable');
      } else {
        element.classList.remove('selectable');
      }
    }
  }

  animate(pawnId) {
    const element = this.pawnElements.get(pawnId);
    if (element) {
      element.classList.remove('moving');
      void element.offsetWidth;
      element.classList.add('moving');
    }
  }
}

class UIManager {
  constructor() {
    this.screens = {
      intro: document.getElementById('screen-intro'),
      rules: document.getElementById('screen-rules'),
      game: document.getElementById('screen-game')
    };
  }

  switchScreen(screenName) {
    Object.values(this.screens).forEach(s => s.classList.remove('active'));
    this.screens[screenName].classList.add('active');
  }

  updateCurrentPlayer(player) {
    document.getElementById('current-player-name').textContent = player.name;
    document.getElementById('current-player-name').style.color = player.color.hex;
    document.getElementById('current-player-score').textContent = `${player.score} pts`;
  }

  updatePlayersList(players, currentIndex) {
    const list = document.getElementById('players-list');
    list.innerHTML = '';

    players.forEach((player, idx) => {
      const card = document.createElement('div');
      card.className = 'player-card';
      if (idx === currentIndex) card.classList.add('active-turn');

      const pawnsStatus = player.pawns.map(p => {
        if (p.finished) return 'finished';
        if (p.position === -1) return 'home';
        return 'playing';
      });

      card.innerHTML = `
        <div class="player-card-name">
          <span class="color-dot" style="background: ${player.color.hex}"></span>
          ${player.name}
        </div>
        <div class="player-card-score">${player.score} pts</div>
        <div class="player-card-pawns">
          ${pawnsStatus.map(status => `<div class="pawn-indicator ${status}" style="background: ${player.color.hex}"></div>`).join('')}
        </div>
      `;

      list.appendChild(card);
    });
  }

  setDiceValue(value) {
    document.getElementById('dice-display').textContent = value;
  }

  updateActionLog(text) {
    document.getElementById('action-log').textContent = text;
  }

  showDiceRoll() {
    const dice = document.getElementById('dice-display').parentElement;
    dice.classList.add('rolling');
    setTimeout(() => dice.classList.remove('rolling'), 600);
  }

  showQuestion(question, level) {
    const modal = document.getElementById('question-modal');
    document.getElementById('q-level').textContent = `Nível ${level}`;
    document.getElementById('q-type').textContent = this.getQuestionType(question.type);
    document.getElementById('q-text').textContent = question.text;

    document.getElementById('q-multiple').classList.add('hidden');
    document.getElementById('q-truefalse').classList.add('hidden');
    document.getElementById('q-order').classList.add('hidden');
    document.getElementById('q-feedback').classList.add('hidden');
    document.getElementById('btn-continue-game').classList.add('hidden');
    document.getElementById('btn-confirm-order').classList.add('hidden');

    if (question.type === 'multiple') {
      this.renderMultipleChoice(question);
    } else if (question.type === 'truefalse') {
      this.renderTrueFalse(question);
    } else if (question.type === 'order') {
      this.renderOrderSequence(question);
    }

    modal.classList.remove('hidden');
  }

  getQuestionType(type) {
    const types = {
      'multiple': 'Múltipla Escolha',
      'truefalse': 'Verdadeiro/Falso',
      'order': 'Ordenar Sequência'
    };
    return types[type] || type;
  }

  renderMultipleChoice(question) {
    const section = document.getElementById('q-multiple');
    const options = document.getElementById('q-options');
    options.innerHTML = '';

    question.options.forEach((option, idx) => {
      const btn = document.createElement('button');
      btn.className = 'q-option';
      btn.textContent = option;
      btn.onclick = () => game.handleAnswer(idx === question.answer, question);
      options.appendChild(btn);
    });

    section.classList.remove('hidden');
  }

  renderTrueFalse(question) {
    document.getElementById('q-truefalse').classList.remove('hidden');
  }

  renderOrderSequence(question) {
    const section = document.getElementById('q-order');
    const itemsContainer = document.getElementById('q-order-items');
    const slotsContainer = document.getElementById('q-order-slots');

    itemsContainer.innerHTML = '';
    slotsContainer.innerHTML = '';

    const shuffled = [...question.sequence].sort(() => Math.random() - 0.5);

    shuffled.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'order-item';
      div.textContent = item;
      div.draggable = true;
      div.dataset.index = idx;
      div.dataset.originalIndex = question.sequence.indexOf(item);

      div.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.target.dataset.originalIndex);
      });

      div.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
      });

      itemsContainer.appendChild(div);
    });

    question.sequence.forEach((item, idx) => {
      const slot = document.createElement('div');
      slot.className = 'order-slot';
      slot.dataset.position = idx;
      slot.textContent = `${idx + 1}`;

      slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        slot.classList.add('drag-over');
      });

      slot.addEventListener('dragleave', (e) => {
        slot.classList.remove('drag-over');
      });

      slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.classList.remove('drag-over');
        const originalIndex = e.dataTransfer.getData('text/plain');
        slot.dataset.itemIndex = originalIndex;
        slot.textContent = question.sequence[originalIndex];
        slot.classList.add('filled');
      });

      slotsContainer.appendChild(slot);
    });

    document.getElementById('btn-confirm-order').classList.remove('hidden');
    section.classList.remove('hidden');
  }

  hideQuestion() {
    document.getElementById('question-modal').classList.add('hidden');
  }

  showFeedback(correct, message) {
    const popup = document.getElementById('feedback-popup');
    document.getElementById('popup-icon').textContent = correct ? '✓' : '✗';
    document.getElementById('popup-title').textContent = correct ? 'ACERTOU!' : 'ERROU!';
    document.getElementById('popup-title').className = `popup-title ${correct ? 'correct' : 'wrong'}`;
    document.getElementById('popup-message').textContent = message;
    popup.classList.remove('hidden');
  }

  hideFeedback() {
    document.getElementById('feedback-popup').classList.add('hidden');
  }

  showVictory(winner, players) {
    const modal = document.getElementById('victory-modal');
    document.getElementById('victory-player-name').textContent = winner.name;
    document.getElementById('victory-player-name').style.color = winner.color.hex;
    document.getElementById('victory-score').textContent = `${winner.score} pontos`;

    const sorted = [...players].sort((a, b) => b.score - a.score);
    let rankingHTML = '<h3>Ranking</h3>';
    sorted.forEach((p, idx) => {
      rankingHTML += `
        <div class="ranking-item">
          <span class="ranking-pos">${idx + 1}º</span>
          <span class="ranking-name" style="color: ${p.color.hex}">${p.name}</span>
          <span class="ranking-score">${p.score}</span>
        </div>
      `;
    });
    document.getElementById('victory-ranking').innerHTML = rankingHTML;

    modal.classList.remove('hidden');
  }

  showPawnSelection(pawns) {
    const area = document.getElementById('pawn-selection');
    const container = document.getElementById('pawn-buttons-container');
    container.innerHTML = '';

    pawns.forEach(pawn => {
      const btn = document.createElement('button');
      btn.className = 'btn-pawn';
      btn.textContent = `P${pawn.pawnIndex + 1}`;
      btn.onclick = () => game.movePawn(pawn);
      container.appendChild(btn);
    });

    area.classList.remove('hidden');
  }

  hidePawnSelection() {
    document.getElementById('pawn-selection').classList.add('hidden');
  }

  confirmOrderAnswer() {
    const slots = document.querySelectorAll('.order-slot');
    const answer = Array.from(slots).map(s => parseInt(s.dataset.itemIndex || -1));
    const correct = answer.every((v, i) => v === i);
    const message = correct ? 'Sequência correta!' : 'Sequência incorreta!';
    game.handleAnswer(correct, { explanation: message });
  }
}

class LudoGame {
  constructor() {
    this.ui = new UIManager();
    this.board = null;
    this.pawnRenderer = null;
    this.questionManager = new QuestionManager();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('btn-start-game').addEventListener('click', () => this.startGame());
    document.getElementById('btn-show-rules').addEventListener('click', () => this.ui.switchScreen('rules'));
    document.getElementById('btn-back-rules').addEventListener('click', () => this.ui.switchScreen('intro'));
    document.getElementById('btn-roll-dice').addEventListener('click', () => this.rollDice());
    document.getElementById('btn-menu').addEventListener('click', () => this.returnToMenu());
    document.getElementById('btn-popup-close').addEventListener('click', () => this.continueTurn());
    document.getElementById('btn-continue-game').addEventListener('click', () => this.continueTurn());
    document.getElementById('btn-confirm-order').addEventListener('click', () => this.ui.confirmOrderAnswer());
    document.getElementById('btn-play-again').addEventListener('click', () => this.resetGame());
    document.getElementById('btn-victory-menu').addEventListener('click', () => this.returnToMenu());

    document.querySelectorAll('.btn-count').forEach(btn => {
      btn.addEventListener('click', (e) => this.selectPlayerCount(parseInt(e.target.dataset.count)));
    });

    document.querySelectorAll('.btn-tf').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const answer = e.target.dataset.answer === 'true';
        this.handleAnswer(answer === GameState.currentQuestion.answer, GameState.currentQuestion);
      });
    });

    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('pawn') && e.target.classList.contains('selectable')) {
        const pawnId = e.target.id;
        const player = GameState.players[GameState.currentPlayerIndex];
        const pawn = player.pawns.find(p => p.id === pawnId);
        if (pawn) this.movePawn(pawn);
      }
    });
  }

  selectPlayerCount(count) {
    document.querySelectorAll('.btn-count').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const section = document.getElementById('player-names-section');
    section.innerHTML = '';

    for (let i = 0; i < count; i++) {
      const div = document.createElement('div');
      div.className = 'player-name-input';
      div.innerHTML = `
        <label style="color: ${PLAYER_COLORS[i].hex}">●</label>
        <input type="text" placeholder="Nome" value="${PLAYER_COLORS[i].name}" />
      `;
      section.appendChild(div);
    }
  }

  startGame() {
    const inputs = document.querySelectorAll('.player-name-input input');
    const players = [];

    inputs.forEach((input, idx) => {
      const name = input.value.trim() || PLAYER_COLORS[idx].name;
      players.push(new Player(idx, name, PLAYER_COLORS[idx]));
    });

    GameState.players = players;
    GameState.currentPlayerIndex = 0;
    GameState.gameActive = true;

    this.ui.switchScreen('game');
    this.initializeGame();
  }

  initializeGame() {
    this.board = new LudoBoard('board-canvas');
    this.board.draw(GameState.players);

    this.pawnRenderer = new PawnRenderer('pawns-container', this.board);
    this.pawnRenderer.updateAll(GameState.players);

    this.ui.updateCurrentPlayer(GameState.players[GameState.currentPlayerIndex]);
    this.ui.updatePlayersList(GameState.players, GameState.currentPlayerIndex);
    this.ui.updateActionLog('Clique em "Rolar Dado" para começar!');

    window.addEventListener('resize', () => {
      this.board.setupCanvas();
      this.board.draw(GameState.players);
      this.pawnRenderer.updateAll(GameState.players);
    });
  }

  rollDice() {
    if (!GameState.gameActive || GameState.diceRolled) return;

    GameState.diceValue = Math.floor(Math.random() * 6) + 1;
    GameState.diceRolled = true;
    GameState.pawnMoved = false;

    soundGen.playDiceRoll();
    this.ui.showDiceRoll();
    this.ui.setDiceValue(GameState.diceValue);
    this.ui.updateActionLog(`Dado: ${GameState.diceValue}`);

    setTimeout(() => this.showQuestion(), 900);
  }

  showQuestion() {
    const question = this.questionManager.getNextQuestion(GameState.currentLevel);
    GameState.currentQuestion = question;
    this.ui.showQuestion(question, GameState.currentLevel);
  }

  handleAnswer(correct, question) {
    GameState.questionCorrect = correct;
    if (correct) {
      soundGen.playCorrect();
    } else {
      soundGen.playWrong();
    }
    this.ui.hideQuestion();
    this.ui.showFeedback(correct, question.explanation);
  }

  continueTurn() {
    this.ui.hideFeedback();

    if (GameState.questionCorrect) {
      const currentPlayer = GameState.players[GameState.currentPlayerIndex];
      currentPlayer.score += 10;

      const movablePawns = currentPlayer.getMovablePawns(GameState.diceValue);

      if (movablePawns.length === 0) {
        this.ui.updateActionLog('Nenhum peão pode se mover.');
        setTimeout(() => this.nextTurn(), 1500);
      } else if (movablePawns.length === 1) {
        this.movePawn(movablePawns[0]);
      } else {
        this.ui.showPawnSelection(movablePawns);
      }
    } else {
      this.ui.updateActionLog('Turno perdido!');
      setTimeout(() => this.nextTurn(), 1500);
    }
  }

  movePawn(pawn) {
    if (GameState.pawnMoved && GameState.diceValue !== 6) {
      this.ui.updateActionLog('Você já moveu um peão neste turno!');
      return;
    }

    const currentPlayer = GameState.players[GameState.currentPlayerIndex];
    const diceValue = GameState.diceValue;

    if (pawn.position === -1 && diceValue === 6) {
      pawn.position = 0;
    } else if (pawn.position !== -1) {
      const newPosition = pawn.position + diceValue;

      if (newPosition >= TOTAL_POSITIONS) {
        pawn.finished = true;
        currentPlayer.score += 50;

        if (currentPlayer.isWinner()) {
          this.endGame(currentPlayer);
          return;
        }
      } else {
        pawn.position = newPosition;

        if (!this.board.isSafeCell(newPosition)) {
          this.captureEnemyPawn(newPosition, currentPlayer.index);
        }
      }
    }

    GameState.pawnMoved = true;
    soundGen.playMove();
    this.pawnRenderer.animate(pawn.id);
    this.pawnRenderer.updatePosition(pawn, currentPlayer);
    this.ui.updatePlayersList(GameState.players, GameState.currentPlayerIndex);
    this.ui.updateActionLog('Peão movido!');
    this.ui.hidePawnSelection();

    if (diceValue === 6 && !GameState.pawnMoved) {
      this.ui.updateActionLog('Tirou 6! Jogue novamente.');
      setTimeout(() => {
        GameState.diceRolled = false;
        GameState.pawnMoved = false;
      }, 1000);
    } else {
      setTimeout(() => this.nextTurn(), 1000);
    }
  }

  captureEnemyPawn(position, playerIndex) {
    GameState.players.forEach((player, idx) => {
      if (idx !== playerIndex) {
        const pawn = player.pawns.find(p => p.position === position && !p.finished);
        if (pawn) {
          pawn.position = -1;
          this.pawnRenderer.updatePosition(pawn, player);
          this.ui.updateActionLog('Peão capturado!');
        }
      }
    });
  }

  nextTurn() {
    GameState.currentPlayerIndex = (GameState.currentPlayerIndex + 1) % GameState.players.length;
    GameState.diceRolled = false;
    GameState.questionCorrect = false;
    GameState.pawnMoved = false;

    this.ui.updateCurrentPlayer(GameState.players[GameState.currentPlayerIndex]);
    this.ui.updatePlayersList(GameState.players, GameState.currentPlayerIndex);
    this.ui.setDiceValue('—');
    this.ui.updateActionLog('Clique em "Rolar Dado"');
  }

  endGame(winner) {
    GameState.gameActive = false;
    this.ui.showVictory(winner, GameState.players);
  }

  resetGame() {
    GameState.reset();
    this.questionManager.reset();
    this.ui.switchScreen('intro');
  }

  returnToMenu() {
    if (confirm('Voltar ao menu? O jogo será perdido.')) {
      this.resetGame();
    }
  }
}

class QuestionManager {
  constructor() {
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
    return question;
  }

  reset() {
    this.usedQuestions.clear();
  }
}

let game;

document.addEventListener('DOMContentLoaded', () => {
  game = new LudoGame();
  const btn2 = document.querySelector('[data-count="2"]');
  btn2.click();
});
