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
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [gameName, setGameName] = useState('');
  const [gameType, setGameType] = useState<'public' | 'private'>('public');
  const [createdGameId, setCreatedGameId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [joinGameId, setJoinGameId] = useState('');
  const [joinError, setJoinError] = useState(false);

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

  const handleJoinById = () => {
    if (joinGameId.trim()) {
      // Simulate checking if game exists (in real app, this would be an API call)
      const gameExists = games.some(game => game.id === joinGameId.trim());
      
      if (gameExists) {
        onJoinGame(joinGameId.trim());
        handleCloseJoinModal();
      } else {
        setJoinError(true);
        setTimeout(() => setJoinError(false), 3000); // Reset error after 3 seconds
      }
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
    setGameType('public');
    setCopySuccess(false);
  };

  const handleCloseJoinModal = () => {
    setShowJoinModal(false);
    setJoinGameId('');
    setJoinError(false);
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

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => setShowJoinModal(true)}
          className="px-6 py-3 bg-pixel-accent hover:bg-pixel-success text-pixel-black font-bold text-pixel-base pixel-btn border-pixel-black uppercase tracking-wider"
        >
          Join by ID
        </button>
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
                  className="w-full px-4 py-3 text-pixel-base font-bold bg-pixel-dark-gray text-pixel-base-gray border-4 border-pixel-gray focus:border-pixel-primary focus:outline-none mb-4"
                  maxLength={30}
                />
                
                {/* Game Type Selection */}
                <div className="mb-6">
                  <p className="text-pixel-sm font-bold text-pixel-primary mb-3 uppercase tracking-wider text-center">
                    Game Type
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setGameType('public')}
                      className={`flex-1 px-4 py-3 font-bold text-pixel-sm pixel-btn uppercase tracking-wider ${
                        gameType === 'public'
                          ? 'bg-pixel-success text-pixel-black border-pixel-black'
                          : 'bg-pixel-gray hover:bg-pixel-light-gray text-pixel-primary border-pixel-gray'
                      }`}
                    >
                      Public
                    </button>
                    <button
                      onClick={() => setGameType('private')}
                      className={`flex-1 px-4 py-3 font-bold text-pixel-sm pixel-btn uppercase tracking-wider ${
                        gameType === 'private'
                          ? 'bg-pixel-warning text-pixel-black border-pixel-black'
                          : 'bg-pixel-gray hover:bg-pixel-light-gray text-pixel-primary border-pixel-gray'
                      }`}
                    >
                      Private
                    </button>
                  </div>
                  <p className="text-pixel-xs text-pixel-base-gray mt-2 text-center">
                    {gameType === 'public' ? 'Anyone can join this game' : 'Only players with ID can join'}
                  </p>
                </div>
                
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

      {/* Join by ID Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className={`p-8 pixel-panel max-w-md w-full mx-4 ${
            joinError ? 'bg-pixel-error border-pixel-error' : 'bg-pixel-light-gray border-pixel-black'
          }`}>
            <h3 className={`text-pixel-xl font-bold text-center mb-6 uppercase tracking-wider ${
              joinError ? 'text-pixel-black' : 'text-pixel-primary'
            }`}>
              {joinError ? 'Game Not Found!' : 'Join by Game ID'}
            </h3>
            
            <input
              type="text"
              value={joinGameId}
              onChange={(e) => {
                setJoinGameId(e.target.value.toUpperCase());
                if (joinError) setJoinError(false); // Reset error when typing
              }}
              placeholder="Enter Game ID"
              className={`w-full px-4 py-3 text-pixel-base font-bold border-4 focus:outline-none mb-6 uppercase tracking-wider text-center ${
                joinError 
                  ? 'bg-pixel-dark-gray text-pixel-error border-pixel-error focus:border-pixel-error'
                  : 'bg-pixel-dark-gray text-pixel-base-gray border-pixel-gray focus:border-pixel-primary'
              }`}
              maxLength={9}
            />
            
            {joinError && (
              <div className="bg-pixel-black p-3 pixel-panel border-pixel-error mb-4">
                <p className="text-pixel-error text-pixel-sm font-bold text-center uppercase tracking-wider">
                  Game ID not found. Please check and try again.
                </p>
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={handleJoinById}
                disabled={!joinGameId.trim()}
                className={`flex-1 px-6 py-3 font-bold text-pixel-base pixel-btn uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed ${
                  joinError
                    ? 'bg-pixel-black hover:bg-pixel-dark-gray text-pixel-error border-pixel-error'
                    : 'bg-pixel-primary hover:bg-pixel-success text-pixel-black border-pixel-black'
                }`}
              >
                Join Game
              </button>
              <button
                onClick={handleCloseJoinModal}
                className={`flex-1 px-6 py-3 font-bold text-pixel-base pixel-btn uppercase tracking-wider ${
                  joinError
                    ? 'bg-pixel-dark-gray hover:bg-pixel-gray text-pixel-error border-pixel-error'
                    : 'bg-pixel-gray hover:bg-pixel-light-gray text-pixel-primary border-pixel-gray'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}