export interface Track {
  title: string;
  artist: string;
  genre: string;
}

export interface RegionData {
  id: string;
  region: string;
  country: string;
  description: string;
  tracks: Track[];
}

export const regions: RegionData[] = [
  {
    id: "west-africa",
    region: "West Africa",
    country: "Nigeria, Ghana, Senegal",
    description: "Home to Afrobeats, Highlife, and Mbalax - infectious rhythms blending traditional percussion with modern production.",
    tracks: [
      { title: "Last Last", artist: "Burna Boy", genre: "Afrobeats" },
      { title: "Essence", artist: "WizKid ft. Tems", genre: "Afrobeats" },
      { title: "Ye", artist: "Burna Boy", genre: "Afropop" }
    ]
  },
  {
    id: "southern-africa",
    region: "Southern Africa",
    country: "South Africa, Zimbabwe",
    description: "Amapiano's deep house beats meet traditional Mbira melodies and powerful vocal harmonies.",
    tracks: [
      { title: "Ke Star", artist: "Focalistic & Vigro Deep", genre: "Amapiano" },
      { title: "Jerusalema", artist: "Master KG", genre: "House" },
      { title: "Tholukuthi Hey", artist: "Sho Madjozi", genre: "Gqom" }
    ]
  },
  {
    id: "east-asia",
    region: "East Asia",
    country: "South Korea, Japan",
    description: "K-Pop's choreographed perfection and J-Pop's experimental production push global pop boundaries.",
    tracks: [
      { title: "Dynamite", artist: "BTS", genre: "K-Pop" },
      { title: "Shut Down", artist: "BLACKPINK", genre: "K-Pop" },
      { title: "First Love", artist: "Utada Hikaru", genre: "J-Pop" }
    ]
  },
  {
    id: "latin-america",
    region: "Latin America",
    country: "Colombia, Puerto Rico, Brazil",
    description: "Reggaeton and Samba create irresistible dance rhythms rooted in African and Indigenous traditions.",
    tracks: [
      { title: "Tití Me Preguntó", artist: "Bad Bunny", genre: "Reggaeton" },
      { title: "Mi Gente", artist: "J Balvin", genre: "Reggaeton" },
      { title: "Envolver", artist: "Anitta", genre: "Funk Carioca" }
    ]
  },
  {
    id: "middle-east",
    region: "Middle East",
    country: "Lebanon, Egypt, UAE",
    description: "Arabic Pop blends classical maqam scales with contemporary beats, creating emotionally rich soundscapes.",
    tracks: [
      { title: "Lm3allem", artist: "Saad Lamjarred", genre: "Arabic Pop" },
      { title: "Ya Lili", artist: "Balti ft. Hamouda", genre: "Arabic Rap" },
      { title: "3 Daqat", artist: "Abu ft. Yousra", genre: "Arabic Pop" }
    ]
  },
  {
    id: "south-asia",
    region: "South Asia",
    country: "India, Pakistan, Bangladesh",
    description: "Bollywood and Qawwali traditions merge with hip-hop, creating vibrant, spiritually-infused modern sounds.",
    tracks: [
      { title: "Kesariya", artist: "Arijit Singh", genre: "Bollywood" },
      { title: "Pasoori", artist: "Ali Sethi & Shae Gill", genre: "Folk Pop" },
      { title: "Excuses", artist: "AP Dhillon", genre: "Punjabi Hip-Hop" }
    ]
  },
  {
    id: "caribbean",
    region: "Caribbean",
    country: "Jamaica, Trinidad, Haiti",
    description: "Reggae, Dancehall, and Soca represent resistance, celebration, and the African diaspora's musical legacy.",
    tracks: [
      { title: "Toast", artist: "Koffee", genre: "Reggae" },
      { title: "Plenty Belly", artist: "Vybz Kartel", genre: "Dancehall" },
      { title: "Differentology", artist: "Bunji Garlin", genre: "Soca" }
    ]
  },
  {
    id: "eastern-europe",
    region: "Eastern Europe",
    country: "Russia, Romania, Balkans",
    description: "Folk traditions blend with electronic music, creating everything from epic ballads to underground techno.",
    tracks: [
      { title: "Dragostea Din Tei", artist: "O-Zone", genre: "Eurodance" },
      { title: "Moskau", artist: "Dschinghis Khan", genre: "Disco" },
      { title: "Stereo Love", artist: "Edward Maya", genre: "House" }
    ]
  }
];

export const getRandomRegion = (): RegionData => {
  return regions[Math.floor(Math.random() * regions.length)];
};

export const getRegionById = (id: string): RegionData | undefined => {
  return regions.find(r => r.id === id);
};
