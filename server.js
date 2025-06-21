import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: true, // Allow all origins for development
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Store active games
const games = new Map();
const players = new Map(); // socketId -> playerInfo

// Helper function to generate game ID
function generateGameId() {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Helper function to generate player ID
function generatePlayerId() {
  return 'player_' + Math.random().toString(36).substr(2, 9);
}

// Initial game state template
function createInitialGameState() {
  return {
    currentRound: 1,
    maxRounds: 20,
    timeRemaining: { hours: 0, minutes: 1, seconds: 0 },
    players: [],
    marketChanges: [
      { resource: 'gold', change: 0, percentage: '+0%' },
      { resource: 'water', change: 0, percentage: '+0%' },
      { resource: 'oil', change: 0, percentage: '+0%' }
    ],
    recentActions: [],
    status: 'waiting', // waiting, playing, finished
    host: null,
    timerActive: false
  };
}

// Create initial player state
function createPlayer(playerId, playerName, socketId) {
  return {
    id: playerId,
    name: playerName,
    socketId: socketId,
    tokens: 1000,
    assets: { gold: 50, water: 25, oil: 10 },
    totalAssets: 85,
    connected: true
  };
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create a new game
  socket.on('create-game', (data) => {
    const { gameName, playerName } = data;
    const gameId = generateGameId();
    const playerId = generatePlayerId();
    
    const gameState = createInitialGameState();
    const player = createPlayer(playerId, playerName, socket.id);
    
    gameState.players.push(player);
    gameState.host = playerId;
    
    games.set(gameId, gameState);
    players.set(socket.id, { gameId, playerId, playerName });
    
    // Join the game room
    socket.join(gameId);
    
    socket.emit('game-created', { gameId, playerId });
    socket.emit('game-state', gameState);
    
    console.log(`Game created: ${gameId} by ${playerName}`);
  });

  // Join an existing game
  socket.on('join-game', (data) => {
    const { gameId, playerName } = data;
    const game = games.get(gameId);
    
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    
    if (game.players.length >= 4) {
      socket.emit('error', { message: 'Game is full' });
      return;
    }
    
    if (game.status !== 'waiting') {
      socket.emit('error', { message: 'Game already in progress' });
      return;
    }
    
    const playerId = generatePlayerId();
    const player = createPlayer(playerId, playerName, socket.id);
    
    game.players.push(player);
    games.set(gameId, game);
    players.set(socket.id, { gameId, playerId, playerName });
    
    // Join the game room
    socket.join(gameId);
    
    // Notify all players in the game
    socket.emit('game-joined', { gameId, playerId });
    io.to(gameId).emit('game-state', game);
    io.to(gameId).emit('player-joined', { playerName });
    
    console.log(`${playerName} joined game: ${gameId}`);
  });

  // Start the game
  socket.on('start-game', () => {
    const playerInfo = players.get(socket.id);
    if (!playerInfo) return;
    
    const game = games.get(playerInfo.gameId);
    if (!game || game.host !== playerInfo.playerId) {
      socket.emit('error', { message: 'Only the host can start the game' });
      return;
    }
    
    if (game.players.length < 2) {
      socket.emit('error', { message: 'Need at least 2 players to start' });
      return;
    }
    
    game.status = 'playing';
    game.timerActive = true;
    games.set(playerInfo.gameId, game);
    
    io.to(playerInfo.gameId).emit('game-started');
    io.to(playerInfo.gameId).emit('game-state', game);
    
    // Start the game timer
    startGameTimer(playerInfo.gameId);
    
    console.log(`Game started: ${playerInfo.gameId}`);
  });

  // Handle player actions
  socket.on('player-action', (data) => {
    const playerInfo = players.get(socket.id);
    if (!playerInfo) return;
    
    const game = games.get(playerInfo.gameId);
    if (!game || game.status !== 'playing') return;
    
    const { action, resource, amount, targetPlayer } = data;
    const player = game.players.find(p => p.id === playerInfo.playerId);
    
    if (!player) return;
    
    let actionText = '';
    const resourcePrices = { gold: 10, water: 15, oil: 25 };
    const price = resourcePrices[resource] * amount;
    
    switch (action) {
      case 'buy':
        if (player.tokens >= price) {
          player.tokens -= price;
          player.assets[resource] += amount;
          actionText = `${player.name} bought ${amount} ${resource.charAt(0).toUpperCase() + resource.slice(1)} for ${price} tokens`;
        }
        break;
        
      case 'sell':
        if (player.assets[resource] >= amount) {
          const sellPrice = Math.floor(price * 0.8);
          player.tokens += sellPrice;
          player.assets[resource] -= amount;
          actionText = `${player.name} sold ${amount} ${resource.charAt(0).toUpperCase() + resource.slice(1)} for ${sellPrice} tokens`;
        }
        break;
        
      case 'burn':
        if (player.assets[resource] >= amount) {
          player.assets[resource] -= amount;
          // Update market changes
          const marketChange = game.marketChanges.find(m => m.resource === resource);
          if (marketChange) {
            marketChange.change += amount * 3;
            marketChange.percentage = `${marketChange.change > 0 ? '+' : ''}${marketChange.change}%`;
          }
          actionText = `${player.name} burned ${amount} ${resource.charAt(0).toUpperCase() + resource.slice(1)} to boost market price`;
        }
        break;
        
      case 'sabotage':
        if (player.tokens >= 100 && targetPlayer) {
          player.tokens -= 100;
          const target = game.players.find(p => p.name === targetPlayer);
          if (target) {
            target.assets[resource] = Math.max(0, target.assets[resource] - amount);
            target.totalAssets = target.assets.gold + target.assets.water + target.assets.oil;
            actionText = `${player.name} sabotaged ${target.name}'s ${resource.charAt(0).toUpperCase() + resource.slice(1)} reserves`;
          }
        }
        break;
    }
    
    // Update player's total assets
    player.totalAssets = player.assets.gold + player.assets.water + player.assets.oil;
    
    // Add action to recent actions
    if (actionText) {
      game.recentActions.unshift(actionText);
      game.recentActions = game.recentActions.slice(0, 10); // Keep only last 10 actions
    }
    
    games.set(playerInfo.gameId, game);
    io.to(playerInfo.gameId).emit('game-state', game);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const playerInfo = players.get(socket.id);
    if (playerInfo) {
      const game = games.get(playerInfo.gameId);
      if (game) {
        // Mark player as disconnected
        const player = game.players.find(p => p.id === playerInfo.playerId);
        if (player) {
          player.connected = false;
        }
        
        // If host disconnects, assign new host
        if (game.host === playerInfo.playerId) {
          const connectedPlayers = game.players.filter(p => p.connected);
          if (connectedPlayers.length > 0) {
            game.host = connectedPlayers[0].id;
          }
        }
        
        games.set(playerInfo.gameId, game);
        io.to(playerInfo.gameId).emit('game-state', game);
        io.to(playerInfo.gameId).emit('player-disconnected', { playerName: playerInfo.playerName });
      }
      
      players.delete(socket.id);
    }
  });
});

// Game timer function
function startGameTimer(gameId) {
  const timer = setInterval(() => {
    const game = games.get(gameId);
    if (!game || !game.timerActive) {
      clearInterval(timer);
      return;
    }
    
    const { hours, minutes, seconds } = game.timeRemaining;
    let newSeconds = seconds - 1;
    let newMinutes = minutes;
    let newHours = hours;
    
    if (newSeconds < 0) {
      newSeconds = 59;
      newMinutes -= 1;
    }
    if (newMinutes < 0) {
      newMinutes = 59;
      newHours -= 1;
    }
    
    if (newHours < 0) {
      // Round ended
      game.currentRound += 1;
      
      if (game.currentRound > game.maxRounds) {
        // Game finished
        game.status = 'finished';
        game.timerActive = false;
        io.to(gameId).emit('game-finished', game);
      } else {
        // New round
        game.timeRemaining = { hours: 0, minutes: 1, seconds: 0 };
        game.recentActions = [];
        
        // Generate new market trends
        game.marketChanges = game.marketChanges.map(change => {
          const randomChange = Math.floor(Math.random() * 40) - 20;
          return {
            ...change,
            change: randomChange,
            percentage: `${randomChange > 0 ? '+' : ''}${randomChange}%`
          };
        });
      }
    } else {
      game.timeRemaining = { hours: newHours, minutes: newMinutes, seconds: newSeconds };
    }
    
    games.set(gameId, game);
    io.to(gameId).emit('game-state', game);
  }, 1000);
}

// Market fluctuations
setInterval(() => {
  games.forEach((game, gameId) => {
    if (game.status === 'playing') {
      game.marketChanges = game.marketChanges.map(change => {
        const fluctuation = Math.floor(Math.random() * 10) - 5;
        const newChange = Math.max(-50, Math.min(50, change.change + fluctuation));
        return {
          ...change,
          change: newChange,
          percentage: `${newChange > 0 ? '+' : ''}${newChange}%`
        };
      });
      
      games.set(gameId, game);
      io.to(gameId).emit('game-state', game);
    }
  });
}, 5000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access from other devices: http://YOUR_IP_ADDRESS:${PORT}`);
});

