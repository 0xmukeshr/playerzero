import React from 'react';
import { Game } from '../types/game';

interface GameLobbyProps {
  games: Game[];
  onJoinGame: (gameId: string) => void;
  onViewGame: (gameId: string) => void;
  onStartNewGame: () => void;
  onPlayGame: (gameId: string) => void;
}

export function GameLobby({ games, onJoinGame, onViewGame, onStartNewGame, onPlayGame }: GameLobbyProps) {
  const getStatusColor = (status: Game['status']) => {
    switch (status) {
      case 'Open':
        return 'bg-pixel-success text-pixel-black pixel-notification border-pixel-black';
      case 'In Progress':
        return 'bg-pixel-warning text-pixel-black pixel-notification border-pixel-black';
      case 'Finished':
        return 'bg-pixel-gray text-pixel-primary pixel-notification border-pixel-black';
      default:
        return 'bg-pixel-gray text-pixel-primary pixel-notification border-pixel-black';
    }
  };

  const getActionButton = (game: Game) => {
    if (game.status === 'Open') {
      return (
        <div className="flex space-x-2">
          <button
            onClick={() => onJoinGame(game.id)}
            className="px-4 py-2 text-pixel-sm font-bold text-pixel-accent hover:text-pixel-black hover:bg-pixel-accent pixel-btn border-pixel-accent uppercase tracking-wider"
          >
            Join
          </button>
          <button
            onClick={() => onPlayGame(game.id)}
            className="px-4 py-2 text-pixel-sm font-bold bg-pixel-primary hover:bg-pixel-success text-pixel-black pixel-btn border-pixel-black uppercase tracking-wider"
          >
            Play
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={() => onViewGame(game.id)}
        className="px-4 py-2 text-pixel-sm font-bold text-pixel-light-gray hover:text-pixel-black hover:bg-pixel-light-gray pixel-btn border-pixel-light-gray uppercase tracking-wider"
      >
        View
      </button>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h2 className="text-pixel-2xl font-bold text-pixel-primary mb-8 uppercase tracking-wider text-center">
        Game Lobby
      </h2>
      
      <div className="bg-pixel-dark-gray pixel-panel border-pixel-gray overflow-hidden">
        <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-pixel-gray border-b-4 border-pixel-light-gray">
          <div className="text-pixel-sm font-bold text-pixel-primary uppercase tracking-wider">Game Name</div>
          <div className="text-pixel-sm font-bold text-pixel-primary uppercase tracking-wider">Status</div>
          <div className="text-pixel-sm font-bold text-pixel-primary uppercase tracking-wider">Players</div>
          <div className="text-pixel-sm font-bold text-pixel-primary uppercase tracking-wider">Action</div>
        </div>
        
        <div className="divide-y divide-pixel-gray">
          {games.map((game) => (
            <div key={game.id} className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-pixel-gray transition-colors">
              <div className="text-pixel-primary font-bold text-pixel-base">{game.name}</div>
              <div>
                <span className={`px-3 py-1 text-pixel-xs font-bold ${getStatusColor(game.status)} uppercase tracking-wider`}>
                  {game.status}
                </span>
              </div>
              <div className="text-pixel-light-gray text-pixel-base font-bold">
                {game.currentPlayers}/{game.maxPlayers}
              </div>
              <div>
                {getActionButton(game)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={onStartNewGame}
          className="px-8 py-3 bg-pixel-secondary hover:bg-pixel-warning text-pixel-black font-bold text-pixel-lg pixel-btn border-pixel-black uppercase tracking-wider"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}