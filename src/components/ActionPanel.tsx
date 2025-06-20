import React from 'react';
import { Player, Action } from '../types/game';

interface ActionPanelProps {
  selectedAction: Action['type'];
  selectedResource: 'gold' | 'water' | 'oil';
  amount: number;
  targetPlayer: string;
  players: Player[];
  currentPlayer: Player;
  onActionChange: (action: Action['type']) => void;
  onResourceChange: (resource: 'gold' | 'water' | 'oil') => void;
  onAmountChange: (amount: number) => void;
  onTargetChange: (target: string) => void;
  onConfirmAction: () => void;
}

export function ActionPanel({
  selectedAction,
  selectedResource,
  amount,
  targetPlayer,
  players,
  currentPlayer,
  onActionChange,
  onResourceChange,
  onAmountChange,
  onTargetChange,
  onConfirmAction
}: ActionPanelProps) {
  const actions: { type: Action['type']; label: string; color: string; borderColor: string }[] = [
    { type: 'buy', label: 'Buy', color: 'bg-pixel-success hover:bg-pixel-primary', borderColor: 'border-pixel-success' },
    { type: 'sell', label: 'Sell', color: 'bg-pixel-blue hover:bg-pixel-cyan', borderColor: 'border-pixel-blue' },
    { type: 'burn', label: 'Burn', color: 'bg-pixel-secondary hover:bg-pixel-warning', borderColor: 'border-pixel-secondary' },
    { type: 'sabotage', label: 'Sabotage', color: 'bg-pixel-error hover:bg-pixel-warning', borderColor: 'border-pixel-error' }
  ];

  const resources: { type: 'gold' | 'water' | 'oil'; label: string }[] = [
    { type: 'gold', label: 'Gold' },
    { type: 'water', label: 'Water' },
    { type: 'oil', label: 'Oil' }
  ];

  const canPerformAction = () => {
    const resourcePrices = { gold: 10, water: 15, oil: 25 };
    const price = resourcePrices[selectedResource] * amount;

    switch (selectedAction) {
      case 'buy':
        return currentPlayer.tokens >= price && amount > 0;
      case 'sell':
        return currentPlayer.assets[selectedResource] >= amount && amount > 0;
      case 'burn':
        return currentPlayer.assets[selectedResource] >= amount && amount > 0;
      case 'sabotage':
        return currentPlayer.tokens >= 100 && targetPlayer && amount > 0;
      default:
        return false;
    }
  };

  return (
    <div className="bg-pixel-dark-gray pixel-panel border-pixel-gray p-3">
      <h3 className="text-pixel-sm font-bold text-pixel-primary mb-3 uppercase tracking-wider text-center">Actions</h3>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {actions.map((action) => (
          <button
            key={action.type}
            onClick={() => onActionChange(action.type)}
            className={`px-2 py-2 pixel-btn text-pixel-black font-bold text-pixel-xs uppercase tracking-wider ${
              selectedAction === action.type
                ? `${action.color} ${action.borderColor}`
                : 'bg-pixel-gray hover:bg-pixel-light-gray border-pixel-light-gray'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Resource Selection */}
      <div className="mb-3">
        <label className="block text-pixel-xs font-bold text-pixel-primary mb-1 uppercase">Resource</label>
        <select
          value={selectedResource}
          onChange={(e) => onResourceChange(e.target.value as 'gold' | 'water' | 'oil')}
          className="w-full px-2 py-1 bg-pixel-gray pixel-input border-pixel-light-gray text-pixel-primary text-pixel-xs font-bold focus:outline-none focus:border-pixel-accent"
        >
          {resources.map((resource) => (
            <option key={resource.type} value={resource.type}>
              {resource.label}
            </option>
          ))}
        </select>
      </div>

      {/* Amount Input */}
      <div className="mb-3">
        <label className="block text-pixel-xs font-bold text-pixel-primary mb-1 uppercase">Amount</label>
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => onAmountChange(parseInt(e.target.value) || 1)}
          className="w-full px-2 py-1 bg-pixel-gray pixel-input border-pixel-light-gray text-pixel-primary text-pixel-xs font-bold focus:outline-none focus:border-pixel-accent"
        />
      </div>

      {/* Target Player (for Sabotage) */}
      {selectedAction === 'sabotage' && (
        <div className="mb-3">
          <label className="block text-pixel-xs font-bold text-pixel-primary mb-1 uppercase">Target</label>
          <select
            value={targetPlayer}
            onChange={(e) => onTargetChange(e.target.value)}
            className="w-full px-2 py-1 bg-pixel-gray pixel-input border-pixel-light-gray text-pixel-primary text-pixel-xs font-bold focus:outline-none focus:border-pixel-accent"
          >
            <option value="">Select Player</option>
            {players.map((player) => (
              <option key={player.id} value={player.name}>
                {player.name.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Confirm Button */}
      <button
        onClick={onConfirmAction}
        disabled={!canPerformAction()}
        className={`w-full px-3 py-2 pixel-btn font-bold text-pixel-sm uppercase tracking-wider ${
          canPerformAction()
            ? 'bg-pixel-primary hover:bg-pixel-accent text-pixel-black border-pixel-black'
            : 'bg-pixel-gray text-pixel-light-gray border-pixel-light-gray cursor-not-allowed'
        }`}
      >
        Execute
      </button>
    </div>
  );
}