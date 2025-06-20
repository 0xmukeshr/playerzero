import React from 'react';

interface RecentActionsProps {
  actions: string[];
  currentRound: number;
  maxRounds: number;
}

export function RecentActions({ actions, currentRound, maxRounds }: RecentActionsProps) {
  return (
    <div className="bg-pixel-dark-gray pixel-panel border-pixel-gray p-2 max-w-xs">
      <h3 className="text-pixel-xs font-bold text-pixel-primary mb-2 uppercase tracking-wider text-center">Actions</h3>
      
      <div className="space-y-1 mb-2 max-h-20 overflow-y-auto">
        {actions.slice(0, 3).map((action, index) => (
          <div key={index} className="pixel-card bg-pixel-gray border-pixel-light-gray p-1">
            <div className="text-pixel-xs text-pixel-light-gray font-bold leading-tight">
              {action.length > 35 ? action.substring(0, 32) + '...' : action}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-1 border-t-2 border-pixel-gray">
        <div className="text-pixel-xs text-pixel-primary font-bold text-center uppercase">
          Round {currentRound}/{maxRounds}
        </div>
      </div>
    </div>
  );
}
