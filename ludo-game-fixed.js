/**
 * BioLudo Fixed — Motor de Jogo Corrigido
 * Alinhamento perfeito, dado 3D animado, peões bem distribuídos e regras oficiais.
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO E CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

const PLAYER_COLORS = [
  { name: 'Vermelho', hex: '#E63946', index: 0 },  // Superior esquerdo
  { name: 'Azul', hex: '#457B9D', index: 1 },      // Superior direito
  { name: 'Amarelo', hex: '#F4A261', index: 2 },   // Inferior direito
  { name: 'Verde', hex: '#2A9D8F', index: 3 }      // Inferior esquerdo
];

const SAFE_CELLS = [0, 8, 13, 21, 26, 34, 39, 47]; // Casas marcadas com estrela no Ludo padrão
const BOARD_SIZE = 15; // Grid 15x15

// ═══════════════════════════════════════════════════════════════════════════
// ESTADO DO JOGO
// ═══════════════════════════════════════════════════════════════════════════

const GameState = {
  gameActive: false,
  currentPlayerIndex: 0,
  diceValue: 0,
  diceRolled: false,
  canRollAgain: false,
  players: [],
  selectedPawn: null,
  currentQuestion: null,
  currentLevel: 1
};

// ═══════════════════════════════════════════════════════════════════════════
// CLASSES PRINCIPAIS
// ═══════════════════════════════════════════════════════════════════════════

class Pawn {
  constructor(id, pawnIndex, playerIndex) {
    this.id = id;
    this.pawnIndex = pawnIndex;
    this.playerIndex = playerIndex;
    this.position = -1; // -1 = na base
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
    this.name = name || `Jogador ${index + 1}`;
    this.pawns = Array.from({ length: 4 }, (_, i) => new Pawn(`p${index}_${i}`, i, index));
    this.score = 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDERIZAÇÃO E UI
// ═══════════════════════════════════════════════════════════════════════════

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
    
    // Modal de Perguntas
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
    // Criar estrutura do dado 3D se não existir
    if (!document.querySelector('.dice-cube')) {
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
    }
    this.diceCube = document.getElementById('dice-cube');
  }

  updateActionLog(message) {
    this.actionLog.textContent = message;
    this.actionLog.scrollTop = this.actionLog.scrollHeight;
  }

  renderPlayers(players, currentIndex) {
    this.playersList.innerHTML = '';
    players.forEach((player, i) => {
      const card = document.createElement('div');
      card.className = `player-card ${i === currentIndex ? 'active-turn' : ''}`;
      card.innerHTML = `
        <div class="player-card-name">
          <span class="color-dot" style="background: ${player.color.hex}"></span>
          ${player.name}
        </div>
        <div class="player-card-score">Score: ${player.score}</div>
      `;
      this.playersList.appendChild(card);
    });
    this.currentPlayerName.textContent = players[currentIndex].name;
    this.currentPlayerName.style.color = players[currentIndex].color.hex;
  }

  updatePawns(players) {
    // Limpar peões órfãos
    const existingPawnIds = new Set();
    players.forEach(p => p.pawns.forEach(pn => existingPawnIds.add(pn.id)));
    
    Array.from(this.pawnsContainer.children).forEach(child => {
      if (!existingPawnIds.has(child.id)) child.remove();
    });

    const boardSizePx = this.boardWrapper.offsetWidth;
    const cellSize = boardSizePx / BOARD_SIZE;

    // Agrupar peões por posição para evitar sobreposição
    const positionMap = new Map();

    players.forEach(player => {
      player.pawns.forEach(pawn => {
        // Criar elemento se não existir
        let el = document.getElementById(pawn.id);
        if (!el) {
          el = document.createElement('div');
          el.id = pawn.id;
          el.className = 'pawn';
          el.style.backgroundColor = player.color.hex;
          el.textContent = '●';
          this.pawnsContainer.appendChild(el);
        }

        // Calcular posição base (x, y em grid)
        let gridX, gridY;
        if (pawn.position === -1) {
          // Posições fixas na base
          const bases = [
            { x: 1.5, y: 1.5 }, { x: 12.5, y: 1.5 },
            { x: 12.5, y: 12.5 }, { x: 1.5, y: 12.5 }
          ];
          const b = bases[player.index];
          gridX = b.x + (pawn.pawnIndex % 2) * 1.2;
          gridY = b.y + Math.floor(pawn.pawnIndex / 2) * 1.2;
        } else if (pawn.finished) {
          gridX = 7.5;
          gridY = 7.5;
        } else {
          const pos = this.getGridCoordinates(pawn.position, player.index);
          gridX = pos.x;
          gridY = pos.y;
        }

        // Armazenar para resolver sobreposição
        const key = `${gridX},${gridY}`;
        if (!positionMap.has(key)) positionMap.set(key, []);
        positionMap.get(key).push({ el, pawn });
      });
    });

    // Aplicar posições com offset para múltiplos peões
    positionMap.forEach((peons, key) => {
      const [gx, gy] = key.split(',').map(Number);
      const count = peons.length;
      
      peons.forEach((item, index) => {
        let offsetX = 0, offsetY = 0;
        if (count > 1) {
          const spacing = 8; // pixels
          offsetX = (index % 2) * spacing - (spacing / 2);
          offsetY = Math.floor(index / 2) * spacing - (spacing / 2);
        }
        
        item.el.style.left = `${gx * cellSize + offsetX}px`;
        item.el.style.top = `${gy * cellSize + offsetY}px`;
        item.el.style.transform = 'translate(-50%, -50%)';
      });
    });
  }

  getGridCoordinates(pos, playerIndex) {
    // Simplificação do caminho do Ludo em grid 15x15
    // O caminho real depende de como o tabuleiro.png foi desenhado.
    // Baseado no ludo-game-v2.js e ajustando para alinhar:
    
    // Caminho comum de 52 casas
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

    // Cada jogador começa em um ponto diferente (0, 13, 26, 39)
    const startOffsets = [0, 13, 26, 39];
    const index = (pos + startOffsets[playerIndex]) % 52;
    return path[index];
  }

  rollDice(value, callback) {
    if (soundGen) soundGen.playDiceRoll();
    this.diceCube.className = 'dice-cube rolling';
    
    // Rotações para cada face
    const rotations = {
      1: 'rotateX(0deg) rotateY(0deg)',
      2: 'rotateX(0deg) rotateY(-90deg)',
      3: 'rotateX(-90deg) rotateY(0deg)',
      4: 'rotateX(90deg) rotateY(0deg)',
      5: 'rotateX(0deg) rotateY(90deg)',
      6: 'rotateX(180deg) rotateY(0deg)'
    };

    setTimeout(() => {
      this.diceCube.classList.remove('rolling');
      this.diceCube.style.transform = rotations[value];
      if (callback) callback();
    }, 800);
  }

  showPawnSelection(pawns, callback) {
    this.pawnButtonsContainer.innerHTML = '';
    pawns.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'btn-pawn-select';
      btn.textContent = `Peão ${p.pawnIndex + 1}`;
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
    this.qType.textContent = question.type === 'multiple' ? 'Múltipla Escolha' : 
                             question.type === 'truefalse' ? 'Verdadeiro ou Falso' : 'Ordenar';
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
        btn.className = 'btn-option';
        btn.textContent = opt;
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
      const items = [...question.sequence].sort(() => Math.random() - 0.5);
      items.forEach(text => {
        const div = document.createElement('div');
        div.className = 'order-item';
        div.textContent = text;
        div.draggable = true;
        this.qOrderItems.appendChild(div);
      });
      
      // Implementação simples de drag-n-drop ou clique para ordenar
      let currentOrder = [];
      document.getElementById('btn-confirm-order').onclick = () => {
        const result = Array.from(this.qOrderItems.children).map(c => c.textContent);
        onAnswer(result);
      };
      this.qOrder.classList.remove('hidden');
    }

    this.questionModal.classList.remove('hidden');
  }

  showFeedback(isCorrect, explanation, onContinue) {
    this.qFeedback.textContent = (isCorrect ? "✅ Correto! " : "❌ Incorreto. ") + (explanation || "");
    this.qFeedback.className = `question-feedback ${isCorrect ? 'correct' : 'wrong'}`;
    this.qFeedback.classList.remove('hidden');
    this.btnContinue.classList.remove('hidden');
    this.btnContinue.onclick = () => {
      this.questionModal.classList.add('hidden');
      onContinue();
    };
    if (soundGen) isCorrect ? soundGen.playCorrect() : soundGen.playWrong();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTROLADOR DO JOGO
// ═══════════════════════════════════════════════════════════════════════════

class GameController {
  constructor() {
    this.ui = new GameUI();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('btn-start-game').addEventListener('click', () => this.startGame());
    document.getElementById('btn-roll-dice').addEventListener('click', () => this.handleDiceRoll());
    
    // Sincronizar tamanho do tabuleiro no redimensionamento
    window.addEventListener('resize', () => this.ui.updatePawns(GameState.players));
  }

  startGame() {
    const count = parseInt(document.querySelector('.btn-count.active').dataset.count);
    GameState.players = Array.from({ length: count }, (_, i) => new Player(i, PLAYER_COLORS[i]));
    GameState.currentPlayerIndex = 0;
    GameState.gameActive = true;
    
    document.getElementById('screen-intro').classList.remove('active');
    document.getElementById('screen-game').classList.add('active');
    
    this.ui.renderPlayers(GameState.players, GameState.currentPlayerIndex);
    this.ui.updatePawns(GameState.players);
    this.ui.updateActionLog("O jogo começou! " + GameState.players[0].name + " joga primeiro.");
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
        this.ui.updateActionLog(`Nenhum peão pode mover com ${value}.`);
        setTimeout(() => this.nextTurn(), 1500);
      } else if (movable.length === 1) {
        this.movePawn(movable[0]);
      } else {
        this.ui.showPawnSelection(movable, (p) => this.movePawn(p));
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

  movePawn(pawn) {
    const player = GameState.players[GameState.currentPlayerIndex];
    
    if (pawn.position === -1) {
      pawn.position = 0;
    } else {
      pawn.position += GameState.diceValue;
    }

    if (pawn.position === 52) {
      pawn.finished = true;
      player.score += 100;
    }

    if (soundGen) soundGen.playMove();
    this.ui.updatePawns(GameState.players);
    this.checkCapture(pawn);

    // Regra do 6: ganha outra jogada
    GameState.canRollAgain = (GameState.diceValue === 6);

    // Sistema de Perguntas
    this.triggerQuestion();
  }

  checkCapture(movedPawn) {
    if (movedPawn.position === -1 || movedPawn.finished || SAFE_CELLS.includes(movedPawn.position)) return;

    GameState.players.forEach(player => {
      if (player.index === GameState.currentPlayerIndex) return;
      player.pawns.forEach(pawn => {
        if (pawn.position === movedPawn.position) {
          pawn.reset();
          this.ui.updateActionLog(`Captura! Peão de ${player.name} voltou para a base.`);
        }
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
    }

    this.ui.showFeedback(isCorrect, q.explanation, () => {
      this.checkWinCondition();
    });
  }

  checkWinCondition() {
    const player = GameState.players[GameState.currentPlayerIndex];
    if (player.pawns.every(p => p.finished)) {
      alert(`Parabéns ${player.name}! Você venceu!`);
      location.reload();
    } else {
      if (GameState.canRollAgain) {
        GameState.diceRolled = false;
        GameState.canRollAgain = false;
        this.ui.updateActionLog("Tirou 6! Jogue novamente.");
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
    this.ui.updateActionLog(`Vez de ${GameState.players[GameState.currentPlayerIndex].name}.`);
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.game = new GameController();
  
  // Inicializar som com interação do usuário para evitar bloqueio do navegador
  document.body.addEventListener('click', () => {
    if (window.soundGen && window.soundGen.audioContext && window.soundGen.audioContext.state === 'suspended') {
      window.soundGen.audioContext.resume();
    }
  }, { once: true });
});
