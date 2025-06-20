import React, { useState } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { GameLobby } from './components/GameLobby';
import { ProfilePage } from './components/ProfilePage';
import { GameInterface } from './components/GameInterface';
import { useGames } from './hooks/useGames';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const { games, joinGame, viewGame, startNewGame } = useGames();

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setCurrentGameId(null);
  };

  const handleNavigateToGames = () => {
    setCurrentPage('games');
  };

  const handlePlayGame = (gameId: string) => {
    setCurrentGameId(gameId);
    setCurrentPage('game');
  };

  const handleExitGame = () => {
    setCurrentGameId(null);
    setCurrentPage('games');
  };

  const renderCurrentPage = () => {
    if (currentPage === 'game' && currentGameId) {
      return <GameInterface gameId={currentGameId} onExitGame={handleExitGame} />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigateToGames={handleNavigateToGames} />;
      case 'games':
        return (
          <GameLobby
            games={games}
            onJoinGame={joinGame}
            onViewGame={viewGame}
            onStartNewGame={startNewGame}
            onPlayGame={handlePlayGame}
          />
        );
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage onNavigateToGames={handleNavigateToGames} />;
    }
  };

  if (currentPage === 'game' && currentGameId) {
    return renderCurrentPage();
  }

  return (
    <div className="min-h-screen bg-pixel-black scanlines font-pixel">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="relative">
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;