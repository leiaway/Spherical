// Mock data for the music discovery app

export interface Region {
  name: string;
  country: string;
  flagColors: string[];
}

export interface Artist {
  id: string;
  name: string;
  region: Region;
  genre: string;
  isEmerging: boolean;
  imageUrl: string;
  badge?: "New" | "Authentic Voice";
}

export interface Song {
  id: string;
  title: string;
  artist: Artist;
  album: string;
  duration: string;
  playCount: number;
  lastPlayed?: Date;
  coverUrl: string;
}

export const regions: Region[] = [
  {
    name: "Bulawayo",
    country: "Zimbabwe",
    flagColors: ["#006400", "#FFD700", "#DC143C", "#000000"],
  },
  {
    name: "Seoul",
    country: "South Korea",
    flagColors: ["#003478", "#CD2E3A", "#FFFFFF"],
  },
  {
    name: "Buenos Aires",
    country: "Argentina",
    flagColors: ["#74ACDF", "#FFFFFF", "#F6B40E"],
  },
  {
    name: "Dublin",
    country: "Ireland",
    flagColors: ["#169B62", "#FFFFFF", "#FF883E"],
  },
  {
    name: "Istanbul",
    country: "Turkey",
    flagColors: ["#E30A17", "#FFFFFF"],
  },
  {
    name: "Lagos",
    country: "Nigeria",
    flagColors: ["#008751", "#FFFFFF"],
  },
];

export const artists: Artist[] = [
  {
    id: "1",
    name: "Tendai Mpofu",
    region: regions[0],
    genre: "Afro-Jazz Fusion",
    isEmerging: true,
    imageUrl: "https://images.unsplash.com/photo-1764670274687-ab62458d6306?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBZnJpY2FuJTIwbXVzaWNpYW4lMjBwZXJmb3JtaW5nJTIwdHJhZGl0aW9uYWx8ZW58MXx8fHwxNzc0MjczMDcyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    badge: "Authentic Voice",
  },
  {
    id: "2",
    name: "Ji-Yeon Park",
    region: regions[1],
    genre: "K-Indie Rock",
    isEmerging: true,
    imageUrl: "https://images.unsplash.com/photo-1624809588419-6f2fa3848225?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBc2lhbiUyMGluZGllJTIwYXJ0aXN0JTIwY29uY2VydHxlbnwxfHx8fDE3NzQyNzMwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    badge: "New",
  },
  {
    id: "3",
    name: "Mateo Vargas",
    region: regions[2],
    genre: "Tango Electronico",
    isEmerging: true,
    imageUrl: "https://images.unsplash.com/photo-1760264585857-fff3517f6bfa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMYXRpbiUyMEFtZXJpY2FuJTIwc3RyZWV0JTIwbXVzaWNpYW58ZW58MXx8fHwxNzc0MjczMDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    badge: "Authentic Voice",
  },
  {
    id: "4",
    name: "Siobhan O'Brien",
    region: regions[3],
    genre: "Celtic Folk Revival",
    isEmerging: false,
    imageUrl: "https://images.unsplash.com/photo-1758388536193-affe81d27c9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxFdXJvcGVhbiUyMGZvbGslMjBiYW5kJTIwcGVyZm9ybWFuY2V8ZW58MXx8fHwxNzc0MjczMDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    badge: "New",
  },
  {
    id: "5",
    name: "Ayşe Demir",
    region: regions[4],
    genre: "Anatolian Psychedelic",
    isEmerging: true,
    imageUrl: "https://images.unsplash.com/photo-1764872566350-9452aef1f307?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNaWRkbGUlMjBFYXN0ZXJuJTIwdHJhZGl0aW9uYWwlMjBpbnN0cnVtZW50c3xlbnwxfHx8fDE3NzQyNzMwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    badge: "Authentic Voice",
  },
];

export const currentSong: Song = {
  id: "s1",
  title: "Mbira Dreams",
  artist: artists[0],
  album: "Echoes of the Highveld",
  duration: "4:32",
  playCount: 0,
  coverUrl: "https://images.unsplash.com/photo-1599723895995-80e160d14fe4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMHBsYXllciUyMHR1cm50YWJsZXxlbnwxfHx8fDE3NzQyNjA4MDd8MA&ixlib=rb-4.1.0&q=80&w=1080",
};

export const culturalMetadata = {
  genreHistory: `Afro-Jazz Fusion emerged in the 1960s as a blend of traditional African rhythms, particularly from Zimbabwe's mbira (thumb piano) traditions, and American jazz improvisation. Artists like Tendai Mpofu are reviving this sound with modern electronic production while maintaining authentic cultural roots.`,
  artistOrigin: `Tendai Mpofu hails from Bulawayo, Zimbabwe's second-largest city, known for its rich musical heritage. The city has been a cultural hub for innovation in African music, blending Ndebele traditions with contemporary sounds.`,
};

export const regionalTrending = [
  { region: "Bulawayo, Zimbabwe", hotness: 95, lat: -20.15, lng: 28.58 },
  { region: "Lagos, Nigeria", hotness: 88, lat: 6.52, lng: 3.37 },
  { region: "Seoul, South Korea", hotness: 82, lat: 37.56, lng: 126.97 },
  { region: "Buenos Aires, Argentina", hotness: 76, lat: -34.61, lng: -58.38 },
  { region: "Istanbul, Turkey", hotness: 71, lat: 41.01, lng: 28.97 },
];
