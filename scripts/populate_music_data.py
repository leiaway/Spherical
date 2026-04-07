#!/usr/bin/env python3
"""
Music data population script for FREQUENCY app.
Fetches music from Last.fm and YouTube, populates Supabase database.
Targets ~100 artists/tracks across diverse regions/cultures.
"""

import os
import sys
import json
import time
from typing import Optional, List, Dict, Any
import urllib.request
import urllib.parse
from pathlib import Path

# Add parent directory to path for imports
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

import requests
from dotenv import load_dotenv

# Load environment variables from project root
load_dotenv(project_root / '.env')

# Initialize Supabase REST client
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or "https://gblzutsvoywatulevhux.supabase.co"
# Use service role key to bypass RLS during data population.
# Falls back to publishable key if not set (will fail on RLS-protected tables).
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY") or "sb_publishable_sqgyDoJBsQuFD_iQO8ruAw_zA3HX97R"

# Remove quotes if present
SUPABASE_URL = SUPABASE_URL.strip('"\'')
SUPABASE_KEY = SUPABASE_KEY.strip('"\'')

class SupabaseClient:
    """Simple Supabase REST API client"""
    def __init__(self, url: str, key: str):
        self.url = url.rstrip('/')
        self.key = key
        self.session = requests.Session()
        self.session.headers.update({
            'apikey': self.key,
            'Authorization': f'Bearer {self.key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
        })

    def from_(self, table: str):
        return SupabaseTable(self, table)

class SupabaseTable:
    """Simple table operations"""
    def __init__(self, client: SupabaseClient, table: str):
        self.client = client
        self.table = table
        self.url = f"{client.url}/rest/v1/{table}"
        self.query = ""
        self.filters = {}

    def select(self, columns: str = "*"):
        self.query = f"?select={columns}"
        return self

    def eq(self, column: str, value: str):
        self.filters[column] = value
        return self

    def execute(self):
        """Execute GET request with filters"""
        url = self.url + (self.query if self.query else "?select=*")

        # Add filters to URL
        for col, val in self.filters.items():
            separator = "&" if "?" in url else "?"
            url += f"{separator}{col}=eq.{val}"

        try:
            response = self.client.session.get(url, timeout=10)
            response.raise_for_status()
            return SupabaseResponse(response.json() if response.text else [])
        except Exception as e:
            print(f"Error executing query: {e}")
            return SupabaseResponse([])

    def insert(self, data: dict):
        """Execute POST request to insert data"""
        try:
            response = self.client.session.post(self.url, json=data, timeout=10)
            response.raise_for_status()
            result = response.json() if response.text else []
            # Return list-wrapped result for consistency
            return SupabaseResponse(result if isinstance(result, list) else [result])
        except Exception as e:
            # Try to get more details from response
            error_msg = str(e)
            try:
                if hasattr(response, 'text') and response.text:
                    error_msg += f" - {response.text}"
            except:
                pass
            print(f"    [INSERT ERROR] {error_msg}")
            return SupabaseResponse([])

    def update(self, data: dict):
        """Execute PATCH request to update data"""
        url = self.url + (self.query if self.query else "")

        # Add filters to URL
        for col, val in self.filters.items():
            separator = "&" if "?" in url else "?"
            url += f"{separator}{col}=eq.{val}"

        try:
            response = self.client.session.patch(url, json=data, timeout=10)
            response.raise_for_status()
            return SupabaseResponse(response.json() if response.text else [])
        except Exception as e:
            print(f"Error updating data: {e}")
            return SupabaseResponse([])

class SupabaseResponse:
    """Simple response wrapper"""
    def __init__(self, data):
        self.data = data if isinstance(data, list) else [data] if data else []

supabase = SupabaseClient(SUPABASE_URL, SUPABASE_KEY)

# Configuration
LASTFM_API_KEY = os.getenv("LASTFM_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

# Regions to populate (country codes + names)
REGIONS = [
    # Africa
    {"code": "NG", "name": "Nigeria", "continent": "West Africa"},
    {"code": "GH", "name": "Ghana", "continent": "West Africa"},
    {"code": "SN", "name": "Senegal", "continent": "West Africa"},
    {"code": "KE", "name": "Kenya", "continent": "East Africa"},
    {"code": "UG", "name": "Uganda", "continent": "East Africa"},
    {"code": "ET", "name": "Ethiopia", "continent": "East Africa"},
    {"code": "ZA", "name": "South Africa", "continent": "Southern Africa"},
    # Americas
    {"code": "US", "name": "United States", "continent": "North America"},
    {"code": "CA", "name": "Canada", "continent": "North America"},
    {"code": "BR", "name": "Brazil", "continent": "South America"},
    {"code": "CO", "name": "Colombia", "continent": "South America"},
    {"code": "MX", "name": "Mexico", "continent": "North America"},
    # Asia
    {"code": "KR", "name": "South Korea", "continent": "East Asia"},
    {"code": "JP", "name": "Japan", "continent": "East Asia"},
    {"code": "CN", "name": "China", "continent": "East Asia"},
    {"code": "VN", "name": "Vietnam", "continent": "Southeast Asia"},
    {"code": "TH", "name": "Thailand", "continent": "Southeast Asia"},
    {"code": "ID", "name": "Indonesia", "continent": "Southeast Asia"},
    {"code": "IN", "name": "India", "continent": "South Asia"},
    # Middle East
    {"code": "LB", "name": "Lebanon", "continent": "Middle East"},
    {"code": "EG", "name": "Egypt", "continent": "Middle East"},
    {"code": "IR", "name": "Iran", "continent": "Middle East"},
    # Europe
    {"code": "SE", "name": "Sweden", "continent": "Northern Europe"},
    {"code": "NO", "name": "Norway", "continent": "Northern Europe"},
    {"code": "DK", "name": "Denmark", "continent": "Northern Europe"},
    {"code": "GR", "name": "Greece", "continent": "Southern Europe"},
    {"code": "IT", "name": "Italy", "continent": "Southern Europe"},
    {"code": "ES", "name": "Spain", "continent": "Southern Europe"},
]

# Top genres to track
GENRES = [
    "Hip Hop", "R&B", "Pop", "Rock", "Electronic", "Dance",
    "Reggae", "Latin", "Jazz", "Blues", "Country", "Folk",
    "Metal", "Indie", "Soul", "Funk", "Afrobeats", "K-Pop",
    "Trap", "House", "Techno", "Ambient", "World", "Traditional"
]


class MusicDataPopulator:
    def __init__(self):
        self.lastfm_api_key = LASTFM_API_KEY
        self.youtube_api_key = YOUTUBE_API_KEY
        self.session = requests.Session()

        if not self.lastfm_api_key or not self.youtube_api_key:
            raise ValueError("Missing API keys. Please set LASTFM_API_KEY and YOUTUBE_API_KEY in .env")

        self.regions_map: Dict[str, str] = {}  # region_name -> region_id
        self.genres_map: Dict[str, str] = {}   # genre_name -> genre_id
        self.artists_seen: set = set()  # Track artists to avoid duplicates

    def setup_genres(self):
        """Create genres in database if they don't exist."""
        print("Setting up genres...")
        for genre_name in GENRES:
            try:
                # Check if genre exists
                result = supabase.from_("genres").select("id").eq("name", genre_name).execute()

                if result.data:
                    self.genres_map[genre_name] = result.data[0]["id"]
                else:
                    # Create new genre
                    insert_result = supabase.from_("genres").insert({
                        "name": genre_name,
                        "description": f"{genre_name} music"
                    })

                    if insert_result.data:
                        self.genres_map[genre_name] = insert_result.data[0]["id"]
                        print(f"  ✓ Created genre: {genre_name}")
            except Exception as e:
                print(f"  ✗ Error creating genre {genre_name}: {e}")

        print(f"Genres ready: {len(self.genres_map)} genres\n")

    def setup_regions(self):
        """Create regions in database if they don't exist."""
        print("Setting up regions...")
        for region in REGIONS:
            try:
                # Check if region exists
                result = supabase.from_("regions").select("id").eq("name", region["name"]).execute()

                if result.data:
                    self.regions_map[region["name"]] = result.data[0]["id"]
                else:
                    # Create new region
                    insert_result = supabase.from_("regions").insert({
                        "name": region["name"],
                        "country": region["name"],
                        "description": f"{region['continent']}, {region['name']}"
                    })

                    if insert_result.data:
                        self.regions_map[region["name"]] = insert_result.data[0]["id"]
                        print(f"  ✓ Created region: {region['name']}")
            except Exception as e:
                print(f"  ✗ Error creating region {region['name']}: {e}")

        print(f"Regions ready: {len(self.regions_map)} regions\n")

    def get_top_artists_by_country(self, country_name: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Fetch top artists for a country from Last.fm (expects full country name, not code)."""
        try:
            url = "http://ws.audioscrobbler.com/2.0/"
            params = {
                "method": "geo.gettopartists",
                "country": country_name,
                "api_key": self.lastfm_api_key,
                "format": "json",
                "limit": limit
            }

            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            # Debug output
            if "error" in data:
                print(f"    [DEBUG] Last.fm error for {country_name}: {data}")
                return []

            if "topartists" in data and "artist" in data["topartists"]:
                artists = data["topartists"]["artist"]
                return artists if isinstance(artists, list) else [artists]

            print(f"    [DEBUG] No topartists in response for {country_name}: {list(data.keys())}")
            return []
        except Exception as e:
            print(f"  ! Error fetching artists for {country_name}: {e}")
            return []

    def get_artists_by_country_origin(self, country_name: str, limit: int = 5) -> List[str]:
        """Fetch musicians from a specific country using Wikidata SPARQL.
        Falls back to a hardcoded list for countries where Wikidata times out
        (e.g. United States — too many results) or returns too few (e.g. Denmark).
        """
        # Hardcoded fallbacks for countries that reliably fail Wikidata queries
        fallbacks = {
            "United States": ["Kendrick Lamar", "Taylor Swift", "Beyoncé", "Jay-Z", "Billie Eilish"],
            "Denmark":       ["MØ", "Lukas Graham", "Aqua", "Nephew", "Christopher"],
        }
        if country_name in fallbacks:
            print(f"    [FALLBACK] Using hardcoded artist list for {country_name}")
            return fallbacks[country_name][:limit]

        try:
            # Map country names to Wikidata country codes
            country_map = {
                "Nigeria": "Q1033", "Ghana": "Q117", "Senegal": "Q1041",
                "Kenya": "Q114", "Uganda": "Q1036", "Ethiopia": "Q115",
                "South Africa": "Q258", "United States": "Q30", "Canada": "Q16",
                "Brazil": "Q155", "Colombia": "Q739", "Mexico": "Q96",
                "South Korea": "Q884", "Japan": "Q17", "China": "Q148",
                "Vietnam": "Q881", "Thailand": "Q869", "Indonesia": "Q252",
                "India": "Q668", "Lebanon": "Q822", "Egypt": "Q79",
                "Iran": "Q794", "Sweden": "Q34", "Norway": "Q20",
                "Denmark": "Q35", "Greece": "Q41", "Italy": "Q38", "Spain": "Q29"
            }

            country_code = country_map.get(country_name)
            if not country_code:
                print(f"    [WIKIDATA] Country not mapped: {country_name}")
                return []

            # SPARQL query to get well-known musicians from a country.
            # Ordered by sitelinks count (number of Wikipedia language editions) so
            # that famous, unambiguous artists appear first — filtering out obscure
            # entries that tend to have incorrect or incomplete citizenship data.
            sparql_query = f"""
            SELECT ?musicianLabel (COUNT(?sitelink) AS ?links) WHERE {{
              ?musician wdt:P31 wd:Q5 .          # human
              ?musician wdt:P106 wd:Q639669 .    # occupation: musician
              ?musician wdt:P27 wd:{country_code} .  # country of citizenship
              ?musician rdfs:label ?musicianLabel .
              FILTER (LANG(?musicianLabel) = "en")
              ?sitelink schema:about ?musician .  # count Wikipedia sitelinks
            }}
            GROUP BY ?musicianLabel
            HAVING (COUNT(?sitelink) > 5)
            ORDER BY DESC(?links)
            LIMIT {limit}
            """

            url = "https://query.wikidata.org/sparql"
            params = {
                "query": sparql_query,
                "format": "json"
            }

            # Add User-Agent header for Wikidata compliance
            headers = {
                "User-Agent": "FREQUENCY-Music-App/1.0 (https://github.com/spherical)"
            }

            response = self.session.get(url, params=params, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()

            artists = []
            if "results" in data and "bindings" in data["results"]:
                for binding in data["results"]["bindings"]:
                    if "musicianLabel" in binding:
                        artist_name = binding["musicianLabel"].get("value", "").strip()
                        if artist_name:
                            artists.append(artist_name)

            return artists[:limit]

        except Exception as e:
            print(f"    [WIKIDATA] Error fetching artists from {country_name}: {e}")
            return []

    def get_artist_top_tracks(self, artist_name: str, limit: int = 3) -> List[Dict[str, Any]]:
        """Fetch top tracks for an artist from Last.fm."""
        try:
            url = "http://ws.audioscrobbler.com/2.0/"
            params = {
                "method": "artist.gettoptracks",
                "artist": artist_name,
                "api_key": self.lastfm_api_key,
                "format": "json",
                "limit": limit
            }

            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if "toptracks" in data and "track" in data["toptracks"]:
                tracks = data["toptracks"]["track"]
                # Ensure it's a list
                if not isinstance(tracks, list):
                    tracks = [tracks]
                return tracks
            return []
        except Exception as e:
            print(f"  ! Error fetching tracks for {artist_name}: {e}")
            return []

    def search_youtube_audio(self, artist_name: str, track_name: str) -> Optional[str]:
        """Search for a track on YouTube and return the first result URL."""
        try:
            url = "https://www.googleapis.com/youtube/v3/search"
            params = {
                "part": "snippet",
                "q": f"{artist_name} {track_name} official audio",
                "type": "video",
                "maxResults": 1,
                "key": self.youtube_api_key,
                "relevanceLanguage": "en"
            }

            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if data.get("items"):
                video_id = data["items"][0]["id"]["videoId"]
                return f"https://www.youtube.com/watch?v={video_id}"
            return None
        except Exception as e:
            print(f"  ! Error searching YouTube for {artist_name} - {track_name}: {e}")
            return None

    def populate_country(self, country_code: str, country_name: str, region_name: str, artists_per_country: int = 3):
        """Populate artists and tracks for a specific country."""
        print(f"\n📍 Processing {country_name}...")

        # Use country_name as region (we create regions by country, not continent)
        region_id = self.regions_map.get(country_name)
        if not region_id:
            print(f"  ✗ Region '{region_name}' not found")
            return

        # Get artists from this country using Wikidata (gets artists by origin, not popularity)
        artist_names = self.get_artists_by_country_origin(country_name, limit=artists_per_country)
        print(f"  → Found {len(artist_names)} artists from Wikidata")

        # Convert artist names to Last.fm format
        artists = [{"name": name} for name in artist_names]

        for artist_data in artists:
            artist_name = artist_data.get("name", "").strip()
            if not artist_name or artist_name in self.artists_seen:
                continue

            self.artists_seen.add(artist_name)

            try:
                # Check if artist already exists
                existing = supabase.from_("artists").select("id").eq("name", artist_name).execute()

                if existing.data:
                    artist_id = existing.data[0]["id"]
                    print(f"  ℹ Artist already exists: {artist_name}")
                else:
                    # Create artist
                    listener_count = int(artist_data.get("listeners", 0))

                    artist_insert = supabase.from_("artists").insert({
                        "name": artist_name,
                        "region_id": region_id,
                        "listener_count": listener_count,
                        "is_emerging": listener_count < 50000,  # Mark as emerging if < 50k listeners
                        "bio": f"Musician from {country_name}"
                    })

                    if not artist_insert.data or len(artist_insert.data) == 0:
                        print(f"  ✗ Failed to create artist: {artist_name} - no data returned")
                        continue

                    if 'id' not in artist_insert.data[0]:
                        print(f"  ✗ Failed to create artist {artist_name} - missing id in response: {artist_insert.data[0]}")
                        continue

                    artist_id = artist_insert.data[0]["id"]
                    print(f"  ✓ Created artist: {artist_name}")

                # Get top tracks for this artist
                tracks = self.get_artist_top_tracks(artist_name, limit=2)

                for track_data in tracks:
                    track_name = track_data.get("name", "").strip()
                    if not track_name:
                        continue

                    # Check if track already exists
                    existing_track = supabase.from_("tracks").select("id").eq("title", track_name).eq("artist_id", artist_id).execute()

                    if existing_track.data:
                        print(f"    ℹ Track already exists: {track_name}")
                        continue

                    # Search for audio on YouTube
                    audio_url = self.search_youtube_audio(artist_name, track_name)

                    # Get a genre (cycle through available genres)
                    genre_id = list(self.genres_map.values())[hash(artist_name) % len(self.genres_map)]

                    # Insert track
                    track_insert = supabase.from_("tracks").insert({
                        "title": track_name,
                        "artist_id": artist_id,
                        "region_id": region_id,
                        "genre_id": genre_id,
                        "audio_url": audio_url,
                        "play_count": 0,
                        "cultural_context": f"Musician from {country_name}"
                    })

                    if track_insert.data and len(track_insert.data) > 0:
                        print(f"    ✓ Created track: {track_name}")
                    else:
                        # Track insert failed - likely due to missing artist or other validation
                        print(f"    ✗ Track insert failed: {track_name} (response: {track_insert.data})")

                    # Rate limiting for YouTube API
                    time.sleep(0.5)

            except Exception as e:
                print(f"  ✗ Error processing artist {artist_name}: {e}")

            # Rate limiting for Last.fm API
            time.sleep(0.5)

    def run(self, only_countries: list = None):
        """Main execution method.

        Args:
            only_countries: Optional list of country names to restrict processing to.
                            e.g. ["Canada", "China"]. If None, processes all countries.
        """
        print("🎵 FREQUENCY - Music Data Population Script\n")
        print("=" * 50)

        # Setup
        self.setup_genres()
        self.setup_regions()

        print("Fetching and populating music data...")
        print("=" * 50)

        # Build deduplicated country list from REGIONS
        regions_by_country = {}
        for region in REGIONS:
            code = region["code"]
            if code not in regions_by_country:
                regions_by_country[code] = (region["name"], region["continent"])

        # Filter to requested countries if provided
        if only_countries:
            requested = {c.strip().lower() for c in only_countries}
            regions_by_country = {
                code: (name, continent)
                for code, (name, continent) in regions_by_country.items()
                if name.lower() in requested
            }
            if not regions_by_country:
                print("❌ No matching countries found. Check spelling against REGIONS list.")
                return
            print(f"Targeting {len(regions_by_country)} country/countries: {', '.join(n for n, _ in regions_by_country.values())}\n")

        artists_per_country = 2
        for country_code, (country_name, region_name) in regions_by_country.items():
            self.populate_country(country_code, country_name, region_name, artists_per_country)
            time.sleep(0.5)

        print("\n" + "=" * 50)
        print(f"✅ Population complete!")
        print(f"   • Genres set up: {len(self.genres_map)}")
        print(f"   • Regions set up: {len(self.regions_map)}")
        print(f"   • Artists processed: {len(self.artists_seen)}")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Populate FREQUENCY music data")
    parser.add_argument(
        "--countries",
        type=str,
        default=None,
        help='Comma-separated list of country names to populate, e.g. "Canada,China,Denmark"'
    )
    args = parser.parse_args()

    only = [c.strip() for c in args.countries.split(",")] if args.countries else None

    try:
        populator = MusicDataPopulator()
        populator.run(only_countries=only)
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        sys.exit(1)
