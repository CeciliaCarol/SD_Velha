const socket = io('http://10.35.5.21:3000');

let board = [];
let currentPlayer = '';
let myTurn = false;
let mark = '';

// Função para reiniciar o jogo
function restartGame() {
  socket.emit('restartGame');
}

// Função para fazer um movimento
function makeMove(index) {
  if (myTurn && !board[index]) {
    socket.emit('makeMove', index);
  }
}

// Função para reiniciar o jogo
function restartGame() {
  socket.emit('restartGame');
}

// Função para atualizar a interface do usuário
function updateUI() {
  const boardElement = document.getElementById('board');
  boardElement.innerHTML = '';

  for (let i = 0; i < board.length; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';

    // Adiciona um estilo para melhor visualização do conteúdo dentro da célula
    cell.style.display = 'flex';
    cell.style.alignItems = 'center';
    cell.style.justifyContent = 'center';

    cell.textContent = board[i] || ''; // Use board[i] diretamente para obter X ou O

    // Adiciona uma borda à célula para melhor visualização
    cell.style.border = '1px solid #000';

    cell.addEventListener('click', () => makeMove(i));
    boardElement.appendChild(cell);
  }

  // Adiciona uma mensagem indicando de quem é a vez
  const turnMessage = document.createElement('div');
  turnMessage.textContent = myTurn ? 'Sua vez' : `Vez de ${currentPlayer}`;
  boardElement.appendChild(turnMessage);

  // Adiciona o marcador do jogador atual
  const markInfo = document.createElement('div');
  markInfo.textContent = `Você é ${mark}`;
  boardElement.appendChild(markInfo);
}

// Configuração dos ouvintes de eventos Socket.io
socket.on('init', (data) => {
  board = data.board;
  currentPlayer = data.currentPlayer;
  myTurn = socket.id === currentPlayer;
  mark = data.mark;
  updateUI();
});

socket.on('updateBoard', (data) => {
  board = data.board;
  currentPlayer = data.currentPlayer;
  myTurn = socket.id === currentPlayer;
  updateUI();
});

socket.on('gameOver', (data) => {
  const { winner, isTie } = data;

  const notificationElement = document.createElement('div');
  notificationElement.className = 'notification';

  if (winner) {
    notificationElement.textContent = `O jogador ${winner} venceu!`;
  } else if (isTie) {
    notificationElement.textContent = 'O jogo empatou!';
  }

  document.body.appendChild(notificationElement);

  // Aguarde um momento e remova a notificação
  setTimeout(() => {
    document.body.removeChild(notificationElement);
  }, 3000);

  // Atualiza o tabuleiro e as informações do jogador
  updateUI();
});
