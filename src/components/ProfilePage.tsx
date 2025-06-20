import React from 'react';
import { User, Trophy, Target, Clock } from 'lucide-react';

export function ProfilePage() {
  const stats = [
    { label: 'Games', value: '127', icon: Target, color: 'text-pixel-success', bgColor: 'bg-pixel-success', borderColor: 'border-pixel-success' },
    { label: 'Wins', value: '89', icon: Trophy, color: 'text-pixel-yellow', bgColor: 'bg-pixel-yellow', borderColor: 'border-pixel-yellow' },
    { label: 'Win Rate', value: '70%', icon: Target, color: 'text-pixel-blue', bgColor: 'bg-pixel-blue', borderColor: 'border-pixel-blue' },
    { label: 'Hours', value: '45h', icon: Clock, color: 'text-pixel-magenta', bgColor: 'bg-pixel-magenta', borderColor: 'border-pixel-magenta' }
  ];

  const recentGames = [
    { name: 'Clash of Titans', result: 'Victory', date: '2h ago' },
    { name: 'Strategic Conquest', result: 'Defeat', date: '1d ago' },
    { name: 'Global Domination', result: 'Victory', date: '2d ago' },
    { name: 'Epic Showdown', result: 'Victory', date: '3d ago' }
  ];

  const achievements = [
    { name: 'First Victory', icon: Trophy, unlocked: true },
    { name: 'Win Streak', icon: Target, unlocked: true },
    { name: 'Master Trader', icon: User, unlocked: false },
    { name: 'Time Lord', icon: Clock, unlocked: false }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <h1 className="text-pixel-2xl font-bold text-pixel-primary mb-6 uppercase tracking-wider text-center">
        Player Profile
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-pixel-dark-gray pixel-panel border-pixel-gray p-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-pixel-primary pixel-avatar mx-auto mb-3 flex items-center justify-center">
                <span className="text-pixel-black text-pixel-lg font-bold">JD</span>
              </div>
              <h2 className="text-pixel-lg font-bold text-pixel-primary mb-1 uppercase tracking-wider">John Doe</h2>
              <p className="text-pixel-accent font-bold text-pixel-sm uppercase">Strategy Master</p>
            </div>
            
            <div className="space-y-3">
              <div className="pixel-card bg-pixel-gray border-pixel-light-gray p-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-pixel-primary" />
                  <span className="text-pixel-xs text-pixel-light-gray font-bold uppercase">Joined Mar 2024</span>
                </div>
              </div>
              
              <div className="pixel-card bg-pixel-gray border-pixel-primary p-3">
                <div className="text-pixel-xs text-pixel-light-gray font-bold uppercase mb-1">Current Rank</div>
                <div className="text-pixel-accent font-bold text-pixel-base uppercase tracking-wider animate-pulse">Diamond III</div>
              </div>
              
              <div className="pixel-card bg-pixel-gray border-pixel-secondary p-3">
                <div className="text-pixel-xs text-pixel-light-gray font-bold uppercase mb-1">Total Points</div>
                <div className="text-pixel-secondary font-bold text-pixel-base animate-pulse">15,847</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats and Recent Games */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat, index) => (
              <div key={index} className={`bg-pixel-gray pixel-card ${stat.borderColor} p-3`}>
                <div className={`flex items-center justify-center w-8 h-8 ${stat.bgColor} pixel-avatar mb-2`}>
                  <stat.icon className="w-4 h-4 text-pixel-black" />
                </div>
                <div className={`text-pixel-lg font-bold ${stat.color} mb-1 animate-pulse`}>{stat.value}</div>
                <div className="text-pixel-xs text-pixel-primary font-bold uppercase">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Games */}
          <div className="bg-pixel-dark-gray pixel-panel border-pixel-gray">
            <div className="px-4 py-3 border-b-2 border-pixel-gray">
              <h3 className="text-pixel-base font-bold text-pixel-primary uppercase tracking-wider text-center">Recent Games</h3>
            </div>
            <div className="p-3 space-y-2">
              {recentGames.map((game, index) => (
                <div key={index} className="pixel-card bg-pixel-gray border-pixel-light-gray p-3 hover:bg-pixel-light-gray transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-pixel-primary font-bold text-pixel-sm">
                        {game.name.length > 20 ? game.name.substring(0, 17) + '...' : game.name}
                      </div>
                      <div className="text-pixel-xs text-pixel-light-gray font-bold">{game.date}</div>
                    </div>
                    <div>
                      <span className={`px-2 py-1 pixel-notification text-pixel-xs font-bold uppercase tracking-wider ${
                        game.result === 'Victory' 
                          ? 'bg-pixel-success text-pixel-black border-pixel-black' 
                          : 'bg-pixel-error text-pixel-black border-pixel-black'
                      }`}>
                        {game.result}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Achievements */}
          <div className="bg-pixel-dark-gray pixel-panel border-pixel-gray">
            <div className="px-4 py-3 border-b-2 border-pixel-gray">
              <h3 className="text-pixel-base font-bold text-pixel-primary uppercase tracking-wider text-center">Achievements</h3>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-2 gap-2">
                {achievements.map((achievement, index) => (
                  <div key={index} className={`pixel-card p-2 ${
                    achievement.unlocked 
                      ? 'bg-pixel-gray border-pixel-accent' 
                      : 'bg-pixel-dark-gray border-pixel-light-gray'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 pixel-avatar flex items-center justify-center ${
                        achievement.unlocked 
                          ? 'bg-pixel-accent' 
                          : 'bg-pixel-light-gray'
                      }`}>
                        <achievement.icon className="w-3 h-3 text-pixel-black" />
                      </div>
                      <div>
                        <div className={`text-pixel-xs font-bold uppercase ${
                          achievement.unlocked 
                            ? 'text-pixel-accent' 
                            : 'text-pixel-light-gray'
                        }`}>
                          {achievement.name}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}