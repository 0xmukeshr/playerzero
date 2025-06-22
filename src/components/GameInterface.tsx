import React, { useState, useEffect } from 'react';
import { GameState, Action, Player } from '../types/game';
import { Timer } from './Timer';
import { PlayerWallet } from './PlayerWallet';
import { AssetsList } from './AssetsList';
import { PlayerStats } from './PlayerStats';
import { ActionPanel } from './ActionPanel';
import { RecentActions } from './RecentActions';
import { usePeer } from '../context/PeerContext';
import { useAudio } from '../hooks/useAudio';

interface GameInterfaceProps {
  onExitGame: () => void;
}

export function GameInterface({ onExitGame }: GameInterfaceProps) {
  const { gameId, playerId, playerName, gameState, isHost, startGame, sendAction, exitGame } = usePeer();
  const { playSound } = useAudio();
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [selectedAction, setSelectedAction] = useState<Action['type']>('buy');
  const [selectedResource, setSelectedResource] = useState<'gold' | 'water' | 'oil'>('gold');
  const [amount, setAmount] = useState<number>(1);
  const [targetPlayer, setTargetPlayer] = useState<string>('');
  const [gameStarted, setGameStarted] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [actionsByRound, setActionsByRound] = useState<{ [round: number]: string[] }>({});
  const [previousPlayerCount, setPreviousPlayerCount] = useState(0);
  const [previousRecentActions, setPreviousRecentActions] = useState<string[]>([]);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  useEffect(() => {
    if (gameState) {
      const player = gameState.players.find((p: any) => p.id === playerId);
      setCurrentPlayer(player || null);
      setGameStarted(gameState.status === 'playing');
      
      // Check for new players joining (only if we had a previous count)
      if (previousPlayerCount > 0 && gameState.players.length > previousPlayerCount) {
        const newPlayer = gameState.players[gameState.players.length - 1];
        if (newPlayer.id !== playerId) {
          addNotification(`🎮 ${newPlayer.name} joined the game!`);
          playSound('switch');
        }
      }
      
      // Update previous player count
      setPreviousPlayerCount(gameState.players.length);
      
      // Check for new actions (only if we had previous actions)
      if (previousRecentActions.length > 0 && gameState.recentActions && gameState.recentActions.length > 0) {
        const latestAction = gameState.recentActions[0];
        const wasLatestAction = previousRecentActions[0];
        
        // If there's a new action at the top of the list
        if (latestAction && latestAction !== wasLatestAction) {
          // Check if this action was performed by the current player
          const isMyAction = latestAction.includes(playerName || '');
          
          if (!isMyAction) {
            // Show notification for other players' actions
            addNotification(`⚡ ${latestAction}`);
            playSound('click');
          }
        }
      }
      
      // Update previous recent actions
      setPreviousRecentActions(gameState.recentActions || []);
      
      // Update actions by round
      if (gameState.recentActions && gameState.currentRound) {
        setActionsByRound(prev => ({
          ...prev,
          [gameState.currentRound]: gameState.recentActions
        }));
      }
      
      // Check if game finished
      if (gameState.status === 'finished' && !gameFinished) {
        setGameStarted(false);
        setGameFinished(true);
        setShowWinnerModal(true);
        
        // Play victory sound
        playSound('switch');
        
        addNotification('🏁 Game finished!');
        
        // Show winner from game state (calculated by host)
        if (gameState.winner) {
          addNotification(`🏆 Winner: ${gameState.winner.name} (${gameState.winner.finalScore} points)!`);
        }
      }
      
      // Check if game returned to waiting after being finished
      if (gameState.status === 'waiting' && gameFinished) {
        setGameFinished(false);
        setShowWinnerModal(false);
        setGameStarted(false);
        addNotification('🔄 Ready for rematch!');
      }
    }
  }, [gameState, playerId, playerName, playSound, previousPlayerCount, previousRecentActions]);

  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== message));
    }, 5000);
  };

  const handleStartGame = () => {
    if (isHost) {
      try {
        startGame();
        addNotification('Game started!');
      } catch (error: any) {
        addNotification(`Error: ${error.message}`);
      }
    }
  };

  const handleExitGame = () => {
    exitGame();
    onExitGame();
  };

  const handleAction = () => {
    if (!currentPlayer || amount <= 0) return;

    const actionData = {
      action: selectedAction,
      resource: selectedResource,
      amount: amount,
      targetPlayer: selectedAction === 'sabotage' ? targetPlayer : undefined
    };

    sendAction(actionData);

    // Reset form
    setAmount(1);
    setTargetPlayer('');
  };

  // Loading state
  if (!gameState) {
    return (
      <div className="min-h-screen bg-pixel-black scanlines p-6 font-pixel flex items-center justify-center">
        <div className="bg-pixel-dark-gray pixel-panel border-pixel-gray p-8">
          <h2 className="text-pixel-xl font-bold text-pixel-primary text-center mb-4">
            Loading Game...
          </h2>
          <p className="text-pixel-base-gray text-center">Game ID: {gameId}</p>
        </div>
      </div>
    );
  }

  // Waiting room state
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-pixel-black scanlines p-6 font-pixel">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-pixel-2xl font-bold text-pixel-primary uppercase tracking-wider">
              Waiting Room
            </h1>
            <button
              onClick={() => {
                playSound('click');
                handleExitGame();
              }}
              className="px-4 py-2 bg-pixel-error hover:bg-pixel-warning text-pixel-black font-bold text-pixel-sm pixel-btn border-pixel-black uppercase tracking-wider"
            >
              Exit Game
            </button>
          </div>

          {/* Game Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-pixel-dark-gray pixel-panel border-pixel-gray p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-pixel-lg font-bold text-pixel-primary">Game Info</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-pixel-success pixel-notification border-pixel-success animate-pulse" title="Live Sync Active"></div>
                  <span className="text-pixel-xs text-pixel-success font-bold">LIVE</span>
                </div>
              </div>
              <div className="space-y-2 text-pixel-base-gray">
                <p><span className="text-pixel-primary">Game ID:</span> {gameId}</p>
                <p><span className="text-pixel-primary">Host:</span> {isHost ? 'You' : gameState.players.find((p: any) => p.id === gameState.host)?.name || 'Unknown'}</p>
                <p><span className="text-pixel-primary">Players:</span> {gameState.players.length}/4</p>
                <p><span className="text-pixel-primary">Status:</span> Waiting for players</p>
              </div>
            </div>

            <div className="bg-pixel-dark-gray pixel-panel border-pixel-gray p-6">
              <h3 className="text-pixel-lg font-bold text-pixel-primary mb-4">How to Invite</h3>
              <div className="space-y-2 text-pixel-base-gray text-pixel-sm">
                <p>1. Share the Game ID with friends</p>
                <p>2. They join using "Join by ID"</p>
                <p>3. Host starts the game when ready</p>
              </div>
              <button
                onClick={() => {
                  playSound('click');
                  navigator.clipboard.writeText(gameId || '');
                }}
                className="mt-4 w-full px-4 py-2 bg-pixel-accent hover:bg-pixel-success text-pixel-black font-bold text-pixel-sm pixel-btn border-pixel-black uppercase tracking-wider"
              >
                Copy Game ID
              </button>
            </div>
          </div>

          {/* Players List */}
          <div className="bg-pixel-dark-gray pixel-panel border-pixel-gray p-6 mb-6">
            <h3 className="text-pixel-lg font-bold text-pixel-primary mb-4">Players ({gameState.players.length}/4)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameState.players.map((player: any, index: number) => (
                <div key={player.id} className="bg-pixel-gray pixel-panel border-pixel-light-gray p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-pixel-primary font-bold">
                      {player.name} {player.id === playerId && '(You)'}
                    </span>
                    <div className="flex items-center space-x-2">
                      {player.id === gameState.host && (
                        <span className="text-pixel-xs bg-pixel-warning text-pixel-black px-2 py-1 pixel-notification border-pixel-black">
                          HOST
                        </span>
                      )}
                      <div className={`w-3 h-3 pixel-notification border-pixel-black ${
                        player.connected ? 'bg-pixel-success' : 'bg-pixel-error'
                      }`} title={player.connected ? 'Connected' : 'Disconnected'} />
                    </div>
                  </div>
                </div>
              ))}
              {Array.from({ length: 4 - gameState.players.length }).map((_, index) => (
                <div key={`empty-${index}`} className="bg-pixel-black pixel-panel border-pixel-gray p-4">
                  <span className="text-pixel-base-gray font-bold">Waiting for player...</span>
                </div>
              ))}
            </div>
          </div>

          {/* Start Game Button */}
          {isHost && (
            <div className="text-center">
              <button
                onClick={() => {
                  playSound('click');
                  handleStartGame();
                }}
                disabled={gameState.players.length < 2}
                className="px-8 py-4 bg-pixel-primary hover:bg-pixel-success text-pixel-black font-bold text-pixel-lg pixel-btn border-pixel-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {gameState.players.length < 2 ? 'Need 2+ Players' : 'Start Game'}
              </button>
              <p className="text-pixel-base-gray text-pixel-xs mt-2">
                Minimum 2 players required to start
              </p>
            </div>
          )}

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="fixed top-4 right-4 space-y-2 z-50">
              {notifications.map((notification, index) => (
                <div key={index} className="bg-pixel-accent text-pixel-black p-3 pixel-panel border-pixel-black">
                  <p className="font-bold text-pixel-sm">{notification}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pixel-black scanlines p-6 font-pixel">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-pixel-lg font-bold text-pixel-primary uppercase tracking-wider">Trading Game</h1>
          <div className="flex items-center space-x-3">
            <div className="text-pixel-base-gray text-pixel-sm font-bold pixel-notification bg-pixel-dark-gray border-pixel-gray px-2 py-1">
              Round {gameState.currentRound}/{gameState.maxRounds}
            </div>
            <button
              onClick={onExitGame}
              className="px-3 py-1 bg-pixel-error hover:bg-pixel-warning text-pixel-black font-bold text-pixel-xs pixel-btn border-pixel-black uppercase tracking-wider"
            >
              Exit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Left Column - Compact Info Panels */}
          <div className="lg:col-span-3 space-y-3">
            <Timer timeRemaining={gameState.timeRemaining} />
            <AssetsList assets={currentPlayer?.assets || { gold: 0, water: 0, oil: 0 }} marketChanges={gameState.marketChanges} />
            <RecentActions 
              actions={gameState.recentActions} 
              currentRound={gameState.currentRound} 
              maxRounds={gameState.maxRounds} 
              actionsByRound={actionsByRound}
            />
          </div>

          {/* Middle Column - Player Info */}
          <div className="lg:col-span-5 space-y-3">
            <PlayerWallet 
              tokens={currentPlayer?.tokens || 0} 
              assets={currentPlayer?.assets || { gold: 0, water: 0, oil: 0 }} 
            />
            <PlayerStats players={gameState.players} />
          </div>

          {/* Right Column - Actions */}
          <div className="lg:col-span-4 space-y-3">
            <ActionPanel
              selectedAction={selectedAction}
              selectedResource={selectedResource}
              amount={amount}
              targetPlayer={targetPlayer}
              players={gameState.players}
              currentPlayer={currentPlayer || { id: '', name: '', tokens: 0, assets: { gold: 0, water: 0, oil: 0 }, totalAssets: 0 }}
              onActionChange={setSelectedAction}
              onResourceChange={setSelectedResource}
              onAmountChange={setAmount}
              onTargetChange={setTargetPlayer}
              onConfirmAction={handleAction}
            />
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="fixed top-4 right-4 space-y-2 z-40">
            {notifications.map((notification, index) => (
              <div key={index} className="bg-pixel-accent text-pixel-black p-3 pixel-panel border-pixel-black">
                <p className="font-bold text-pixel-sm">{notification}</p>
              </div>
            ))}
          </div>
        )}

        {/* Winner Modal - Simple Center Popup */}
        {showWinnerModal && gameState?.status === 'finished' && gameState?.winner && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
            <div className="bg-pixel-primary p-12 pixel-panel border-pixel-black max-w-lg w-full mx-4 text-center">
              {/* Winner Crown Animation */}
              <div className="text-8xl mb-6 animate-bounce">
                👑
              </div>
              
              {/* Game Finished */}
              <h2 className="text-pixel-3xl font-bold text-pixel-black mb-4 uppercase tracking-wider">
                Game Finished!
              </h2>
              
              {/* Winner Announcement */}
              <div className="bg-pixel-black p-6 pixel-panel border-pixel-black mb-6">
                <h3 className="text-pixel-2xl font-bold text-pixel-primary mb-2 uppercase tracking-wider animate-pulse">
                  🏆 Winner
                </h3>
                <div className="text-pixel-3xl font-bold text-pixel-success mb-2">
                  {gameState.winner.name}
                </div>
                <div className="text-pixel-lg font-bold text-pixel-base-gray">
                  Final Score: {gameState.winner.finalScore} Points
                </div>
                {gameState.winner.id === playerId && (
                  <div className="text-pixel-lg font-bold text-pixel-warning mt-2">
                    🎉 Congratulations! 🎉
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    playSound('click');
                    setShowWinnerModal(false);
                  }}
                  className="flex-1 px-6 py-3 bg-pixel-success hover:bg-pixel-accent text-pixel-black font-bold text-pixel-base pixel-btn border-pixel-black uppercase tracking-wider"
                >
                  Continue
                </button>
                <button
                  onClick={() => {
                    playSound('click');
                    handleExitGame();
                  }}
                  className="flex-1 px-6 py-3 bg-pixel-error hover:bg-pixel-warning text-pixel-black font-bold text-pixel-base pixel-btn border-pixel-black uppercase tracking-wider"
                >
                  Exit Game
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
