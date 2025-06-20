import React, { useState } from 'react';
import { Game } from '../types/game';

interface GameLobbyProps {
  games: Game[];
  onJoinGame: (gameId: string) => void;
  onViewGame: (gameId: string) => void;
  onStartNewGame: () => void;
  onPlayGame: (gameId: string) => void;
  onCreateGame?: (gameName: string) => string; // Returns the created game ID
}

export function GameLobby({ games, onJoinGame, onViewGame, onStartNewGame, onPlayGame, onCreateGame }: GameLobbyProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [gameName, setGameName] = useState('');
  const [createdGameId, setCreatedGameId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const generateGameId = () => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const handleStartGame = () => {
    setShowCreateModal(true);
  };

  const handleCreateGame = () => {
    if (gameName.trim()) {
      let gameId: string;
      if (onCreateGame) {
        gameId = onCreateGame(gameName.trim());
      } else {
        gameId = generateGameId();
      }
      setCreatedGameId(gameId);
      setGameName('');
    }
  };

  const handleCopyGameId = async () => {
    if (createdGameId) {
      try {
        await navigator.clipboard.writeText(createdGameId);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy game ID:', err);
      }
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setCreatedGameId(null);
    setGameName('');
    setCopySuccess(false);
  };
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
          onClick={handleStartGame}
          className="px-8 py-3 bg-pixel-secondary hover:bg-pixel-warning text-pixel-black font-bold text-pixel-lg pixel-btn border-pixel-black uppercase tracking-wider"
        >
          Start Game
        </button>
      </div>

      {/* Create Game Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-pixel-light-gray p-8 pixel-panel border-pixel-black max-w-md w-full mx-4">
            <h3 className="text-pixel-xl font-bold text-pixel-primary text-center mb-6 uppercase tracking-wider">
              Create New Game
            </h3>
            
            {!createdGameId ? (
              <>
                <input
                  type="text"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder="Enter game name"
                  className="w-full px-4 py-3 text-pixel-base font-bold bg-pixel-dark-gray text-pixel-base-gray border-4 border-pixel-gray focus:border-pixel-primary focus:outline-none mb-6"
                  maxLength={30}
                />
                <div className="flex space-x-4">
                  <button
                    onClick={handleCreateGame}
                    disabled={!gameName.trim()}
                    className="flex-1 px-6 py-3 bg-pixel-primary hover:bg-pixel-success text-pixel-black font-bold text-pixel-base pixel-btn border-pixel-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 bg-pixel-gray hover:bg-pixel-light-gray text-pixel-primary font-bold text-pixel-base pixel-btn border-pixel-gray uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-pixel-dark-gray p-6 pixel-panel border-pixel-gray mb-6">
                  <div className="text-center">
                    <p className="text-pixel-sm font-bold text-pixel-light-gray mb-2 uppercase tracking-wider">
                      Game Created Successfully!
                    </p>
                    <p className="text-pixel-base font-bold text-pixel-primary mb-4">
                      Game ID:
                    </p>
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-pixel-lg font-bold text-pixel-secondary bg-pixel-black px-4 py-2 pixel-notification border-pixel-secondary">
                        {createdGameId}
                      </span>
                      <button
                        onClick={handleCopyGameId}
                        className="px-4 py-2 bg-pixel-accent hover:bg-pixel-warning text-pixel-black font-bold text-pixel-sm pixel-btn border-pixel-black uppercase tracking-wider transition-colors"
                        title="Copy Game ID"
                      >
                        {copySuccess ? '✓ Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-full px-6 py-3 bg-pixel-primary hover:bg-pixel-success text-pixel-black font-bold text-pixel-base pixel-btn border-pixel-black uppercase tracking-wider"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}