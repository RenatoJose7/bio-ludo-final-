/**
 * BioLudo v2.0 — Motor de Jogo Completo
 * Alinhamento perfeito, dado 3D animado, peões bem distribuídos
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO DE CORES
// ═══════════════════════════════════════════════════════════════════════════

const PLAYER_COLORS = [
  { name: 'Vermelho', hex: '#E63946', index: 0 },  // Canto superior esquerdo
  { name: 'Azul', hex: '#457B9D', index: 1 },      // Canto superior direito
  { name: 'Amarelo', hex: '#F4A261', index: 2 }, // Canto inferior direito
  { name: 'Verde', hex: '#2A9D8F', index: 3 }      // Canto inferior esquerdo
];

// ═══════════════════════════════════════════════════════════════════════════
// ESTADO DO JOGO
// ═══════════════════════════════════════════════════════════════════════════

const GameState = {
  gameActive: false,
  currentPlayerIndex: 0,
  diceValue: 0,
  diceRolled: false,
  pawnMoved: false,
  questionCorrect: false,
  currentQuestion: null,
  currentLevel: 1,
  players: [],
  selectedPawn: null
};

// ═══════════════════════════════════════════════════════════════════════════
// CLASSE: PAWN (Peão)
// ═══════════════════════════════════════════════════════════════════════════

class Pawn {
  constructor(id, pawnIndex, playerIndex) {
    this.id = id;
    this.pawnIndex = pawnIndex;
    this.playerIndex = playerIndex;
    this.position = -1; // -1 = na base
    this.finished = false;
  }

  move(steps) {
    if (this.position === -1) {
      this.position = 0;
      steps--;
    }
    this.position += steps;
    if (this.position >= 52) {
      this.finished = true;
      this.position = 52;
    }
  }

  reset() {
    this.position = -1;
    this.finished = false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLASSE: PLAYER (Jogador)
// ═══════════════════════════════════════════════════════════════════════════

class Player {
  constructor(index, color) {
    this.index = index;
    this.color = color;
    this.pawns = [
      new Pawn(`p${index}_0`, 0, index),
      new Pawn(`p${index}_1`, 1, index),
      new Pawn(`p${index}_2`, 2, index),
      new Pawn(`p${index}_3`, 3, index)
    ];
    this.score = 0;
  }

  getMovablePawns(diceValue) {
    if (diceValue === 6) {
      return this.pawns.filter(p => !p.finished);
    }
    return this.pawns.filter(p => p.position !== -1 && !p.finished);
  }

  reset() {
    this.pawns.forEach(p => p.reset());
    this.score = 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLASSE: QUESTION MANAGER
// ═══════════════════════════════════════════════════════════════════════════

class QuestionManager {
  constructor() {
    this.currentQuestionIndex = {};
    [1, 2, 3].forEach(level => {
      this.currentQuestionIndex[level] = 0;
    });
  }

  getNextQuestion(level) {
    if (!QUESTIONS[level] || QUESTIONS[level].length === 0) {
      return null;
    }
    const questions = QUESTIONS[level];
    const idx = this.currentQuestionIndex[level];
    const question = questions[idx];
    this.currentQuestionIndex[level] = (idx + 1) % questions.length;
    return question;
  }

  checkAnswer(question, answer) {
    if (question.type === 'multiple') {
      return answer === question.answer;
    } else if (question.type === 'truefalse') {
      return answer === question.answer;
    } else if (question.type === 'order') {
      return JSON.stringify(answer) === JSON.stringify(question.sequence);
    }
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLASSE: PAWN RENDERER (Renderizador de Peões)
// ═══════════════════════════════════════════════════════════════════════════

class PawnRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.pawnElements = new Map();
    this.boardSize = 600; // Tamanho do tabuleiro em pixels
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
    const cellSize = this.boardSize / 15;

    if (pawn.position === -1) {
      // Na base
      const basePositions = [
        { x: 1.5, y: 1.5 },   // Vermelho (superior esquerdo)
        { x: 13.5, y: 1.5 },  // Azul (superior direito)
        { x: 13.5, y: 13.5 }, // Amarelo (inferior direito)
        { x: 1.5, y: 13.5 }   // Verde (inferior esquerdo)
      ];
      const base = basePositions[player.index];
      const offsetX = (pawn.pawnIndex % 2) * 0.8;
      const offsetY = Math.floor(pawn.pawnIndex / 2) * 0.8;
      x = (base.x + offsetX) * cellSize;
      y = (base.y + offsetY) * cellSize;
    } else if (pawn.finished) {
      // Na meta
      const centerX = 7.5 * cellSize;
      const centerY = 7.5 * cellSize;
      const offsetX = (pawn.pawnIndex % 2 - 0.5) * cellSize * 0.6;
      const offsetY = (Math.floor(pawn.pawnIndex / 2) - 0.5) * cellSize * 0.6;
      x = centerX + offsetX;
      y = centerY + offsetY;
    } else {
      // No tabuleiro
      x = this.getCellX(pawn.position) * cellSize;
      y = this.getCellY(pawn.position) * cellSize;
    }

    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.transform = 'translate(-50%, -50%)';
  }

  getCellX(position) {
    // Mapeamento das coordenadas X do tabuleiro
    if (position < 6) return 8 + position;       // Reta inferior
    if (position < 9) return 14;                 // Sobe direita
    if (position < 15) return 14 - (position - 9); // Reta superior
    if (position < 18) return 8;                 // Desce esquerda
    if (position < 24) return 8 - (position - 18); // Reta esquerda
    if (position < 27) return 2;                 // Sobe esquerda
    if (position < 33) return 2 + (position - 27); // Reta superior
    if (position < 36) return 8;                 // Desce direita
    if (position < 42) return 8 + (position - 36); // Reta direita
    if (position < 45) return 14;                // Sobe direita
    if (position < 51) return 14 - (position - 45); // Reta superior
    return 8; // Meta
  }

  getCellY(position) {
    // Mapeamento das coordenadas Y do tabuleiro
    if (position < 6) return 8;                  // Reta inferior
    if (position < 9) return 8 - (position - 6); // Sobe direita
    if (position < 15) return 2;                 // Reta superior
    if (position < 18) return 2 + (position - 15); // Desce esquerda
    if (position < 24) return 8;                 // Reta esquerda
    if (position < 27) return 8 + (position - 24); // Sobe esquerda
    if (position < 33) return 14;                // Reta superior
    if (position < 36) return 14 - (position - 33); // Desce direita
    if (position < 42) return 8;                 // Reta direita
    if (position < 45) return 8 - (position - 42); // Sobe direita
    if (position < 51) return 2;                 // Reta superior
    return 7.5; // Meta
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

  animate(pawnId) {
    const element = this.pawnElements.get(pawnId);
    if (element) {
      element.style.animation = 'none';
      setTimeout(() => {
        element.style.animation = 'pawnMove 0.4s ease-out';
      }, 10);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLASSE: UI MANAGER
// ═══════════════════════════════════════════════════════════════════════════

class UIManager {
  constructor() {
    this.diceElement = document.getElementById('dice-value');
    this.feedbackElement = document.getElementById('feedback-popup');
    this.questionElement = document.getElementById('question-popup');
    this.playersListElement = document.getElementById('players-list');
    this.actionLogElement = document.getElementById('action-log');
  }

  setDiceValue(value) {
    if (this.diceElement) {
      this.diceElement.textContent = value;
      this.diceElement.classList.add('rolling');
      setTimeout(() => {
        this.diceElement.classList.remove('rolling');
      }, 800);
    }
  }

  showDiceRoll() {
    if (this.diceElement) {
      this.diceElement.classList.add('rolling');
    }
  }

  showQuestion(question, level) {
    if (!this.questionElement) return;
    
    let html = `<div class="question-content">
      <h3>${question.text}</h3>`;

    if (question.type === 'multiple') {
      html += '<div class="options">';
      question.options.forEach((opt, idx) => {
        html += `<button class="option-btn" data-answer="${idx}">${opt}</button>`;
      });
      html += '</div>';
    } else if (question.type === 'truefalse') {
      html += `<div class="options">
        <button class="option-btn" data-answer="true">Verdadeiro</button>
        <button class="option-btn" data-answer="false">Falso</button>
      </div>`;
    } else if (question.type === 'order') {
      html += '<div class="order-container" id="order-items">';
      question.sequence.forEach((item, idx) => {
        html += `<div class="order-item" draggable="true" data-index="${idx}">${item}</div>`;
      });
      html += '</div>';
    }

    html += '</div>';
    this.questionElement.innerHTML = html;
    this.questionElement.style.display = 'flex';

    // Adicionar event listeners
    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const answer = e.target.dataset.answer;
        if (question.type === 'truefalse') {
          gameController.handleAnswer(answer === 'true' ? question.answer : !question.answer, question);
        } else {
          gameController.handleAnswer(parseInt(answer) === question.answer, question);
        }
      });
    });
  }

  hideQuestion() {
    if (this.questionElement) {
      this.questionElement.style.display = 'none';
    }
  }

  showFeedback(correct, explanation) {
    if (!this.feedbackElement) return;
    
    const html = `<div class="feedback-content ${correct ? 'correct' : 'wrong'}">
      <div class="feedback-icon">${correct ? '✓' : '✗'}</div>
      <div class="feedback-text">
        <h3>${correct ? 'Acertou!' : 'Errou!'}</h3>
        <p>${explanation}</p>
      </div>
      <button class="feedback-btn">Continuar</button>
    </div>`;
    
    this.feedbackElement.innerHTML = html;
    this.feedbackElement.style.display = 'flex';

    document.querySelector('.feedback-btn').addEventListener('click', () => {
      gameController.continueTurn();
    });
  }

  hideFeedback() {
    if (this.feedbackElement) {
      this.feedbackElement.style.display = 'none';
    }
  }

  updatePlayersList(players, currentIndex) {
    if (!this.playersListElement) return;
    
    let html = '';
    players.forEach((player, idx) => {
      const isCurrentPlayer = idx === currentIndex ? 'current' : '';
      const finishedCount = player.pawns.filter(p => p.finished).length;
      html += `<div class="player-card ${isCurrentPlayer}">
        <div class="player-name" style="color: ${player.color.hex}">${player.color.name}</div>
        <div class="player-score">Peões na meta: ${finishedCount}/4</div>
      </div>`;
    });
    
    this.playersListElement.innerHTML = html;
  }

  updateActionLog(message) {
    if (this.actionLogElement) {
      this.actionLogElement.textContent = message;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLASSE: GAME CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════

class GameController {
  constructor() {
    this.questionManager = new QuestionManager();
    this.ui = new UIManager();
    this.pawnRenderer = null;
  }

  initGame(playerCount) {
    GameState.players = [];
    for (let i = 0; i < playerCount; i++) {
      GameState.players.push(new Player(i, PLAYER_COLORS[i]));
    }
    GameState.currentPlayerIndex = 0;
    GameState.gameActive = true;
    GameState.currentLevel = 1;

    this.pawnRenderer = new PawnRenderer('pawns-container');
    this.pawnRenderer.updateAll(GameState.players);
    this.ui.updatePlayersList(GameState.players, GameState.currentPlayerIndex);

    document.getElementById('btn-roll-dice').addEventListener('click', () => this.rollDice());
  }

  rollDice() {
    if (!GameState.gameActive || GameState.diceRolled) return;

    GameState.diceValue = Math.floor(Math.random() * 6) + 1;
    GameState.diceRolled = true;
    GameState.pawnMoved = false;

    soundGen.playDiceRoll();
    this.ui.setDiceValue(GameState.diceValue);
    this.ui.updateActionLog(`Dado: ${GameState.diceValue}`);

    setTimeout(() => this.showQuestion(), 900);
  }

  showQuestion() {
    const question = this.questionManager.getNextQuestion(GameState.currentLevel);
    if (question) {
      GameState.currentQuestion = question;
      this.ui.showQuestion(question, GameState.currentLevel);
    }
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

    if (!GameState.questionCorrect) {
      this.nextTurn();
      return;
    }

    const currentPlayer = GameState.players[GameState.currentPlayerIndex];
    const movablePawns = currentPlayer.getMovablePawns(GameState.diceValue);

    if (movablePawns.length === 0) {
      this.nextTurn();
      return;
    }

    this.showPawnSelection(movablePawns);
  }

  showPawnSelection(pawns) {
    const html = `<div class="pawn-selection">
      <p>Escolha um peão para mover:</p>
      <div class="pawn-options">
        ${pawns.map((p, idx) => `
          <button class="pawn-option" data-pawn-id="${p.id}">
            Peão ${p.pawnIndex + 1}
          </button>
        `).join('')}
      </div>
    </div>`;

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    document.querySelectorAll('.pawn-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pawnId = e.target.dataset.pawnId;
        const pawn = pawns.find(p => p.id === pawnId);
        this.movePawn(pawn);
        container.remove();
      });
    });
  }

  movePawn(pawn) {
    const currentPlayer = GameState.players[GameState.currentPlayerIndex];
    pawn.move(GameState.diceValue);
    GameState.pawnMoved = true;

    soundGen.playMove();
    this.pawnRenderer.animate(pawn.id);
    this.pawnRenderer.updatePosition(pawn, currentPlayer);
    this.ui.updatePlayersList(GameState.players, GameState.currentPlayerIndex);
    this.ui.updateActionLog('Peão movido!');

    // Verificar vitória
    if (pawn.finished && currentPlayer.pawns.every(p => p.finished)) {
      this.endGame(currentPlayer);
      return;
    }

    // Próximo turno ou jogada extra
    if (GameState.diceValue === 6 && !GameState.pawnMoved) {
      this.ui.updateActionLog('Tirou 6! Jogue novamente.');
      setTimeout(() => {
        GameState.diceRolled = false;
        this.rollDice();
      }, 1500);
    } else {
      setTimeout(() => this.nextTurn(), 1000);
    }
  }

  nextTurn() {
    GameState.currentPlayerIndex = (GameState.currentPlayerIndex + 1) % GameState.players.length;
    GameState.diceRolled = false;
    GameState.pawnMoved = false;
    this.ui.updatePlayersList(GameState.players, GameState.currentPlayerIndex);
    this.ui.updateActionLog('Próximo turno!');
  }

  endGame(winner) {
    GameState.gameActive = false;
    this.ui.updateActionLog(`${winner.color.name} venceu!`);
    alert(`${winner.color.name} venceu o jogo!`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

const gameController = new GameController();

// Event listeners para tela inicial
document.querySelectorAll('.btn-count').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const count = parseInt(e.target.dataset.count);
    document.getElementById('screen-intro').style.display = 'none';
    document.getElementById('screen-game').style.display = 'flex';
    gameController.initGame(count);
  });
});

document.getElementById('btn-victory-menu').addEventListener('click', () => {
  location.reload();
});
