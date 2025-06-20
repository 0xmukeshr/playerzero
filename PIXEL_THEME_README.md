# 🎮 Pixelated Theme Implementation

Your Strategy Clash application has been completely transformed with a retro pixel art theme! Here's what's been implemented:

## 🎨 Theme Features

### **Visual Style**
- **Pixel-perfect font**: Uses "Press Start 2P" - the classic 8-bit gaming font
- **Retro color palette**: 8-bit inspired colors including neon greens, yellows, blues, and reds
- **Pixelated borders**: Chunky, blocky borders with shadow effects
- **Scanline effects**: Optional CRT monitor-style scanlines overlay
- **Crisp image rendering**: All graphics use pixel-perfect rendering

### **UI Components**

#### **Buttons** (`.pixel-btn`)
- 3D pixelated appearance with shadow effects
- Hover and click animations that simulate pressing a physical button
- Uppercase text with wide letter spacing

#### **Panels** (`.pixel-panel`)
- Retro computer terminal-style panels
- Inset shadows for depth
- Thick borders with 8-bit styling

#### **Cards** (`.pixel-card`)
- Game cartridge-inspired design
- Hover effects that lift the cards
- Multiple border color variants

#### **Notifications** (`.pixel-notification`)
- Classic game HUD-style notifications
- Perfect for status indicators and alerts

#### **Inputs** (`.pixel-input`)
- Retro terminal-style input fields
- Inset appearance with pixelated borders

### **Color Palette**

#### **Primary Colors**
- `pixel-primary`: #00ff88 (Neon Green)
- `pixel-secondary`: #ff8800 (Orange)
- `pixel-accent`: #88ff00 (Lime Green)

#### **Status Colors**
- `pixel-success`: #00ff44 (Success Green)
- `pixel-warning`: #ff4400 (Warning Orange)
- `pixel-error`: #ff0044 (Error Red)

#### **Game Colors**
- `pixel-health`: #ff4444 (Health Red)
- `pixel-mana`: #4444ff (Mana Blue)
- `pixel-energy`: #ffff44 (Energy Yellow)
- `pixel-experience`: #44ff44 (XP Green)

#### **8-bit Colors**
- `pixel-red`: #ff4444
- `pixel-green`: #44ff44
- `pixel-blue`: #4444ff
- `pixel-yellow`: #ffff44
- `pixel-magenta`: #ff44ff
- `pixel-cyan`: #44ffff

#### **Grayscale**
- `pixel-black`: #0f0f0f
- `pixel-dark-gray`: #1a1a1a
- `pixel-gray`: #2d2d2d
- `pixel-light-gray`: #404040

### **Typography**

#### **Pixel Font Sizes**
- `text-pixel-xs`: 8px
- `text-pixel-sm`: 10px
- `text-pixel-base`: 12px
- `text-pixel-lg`: 14px
- `text-pixel-xl`: 16px
- `text-pixel-2xl`: 20px
- `text-pixel-3xl`: 24px

### **Animations**
- `animate-blink`: Classic blinking cursor effect
- `animate-bounce-pixel`: Retro bouncing animation
- `animate-pulse`: Subtle pulsing for important elements

### **Special Effects**

#### **Scanlines** (`.scanlines`)
Adds a subtle CRT monitor effect with horizontal lines across the entire interface.

#### **Pixel Spacing**
Custom spacing utilities that align with the pixel grid:
- `pixel`: 2px
- `pixel-2`: 4px
- `pixel-3`: 6px
- `pixel-4`: 8px
- `pixel-6`: 12px
- `pixel-8`: 16px

## 🎮 Updated Components

### **Header**
- Retro game cartridge-style logo
- Pixelated navigation buttons
- 8-bit notification bell with blinking indicator
- Blocky user avatar

### **Home Page**
- Pixel art hero section with animated title
- Game cartridge-style feature cards
- Retro stats display with pulsing numbers

### **Game Lobby**
- Terminal-style game list
- Pixelated status indicators
- Retro action buttons

### **Game Interface**
- Full pixel art transformation
- Scanline overlay for authentic CRT feel
- Color-coded resource displays
- Chunky, game-like UI elements

### **Timer**
- Digital clock display with pixel borders
- Pulsing numbers for urgency
- Retro time unit labels

### **Player Wallet**
- Game inventory-style layout
- Color-coded resource icons
- Animated token display

## 🚀 Usage

The theme is automatically applied to all components. Key classes you can use:

```html
<!-- Buttons -->
<button class="pixel-btn bg-pixel-primary text-pixel-black border-pixel-black">
  Click Me!
</button>

<!-- Panels -->
<div class="pixel-panel bg-pixel-dark-gray border-pixel-gray">
  Content here
</div>

<!-- Cards -->
<div class="pixel-card bg-pixel-gray border-pixel-primary">
  Card content
</div>

<!-- Text with pixel font -->
<h1 class="font-pixel text-pixel-2xl text-pixel-primary uppercase tracking-wider">
  Pixel Title
</h1>
```

## 🎯 Perfect For
- Retro gaming applications
- Nostalgic user interfaces
- 8-bit style games
- Pixel art projects
- Indie game interfaces
- Retro-computing themes

Enjoy your new pixelated gaming experience! 🕹️

