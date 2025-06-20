import React from 'react';
import { Circle, TrendingUp, TrendingDown } from 'lucide-react';
import { MarketChange } from '../types/game';

interface MarketChangesProps {
  changes: MarketChange[];
}

export function MarketChanges({ changes }: MarketChangesProps) {
  const getResourceColor = (resource: string) => {
    switch (resource) {
      case 'gold': return { color: 'text-pixel-yellow', bgColor: 'bg-pixel-yellow', borderColor: 'border-pixel-yellow' };
      case 'water': return { color: 'text-pixel-blue', bgColor: 'bg-pixel-blue', borderColor: 'border-pixel-blue' };
      case 'oil': return { color: 'text-pixel-magenta', bgColor: 'bg-pixel-magenta', borderColor: 'border-pixel-magenta' };
      default: return { color: 'text-pixel-light-gray', bgColor: 'bg-pixel-light-gray', borderColor: 'border-pixel-light-gray' };
    }
  };

  const marketHistory = [
    { round: 5, resource: 'gold', change: 10, percentage: '+10%' },
    { round: 5, resource: 'water', change: -5, percentage: '-5%' },
    { round: 5, resource: 'oil', change: 20, percentage: '+20%' },
    { round: 4, resource: 'gold', change: 5, percentage: '+5%' },
    { round: 4, resource: 'water', change: 15, percentage: '+15%' },
    { round: 4, resource: 'oil', change: -10, percentage: '-10%' },
    { round: 3, resource: 'gold', change: -8, percentage: '-8%' },
    { round: 3, resource: 'water', change: 12, percentage: '+12%' },
    { round: 3, resource: 'oil', change: 25, percentage: '+25%' },
  ];

  return (
    <div className="bg-pixel-dark-gray pixel-panel border-pixel-gray p-2 max-w-xs h-96">
      <h3 className="text-pixel-xs font-bold text-pixel-primary mb-2 uppercase tracking-wider text-center">Market Trends</h3>
      
      {/* Current Market */}
      <div className="mb-3">
        <h4 className="text-pixel-xs text-pixel-accent font-bold uppercase mb-1">Current (Round 5)</h4>
        <div className="space-y-1">
          {changes.map((change) => {
            const colors = getResourceColor(change.resource);
            const isPositive = change.change > 0;
            
            return (
              <div key={change.resource} className={`pixel-card bg-pixel-gray ${colors.borderColor} p-1`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <div className={`w-4 h-4 ${colors.bgColor} pixel-avatar flex items-center justify-center`}>
                      <Circle className="w-2 h-2 text-pixel-black fill-current" />
                    </div>
                    <div className="text-pixel-primary font-bold text-pixel-xs uppercase">{change.resource}</div>
                  </div>
                  <div className={`flex items-center space-x-1 font-bold text-pixel-xs ${
                    isPositive ? 'text-pixel-success' : 'text-pixel-error'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="w-2 h-2" />
                    ) : (
                      <TrendingDown className="w-2 h-2" />
                    )}
                    <span>{change.percentage}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Market History */}
      <div className="border-t-2 border-pixel-gray pt-2">
        <h4 className="text-pixel-xs text-pixel-light-gray font-bold uppercase mb-1">History</h4>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {marketHistory.map((entry, index) => {
            const colors = getResourceColor(entry.resource);
            const isPositive = entry.change > 0;
            
            return (
              <div key={index} className="pixel-card bg-pixel-dark-gray border-pixel-light-gray p-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <span className="text-pixel-light-gray font-bold text-pixel-xs">R{entry.round}</span>
                    <div className={`w-3 h-3 ${colors.bgColor} pixel-avatar`}></div>
                    <div className="text-pixel-light-gray font-bold text-pixel-xs uppercase truncate">{entry.resource.slice(0,3)}</div>
                  </div>
                  <div className={`font-bold text-pixel-xs ${
                    isPositive ? 'text-pixel-success' : 'text-pixel-error'
                  }`}>
                    {entry.percentage}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}