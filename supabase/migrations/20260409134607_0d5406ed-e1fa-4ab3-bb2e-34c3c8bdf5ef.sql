-- Insert new regions (skip if name+country already exists)
INSERT INTO public.regions (name, country, description, latitude, longitude) VALUES
  ('Appalachia', 'United States', 'Mountain music heartland of the American South', 37.0, -81.0),
  ('Deep South', 'United States', 'Blues, gospel, and soul from the American South', 32.3, -90.2),
  ('Pacific Northwest', 'United States', 'Grunge and indie from the American Northwest', 47.6, -122.3),
  ('New York', 'United States', 'Hip-hop birthplace and jazz capital', 40.7, -74.0),
  ('Los Angeles', 'United States', 'West Coast beats and entertainment capital', 34.1, -118.2),
  ('Nairobi', 'Kenya', 'East African hub for Benga, Genge, and Afro-pop', -1.3, 36.8),
  ('Dar es Salaam', 'Tanzania', 'Bongo Flava and Taarab center of East Africa', -6.8, 39.3),
  ('Addis Ababa', 'Ethiopia', 'Ethio-jazz and traditional Ethiopian music', 9.0, 38.7),
  ('Moscow', 'Russia', 'Classical, electronic, and contemporary Russian music', 55.8, 37.6),
  ('Tbilisi', 'Georgia', 'Polyphonic singing traditions and emerging electronic scene', 41.7, 44.8),
  ('Fiji Islands', 'Fiji', 'South Pacific island rhythms and Polynesian traditions', -17.8, 178.0),
  ('Aotearoa', 'New Zealand', 'Māori musical traditions and indie scene', -41.3, 174.8),
  ('Papua New Guinea Highlands', 'Papua New Guinea', 'Indigenous music traditions of Melanesia', -6.0, 147.0)
ON CONFLICT DO NOTHING;

-- Insert new genres (skip if name already exists)
INSERT INTO public.genres (name, description) VALUES
  ('Bachata', 'Dominican guitar-driven romantic music'),
  ('Blues', 'African American roots music built on blue notes and call-and-response'),
  ('Bossa Nova', 'Brazilian blend of samba and jazz'),
  ('Calypso', 'Trinidadian carnival music with social commentary'),
  ('Classical', 'Western art music tradition'),
  ('Country', 'American roots music with storytelling traditions'),
  ('Disco', 'Dance music with four-on-the-floor beats'),
  ('Dub', 'Jamaican remix tradition with heavy bass and echo'),
  ('EDM', 'Electronic dance music spanning house, techno, and beyond'),
  ('Flamenco', 'Spanish art form combining guitar, singing, and dance'),
  ('Folk Music', 'Traditional and contemporary acoustic storytelling'),
  ('Gospel', 'Sacred music rooted in African American church traditions'),
  ('Grime', 'UK electronic genre with rapid-fire MCing'),
  ('Hip-Hop/Rap', 'Urban music culture built on beats, rhymes, and DJing'),
  ('J-Pop', 'Japanese popular music'),
  ('Jazz', 'Improvisational American art form'),
  ('Metal', 'Heavy, amplified rock with distorted guitars'),
  ('Neo-Soul', 'Modern soul blending R&B, jazz, and hip-hop influences'),
  ('Pop', 'Mainstream popular music'),
  ('Punk', 'Fast, raw, anti-establishment rock'),
  ('RnB/Soul', 'Rhythm and blues rooted in gospel and jazz'),
  ('Rock', 'Guitar-driven popular music'),
  ('Shoegaze', 'Dreamy, effects-laden guitar rock'),
  ('Soundtrack', 'Music composed for film, TV, and media'),
  ('UK Garage', 'British electronic dance music with syncopated beats')
ON CONFLICT DO NOTHING;