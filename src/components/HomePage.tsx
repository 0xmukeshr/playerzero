import React from 'react';
import { Trophy, Users, Zap, Target } from 'lucide-react';

interface HomePageProps {
  onNavigateToGames: () => void;
}

export function HomePage({ onNavigateToGames }: HomePageProps) {
  const features = [
    {
      icon: Trophy,
      title: 'Competitive Gaming',
      description: 'Join ranked matches and climb the leaderboards'
    },
    {
      icon: Users,
      title: 'Multiplayer Battles',
      description: 'Team up with friends or face opponents worldwide'
    },
    {
      icon: Zap,
      title: 'Real-time Action',
      description: 'Experience fast-paced strategic gameplay'
    },
    {
      icon: Target,
      title: 'Strategic Depth',
      description: 'Master complex tactics and outsmart your rivals'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-pixel-3xl font-bold text-pixel-primary mb-8 uppercase tracking-wider">
          Welcome to <span className="text-pixel-accent animate-bounce-pixel">Strategy Clash</span>
        </h1>
        <p className="text-pixel-base text-pixel-light-gray mb-8 max-w-2xl mx-auto leading-relaxed">
          Master the art of strategic warfare in intense multiplayer battles. 
          Join thousands of players in the ultimate test of tactical prowess.
        </p>
        <button
          onClick={onNavigateToGames}
          className="px-8 py-4 bg-pixel-primary hover:bg-pixel-accent text-pixel-black font-bold text-pixel-lg uppercase tracking-wider pixel-btn border-pixel-black"
        >
          Enter Game Lobby
        </button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {features.map((feature, index) => (
          <div key={index} className="bg-pixel-gray pixel-card border-pixel-light-gray p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-pixel-secondary pixel-avatar mb-4">
              <feature.icon className="w-6 h-6 text-pixel-black" />
            </div>
            <h3 className="text-pixel-lg font-bold text-pixel-primary mb-3 uppercase">{feature.title}</h3>
            <p className="text-pixel-light-gray text-pixel-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="bg-pixel-dark-gray pixel-panel border-pixel-gray p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="pixel-card bg-pixel-gray border-pixel-primary p-4">
            <div className="text-pixel-2xl font-bold text-pixel-success mb-2 animate-pulse">15,000+</div>
            <div className="text-pixel-primary text-pixel-sm uppercase tracking-wider">Active Players</div>
          </div>
          <div className="pixel-card bg-pixel-gray border-pixel-secondary p-4">
            <div className="text-pixel-2xl font-bold text-pixel-warning mb-2 animate-pulse">500+</div>
            <div className="text-pixel-primary text-pixel-sm uppercase tracking-wider">Daily Matches</div>
          </div>
          <div className="pixel-card bg-pixel-gray border-pixel-accent p-4">
            <div className="text-pixel-2xl font-bold text-pixel-cyan mb-2 animate-pulse">24/7</div>
            <div className="text-pixel-primary text-pixel-sm uppercase tracking-wider">Game Availability</div>
          </div>
        </div>
      </div>
    </div>
  );
}