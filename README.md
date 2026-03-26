# 🎲 BioLudo 3D — Jogo Educacional de Divisão Celular

Um jogo de tabuleiro estilo Ludo totalmente interativo em 3D, desenvolvido com **HTML, CSS e JavaScript puro**, com mecânica educacional sobre **Mitose, Meiose e Ciclo Celular**.

![BioLudo 3D](https://img.shields.io/badge/Versão-1.0-blue) ![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎮 Características Principais

✅ **Tabuleiro 3D** com CSS 3D Transforms e Canvas  
✅ **Até 4 jogadores** simultâneos  
✅**Sistema de turno** com dado animado  
✅ **Perguntas educacionais** em 3 tipos:
- Múltipla escolha
- Verdadeiro ou Falso
- Ordenar sequência (drag & drop)

✅ **3 níveis de dificuldade**:
- **Nível 1**: Mitose (10 perguntas)
- **Nível 2**: Meiose (10 perguntas)
- **Nível 3**: Verdadeiro/Falso (12 perguntas)

✅ **Sistema de pontuação** com progressão de níveis  
✅ **Design arcade** inspirado em Street Fighter  
✅ **Animações suaves** e feedback visual  
✅ **Responsivo** em desktop, tablet e mobile  
✅ **Sem dependências externas** — vanilla JavaScript puro

---

## 📋 Como Jogar

1. **Selecione o número de jogadores** (2, 3 ou 4)
2. **Digite os nomes** dos jogadores
3. **Clique em "INICIAR JOGO"**
4. **Na sua vez**:
   - Clique em **"ROLAR DADO"**
   - **Responda a pergunta educacional**
   - Se **acertar**: mova seu peão normalmente
   - Se **errar**: perde o turno
5. **Tire 6** para tirar um peão da base
6. **Leve todos os 4 peões** até a meta (centro) para vencer!

---

## 🚀 Como Rodar Localmente

### Opção 1: Abrir diretamente no navegador

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/ludo-educacional.git
cd ludo-educacional

# Abra o arquivo index.html no navegador
# Opção A: Clique duplo em index.html
# Opção B: Arraste para o navegador
# Opção C: Use um servidor local (recomendado)
```

### Opção 2: Usar um servidor local (recomendado)

#### Com Python 3:
```bash
python -m http.server 8000
# Acesse: http://localhost:8000
```

#### Com Python 2:
```bash
python -m SimpleHTTPServer 8000
# Acesse: http://localhost:8000
```

#### Com Node.js (http-server):
```bash
npm install -g http-server
http-server
# Acesse: http://localhost:8080
```

#### Com VS Code (Live Server):
1. Instale a extensão "Live Server"
2. Clique com botão direito em `index.html`
3. Selecione "Open with Live Server"

---

## 📦 Estrutura do Projeto

```
ludo-educacional/
├── index.html          # Estrutura HTML principal
├── style.css           # Estilos arcade 3D completos
├── script.js           # Motor principal do jogo
├── questions.js        # Banco de perguntas educacionais
├── README.md           # Este arquivo
└── .gitignore          # Arquivos a ignorar no Git
```

### Descrição dos Arquivos

- **index.html**: Contém toda a estrutura da UI, modais de pergunta, tabuleiro 3D e peões
- **style.css**: Design arcade com CSS 3D Transforms, animações, responsividade
- **script.js**: Lógica completa do jogo (turnos, movimentação, seleção de peões)
- **questions.js**: 32 perguntas organizadas em 3 níveis e 3 tipos

---

## 🌐 Deploy no GitHub Pages

### Passo 1: Criar repositório no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Crie um repositório com o nome: `ludo-educacional`
3. **Não** inicialize com README (faremos isso localmente)

### Passo 2: Fazer push do código

```bash
# Clone o repositório vazio
git clone https://github.com/SEU_USUARIO/ludo-educacional.git
cd ludo-educacional

# Copie os arquivos do jogo para esta pasta
# (index.html, style.css, script.js, questions.js, README.md)

# Adicione e faça commit
git add .
git commit -m "Initial commit: BioLudo 3D game"

# Faça push
git push -u origin main
```

### Passo 3: Ativar GitHub Pages

1. Vá para **Settings** do repositório
2. Procure por **Pages** (na barra lateral esquerda)
3. Em **Source**, selecione **main** branch
4. Clique em **Save**

Seu jogo estará disponível em:
```
https://seu-usuario.github.io/ludo-educacional/
```

---

## 🎯 Mecânica Educacional

A cada turno, o jogador **deve responder uma pergunta** antes de poder mover:

### ✅ Se acertar:
- Ganha **10 pontos**
- Pode mover o peão normalmente
- A cada 30 pontos, sobe de nível (Mitose → Meiose → V/F)

### ❌ Se errar:
- Não ganha pontos
- **Perde o turno** (sem movimento)
- Continua no mesmo nível

### 🏆 Bônus:
- Levar um peão à meta: **+50 pontos**
- Vencer o jogo: **Ranking final** com todos os jogadores

---

## 📚 Conteúdo Educacional

### Nível 1 — MITOSE (10 perguntas)
- Fases da mitose (Prófase, Metáfase, Anáfase, Telófase)
- Objetivo e resultado da mitose
- Ciclo celular (G1, S, G2)

### Nível 2 — MEIOSE (10 perguntas)
- Função e fases da meiose
- Crossing-over e variabilidade genética
- Diferenças entre Meiose I e II
- Células haploides vs diploides

### Nível 3 — VERDADEIRO/FALSO (12 perguntas)
- Conceitos mistos de mitose, meiose e ciclo celular
- Validação de conhecimento consolidado

---

## 🎨 Design & Animações

- **Paleta de cores**: Arcade neon (roxo, ciano, amarelo, verde, vermelho)
- **Tipografia**: Orbitron (títulos), Rajdhani (corpo)
- **Efeitos 3D**: CSS 3D Transforms no tabuleiro e dado
- **Animações**:
  - Rolagem do dado com rotação 3D
  - Movimento dos peões com easing cubic-bezier
  - Pulso de seleção de peões
  - Transições suaves de modais

---

## 🛠️ Tecnologias

- **HTML5**: Estrutura semântica
- **CSS3**: Flexbox, Grid, 3D Transforms, Animations
- **JavaScript ES6+**: Classes, Arrow Functions, Modules
- **Canvas API**: Renderização do tabuleiro
- **Sem frameworks**: Vanilla JavaScript puro ✨

---

## 📱 Compatibilidade

| Navegador | Suporte |
|-----------|---------|
| Chrome    | ✅ 100% |
| Firefox   | ✅ 100% |
| Safari    | ✅ 100% |
| Edge      | ✅ 100% |
| Mobile    | ✅ 95%  |

---

## 🐛 Troubleshooting

### O jogo não carrega
- Certifique-se de que todos os 4 arquivos estão na mesma pasta
- Verifique se não há erros no console (F12)
- Tente usar um servidor local em vez de abrir o arquivo diretamente

### Peões não aparecem
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Recarregue a página (Ctrl+F5)

### Perguntas não aparecem
- Verifique se `questions.js` está carregado antes de `script.js`
- Abra o console (F12) e procure por erros

### Tabuleiro 3D não funciona
- Seu navegador pode não suportar CSS 3D Transforms
- Atualize para a versão mais recente do navegador

---

## 📝 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo LICENSE para detalhes.

---

## 👨‍💻 Créditos

Desenvolvido como um projeto educacional para ensinar **Divisão Celular** de forma interativa e divertida.

**Conceitos biológicos**: Baseado no currículo de Biologia do Ensino Médio  
**Design**: Inspirado em jogos arcade clássicos (Street Fighter, Pac-Man)  
**Tecnologia**: HTML5, CSS3, JavaScript ES6+

---

## 🚀 Roadmap Futuro

- [ ] Sistema de som (efeitos e música)
- [ ] Leaderboard online
- [ ] Mais perguntas (expandir banco de dados)
- [ ] Temas adicionais (Genética, Fotossíntese, etc)
- [ ] Modo single-player com IA
- [ ] Suporte a PWA (Progressive Web App)
- [ ] Modo dark/light theme

---

## 💬 Feedback & Contribuições

Encontrou um bug? Tem uma sugestão? Abra uma **Issue** ou faça um **Pull Request**!

---

**Divirta-se aprendendo sobre Divisão Celular! 🧬🎲**
