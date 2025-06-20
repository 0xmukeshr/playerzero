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
    <div className="bg-pixel-dark-gray pixel-panel border-pixel-gray overflow-hidden">
      <div className="px-3 py-2 border-b-2 border-pixel-gray flex items-center justify-between">
        <h3 className="text-pixel-sm font-bold text-pixel-primary uppercase tracking-wider">Recent Actions</h3>
        <div className="text-pixel-xs text-pixel-light-gray font-bold">
          Round {currentRound}/{maxRounds}
        </div>
      </div>
      
      {/* Round Selector and Actions in horizontal layout */}
      <div className="p-3">
        <div className="flex items-center space-x-3 mb-3">
          <label className="text-pixel-xs font-bold text-pixel-light-gray uppercase tracking-wider whitespace-nowrap">View Round:</label>
          <select 
            value={selectedRound}
            onChange={(e) => setSelectedRound(Number(e.target.value))}
            className="flex-1 bg-pixel-gray border-2 border-pixel-light-gray text-pixel-xs text-pixel-light-gray font-bold p-1 pixel-card uppercase tracking-wider focus:border-pixel-primary focus:outline-none"
          >
            {availableRounds.map(round => (
              <option key={round} value={round} className="bg-pixel-gray">
                Round {round} {round === currentRound ? '(Current)' : ''}
              </option>
            ))}
          </select>
          <div className="text-pixel-xs text-pixel-primary font-bold whitespace-nowrap">
            {displayActions.length} actions
          </div>
        </div>
        
        {/* Actions in wider grid layout */}
        {displayActions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {displayActions.slice(0, 6).map((action, index) => (
              <div key={index} className="pixel-card bg-pixel-gray border-pixel-light-gray p-2 hover:bg-pixel-light-gray transition-colors">
                <div className="text-pixel-xs text-pixel-light-gray font-bold leading-tight">
                  {action.length > 45 ? action.substring(0, 42) + '...' : action}
                </div>
                <div className="text-pixel-xs text-pixel-primary mt-1 opacity-75">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="pixel-card bg-pixel-gray border-pixel-light-gray p-4 text-center">
            <div className="text-pixel-sm text-pixel-light-gray font-bold mb-2">
              🎯
            </div>
            <div className="text-pixel-xs text-pixel-light-gray font-bold">
              No actions this round yet. Make the first move!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
