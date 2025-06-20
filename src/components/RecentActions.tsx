import React, { useState, useEffect } from 'react';

interface RecentActionsProps {
  actions: string[];
  currentRound: number;
  maxRounds: number;
  actionsByRound?: { [round: number]: string[] };
}

export function RecentActions({ actions, currentRound, maxRounds, actionsByRound = {} }: RecentActionsProps) {
  const [selectedRound, setSelectedRound] = useState<number>(currentRound);
  
  // Auto-switch to current round when round changes
  useEffect(() => {
    setSelectedRound(currentRound);
  }, [currentRound]);
  
  // Get actions for the selected round, fallback to current actions if not available
  const displayActions = actionsByRound[selectedRound] || (selectedRound === currentRound ? actions : []);
  
  // Generate round options (only show rounds that have actions or current round)
  const availableRounds = Array.from(
    new Set([
      ...Object.keys(actionsByRound).map(Number),
      currentRound
    ])
  ).sort((a, b) => b - a); // Sort descending (most recent first)

  return (
    <div className="bg-pixel-dark-gray pixel-panel border-pixel-gray p-2 max-w-xs">
      <h3 className="text-pixel-xs font-bold text-pixel-primary mb-2 uppercase tracking-wider text-center">Actions</h3>
      
      {/* Round Selector Dropdown */}
      <div className="mb-2">
        <select 
          value={selectedRound}
          onChange={(e) => setSelectedRound(Number(e.target.value))}
          className="w-full bg-pixel-gray border-2 border-pixel-light-gray text-pixel-xs text-pixel-light-gray font-bold p-1 pixel-card uppercase tracking-wider focus:border-pixel-primary focus:outline-none"
        >
          {availableRounds.map(round => (
            <option key={round} value={round} className="bg-pixel-gray">
              Round {round} {round === currentRound ? '(Current)' : ''}
            </option>
          ))}
        </select>
      </div>
      
      {/* Actions List - Show 4 actions max (1 per player) */}
      <div className="space-y-1 mb-2">
        {displayActions.length > 0 ? (
          displayActions.slice(0, 4).map((action, index) => (
            <div key={index} className="pixel-card bg-pixel-gray border-pixel-light-gray p-1">
              <div className="text-pixel-xs text-pixel-light-gray font-bold leading-tight">
                {action.length > 35 ? action.substring(0, 32) + '...' : action}
              </div>
            </div>
          ))
        ) : (
          <div className="pixel-card bg-pixel-gray border-pixel-light-gray p-1">
            <div className="text-pixel-xs text-pixel-light-gray font-bold leading-tight text-center">
              No actions this round
            </div>
          </div>
        )}
      </div>

      <div className="pt-1 border-t-2 border-pixel-gray">
        <div className="text-pixel-xs text-pixel-primary font-bold text-center uppercase">
          Round {currentRound}/{maxRounds}
        </div>
      </div>
    </div>
  );
}
