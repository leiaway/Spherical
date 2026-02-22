# Requirements Reference

Frequency’s features (F1–F21) and user personas. Code comments reference these IDs (e.g. `Requirement: F1`) for traceability.

---

## Features (F1–F21)

| ID | Feature | Primary code locations |
|----|---------|------------------------|
| **F1** | Geo-tracking | `useGeolocation`, `LocationPrompt`, `Index` |
| **F2** | Location preference in music recommendations | `useGeolocation` (nearest region), `DiscoverySection` (when location-based), `Index` |
| **F3** | Curated user playlists | `usePlaylists`, `PlaylistManager`, `CreatePlaylistDialog`, `AddToPlaylistButton`, `SharePlaylistDialog` |
| **F4** | User map (snap map stories) | `UserMap` |
| **F5** | International / cultural music recommendations | `useRegions`, `useRegionTracks`, `useRegionArtists`, `RegionPicker`, `DiscoverySection` (tracks/artists by region, cultural_context) |
| **F6** | Music shuffle algorithm (prioritize less-played songs) | `docs/F6.1-shuffle-algorithm-design.md`, `user_track_plays` migrations |
| **F7** | Add friend feature | `useFriends`, `FriendsList`, `AddFriend` |
| **F8** | Recommend new/emerging artists | `useEmergingArtists`, `EmergingArtistsRecommendations`, `DiscoverySection` (emerging tab) |
| **F9** | Artist song upload feature | — (not yet implemented) |
| **F10** | Location and genre tagging | — (partial: regions/genres in data; tagging UI TBD) |
| **F11** | Music genre history page | — (not yet implemented) |
| **F12** | Local festivals relating to genres user listens to | — (not yet implemented) |
| **F13** | User community chat room | — (not yet implemented) |
| **F14** | Talent Scout Log In | — (not yet implemented) |
| **F15** | Talent Scout Dashboard | — (not yet implemented) |
| **F16** | Talent Scout Dashboard – Trending Local Artist | — (not yet implemented) |
| **F17** | Talent Scout Dashboard – Filter by genre, listener growth, engagement | — (not yet implemented) |
| **F18** | Allow App Notifications | — (not yet implemented) |
| **F19** | Talent scout notifications for upcoming artists in regions | — (not yet implemented) |
| **F20** | Recommend local live performances | — (not yet implemented) |
| **F21** | Artist Dashboard | — (not yet implemented) |

*Authentication (sign in / sign up) supports all features; see `Auth.tsx` and Supabase Auth.*

---

## User stories (personas)

| Persona | Goal | Catered features |
|---------|------|------------------|
| **Nâmé – The Traveler** | Immerse in local culture and atmosphere of a new region | F1, F2, F3, F11, F12, F20 |
| **Antonio – The Music Lover** | Escape "taste bubbles" and discover non-repetitive, fresh sounds | F3, F5, F6, F8, F11, F18 |
| **Lucy – The Immigrant** | Feel at home by connecting local music with cultural roots | F1, F2, F3, F5, F10, F13 |
| **Ryan – The Local Artist** | Be discovered by international listeners and track audience growth | F4, F7, F9, F10, F13, F21 |
| **Wayne – The Talent Scout** | Discover and sign rising artists in underrepresented regions via data-driven insights | F14, F15, F16, F17, F19 |
| **Sasha – The Journalist** | Analyze global music trends and metadata for reports on under-appreciated cultures | F2, F11, F12, F20 |

---

## Finding requirement refs in code

Search for `Requirement: F` or `F1` (etc.) in the repo to see where each feature is implemented or referenced.
