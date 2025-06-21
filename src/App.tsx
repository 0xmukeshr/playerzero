import React, { useState } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { GameLobby } from './components/GameLobby';
import { ProfilePage } from './components/ProfilePage';
import { GameInterface } from './components/GameInterface';
import { SocketProvider } from './context/SocketContext';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleNavigateToGames = () => {
    setCurrentPage('games');
  };

  const handlePlayGame = () => {
    setCurrentPage('game');
  };

  const handleExitGame = () => {
    setCurrentPage('games');
  };

  const renderCurrentPage = () => {
    if (currentPage === 'game') {
      return <GameInterface onExitGame={handleExitGame} />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigateToGames={handleNavigateToGames} />;
      case 'games':
        return <GameLobby onPlayGame={handlePlayGame} />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage onNavigateToGames={handleNavigateToGames} />;
    }
  };

  if (currentPage === 'game') {
    return (
      <SocketProvider>
        {renderCurrentPage()}
      </SocketProvider>
    );
  }

  return (
    <SocketProvider>
      <div className="min-h-screen bg-pixel-black scanlines font-pixel">
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
        <main className="relative">
          {renderCurrentPage()}
        </main>
      </div>
    </SocketProvider>
  );
}

export default App;