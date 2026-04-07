# Music Data Population Setup

This guide walks you through setting up the music data population script for FREQUENCY app.

## Overview

The `populate_music_data.py` script:
- Fetches emerging and top artists from **Last.fm API** by region/country
- Searches for their top tracks and audio on **YouTube Data API**
- Automatically populates your Supabase database with:
  - Regions (countries grouped by continent)
  - Artists (with listener counts, emerging status)
  - Tracks (with audio URLs, genres, cultural context)
  - Genres

**Target**: ~100 artists/tracks across 26 regions/countries

## Prerequisites

- Python 3.8+
- pip (Python package manager)
- Last.fm API key (free)
- YouTube Data API key (free)

## Step 1: Get API Keys

### Last.fm API Key

1. Go to [Last.fm API](https://www.last.fm/api/account/create)
2. Sign up for a Last.fm account (if you don't have one)
3. Fill out the form:
   - Application name: `FREQUENCY Music Discovery`
   - Application description: `Class project for discovering global music`
   - Commercial: No
4. Accept the terms and create the application
5. Copy your **API Key** (you don't need the shared secret)

### YouTube Data API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **YouTube Data API v3**:
   - Click "Enable APIs and Services"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. Create credentials:
   - Click "Create Credentials"
   - Choose "API Key"
   - Copy the API Key
5. ⚠️ **Important**: Restrict your key to **YouTube Data API v3** only (for security)

## Step 2: Install Dependencies

```bash
cd scripts
pip install -r requirements.txt
```

Or install individually:
```bash
pip install requests python-dotenv supabase
```

## Step 3: Configure Environment Variables

Create a `.env` file in the project root (or scripts folder) with your API keys:

```bash
# Copy the template
cp .env.example .env

# Edit .env and add your keys:
LASTFM_API_KEY=your_lastfm_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
```

**Or manually create `.env`:**

```
LASTFM_API_KEY=xxxxxxxxxxxxxxxxxxxx
YOUTUBE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 4: Run the Script

From the project root:

```bash
python scripts/populate_music_data.py
```

The script will:
1. ✅ Create all genres
2. ✅ Create all regions/countries
3. ✅ Fetch artists for each region
4. ✅ Fetch tracks for each artist
5. ✅ Search for audio on YouTube
6. ✅ Populate Supabase database

**Expected output:**
```
🎵 FREQUENCY - Music Data Population Script

==================================================
Setting up genres...
  ✓ Created genre: Hip Hop
  ✓ Created genre: R&B
  ...
Genres ready: 22 genres

Setting up regions...
  ✓ Created region: Nigeria
  ✓ Created region: Ghana
  ...
Regions ready: 26 regions

Fetching and populating music data...
==================================================

📍 Processing Nigeria...
  ✓ Created artist: Wizkid
    ✓ Created track: Essence
    ✓ Created track: Essence (Remix)
  ...

✅ Population complete!
   • Genres created: 22
   • Regions created: 26
   • Artists processed: 24
```

## Troubleshooting

### "Missing API keys" Error
- Make sure your `.env` file is in the correct location
- Check that `LASTFM_API_KEY` and `YOUTUBE_API_KEY` are properly set
- No quotes needed around keys in .env

### "Too many requests" Error
- The script has rate limiting built in, but Last.fm/YouTube may still throttle
- Wait a few minutes and try again
- Last.fm free tier: 60 requests/minute

### "Supabase connection failed" Error
- Check that your `.env` file at the project root has valid Supabase credentials
- Verify you're connected to the internet
- Make sure you're using the new Supabase project (gblzutsvoywatulevhux)

### No tracks appearing with audio_url
- YouTube searches may not always find official audio
- Some artists/tracks may not have official uploads
- The script still creates the tracks even without audio URLs
- You can manually add audio URLs later through the Supabase dashboard

## Running Periodically

To refresh data regularly (e.g., daily for emerging artists), you can:

### macOS/Linux - Cron Job
```bash
# Edit crontab
crontab -e

# Add this line to run daily at 2 AM:
0 2 * * * cd /path/to/Spherical && python scripts/populate_music_data.py >> scripts/music_sync.log 2>&1
```

### Windows - Task Scheduler
- Create a batch file: `scripts/run_sync.bat`
- Add: `cd C:\path\to\Spherical && python scripts/populate_music_data.py`
- Schedule it in Task Scheduler

### Docker/Cloud Function
Deploy to a serverless function and trigger on schedule.

## Data Structure

The script creates:

**Regions Table**
- id (UUID)
- name (Country name)
- country (Country name)
- description (Continent + Country)

**Artists Table**
- id (UUID)
- name (Artist name)
- region_id (Reference to regions)
- listener_count (From Last.fm)
- is_emerging (true if < 50k listeners)
- bio (Auto-generated)

**Tracks Table**
- id (UUID)
- title (Track name)
- artist_id (Reference to artists)
- region_id (Reference to regions)
- genre_id (Reference to genres)
- audio_url (YouTube link or null)
- cultural_context (Auto-generated)
- play_count (0, updated by app)

## Customization

To change what data is fetched, edit `populate_music_data.py`:

- **Regions**: Modify the `REGIONS` list
- **Genres**: Modify the `GENRES` list
- **Artists per country**: Change `artists_per_country` in `run()` method
- **Tracks per artist**: Change `limit` in `get_artist_top_tracks()` call

## Next Steps

1. After running the script, test the app at `http://localhost:8080`
2. You should now see regions in the region picker
3. Click on a region to see artists and tracks
4. Test audio playback for tracks with audio URLs

## Support

If you encounter issues:
- Check API rate limits on Last.fm and YouTube
- Verify API keys are valid
- Make sure Supabase credentials in `.env` match your new project
- Review error logs in the console output
