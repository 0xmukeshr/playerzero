import React from 'react';
import { Bell, Sword } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'games', label: 'Games' },
    { id: 'profile', label: 'Profile' }
  ];

  return (
    <header className="bg-pixel-dark-gray pixel-panel border-pixel-gray border-b-4 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-10 h-10 bg-pixel-primary pixel-avatar">
            <Sword className="w-6 h-6 text-pixel-black" />
          </div>
          <h1 className="text-pixel-lg font-bold text-pixel-primary uppercase tracking-wider">Player Zero</h1>
        </div>

        <nav className="flex items-center space-x-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-4 py-2 pixel-nav-item text-pixel-sm font-bold uppercase tracking-wider ${
                currentPage === item.id
                  ? 'bg-pixel-primary text-pixel-black active'
                  : 'text-pixel-primary hover:text-pixel-black hover:bg-pixel-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="pixel-notification bg-pixel-secondary border-pixel-black w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-pixel-warning transition-colors">
              <Bell className="w-4 h-4 text-pixel-black" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-pixel-error pixel-avatar animate-blink"></div>
          </div>
          <div className="w-10 h-10 bg-pixel-accent pixel-avatar flex items-center justify-center">
            <span className="text-pixel-black text-pixel-sm font-bold">JD</span>
          </div>
        </div>
      </div>
    </header>
  );
}