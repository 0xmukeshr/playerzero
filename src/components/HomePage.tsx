import React, { useEffect, useRef } from 'react';
import { Trophy, Users, Zap, Target } from 'lucide-react';

interface HomePageProps {
  onNavigateToGames: () => void;
}

export function HomePage({ onNavigateToGames }: HomePageProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

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

  // Auto-play background music on component mount
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      // Set volume to a reasonable level
      audio.volume = 0.3;
      // Attempt to play (some browsers require user interaction)
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Auto-play prevented by browser policy:', error);
        });
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background Audio */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        className="hidden"
      >
        <source src="/audio/pixel-paradise.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Centered Hero Section */}
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-pixel-primary mb-8 uppercase tracking-wider animate-pulse  animate-pulse">
       <span className="relative -top-[20px] block">Welcome</span>
        <span className="text-pixel-accent animate-bounce-pixel">Player_Zero</span>
        </h1>


        <p className="text-pixel-lg text-pixel-base-gray mb-12 max-w-3xl mx-auto leading-relaxed">
          Master the art of strategic warfare in intense multiplayer battles. 
          Join thousands of players in the ultimate test of tactical prowess.
        </p>
        <button
          onClick={onNavigateToGames}
          className="px-12 py-6 bg-pixel-primary hover:bg-pixel-accent text-pixel-black font-bold text-pixel-xl uppercase tracking-wider pixel-btn border-pixel-black transform hover:scale-105 transition-transform animate-bounce"
        >
          Enter Game Lobby
        </button>
      </div>
    </div>
  );
}