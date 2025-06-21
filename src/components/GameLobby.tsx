import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

interface GameLobbyProps {
  onPlayGame: () => void;
}

export function GameLobby({ onPlayGame }: GameLobbyProps) {
  const { socket, connected, setGameInfo } = useSocket();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [gameName, setGameName] = useState('');
  const [createdGameId, setCreatedGameId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [joinGameId, setJoinGameId] = useState('');
  const [joinError, setJoinError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!socket) return;

    socket.on('game-created', (data) => {
      setCreatedGameId(data.gameId);
      setGameInfo(data.gameId, data.playerId, playerName);
      setGameName('');
      setPlayerName('');
    });

    socket.on('game-joined', (data) => {
      setGameInfo(data.gameId, data.playerId, playerName);
      onPlayGame();
    });

    socket.on('error', (data) => {
      setError(data.message);
      if (showJoinModal) {
        setJoinError(data.message);
      }
    });

    return () => {
      socket.off('game-created');
      socket.off('game-joined');
      socket.off('error');
    };
  }, [socket, onPlayGame, showJoinModal]);

  const handleCreateGame = () => {
    if (gameName.trim() && playerName.trim() && socket) {
      socket.emit('create-game', {
        gameName: gameName.trim(),
        playerName: playerName.trim()
      });
    }
  };

  const handleJoinById = () => {
    if (joinGameId.trim() && playerName.trim() && socket) {
      socket.emit('join-game', {
        gameId: joinGameId.trim(),
        playerName: playerName.trim()
      });
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

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreatedGameId(null);
    setGameName('');
    setPlayerName('');
    setCopySuccess(false);
    setError('');
  };

  const handleCloseJoinModal = () => {
    setShowJoinModal(false);
    setJoinGameId('');
    setJoinError('');
    setPlayerName('');
    setError('');
  };

  const handlePlayCreatedGame = () => {
    handleCloseCreateModal();
    onPlayGame();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h2 className="text-pixel-2xl font-bold text-pixel-primary mb-8 uppercase tracking-wider text-center">
        Multiplayer Lobby
      </h2>
      
      {!connected && (
        <div className="bg-pixel-error p-4 pixel-panel border-pixel-error mb-6">
          <p className="text-pixel-black text-center font-bold">
            Connecting to server...
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Game Card */}
        <div className="bg-pixel-dark-gray pixel-panel border-pixel-gray p-6">
          <h3 className="text-pixel-xl font-bold text-pixel-primary mb-4 uppercase tracking-wider text-center">
            Create Game
          </h3>
          <p className="text-pixel-base-gray text-pixel-sm mb-6 text-center">
            Start a new multiplayer game and invite friends
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={!connected}
            className="w-full px-6 py-4 bg-pixel-primary hover:bg-pixel-success text-pixel-black font-bold text-pixel-base pixel-btn border-pixel-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create New Game
          </button>
        </div>

        {/* Join Game Card */}
        <div className="bg-pixel-dark-gray pixel-panel border-pixel-gray p-6">
          <h3 className="text-pixel-xl font-bold text-pixel-primary mb-4 uppercase tracking-wider text-center">
            Join Game
          </h3>
          <p className="text-pixel-base-gray text-pixel-sm mb-6 text-center">
            Enter a game ID to join an existing game
          </p>
          <button
            onClick={() => setShowJoinModal(true)}
            disabled={!connected}
            className="w-full px-6 py-4 bg-pixel-accent hover:bg-pixel-success text-pixel-black font-bold text-pixel-base pixel-btn border-pixel-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join by Game ID
          </button>
        </div>
      </div>

      {/* Create Game Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-pixel-light-gray p-8 pixel-panel border-pixel-black max-w-md w-full mx-4">
            <h3 className="text-pixel-xl font-bold text-pixel-primary text-center mb-6 uppercase tracking-wider">
              Create New Game
            </h3>
            
            {error && (
              <div className="bg-pixel-error p-3 pixel-panel border-pixel-error mb-4">
                <p className="text-pixel-black text-pixel-sm font-bold text-center">
                  {error}
                </p>
              </div>
            )}
            
            {!createdGameId ? (
              <>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 text-pixel-base font-bold bg-pixel-dark-gray text-pixel-base-gray border-4 border-pixel-gray focus:border-pixel-primary focus:outline-none mb-4"
                  maxLength={20}
                />
                
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
                    disabled={!gameName.trim() || !playerName.trim()}
                    className="flex-1 px-6 py-3 bg-pixel-primary hover:bg-pixel-success text-pixel-black font-bold text-pixel-base pixel-btn border-pixel-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create
                  </button>
                  <button
                    onClick={handleCloseCreateModal}
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
                    <div className="flex items-center justify-center space-x-3 mb-4">
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
                    <p className="text-pixel-xs text-pixel-base-gray">
                      Share this ID with friends to let them join!
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={handlePlayCreatedGame}
                    className="flex-1 px-6 py-3 bg-pixel-primary hover:bg-pixel-success text-pixel-black font-bold text-pixel-base pixel-btn border-pixel-black uppercase tracking-wider"
                  >
                    Enter Game
                  </button>
                  <button
                    onClick={handleCloseCreateModal}
                    className="flex-1 px-6 py-3 bg-pixel-gray hover:bg-pixel-light-gray text-pixel-primary font-bold text-pixel-base pixel-btn border-pixel-gray uppercase tracking-wider"
                  >
                    Close
                  </button>
                </div>
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
              {joinError ? 'Error!' : 'Join Game'}
            </h3>
            
            {joinError && (
              <div className="bg-pixel-black p-3 pixel-panel border-pixel-error mb-4">
                <p className="text-pixel-error text-pixel-sm font-bold text-center uppercase tracking-wider">
                  {joinError}
                </p>
              </div>
            )}
            
            <input
              type="text"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                if (joinError) setJoinError(''); // Reset error when typing
              }}
              placeholder="Enter your name"
              className={`w-full px-4 py-3 text-pixel-base font-bold border-4 focus:outline-none mb-4 ${
                joinError 
                  ? 'bg-pixel-dark-gray text-pixel-error border-pixel-error focus:border-pixel-error'
                  : 'bg-pixel-dark-gray text-pixel-base-gray border-pixel-gray focus:border-pixel-primary'
              }`}
              maxLength={20}
            />
            
            <input
              type="text"
              value={joinGameId}
              onChange={(e) => {
                setJoinGameId(e.target.value.toUpperCase());
                if (joinError) setJoinError(''); // Reset error when typing
              }}
              placeholder="Enter Game ID"
              className={`w-full px-4 py-3 text-pixel-base font-bold border-4 focus:outline-none mb-6 uppercase tracking-wider text-center ${
                joinError 
                  ? 'bg-pixel-dark-gray text-pixel-error border-pixel-error focus:border-pixel-error'
                  : 'bg-pixel-dark-gray text-pixel-base-gray border-pixel-gray focus:border-pixel-primary'
              }`}
              maxLength={9}
            />
            
            <div className="flex space-x-4">
              <button
                onClick={handleJoinById}
                disabled={!joinGameId.trim() || !playerName.trim()}
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
