import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

interface PeerContextType {
  isHost: boolean;
  gameId: string | null;
  playerId: string | null;
  playerName: string | null;
  connected: boolean;
  peers: Map<string, RTCPeerConnection>;
  gameState: any;
  createGame: (gameName: string, playerName: string, isPrivate: boolean) => void;
  joinGame: (gameId: string, playerName: string) => void;
  startGame: () => void;
  sendAction: (action: any) => void;
  exitGame: () => void;
  setGameInfo: (gameId: string, playerId: string, playerName: string) => void;
  clearGameInfo: () => void;
}

const PeerContext = createContext<PeerContextType | undefined>(undefined);

export const usePeer = () => {
  const context = useContext(PeerContext);
  if (context === undefined) {
    throw new Error('usePeer must be used within a PeerProvider');
  }
  return context;
};

interface PeerProviderProps {
  children: React.ReactNode;
}

// Helper functions
function generateGameId() {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
}

function generatePlayerId() {
  return 'player_' + Math.random().toString(36).substr(2, 9);
}

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
    status: 'waiting',
    host: null,
    timerActive: false,
    gameName: '',
    isPrivate: false,
    createdAt: new Date()
  };
}

function createPlayer(playerId: string, playerName: string) {
  return {
    id: playerId,
    name: playerName,
    tokens: 1000,
    assets: { gold: 50, water: 25, oil: 10 },
    totalAssets: 85,
    connected: true
  };
}

export const PeerProvider: React.FC<PeerProviderProps> = ({ children }) => {
  const [isHost, setIsHost] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [connected, setConnected] = useState(true); // Always connected in client-side mode
  const [peers, setPeers] = useState<Map<string, RTCPeerConnection>>(new Map());
  const [gameState, setGameState] = useState<any>(null);
  const [dataChannels, setDataChannels] = useState<Map<string, RTCDataChannel>>(new Map());
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const marketTimerRef = useRef<NodeJS.Timeout | null>(null);

  // WebRTC configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Broadcast message to all peers
  const broadcastMessage = (message: any) => {
    const messageStr = JSON.stringify(message);
    dataChannels.forEach((channel) => {
      if (channel.readyState === 'open') {
        try {
          channel.send(messageStr);
        } catch (error) {
          console.error('Failed to send message:', error);
        }
      }
    });
  };

  // Handle incoming messages
  const handleMessage = (message: any, senderId: string) => {
    switch (message.type) {
      case 'game-state':
        setGameState(message.data);
        break;
      
      case 'player-action':
        if (isHost) {
          handlePlayerAction(message.data, senderId);
        }
        break;
        
      case 'player-joined':
        if (isHost) {
          // Add player to game state and broadcast update
          const newPlayer = createPlayer(message.data.playerId, message.data.playerName);
          setGameState((prev: any) => {
            if (!prev) return prev;
            const updated = {
              ...prev,
              players: [...prev.players, newPlayer]
            };
            // Broadcast updated game state
            setTimeout(() => broadcastMessage({ type: 'game-state', data: updated }), 100);
            return updated;
          });
        }
        break;
        
      case 'start-game':
        if (message.data.hostId === gameState?.host) {
          startGameTimer();
          setGameState((prev: any) => ({
            ...prev,
            status: 'playing',
            timerActive: true
          }));
        }
        break;
    }
  };

  // Handle player actions (host only)
  const handlePlayerAction = (actionData: any, senderId: string) => {
    if (!isHost || !gameState) return;

    const { action, resource, amount, targetPlayer } = actionData;
    const player = gameState.players.find((p: any) => p.id === senderId);
    
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
          const marketChange = gameState.marketChanges.find((m: any) => m.resource === resource);
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
          const target = gameState.players.find((p: any) => p.name === targetPlayer);
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
      gameState.recentActions.unshift(actionText);
      gameState.recentActions = gameState.recentActions.slice(0, 10);
    }
    
    // Broadcast updated game state
    setGameState({ ...gameState });
    broadcastMessage({ type: 'game-state', data: gameState });
  };

  // Game timer (host only but saves to localStorage for sync)
  const startGameTimer = () => {
    if (!isHost) return;
    
    gameTimerRef.current = setInterval(() => {
      setGameState((prevState: any) => {
        if (!prevState || !prevState.timerActive) {
          if (gameTimerRef.current) clearInterval(gameTimerRef.current);
          return prevState;
        }

        const { hours, minutes, seconds } = prevState.timeRemaining;
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
        
        const updatedState = { ...prevState };
        
        if (newHours < 0) {
          // Round ended
          updatedState.currentRound += 1;
          
          if (updatedState.currentRound > updatedState.maxRounds) {
            // Game finished - calculate winner with proper scoring
            updatedState.status = 'finished';
            updatedState.timerActive = false;
            
            // Calculate final scores with proper resource values
            const playersWithScores = updatedState.players.map((player: any) => {
              const goldValue = player.assets.gold * (10 + (updatedState.marketChanges.find((m: any) => m.resource === 'gold')?.change || 0));
              const waterValue = player.assets.water * (15 + (updatedState.marketChanges.find((m: any) => m.resource === 'water')?.change || 0));
              const oilValue = player.assets.oil * (25 + (updatedState.marketChanges.find((m: any) => m.resource === 'oil')?.change || 0));
              const finalScore = Math.floor(player.tokens + goldValue + waterValue + oilValue);
              
              return {
                ...player,
                finalScore,
                goldValue: Math.floor(goldValue),
                waterValue: Math.floor(waterValue),
                oilValue: Math.floor(oilValue)
              };
            }).sort((a: any, b: any) => b.finalScore - a.finalScore);
            
            updatedState.players = playersWithScores;
            updatedState.winner = playersWithScores[0];
            updatedState.rankings = playersWithScores;
            
            // Clear recent actions since game is finished
            updatedState.recentActions = [];
            
            if (gameTimerRef.current) clearInterval(gameTimerRef.current);
            if (marketTimerRef.current) clearInterval(marketTimerRef.current);
            
            console.log('Game finished! Winner:', updatedState.winner);
            console.log('Final rankings:', playersWithScores);
            
            // Auto-transition to waiting room after 10 seconds to allow rematch
            setTimeout(() => {
              setGameState((prevState: any) => {
                if (!prevState || prevState.status !== 'finished') return prevState;
                
                const resetState = {
                  ...prevState,
                  status: 'waiting',
                  currentRound: 1,
                  timeRemaining: { hours: 0, minutes: 1, seconds: 0 },
                  timerActive: false,
                  // Reset all players to starting values but keep same team
                  players: prevState.players.map((player: any) => ({
                    id: player.id,
                    name: player.name,
                    tokens: 1000,
                    assets: { gold: 50, water: 25, oil: 10 },
                    totalAssets: 85,
                    connected: true
                  })),
                  marketChanges: [
                    { resource: 'gold', change: 0, percentage: '+0%' },
                    { resource: 'water', change: 0, percentage: '+0%' },
                    { resource: 'oil', change: 0, percentage: '+0%' }
                  ],
                  recentActions: [],
                  // Keep winner info for a brief moment
                  previousWinner: prevState.winner,
                  winner: undefined,
                  rankings: undefined
                };
                
                console.log('Game reset to waiting room for rematch');
                return resetState;
              });
            }, 10000); // 10 second delay
          } else {
            // New round - reset timer but keep actions until they can be saved
            updatedState.timeRemaining = { hours: 0, minutes: 1, seconds: 0 };
            
            // Save current round actions to history before clearing
            const previousRound = updatedState.currentRound - 1;
            if (previousRound > 0 && updatedState.recentActions && updatedState.recentActions.length > 0) {
              // Store actions from the previous round
              if (!updatedState.actionHistory) {
                updatedState.actionHistory = {};
              }
              updatedState.actionHistory[previousRound] = [...updatedState.recentActions];
            }
            
            // Now clear recent actions for the new round
            updatedState.recentActions = [];
            
            // Generate new market trends
            updatedState.marketChanges = updatedState.marketChanges.map((change: any) => {
              const randomChange = Math.floor(Math.random() * 40) - 20;
              return {
                ...change,
                change: randomChange,
                percentage: `${randomChange > 0 ? '+' : ''}${randomChange}%`
              };
            });
          }
        } else {
          updatedState.timeRemaining = { hours: newHours, minutes: newMinutes, seconds: newSeconds };
        }
        
        // Auto-save will handle localStorage and sync
        return updatedState;
      });
    }, 1000);
  };

  // Market fluctuations (host only)
  const startMarketTimer = () => {
    if (!isHost) return;
    
    marketTimerRef.current = setInterval(() => {
      setGameState((prevState: any) => {
        if (!prevState || prevState.status !== 'playing') return prevState;
        
        const updatedState = {
          ...prevState,
          marketChanges: prevState.marketChanges.map((change: any) => {
            const fluctuation = Math.floor(Math.random() * 10) - 5;
            const newChange = Math.max(-50, Math.min(50, change.change + fluctuation));
            return {
              ...change,
              change: newChange,
              percentage: `${newChange > 0 ? '+' : ''}${newChange}%`
            };
          })
        };
        
        // Broadcast updated state
        broadcastMessage({ type: 'game-state', data: updatedState });
        return updatedState;
      });
    }, 5000);
  };

  // Create new game (becomes host)
  const createGame = (gameName: string, playerName: string, isPrivate: boolean) => {
    const newGameId = generateGameId();
    const newPlayerId = generatePlayerId();
    
    const initialState = createInitialGameState();
    const player = createPlayer(newPlayerId, playerName);
    
    initialState.players.push(player);
    initialState.host = newPlayerId;
    initialState.gameName = gameName;
    initialState.isPrivate = isPrivate;
    
    setGameId(newGameId);
    setPlayerId(newPlayerId);
    setPlayerName(playerName);
    setIsHost(true);
    setGameState(initialState);
    setConnected(true);
    
    // Store game in localStorage for joining
    const gameInfo = {
      id: newGameId,
      name: gameName,
      isPrivate,
      createdAt: new Date().toISOString()
    };
    
    const publicGames = JSON.parse(localStorage.getItem('publicGames') || '[]');
    if (!isPrivate) {
      publicGames.push(gameInfo);
      localStorage.setItem('publicGames', JSON.stringify(publicGames));
    }
    localStorage.setItem(`game_${newGameId}`, JSON.stringify(initialState));
    
    // Start market timer for host
    startMarketTimer();
  };

  // Join existing game
  const joinGame = async (gameId: string, playerName: string) => {
    try {
      // Try to get game from localStorage first
      const storedGame = localStorage.getItem(`game_${gameId}`);
      if (!storedGame) {
        throw new Error('Game not found');
      }
      
      const gameData = JSON.parse(storedGame);
      if (gameData.players.length >= 4) {
        throw new Error('Game is full');
      }
      
      if (gameData.status !== 'waiting') {
        throw new Error('Game already in progress');
      }
      
      // Check if player name already exists
      const existingPlayer = gameData.players.find((p: any) => p.name === playerName);
      if (existingPlayer) {
        throw new Error('Player name already taken');
      }
      
      const newPlayerId = generatePlayerId();
      setGameId(gameId);
      setPlayerId(newPlayerId);
      setPlayerName(playerName);
      setIsHost(false);
      setConnected(true);
      
      // Create new player and add to game
      const newPlayer = createPlayer(newPlayerId, playerName);
      const updatedGameData = {
        ...gameData,
        players: [...gameData.players, newPlayer]
      };
      
      // Set game state (auto-save will handle localStorage and events)
      setGameState(updatedGameData);
      
      console.log(`Player ${playerName} joined game ${gameId}`, updatedGameData);
      
    } catch (error) {
      console.error('Failed to join game:', error);
      throw error;
    }
  };

  // Start game (host only)
  const startGame = () => {
    if (!isHost || !gameState) return;
    
    if (gameState.players.length < 2) {
      throw new Error('Need at least 2 players to start');
    }
    
    const updatedState = {
      ...gameState,
      status: 'playing',
      timerActive: true
    };
    
    setGameState(updatedState);
    localStorage.setItem(`game_${gameId}`, JSON.stringify(updatedState));
    
    // Start timers
    startGameTimer();
    broadcastMessage({ type: 'start-game', data: { hostId: playerId } });
  };

  // Process action for localStorage-based game
  const processAction = (actionData: any, playerIdToProcess: string) => {
    if (!gameState) return;

    const { action, resource, amount, targetPlayer } = actionData;
    const player = gameState.players.find((p: any) => p.id === playerIdToProcess);
    
    if (!player) return;

    let actionText = '';
    const resourcePrices = { gold: 10, water: 15, oil: 25 };
    const price = resourcePrices[resource] * amount;
    let actionSuccessful = false;

    // Create a copy of the game state for updating
    const updatedGameState = { ...gameState };
    const updatedPlayer = updatedGameState.players.find((p: any) => p.id === playerIdToProcess);
    
    if (!updatedPlayer) return;

    switch (action) {
      case 'buy':
        if (updatedPlayer.tokens >= price) {
          updatedPlayer.tokens -= price;
          updatedPlayer.assets[resource] += amount;
          actionText = `${updatedPlayer.name} bought ${amount} ${resource.charAt(0).toUpperCase() + resource.slice(1)} for ${price} tokens`;
          actionSuccessful = true;
        }
        break;
        
      case 'sell':
        if (updatedPlayer.assets[resource] >= amount) {
          const sellPrice = Math.floor(price * 0.8);
          updatedPlayer.tokens += sellPrice;
          updatedPlayer.assets[resource] -= amount;
          actionText = `${updatedPlayer.name} sold ${amount} ${resource.charAt(0).toUpperCase() + resource.slice(1)} for ${sellPrice} tokens`;
          actionSuccessful = true;
        }
        break;
        
      case 'burn':
        if (updatedPlayer.assets[resource] >= amount) {
          updatedPlayer.assets[resource] -= amount;
          const marketChange = updatedGameState.marketChanges.find((m: any) => m.resource === resource);
          if (marketChange) {
            marketChange.change += amount * 3;
            marketChange.percentage = `${marketChange.change > 0 ? '+' : ''}${marketChange.change}%`;
          }
          actionText = `${updatedPlayer.name} burned ${amount} ${resource.charAt(0).toUpperCase() + resource.slice(1)} to boost market price (+${amount * 3}%)`;
          actionSuccessful = true;
        }
        break;
        
      case 'sabotage':
        if (updatedPlayer.tokens >= 100 && targetPlayer) {
          updatedPlayer.tokens -= 100;
          const target = updatedGameState.players.find((p: any) => p.name === targetPlayer);
          if (target && target.assets[resource] > 0) {
            const amountDestroyed = Math.min(amount, target.assets[resource]);
            target.assets[resource] -= amountDestroyed;
            target.totalAssets = target.assets.gold + target.assets.water + target.assets.oil;
            actionText = `${updatedPlayer.name} sabotaged ${target.name}'s ${amountDestroyed} ${resource.charAt(0).toUpperCase() + resource.slice(1)}`;
            actionSuccessful = true;
          }
        }
        break;
    }

    if (actionSuccessful) {
      // Update player's total assets
      updatedPlayer.totalAssets = updatedPlayer.assets.gold + updatedPlayer.assets.water + updatedPlayer.assets.oil;
      
      // Add action to recent actions
      if (actionText) {
        updatedGameState.recentActions = [actionText, ...updatedGameState.recentActions.slice(0, 9)];
      }
      
      // Update game state (this will trigger auto-save and sync)
      setGameState(updatedGameState);
      
      console.log('Action processed:', actionText);
      return true;
    }
    
    return false;
  };

  // Send action
  const sendAction = (actionData: any) => {
    // In localStorage mode, all players process actions directly
    const success = processAction(actionData, playerId!);
    if (!success) {
      console.warn('Action failed:', actionData);
    }
  };

  // Exit game
  const exitGame = () => {
    // Clean up timers
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    if (marketTimerRef.current) {
      clearInterval(marketTimerRef.current);
      marketTimerRef.current = null;
    }
    
    // Close peer connections
    peers.forEach(peer => peer.close());
    setPeers(new Map());
    setDataChannels(new Map());
    
    // Reset state
    clearGameInfo();
    setGameState(null);
    setIsHost(false);
    setConnected(false);
  };

  const setGameInfo = (gameId: string, playerId: string, playerName: string) => {
    setGameId(gameId);
    setPlayerId(playerId);
    setPlayerName(playerName);
  };

  const clearGameInfo = () => {
    setGameId(null);
    setPlayerId(null);
    setPlayerName(null);
  };

  // Auto-save game state to localStorage whenever it changes
  useEffect(() => {
    if (gameId && gameState) {
      try {
        localStorage.setItem(`game_${gameId}`, JSON.stringify(gameState));
        console.log('Auto-saved game state for', gameId);
        
        // Dispatch custom event to notify other tabs in the same origin
        window.dispatchEvent(new CustomEvent('gameStateUpdate', {
          detail: { gameId, gameState }
        }));
      } catch (error) {
        console.error('Failed to auto-save game state:', error);
      }
    }
  }, [gameId, gameState]);

  // Real-time localStorage synchronization with improved connectivity
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Only listen to game state changes for our current game
      if (!gameId || !e.key || !e.key.startsWith(`game_${gameId}`)) return;
      
      if (e.newValue) {
        try {
          const updatedGameState = JSON.parse(e.newValue);
          // Only sync if the state is actually different to prevent loops
          const currentStateStr = JSON.stringify(gameState);
          const updatedStateStr = JSON.stringify(updatedGameState);
          
          if (currentStateStr !== updatedStateStr) {
            console.log('Storage event - syncing game state (significant change detected)');
            setGameState(updatedGameState);
          }
        } catch (error) {
          console.error('Failed to parse updated game state:', error);
        }
      }
    };
    
    const handleCustomGameUpdate = (e: CustomEvent) => {
      if (!gameId || e.detail.gameId !== gameId) return;
      //
      
      // Only sync if the state is actually different
      const currentStateStr = JSON.stringify(gameState);
      const updatedStateStr = JSON.stringify(e.detail.gameState);
      
      if (currentStateStr !== updatedStateStr) {
        console.log('Custom event - syncing game state (significant change detected)');
        setGameState(e.detail.gameState);
      }
    };
    
    // Listen for localStorage changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange);
    // Listen for custom events from same tab/window  
    window.addEventListener('gameStateUpdate', handleCustomGameUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('gameStateUpdate', handleCustomGameUpdate);
    };
  }, [gameId, gameState]);
  
  // Polling fallback for same-tab updates (storage event doesn't fire in same tab)
  useEffect(() => {
    if (!gameId) return;
    
    const pollInterval = setInterval(() => {
      try {
        const currentStoredGame = localStorage.getItem(`game_${gameId}`);
        if (currentStoredGame) {
          const storedGameState = JSON.parse(currentStoredGame);
          
          // Compare important game state changes
          const currentPlayerCount = gameState?.players?.length || 0;
          const storedPlayerCount = storedGameState?.players?.length || 0;
          const currentRound = gameState?.currentRound || 0;
          const storedRound = storedGameState?.currentRound || 0;
          const currentActionsLength = gameState?.recentActions?.length || 0;
          const storedActionsLength = storedGameState?.recentActions?.length || 0;
          const currentFirstAction = gameState?.recentActions?.[0] || '';
          const storedFirstAction = storedGameState?.recentActions?.[0] || '';
          const currentStatus = gameState?.status || 'waiting';
          const storedStatus = storedGameState?.status || 'waiting';
          
          // Only update if there are significant differences
          if (currentPlayerCount !== storedPlayerCount || 
              currentRound !== storedRound ||
              currentStatus !== storedStatus ||
              currentActionsLength !== storedActionsLength ||
              currentFirstAction !== storedFirstAction) {
            console.log('Polling detected important change, syncing game state:', {
              players: `${currentPlayerCount} → ${storedPlayerCount}`,
              round: `${currentRound} → ${storedRound}`,
              status: `${currentStatus} → ${storedStatus}`
            });
            setGameState(storedGameState);
          }
        }
      } catch (error) {
        console.error('Polling sync error:', error);
      }
    }, 500); // Poll every 500ms for better responsiveness
    
    return () => clearInterval(pollInterval);
  }, [gameId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (marketTimerRef.current) clearInterval(marketTimerRef.current);
      peers.forEach(peer => peer.close());
    };
  }, []);

  return (
    <PeerContext.Provider
      value={{
        isHost,
        gameId,
        playerId,
        playerName,
        connected,
        peers,
        gameState,
        createGame,
        joinGame,
        startGame,
        sendAction,
        exitGame,
        setGameInfo,
        clearGameInfo,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};

