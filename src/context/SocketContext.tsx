import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  gameId: string | null;
  playerId: string | null;
  playerName: string | null;
  setGameInfo: (gameId: string, playerId: string, playerName: string) => void;
  clearGameInfo: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);

  useEffect(() => {
    // Use environment variable or default to localhost for development
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    const newSocket = io(serverUrl);
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, []);

  const setGameInfo = (newGameId: string, newPlayerId: string, newPlayerName: string) => {
    setGameId(newGameId);
    setPlayerId(newPlayerId);
    setPlayerName(newPlayerName);
  };

  const clearGameInfo = () => {
    setGameId(null);
    setPlayerId(null);
    setPlayerName(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        gameId,
        playerId,
        playerName,
        setGameInfo,
        clearGameInfo,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

