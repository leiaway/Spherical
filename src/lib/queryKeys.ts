export const queryKeys = {
  auth: {
    root: ["auth"] as const,
    session: ["auth", "session"] as const,
    profile: (userId: string) => ["auth", "profile", userId] as const,
    profileNone: ["auth", "profile", "none"] as const,
  },
  friends: {
    all: ["friends"] as const,
    byUser: (userId: string | null) => ["friends", "by-user", userId] as const,
    searchProfiles: ["friends", "search-profiles"] as const,
  },
  playlists: {
    all: ["playlists"] as const,
    byUser: (userId: string | null) => ["playlists", "by-user", userId] as const,
    sharedWithUser: (userId: string | null) =>
      ["playlists", "shared-with-user", userId] as const,
    tracksAll: ["playlists", "tracks"] as const,
    tracks: (playlistId: string | null) =>
      ["playlists", "tracks", playlistId] as const,
    sharesAll: ["playlists", "shares"] as const,
    shares: (playlistId: string | null) =>
      ["playlists", "shares", playlistId] as const,
  },
  regions: {
    all: ["regions", "list"] as const,
    tracks: (regionId: string | null) => ["regions", "tracks", regionId] as const,
    artists: (regionId: string | null) => ["regions", "artists", regionId] as const,
  },
  artists: {
    emerging: ["artists", "emerging"] as const,
    emergingRecommendations: (regionId: string | null | undefined) =>
      ["artists", "emerging-recommendations", regionId ?? "all"] as const,
  },
  map: {
    profilesForUserMap: ["map", "profiles-for-user-map"] as const,
  },
  genres: {
    all: ["genres", "all"] as const,
  },
  scout: {
    savedArtistsDetail: (userId: string | null, idsKey: string) =>
      ["scout", "saved-artists", userId, idsKey] as const,
    regionalTrending: (regionId: string | null) =>
      ["scout", "regional-trending", regionId ?? "global"] as const,
    trackStatsForArtists: (idsKey: string) =>
      ["scout", "track-stats", idsKey] as const,
    artistTracks: (artistId: string) => ["scout", "artist-tracks", artistId] as const,
  },
} as const;
