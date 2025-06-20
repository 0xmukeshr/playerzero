import React, { useState, useEffect } from 'react';
import { GameState, Action } from '../types/game';
import { Timer } from './Timer';
import { PlayerWallet } from './PlayerWallet';
import { AssetsList } from './AssetsList';
import { MarketChanges } from './MarketChanges';
import { PlayerStats } from './PlayerStats';
import { ActionPanel } from './ActionPanel';
import { RecentActions } from './RecentActions';

interface GameInterfaceProps {
  gameId: string;
  onExitGame: () => void;
}

export function GameInterface({ gameId, onExitGame }: GameInterfaceProps) {
  const [gameState, setGameState] = useState<GameState>({
    currentRound: 5,
    maxRounds: 20,
    timeRemaining: { hours: 0, minutes: 2, seconds: 30 },
    currentPlayer: {
      id: 'current',
      name: 'You',
      tokens: 1000,
      assets: { gold: 50, water: 25, oil: 10 },
      totalAssets: 85
    },
    players: [
      { id: 'a', name: 'Alex Chen', tokens: 1200, assets: { gold: 75, water: 30, oil: 15 }, totalAssets: 120 },
      { id: 'b', name: 'Sarah Kim', tokens: 800, assets: { gold: 60, water: 25, oil: 10 }, totalAssets: 95 },
      { id: 'c', name: 'Marcus Johnson', tokens: 1500, assets: { gold: 90, water: 40, oil: 25 }, totalAssets: 155 },
      { id: 'd', name: 'Elena Rodriguez', tokens: 950, assets: { gold: 45, water: 35, oil: 20 }, totalAssets: 100 }
    ],
    marketChanges: [
      { resource: 'gold', change: 10, percentage: '+10%' },
      { resource: 'water', change: -5, percentage: '-5%' },
      { resource: 'oil', change: 20, percentage: '+20%' }
    ],
    recentActions: [
      'Alex Chen bought 10 Gold for 100 tokens',
      'Sarah Kim sold 5 Water for 60 tokens',
      'Marcus Johnson sabotaged Elena\'s Oil reserves',
      'Elena Rodriguez burned 3 Gold to boost market price'
    ]
  });

  const [selectedAction, setSelectedAction] = useState<Action['type']>('buy');
  const [selectedResource, setSelectedResource] = useState<'gold' | 'water' | 'oil'>('gold');
  const [amount, setAmount] = useState<number>(1);
  const [targetPlayer, setTargetPlayer] = useState<string>('');

  // Simulate real-time player actions and market changes
  useEffect(() => {
    const simulatePlayerActions = setInterval(() => {
      setGameState(prev => {
        const actions = ['buy', 'sell', 'burn'];
        const resources = ['gold', 'water', 'oil'];
        const randomPlayer = prev.players[Math.floor(Math.random() * prev.players.length)];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        const randomResource = resources[Math.floor(Math.random() * resources.length)];
        const randomAmount = Math.floor(Math.random() * 5) + 1;

        const resourcePrices = { gold: 10, water: 15, oil: 25 };
        const price = resourcePrices[randomResource] * randomAmount;

        let newPlayers = [...prev.players];
        let newMarketChanges = [...prev.marketChanges];
        let actionText = '';

        const playerIndex = newPlayers.findIndex(p => p.id === randomPlayer.id);
        if (playerIndex === -1) return prev;

        switch (randomAction) {
          case 'buy':
            if (randomPlayer.tokens >= price) {
              newPlayers[playerIndex] = {
                ...randomPlayer,
                tokens: randomPlayer.tokens - price,
                assets: {
                  ...randomPlayer.assets,
                  [randomResource]: randomPlayer.assets[randomResource] + randomAmount
                }
              };
              actionText = `${randomPlayer.name} bought ${randomAmount} ${randomResource.charAt(0).toUpperCase() + randomResource.slice(1)} for ${price} tokens`;
            }
            break;

          case 'sell':
            if (randomPlayer.assets[randomResource] >= randomAmount) {
              const sellPrice = Math.floor(price * 0.8);
              newPlayers[playerIndex] = {
                ...randomPlayer,
                tokens: randomPlayer.tokens + sellPrice,
                assets: {
                  ...randomPlayer.assets,
                  [randomResource]: randomPlayer.assets[randomResource] - randomAmount
                }
              };
              actionText = `${randomPlayer.name} sold ${randomAmount} ${randomResource.charAt(0).toUpperCase() + randomResource.slice(1)} for ${sellPrice} tokens`;
            }
            break;

          case 'burn':
            if (randomPlayer.assets[randomResource] >= randomAmount) {
              newPlayers[playerIndex] = {
                ...randomPlayer,
                assets: {
                  ...randomPlayer.assets,
                  [randomResource]: randomPlayer.assets[randomResource] - randomAmount
                }
              };
              
              // Update market changes
              const marketIndex = newMarketChanges.findIndex(m => m.resource === randomResource);
              if (marketIndex !== -1) {
                const newChange = newMarketChanges[marketIndex].change + (randomAmount * 3);
                newMarketChanges[marketIndex] = {
                  ...newMarketChanges[marketIndex],
                  change: newChange,
                  percentage: `${newChange > 0 ? '+' : ''}${newChange}%`
                };
              }
              actionText = `${randomPlayer.name} burned ${randomAmount} ${randomResource.charAt(0).toUpperCase() + randomResource.slice(1)} to boost market price`;
            }
            break;
        }

        // Update total assets for modified player
        if (newPlayers[playerIndex]) {
          newPlayers[playerIndex].totalAssets = 
            newPlayers[playerIndex].assets.gold + 
            newPlayers[playerIndex].assets.water + 
            newPlayers[playerIndex].assets.oil;
        }

        return {
          ...prev,
          players: newPlayers,
          marketChanges: newMarketChanges,
          recentActions: actionText ? [actionText, ...prev.recentActions.slice(0, 4)] : prev.recentActions
        };
      });
    }, 8000); // Player action every 8 seconds

    return () => clearInterval(simulatePlayerActions);
  }, []);

  // Market fluctuations
  useEffect(() => {
    const marketFluctuations = setInterval(() => {
      setGameState(prev => {
        const newMarketChanges = prev.marketChanges.map(change => {
          const fluctuation = Math.floor(Math.random() * 10) - 5; // -5 to +5
          const newChange = Math.max(-50, Math.min(50, change.change + fluctuation));
          return {
            ...change,
            change: newChange,
            percentage: `${newChange > 0 ? '+' : ''}${newChange}%`
          };
        });

        return {
          ...prev,
          marketChanges: newMarketChanges
        };
      });
    }, 5000); // Market changes every 5 seconds

    return () => clearInterval(marketFluctuations);
  }, []);

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => {
        const { hours, minutes, seconds } = prev.timeRemaining;
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
          // Round ended, reset timer and advance round
          return {
            ...prev,
            currentRound: prev.currentRound + 1,
            timeRemaining: { hours: 0, minutes: 2, seconds: 30 }
          };
        }

        return {
          ...prev,
          timeRemaining: { hours: newHours, minutes: newMinutes, seconds: newSeconds }
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAction = () => {
    if (amount <= 0) return;

    const resourcePrices = { gold: 10, water: 15, oil: 25 };
    const price = resourcePrices[selectedResource] * amount;

    setGameState(prev => {
      let newState = { ...prev };
      let actionText = '';

      switch (selectedAction) {
        case 'buy':
          if (prev.currentPlayer.tokens >= price) {
            newState.currentPlayer = {
              ...prev.currentPlayer,
              tokens: prev.currentPlayer.tokens - price,
              assets: {
                ...prev.currentPlayer.assets,
                [selectedResource]: prev.currentPlayer.assets[selectedResource] + amount
              }
            };
            actionText = `You bought ${amount} ${selectedResource.charAt(0).toUpperCase() + selectedResource.slice(1)} for ${price} tokens`;
          }
          break;

        case 'sell':
          if (prev.currentPlayer.assets[selectedResource] >= amount) {
            const sellPrice = Math.floor(price * 0.8);
            newState.currentPlayer = {
              ...prev.currentPlayer,
              tokens: prev.currentPlayer.tokens + sellPrice,
              assets: {
                ...prev.currentPlayer.assets,
                [selectedResource]: prev.currentPlayer.assets[selectedResource] - amount
              }
            };
            actionText = `You sold ${amount} ${selectedResource.charAt(0).toUpperCase() + selectedResource.slice(1)} for ${sellPrice} tokens`;
          }
          break;

        case 'burn':
          if (prev.currentPlayer.assets[selectedResource] >= amount) {
            newState.currentPlayer = {
              ...prev.currentPlayer,
              assets: {
                ...prev.currentPlayer.assets,
                [selectedResource]: prev.currentPlayer.assets[selectedResource] - amount
              }
            };
            // Burning affects market prices
            const marketIndex = prev.marketChanges.findIndex(m => m.resource === selectedResource);
            if (marketIndex !== -1) {
              newState.marketChanges = [...prev.marketChanges];
              newState.marketChanges[marketIndex] = {
                ...newState.marketChanges[marketIndex],
                change: newState.marketChanges[marketIndex].change + amount * 3,
                percentage: `+${Math.abs(newState.marketChanges[marketIndex].change + amount * 3)}%`
              };
            }
            actionText = `You burned ${amount} ${selectedResource.charAt(0).toUpperCase() + selectedResource.slice(1)} to boost market price`;
          }
          break;

        case 'sabotage':
          if (prev.currentPlayer.tokens >= 100 && targetPlayer) {
            newState.currentPlayer = {
              ...prev.currentPlayer,
              tokens: prev.currentPlayer.tokens - 100
            };
            // Find target player and reduce their assets
            const targetIndex = prev.players.findIndex(p => p.name === targetPlayer);
            if (targetIndex !== -1) {
              newState.players = [...prev.players];
              newState.players[targetIndex] = {
                ...newState.players[targetIndex],
                assets: {
                  ...newState.players[targetIndex].assets,
                  [selectedResource]: Math.max(0, newState.players[targetIndex].assets[selectedResource] - amount)
                }
              };
              // Update target's total assets
              newState.players[targetIndex].totalAssets = 
                newState.players[targetIndex].assets.gold + 
                newState.players[targetIndex].assets.water + 
                newState.players[targetIndex].assets.oil;
            }
            actionText = `You sabotaged ${targetPlayer}'s ${selectedResource.charAt(0).toUpperCase() + selectedResource.slice(1)} reserves`;
          }
          break;
      }

      // Update total assets
      newState.currentPlayer.totalAssets = 
        newState.currentPlayer.assets.gold + 
        newState.currentPlayer.assets.water + 
        newState.currentPlayer.assets.oil;

      // Add action to recent actions
      if (actionText) {
        newState.recentActions = [actionText, ...prev.recentActions.slice(0, 4)];
      }

      return newState;
    });

    // Reset form
    setAmount(1);
    setTargetPlayer('');
  };

  return (
    <div className="min-h-screen bg-pixel-black scanlines p-6 font-pixel">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-pixel-lg font-bold text-pixel-primary uppercase tracking-wider">Trading Game</h1>
          <div className="flex items-center space-x-3">
            <div className="text-pixel-light-gray text-pixel-sm font-bold pixel-notification bg-pixel-dark-gray border-pixel-gray px-2 py-1">
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
            <AssetsList assets={gameState.currentPlayer.assets} />
            <MarketChanges changes={gameState.marketChanges} />
            <RecentActions actions={gameState.recentActions} currentRound={gameState.currentRound} maxRounds={gameState.maxRounds} />
          </div>

          {/* Middle Column - Player Info */}
          <div className="lg:col-span-5 space-y-3">
            <PlayerWallet 
              tokens={gameState.currentPlayer.tokens} 
              assets={gameState.currentPlayer.assets} 
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
              currentPlayer={gameState.currentPlayer}
              onActionChange={setSelectedAction}
              onResourceChange={setSelectedResource}
              onAmountChange={setAmount}
              onTargetChange={setTargetPlayer}
              onConfirmAction={handleAction}
            />
          </div>
        </div>
      </div>
    </div>
  );
}