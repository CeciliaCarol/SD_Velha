const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

let board = Array(9).fill(null);
let players = {}; // Armazena os jogadores e seus marcadores
let currentPlayerIndex = 0; // Índice do jogador atual na lista de jogadores conectados

io.on('connection', (socket) => {
  console.log('to conectado');

  players[socket.id] = {
    mark: Object.keys(players).length === 0 ? 'X' : 'O', // O primeiro jogador é 'X', o segundo é 'O'
  };

  // Define o jogador atual com base no número de jogadores conectados
  if (Object.keys(players).length === 2) {
    // Emite 'init' para ambos os jogadores
    Object.keys(players).forEach((playerId) => {
      io.to(playerId).emit('init', { board, currentPlayer: Object.keys(players)[currentPlayerIndex], mark: players[playerId].mark });
    });
  }

  socket.on('makeMove', (index) => {
    if (!board[index] && socket.id === Object.keys(players)[currentPlayerIndex]) {
      board[index] = players[socket.id].mark;
  
      const winner = checkWinner();
      const isTie = checkTie();
  
      if (winner || isTie) {
        // Emite 'gameOver' com os dados corretos
        io.emit('gameOver', { winner, isTie });
      } else {
        currentPlayerIndex = (currentPlayerIndex + 1) % 2;
        io.emit('updateBoard', { board, currentPlayer: Object.keys(players)[currentPlayerIndex] });
      }
    }
  });

  socket.on('restartGame', () => {
    restartGame();

    Object.keys(players).forEach((playerId) => {
      io.to(playerId).emit('init', { board, currentPlayer: Object.keys(players)[currentPlayerIndex], mark: players[playerId].mark });
    });
  });

  socket.on('disconnect', () => {
    console.log('to saindo...');
    delete players[socket.id];

    // Reinicia o jogo se todos os jogadores desconectarem
    if (Object.keys(players).length === 1) {
      io.emit('restartGame');
    }
  });
});

// Função para verificar se há um vencedor
function checkWinner() {
  const winPatterns = [
    // Linhas
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    // Colunas
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    // Diagonais
    [0, 4, 8], [2, 4, 6]
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // Retorna o marcador do vencedor
    }
  }

  return null; // Nenhum vencedor encontrado
}

// Função para verificar se o jogo está empatado
function checkTie() {
  return board.every((cell) => cell !== null);
}

function restartGame() {
  board = Array(9).fill(null);
  currentPlayerIndex = 0;
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`To escutando nessa porta: ${PORT}`);
});
