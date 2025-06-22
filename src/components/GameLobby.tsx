import React, { useState, useEffect } from 'react';
import { usePeer } from '../context/PeerContext';
import { useAudio } from '../hooks/useAudio';

interface PublicGame {
  id: string;
  name: string;
  status: string;
  currentPlayers: number;
  maxPlayers: number;
  hostName: string;
  createdAt: Date;
}

interface GameLobbyProps {
  onPlayGame: () => void;
}

export function GameLobby({ onPlayGame }: GameLobbyProps) {
  const { connected, createGame, joinGame, setGameInfo, gameId } = usePeer();
  const { playSound } = useAudio();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name: string; wallet: string; avatar: string } | null>(null);
  const [gameName, setGameName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [createdGameId, setCreatedGameId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [joinGameId, setJoinGameId] = useState('');
  const [joinError, setJoinError] = useState('');
  const [error, setError] = useState('');
  const [publicGames, setPublicGames] = useState<PublicGame[]>([]);
  const [refreshingGames, setRefreshingGames] = useState(false);
  const [showJoinPublicModal, setShowJoinPublicModal] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedGameName, setSelectedGameName] = useState<string>('');

  // Load user profile on mount
  useEffect(() => {
    const existingProfile = localStorage.getItem('userProfile');
    if (existingProfile) {
      try {
        const profile = JSON.parse(existingProfile);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Load public games on mount
    loadPublicGames();

    // Auto-refresh public games every 10 seconds
    const refreshInterval = setInterval(() => {
      loadPublicGames();
    }, 10000);

    // Check if we have a gameId from the context (game was created)
    if (gameId && !createdGameId) {
      setCreatedGameId(gameId);
    }

    return () => {
      clearInterval(refreshInterval);
    };
  }, [gameId, createdGameId]);

  const loadPublicGames = () => {
    setRefreshingGames(true);
    // Load from localStorage
    try {
      const publicGamesData = JSON.parse(localStorage.getItem('publicGames') || '[]');
      const gamesWithStatus = publicGamesData.map((game: any) => {
        const gameState = localStorage.getItem(`game_${game.id}`);
        if (gameState) {
          const parsedState = JSON.parse(gameState);
          return {
            ...game,
            currentPlayers: parsedState.players.length,
            maxPlayers: 4,
            status: parsedState.players.length >= 4 ? 'Full' : 'Open',
            hostName: parsedState.players.find((p: any) => p.id === parsedState.host)?.name || 'Unknown'
          };
        }
        return null;
      }).filter(Boolean);
      
      setPublicGames(gamesWithStatus);
    } catch (error) {
      console.error('Failed to load public games:', error);
      setPublicGames([]);
    }
    setRefreshingGames(false);
  };

  const handleCreateGame = () => {
    if (gameName.trim() && userProfile?.name) {
      try {
        createGame(gameName.trim(), userProfile.name, isPrivate);
        // Close the modal and refresh games
        setShowCreateModal(false);
        setGameName('');
        setIsPrivate(false);
        loadPublicGames();
        // Navigate to game immediately
        onPlayGame();
      } catch (error) {
        setError('Failed to create game');
      }
    }
  };

  const handleJoinPublicGame = (gameId: string, gameName?: string) => {
    if (userProfile?.name) {
      try {
        joinGame(gameId, userProfile.name);
        onPlayGame();
      } catch (error: any) {
        setError(error.message);
      }
    }
  };


  const handleJoinById = () => {
    if (joinGameId.trim() && userProfile?.name) {
      try {
        joinGame(joinGameId.trim(), userProfile.name);
        onPlayGame();
      } catch (error: any) {
        setJoinError(error.message);
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

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreatedGameId(null);
    setGameName('');
    setCopySuccess(false);
    setError('');
  };

  const handleCloseJoinModal = () => {
    setShowJoinModal(false);
    setJoinGameId('');
    setJoinError('');
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
            onClick={() => {
              playSound('click');
              setShowCreateModal(true);
            }}
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
            onClick={() => {
              playSound('click');
              setShowJoinModal(true);
            }}
            disabled={!connected}
            className="w-full px-6 py-4 bg-pixel-accent hover:bg-pixel-success text-pixel-black font-bold text-pixel-base pixel-btn border-pixel-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join by Game ID
          </button>
        </div>
      </div>

      {/* Public Games Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-pixel-xl font-bold text-pixel-primary uppercase tracking-wider">
            Public Games
          </h3>
          <button
            onClick={() => {
              playSound('click');
              loadPublicGames();
            }}
            disabled={refreshingGames || !connected}
            className="px-4 py-2 bg-pixel-accent hover:bg-pixel-primary text-pixel-black font-bold text-pixel-sm pixel-btn border-pixel-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshingGames ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {publicGames.length === 0 ? (
          <div className="bg-pixel-dark-gray pixel-panel border-pixel-gray p-6 text-center">
            <p className="text-pixel-base-gray text-pixel-base">
              No public games available. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="bg-pixel-dark-gray pixel-panel border-pixel-gray overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-pixel-gray border-b-4 border-pixel-black">
                    <th className="text-left px-4 py-3 text-pixel-base font-bold text-pixel-primary uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-center px-4 py-3 text-pixel-base font-bold text-pixel-primary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-center px-4 py-3 text-pixel-base font-bold text-pixel-primary uppercase tracking-wider">
                      Host
                    </th>
                    <th className="text-center px-4 py-3 text-pixel-base font-bold text-pixel-primary uppercase tracking-wider">
                      Players
                    </th>
                    <th className="text-center px-4 py-3 text-pixel-base font-bold text-pixel-primary uppercase tracking-wider">
                      Join Game
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {publicGames.map((game, index) => (
                    <tr 
                      key={game.id} 
                      className={`border-b-2 border-pixel-black hover:bg-pixel-light-gray transition-colors ${
                        index % 2 === 0 ? 'bg-pixel-dark-gray' : 'bg-pixel-black'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="text-pixel-base font-bold text-pixel-base-gray truncate max-w-xs">
                          {game.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 text-pixel-xs font-bold pixel-notification ${
                          game.status === 'Open' 
                            ? 'bg-pixel-success text-pixel-black border-pixel-success'
                            : 'bg-pixel-warning text-pixel-black border-pixel-warning'
                        }`}>
                          {game.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-pixel-sm font-bold text-pixel-base-gray">
                          {game.hostName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-pixel-sm font-bold text-pixel-base-gray">
                          {game.currentPlayers}/{game.maxPlayers}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            playSound('click');
                            handleJoinPublicGame(game.id);
                          }}
                          disabled={game.status !== 'Open' || !connected}
                          className="px-4 py-2 bg-pixel-primary hover:bg-pixel-success text-pixel-black font-bold text-pixel-sm pixel-btn border-pixel-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {game.status === 'Open' ? 'Join' : 'Full'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
                {/* Show player info */}
                <div className="bg-pixel-gray pixel-panel border-pixel-light-gray p-3 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{userProfile?.avatar}</div>
                    <div>
                      <div className="text-pixel-sm font-bold text-pixel-accent">{userProfile?.name}</div>
                      <div className="text-pixel-xs text-pixel-light-gray">Player</div>
                    </div>
                  </div>
                </div>
                
                <input
                  type="text"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder="Enter game name"
                  className="w-full px-4 py-3 text-pixel-base font-bold bg-pixel-dark-gray text-pixel-base-gray border-4 border-pixel-gray focus:border-pixel-primary focus:outline-none mb-4"
                  maxLength={30}
                />
                
                <div className="mb-6">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="w-5 h-5 accent-pixel-primary"
                    />
                    <span className="text-pixel-base text-pixel-base-gray font-bold">
                      Private Game
                    </span>
                  </label>
                  <p className="text-pixel-xs text-pixel-base-gray mt-1 ml-8">
                    {isPrivate ? 'Only players with the Game ID can join' : 'Game will appear in public lobby'}
                  </p>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      playSound('click');
                      handleCreateGame();
                    }}
                    disabled={!gameName.trim() || !userProfile?.name}
                    className="flex-1 px-6 py-3 bg-pixel-primary hover:bg-pixel-success text-pixel-black font-bold text-pixel-base pixel-btn border-pixel-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      playSound('click');
                      handleCloseCreateModal();
                    }}
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
                    onClick={() => {
                      playSound('click');
                      handlePlayCreatedGame();
                    }}
                    className="flex-1 px-6 py-3 bg-pixel-primary hover:bg-pixel-success text-pixel-black font-bold text-pixel-base pixel-btn border-pixel-black uppercase tracking-wider"
                  >
                    Enter Game
                  </button>
                  <button
                    onClick={() => {
                      playSound('click');
                      handleCloseCreateModal();
                    }}
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
            
            {/* Show player info */}
            <div className="bg-pixel-gray pixel-panel border-pixel-light-gray p-3 mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{userProfile?.avatar}</div>
                <div>
                  <div className="text-pixel-sm font-bold text-pixel-accent">{userProfile?.name}</div>
                  <div className="text-pixel-xs text-pixel-light-gray">Player</div>
                </div>
              </div>
            </div>
            
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
                onClick={() => {
                  playSound('click');
                  handleJoinById();
                }}
                disabled={!joinGameId.trim() || !userProfile?.name}
                className={`flex-1 px-6 py-3 font-bold text-pixel-base pixel-btn uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed ${
                  joinError
                    ? 'bg-pixel-black hover:bg-pixel-dark-gray text-pixel-error border-pixel-error'
                    : 'bg-pixel-primary hover:bg-pixel-success text-pixel-black border-pixel-black'
                }`}
              >
                Join Game
              </button>
              <button
                onClick={() => {
                  playSound('click');
                  handleCloseJoinModal();
                }}
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
