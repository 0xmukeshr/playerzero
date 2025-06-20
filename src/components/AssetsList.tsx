import React from 'react';
import { Circle } from 'lucide-react';

interface AssetsListProps {
  assets: {
    gold: number;
    water: number;
    oil: number;
  };
}

export function AssetsList({ assets }: AssetsListProps) {
  const assetData = [
    { name: 'Gold', value: assets.gold, total: 100, color: 'text-pixel-yellow', bgColor: 'bg-pixel-yellow', borderColor: 'border-pixel-yellow' },
    { name: 'Water', value: assets.water, total: 50, color: 'text-pixel-blue', bgColor: 'bg-pixel-blue', borderColor: 'border-pixel-blue' },
    { name: 'Oil', value: assets.oil, total: 20, color: 'text-pixel-magenta', bgColor: 'bg-pixel-magenta', borderColor: 'border-pixel-magenta' }
  ];

  return (
    <div className="bg-pixel-dark-gray pixel-panel border-pixel-gray p-2 max-w-xs">
      <h3 className="text-pixel-xs font-bold text-pixel-primary mb-2 uppercase tracking-wider text-center">Assets</h3>
      
      <div className="space-y-1">
        {assetData.map((asset) => (
          <div key={asset.name} className={`pixel-card bg-pixel-gray ${asset.borderColor} p-1`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <div className={`w-4 h-4 ${asset.bgColor} pixel-avatar flex items-center justify-center`}>
                  <Circle className={`w-2 h-2 text-pixel-black fill-current`} />
                </div>
                <div className="text-pixel-primary font-bold text-pixel-xs uppercase">{asset.name}</div>
              </div>
              <div className={`${asset.color} font-bold text-pixel-xs`}>{asset.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}