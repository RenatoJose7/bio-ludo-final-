# 🎲 BioLudo — Documento de Problemas e Soluções

## Status Atual
O jogo está no GitHub em: **https://github.com/RenatoJose7/bio-ludo-3d**

---

## ❌ PROBLEMAS IDENTIFICADOS

### 1. **Alinhamento do Tabuleiro Desconfigurado**
**Problema:** O tabuleiro não está perfeitamente alinhado com a imagem de fundo. Os peões não caem exatamente no centro das casas.

**Causa Raiz:** 
- O Canvas e a imagem de fundo não estão sincronizados no mesmo tamanho
- O sistema de coordenadas (grid 15x15) não mapeia corretamente para os pixels da imagem
- Falta de sincronização entre `cellSize` e o tamanho real da imagem

**Solução Necessária:**
```javascript
// Implementar sincronização perfeita:
1. Forçar o board-wrapper a ser um QUADRADO PERFEITO
2. Calcular cellSize = boardSize / 15 (onde boardSize é sempre quadrado)
3. Mapear cada posição (0-51) para coordenadas (x, y) exatas
4. Usar transform: translate(-50%, -50%) para centralizar peões
5. Testar com múltiplas resoluções de tela
```

---

### 2. **Dado Sem Animação 3D Real**
**Problema:** O dado não gira de verdade. Ele apenas muda de número sem efeito visual de rotação.

**Causa Raiz:**
- A animação CSS `diceRoll` não está sendo aplicada corretamente
- O dado não tem faces 3D (apenas um quadrado com número)
- Falta sincronização entre a animação e o resultado final

**Solução Necessária:**
```css
/* Opção 1: Dado 3D com CSS Transforms */
.dice {
  width: 70px;
  height: 70px;
  position: relative;
  transform-style: preserve-3d;
  perspective: 1000px;
}

.dice.rolling {
  animation: diceRoll3D 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes diceRoll3D {
  0% { transform: rotateX(0) rotateY(0) rotateZ(0); }
  25% { transform: rotateX(180deg) rotateY(90deg) rotateZ(45deg); }
  50% { transform: rotateX(360deg) rotateY(180deg) rotateZ(90deg); }
  75% { transform: rotateX(540deg) rotateY(270deg) rotateZ(135deg); }
  100% { transform: rotateX(720deg) rotateY(360deg) rotateZ(180deg); }
}

/* Opção 2: Usar Canvas para desenhar dado 3D */
// Desenhar 6 faces do cubo e rotacionar baseado no resultado
```

---

### 3. **Peões Sobrepostos na Mesma Casa**
**Problema:** Quando 2 ou mais peões estão na mesma casa, eles ficam sobrepostos, impossível de ver quantos há.

**Causa Raiz:**
- O método `updatePosition()` não conta quantos peões estão na mesma posição
- Falta de sistema de "stack" ou distribuição de peões

**Solução Necessária:**
```javascript
function updatePosition(pawn, player) {
  // Contar peões na mesma posição
  let peonsInCell = 0;
  let pawnIndexInCell = 0;
  
  for (const p of GameState.players) {
    for (const pn of p.pawns) {
      if (pn.position === pawn.position && !pn.finished) {
        if (pn.id === pawn.id) pawnIndexInCell = peonsInCell;
        peonsInCell++;
      }
    }
  }
  
  // Distribuir em grid 2x2 se houver múltiplos
  const offsetSize = 8;
  const offsetX = (pawnIndexInCell % 2) * offsetSize - offsetSize / 2;
  const offsetY = Math.floor(pawnIndexInCell / 2) * offsetSize - offsetSize / 2;
  
  element.style.left = `${x + offsetX}px`;
  element.style.top = `${y + offsetY}px`;
}
```

---

### 4. **Cores dos Jogadores Trocadas**
**Problema:** As cores não correspondem à imagem do tabuleiro.

**Mapeamento Correto:**
```javascript
const PLAYER_COLORS = [
  { name: 'Vermelho', hex: '#E63946', index: 0 },   // Superior esquerdo
  { name: 'Azul', hex: '#457B9D', index: 1 },       // Superior direito
  { name: 'Amarelo', hex: '#F4A261', index: 2 },    // Inferior direito
  { name: 'Verde', hex: '#2A9D8F', index: 3 }       // Inferior esquerdo
];
```

---

### 5. **Sistema de Perguntas Não Funciona Corretamente**
**Problema:** O modal de perguntas não aparece ou não valida respostas corretamente.

**Causa Raiz:**
- Falta de sincronização entre `handleAnswer()` e `continueTurn()`
- Validação de resposta incorreta para tipo "order"
- Modal não está visível ou não está sendo fechado

**Solução Necessária:**
```javascript
// Validar resposta corretamente
function checkAnswer(question, answer) {
  if (question.type === 'multiple') {
    return answer === question.answer;
  } else if (question.type === 'truefalse') {
    return answer === question.answer;
  } else if (question.type === 'order') {
    // Comparar arrays corretamente
    return JSON.stringify(answer.sort()) === JSON.stringify(question.sequence.sort());
  }
  return false;
}

// Mostrar modal com z-index correto
#question-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
```

---

### 6. **Efeitos Sonoros Não Funcionam**
**Problema:** Os sons não tocam ou causam erro no console.

**Causa Raiz:**
- Web Audio API pode estar bloqueada por CORS
- `soundGen` não está inicializado antes de ser usado
- Falta de tratamento de erro para navegadores sem suporte

**Solução Necessária:**
```javascript
// Inicializar SoundGenerator com segurança
class SoundGenerator {
  constructor() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API não disponível');
      this.audioContext = null;
    }
  }

  playDiceRoll() {
    if (!this.audioContext) return;
    // ... código de som
  }
}

// Inicializar DEPOIS que o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  soundGen = new SoundGenerator();
});
```

---

### 7. **Regras do Jogo Não Implementadas Corretamente**
**Problema:** 
- Peão não sai da base com 6
- Captura de peão adversário não funciona
- Jogada extra (6) não funciona
- Casas seguras não protegem

**Solução Necessária:**
```javascript
// Saída da base
if (pawn.position === -1 && diceValue !== 6) {
  return false; // Não pode sair sem 6
}

// Captura
function checkCapture(position) {
  for (const player of GameState.players) {
    for (const pawn of player.pawns) {
      if (pawn.position === position && !board.isSafeCell(position)) {
        pawn.reset(); // Volta para base
      }
    }
  }
}

// Jogada extra
if (diceValue === 6) {
  // Permitir outro lançamento após mover um peão
  GameState.canRollAgain = true;
}

// Casas seguras (marcadas com estrela)
const SAFE_CELLS = [0, 8, 13, 21, 26, 34, 39, 47, 52];
```

---

### 8. **Responsividade Quebrada**
**Problema:** O jogo não se adapta bem a diferentes tamanhos de tela.

**Solução Necessária:**
```css
/* Forçar aspect ratio quadrado */
.board-wrapper {
  width: 100%;
  max-width: 600px;
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  position: relative;
  background-image: url('tabuleiro.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

/* Peões com tamanho relativo */
.pawn {
  width: calc(600px / 20); /* 30px em tela padrão */
  height: calc(600px / 20);
  /* ... */
}
```

---

## ✅ SOLUÇÕES PRIORITÁRIAS

### **Prioridade 1 (CRÍTICA):**
1. ✅ Sincronizar alinhamento do tabuleiro
2. ✅ Implementar distribuição de peões
3. ✅ Corrigir cores dos jogadores

### **Prioridade 2 (ALTA):**
4. ✅ Implementar dado 3D com animação real
5. ✅ Corrigir sistema de perguntas
6. ✅ Implementar regras oficiais (saída com 6, captura, etc)

### **Prioridade 3 (MÉDIA):**
7. ✅ Implementar efeitos sonoros com segurança
8. ✅ Melhorar responsividade
9. ✅ Adicionar feedback visual melhorado

---

## 🔧 COMO CORRIGIR

### Passo 1: Clonar o repositório
```bash
git clone https://github.com/RenatoJose7/bio-ludo-3d.git
cd bio-ludo-3d
```

### Passo 2: Criar arquivo corrigido
Criar `ludo-game-fixed.js` com todas as correções acima aplicadas

### Passo 3: Atualizar HTML
```html
<script src="ludo-game-fixed.js"></script>
```

### Passo 4: Testar localmente
```bash
python3 -m http.server 8000
# Acessar http://localhost:8000
```

### Passo 5: Fazer push das correções
```bash
git add .
git commit -m "Fix: Corrigir alinhamento, dado 3D, distribuição de peões e regras"
git push origin main
```

---

## 📋 CHECKLIST DE TESTES

- [ ] Tabuleiro alinhado perfeitamente com a imagem
- [ ] Peões caem no centro das casas
- [ ] Dado gira com animação 3D
- [ ] Múltiplos peões na mesma casa ficam visíveis
- [ ] Cores correspondem à imagem
- [ ] Perguntas aparecem e validam respostas
- [ ] Peão sai da base apenas com 6
- [ ] Captura funciona (peão adversário volta)
- [ ] Jogada extra funciona (tirou 6)
- [ ] Casas seguras protegem
- [ ] Sons tocam sem erros
- [ ] Jogo funciona em celular (responsivo)
- [ ] Vitória é detectada corretamente

---

## 📞 SUPORTE

Se encontrar dúvidas ou problemas durante a implementação, consulte:
- Documentação do Ludo: https://pt.wikipedia.org/wiki/Ludo
- MDN Web Docs (Canvas, CSS 3D): https://developer.mozilla.org/
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

---

**Última atualização:** 26 de Março de 2026
**Status:** Pronto para correções
**Repositório:** https://github.com/RenatoJose7/bio-ludo-3d
