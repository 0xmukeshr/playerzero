import { useState, useCallback } from 'react';
import { Game } from '../types/game';

const initialGames: Game[] = [
  {
    id: '1',
    name: 'Resource Wars Alpha',
    status: 'Open',
    currentPlayers: 1,
    maxPlayers: 4,
    createdAt: new Date(),
    currentRound: 1,
    maxRounds: 20
  },
  {
    id: '2',
    name: 'Trading Empire',
    status: 'In Progress',
    currentPlayers: 4,
    maxPlayers: 4,
    createdAt: new Date(),
    currentRound: 8,
    maxRounds: 20
  },
  {
    id: '3',
    name: 'Market Domination',
    status: 'Open',
    currentPlayers: 2,
    maxPlayers: 4,
    createdAt: new Date(),
    currentRound: 1,
    maxRounds: 20
  },
  {
    id: '4',
    name: 'Strategic Assets',
    status: 'Finished',
    currentPlayers: 4,
    maxPlayers: 4,
    createdAt: new Date(),
    currentRound: 20,
    maxRounds: 20
  },
  {
    id: '5',
    name: 'Economic Warfare',
    status: 'Open',
    currentPlayers: 3,
    maxPlayers: 4,
    createdAt: new Date(),
    currentRound: 1,
    maxRounds: 20
  }
];

export function useGames() {
  const [games, setGames] = useState<Game[]>(initialGames);

  const joinGame = useCallback((gameId: string) => {
    setGames(prevGames => 
      prevGames.map(game => {
        if (game.id === gameId && game.status === 'Open' && game.currentPlayers < game.maxPlayers) {
          const newCurrentPlayers = game.currentPlayers + 1;
          return {
            ...game,
            currentPlayers: newCurrentPlayers,
            status: newCurrentPlayers === game.maxPlayers ? 'In Progress' as const : game.status
          };
        }
        return game;
      })
    );
  }, []);

  const viewGame = useCallback((gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (game) {
      alert(`Viewing game: ${game.name}\nStatus: ${game.status}\nPlayers: ${game.currentPlayers}/${game.maxPlayers}\nRound: ${game.currentRound}/${game.maxRounds}`);
    }
  }, [games]);

  const startNewGame = useCallback(() => {
    const gameNames = [
      'Resource Conquest',
      'Trading Titans',
      'Market Masters',
      'Economic Empire',
      'Strategic Assets',
      'Commodity Wars',
      'Trade Dominion',
      'Resource Rush'
    ];
    
    const randomName = gameNames[Math.floor(Math.random() * gameNames.length)];
    const newGame: Game = {
      id: Date.now().toString(),
      name: randomName,
      status: 'Open',
      currentPlayers: 1,
      maxPlayers: 4,
      createdAt: new Date(),
      currentRound: 1,
      maxRounds: 20
    };

    setGames(prevGames => [newGame, ...prevGames]);
  }, []);

  return {
    games,
    joinGame,
    viewGame,
    startNewGame
  };
}