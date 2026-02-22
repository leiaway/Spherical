# FREQUENCY — Discover Music Beyond Borders
Created by Spherical

A location-aware music discovery app that surfaces tracks and artists by region. Users can explore by geolocation or pick a region, create and share playlists, add friends, and discover emerging artists.

## Purpose
Most music platforms prioritize streaming and algorithm-driven recommendations, which commodifies music and disconnects it from its cultural roots. This narrow system traps listeners in familiar taste bubbles instead of encouraging global, exploratory discovery that highlights music’s origins and cultural significance.

## Product Overview
Our product, Frequency, encourages users to develop more worldly musical palettes by placing them in a random region and displaying the popular music within said region at that time, and allowing them to explore other regions and their music.

## Quick Start
**URL**: https://frequency-global-beats.lovable.app/

---
## Architecture Overview
- **Frontend**: React 18 + TypeScript, Vite, React Router, TanStack Query (React Query), shadcn/ui + Tailwind.
- **Backend / Auth**: Supabase (Postgres, Auth, Realtime). All region, track, playlist, and social data lives in Supabase.
- **Data flow**: UI → hooks (useRegions, usePlaylists, useGeolocation, useFriends) → Supabase client → Postgres. Realtime used for friendships and (where applicable) profile locations.

### High-level data flow

1. **Regions & discovery**  
   `useRegions()` loads regions; `useRegionTracks(regionId)` / `useRegionArtists(regionId)` load content. Data comes from `regions`, `tracks`, `artists` (and related tables) in Supabase.

2. **Location**  
   `useGeolocation()` uses the browser Geolocation API, then computes the nearest region via Haversine distance (see `useGeolocation.ts`). That region can auto-select or be shown as “Near You”.

3. **Playlists**  
   `usePlaylists()` (with current user from Supabase Auth) loads the user’s playlists and shared-with-me playlists. Create/add/remove/share/delete go through mutations that call Supabase and then invalidate the relevant React Query keys.

4. **Sharing**  
   Playlist sharing is a row in `playlist_shares` (playlist_id, shared_with_user_id). `usePlaylistShares(playlistId)` returns who a playlist is shared with; share UI uses that plus `useFriends()` to show friends and “Shared” state.

5. **Friends**  
   `useFriends()` loads friendships for the current user (both directions), enriches with profiles, and separates accepted vs pending. Realtime subscription on `friendships` keeps the list updated.

---
## Tech stack

- **Build**: Vite, TypeScript  
- **UI**: React, shadcn-ui, Tailwind CSS  
- **Data**: TanStack Query, Supabase (Postgres, Auth, Realtime)  
- **Maps**: Mapbox (user map)

---
## Requirements traceability

Features are numbered **F1–F21** (e.g. F1 Geo-tracking, F3 Curated playlists, F6 Music shuffle). User personas (Nâmé, Antonio, Lucy, Ryan, Wayne, Sasha) and their catered features are listed in **`docs/REQUIREMENTS_REFERENCE.md`**. Code comments use `Requirement: Fx` so you can trace implementation to features and personas.

---
