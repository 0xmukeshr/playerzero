# Database Setup Guide - Player Zero Game

This guide will help you set up a Supabase database for your Player Zero game to store games persistently.

## What's Included

The database stores:
- ✅ **Game Name** - The name of the game session
- ✅ **Game ID** - Unique identifier for joining games 
- ✅ **Status** - waiting, playing, or finished
- ✅ **Visibility** - public or private games
- ✅ **Players** - Array of player data (names, tokens, assets)
- ✅ **Created At** - Timestamp when game was created
- ✅ **Game State** - Full game state for resuming sessions

## Quick Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for it to initialize (2-3 minutes)

### 2. Get Your Credentials
1. In your Supabase dashboard, go to **Settings > API**
2. Copy your:
   - Project URL
   - `anon` public key 
   - `service_role` secret key

### 3. Configure Environment
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update your `.env` file:
   ```env
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

### 4. Setup Database Schema

**Option A: Automatic Setup**
```bash
node scripts/setup-database.js
```

**Option B: Manual Setup**
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy contents of `database/schema.sql`
4. Paste and run the SQL

## Database Schema

### `games` Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `game_name` | VARCHAR | Display name of the game |
| `game_id` | VARCHAR | Short ID for joining (e.g., "ABC123DEF") |
| `status` | VARCHAR | 'waiting', 'playing', 'finished' |
| `visibility` | VARCHAR | 'public', 'private' |
| `players` | JSONB | Array of player objects |
| `game_state` | JSONB | Current game state |
| `host_player_id` | VARCHAR | ID of the game host |
| `current_players` | INTEGER | Number of current players |
| `max_players` | INTEGER | Maximum players (default: 4) |
| `created_at` | TIMESTAMP | When game was created |
| `updated_at` | TIMESTAMP | Last update time |

### `public_games` View
A filtered view showing only public games that are:
- Public visibility
- Waiting for players
- Not full (current_players < max_players)
- Ordered by creation time

## Features

### ✅ Real-time Game Management
- Games persist even if server restarts
- Players can rejoin interrupted games
- Host migration when original host disconnects

### ✅ Public Game Discovery
- Lists all available public games
- Shows player count and host information
- Real-time updates when games are created/joined

### ✅ Automatic Cleanup
- Removes finished games older than 24 hours
- Prevents database bloat
- Runs automatically every hour

### ✅ Security
- Row Level Security (RLS) enabled
- Public access for game browsing
- Secure API key usage

## How It Works

### Game Creation Flow
1. Player creates game → Stored in Supabase `games` table
2. Game appears in public games list (if public)
3. Other players can discover and join
4. Game state updates in real-time via Socket.IO
5. Database keeps persistent backup

### Data Persistence
- **Memory**: Real-time game state for fast updates
- **Database**: Persistent storage for reliability
- **Sync**: Database updated on major events (join, start, finish)

## Troubleshooting

### Common Issues

**"Missing Supabase configuration" Error**
- Check your `.env` file has correct credentials
- Ensure no extra spaces in environment variables
- Verify your Supabase project is active

**"Games not appearing in public list"**
- Check game visibility is set to 'public'
- Verify game status is 'waiting'
- Make sure database schema was applied correctly

**"Failed to create game" Error**
- Check Supabase service role key has write permissions
- Verify your database schema is properly set up
- Check Supabase project quota/limits

### Verification Steps

1. **Test Database Connection**:
   ```bash
   node scripts/setup-database.js
   ```

2. **Check Supabase Dashboard**:
   - Go to **Table Editor**
   - Verify `games` table exists
   - Check if test data appears

3. **Test Game Creation**:
   - Start your server: `npm run dev`
   - Create a public game
   - Check if it appears in Supabase table

## Migration from In-Memory Storage

Your server now uses:
- **Supabase** for persistent game data
- **Memory (Map)** for real-time game state
- **Socket.IO** for instant updates

This hybrid approach gives you:
- ✅ Persistence across server restarts
- ✅ Fast real-time updates
- ✅ Scalability for multiple server instances
- ✅ Game discovery and matchmaking

## Support

If you need help:
1. Check this README first
2. Verify your `.env` configuration
3. Run the setup script with `--manual` flag for manual instructions
4. Check Supabase dashboard for any project issues

