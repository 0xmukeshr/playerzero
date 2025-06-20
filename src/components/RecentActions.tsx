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
      
      {/* Current Round Actions */}
      <div className="mb-2">
        <h4 className="text-pixel-xs text-pixel-accent font-bold uppercase mb-1 flex items-center space-x-1">
          <Clock className="w-2 h-2" />
          <span>Round {currentRound}</span>
        </h4>
        <div className="space-y-1 max-h-16 overflow-y-auto">
          {(roundActions[currentRound] || actions.slice(0, 2)).map((action, index) => (
            <div key={index} className="pixel-card bg-pixel-gray border-pixel-light-gray p-1">
              <div className="flex items-start space-x-1">
                {getActionIcon(action)}
                <div className="text-pixel-xs text-pixel-light-gray font-bold leading-tight flex-1">
                  {action.length > 32 ? action.substring(0, 29) + '...' : action}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Previous Rounds Actions */}
      <div className="border-t-2 border-pixel-gray pt-2">
        <h4 className="text-pixel-xs text-pixel-light-gray font-bold uppercase mb-1">Previous Rounds</h4>
        <div className="space-y-2 max-h-24 overflow-y-auto">
          {[4, 3, 2].map(round => (
            <div key={round} className="">
              <div className="text-pixel-xs text-pixel-secondary font-bold mb-1">R{round}</div>
              <div className="space-y-1 pl-2">
                {(roundActions[round] || []).slice(0, 2).map((action, index) => (
                  <div key={index} className="pixel-card bg-pixel-dark-gray border-pixel-dark-gray p-1">
                    <div className="flex items-start space-x-1">
                      {getActionIcon(action)}
                      <div className="text-pixel-xs text-pixel-light-gray font-bold leading-tight flex-1">
                        {action.length > 28 ? action.substring(0, 25) + '...' : action}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t-2 border-pixel-gray">
        <div className="text-pixel-xs text-pixel-primary font-bold text-center uppercase">
          Round {currentRound}/{maxRounds}
        </div>
      </div>
    </div>
  );
}
