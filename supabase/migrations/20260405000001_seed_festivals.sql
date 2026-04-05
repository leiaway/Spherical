-- Requirement: F1.6 (playlists reflecting local mood or festivals)
-- Seeds representative festivals for each region so the Mood & Festivals tab
-- has real content immediately. Uses subqueries to resolve region and genre IDs
-- by name so this migration is safe regardless of UUID values in the database.

INSERT INTO public.festivals (name, region_id, description, typical_month, mood, genre_id)
SELECT
  f.name,
  r.id AS region_id,
  f.description,
  f.typical_month,
  f.mood,
  g.id AS genre_id
FROM (
  VALUES
    -- West Africa
    ('Chale Wote Street Art Festival', 'West Africa',      'Ghana''s vibrant street art and music festival in Accra celebrating African creativity.',         8, 'energetic',   'Afrobeats'),
    ('FESPAM',                         'West Africa',      'Pan-African music festival held in Brazzaville showcasing traditional and contemporary sounds.',   7, 'festive',      'Afrobeats'),

    -- East Africa
    ('Sauti za Busara',                'East Africa',      'Swahili music festival on Zanzibar island blending traditional taarab with modern African styles.', 2, 'festive',      'World Music'),
    ('Koroga Festival',                'East Africa',      'Nairobi outdoor festival fusing Afro-fusion, jazz, and soul in a picnic setting.',                  6, 'chill',        'Afrobeats'),

    -- North Africa
    ('Festival of World Sacred Music', 'North Africa',     'Fez festival bringing together sacred and devotional music traditions from across the globe.',      6, 'spiritual',    'World Music'),
    ('Cairo Jazz Festival',            'North Africa',     'Annual jazz celebration in Cairo drawing artists from Africa, Europe, and the Middle East.',        10, 'chill',        'Jazz'),

    -- East Asia
    ('Fuji Rock Festival',             'East Asia',        'Japan''s premier outdoor rock and electronic music festival held in the Niigata mountains.',        7, 'energetic',    'Electronic'),
    ('Pentaport Rock Festival',        'East Asia',        'South Korea''s largest rock festival celebrating indie, punk, and alternative music in Incheon.',   8, 'energetic',    'Rock'),

    -- South Asia
    ('Jodhpur RIFF',                   'South Asia',       'Rajasthan International Folk Festival celebrating traditional folk music at Mehrangarh Fort.',      10, 'spiritual',    'World Music'),
    ('NH7 Weekender',                  'South Asia',       'India''s happiest music festival spanning multiple stages with indie, jazz, and electronic acts.',  12, 'festive',      'Electronic'),

    -- Latin America
    ('Carnaval de Rio',                'Latin America',    'World-famous samba carnival in Rio de Janeiro — the largest street party on earth.',               2, 'festive',      'Latin'),
    ('Lollapalooza Chile',             'Latin America',    'Santiago''s international music festival headlining global and Latin artists across multiple days.', 3, 'energetic',    'Rock'),

    -- Southeast Asia
    ('Wonderfruit Festival',           'Southeast Asia',   'Thailand''s sustainable arts and music gathering in Pattaya celebrating creativity and wellness.',  12, 'chill',        'Electronic'),
    ('We The Fest',                    'Southeast Asia',   'Jakarta''s premier music and lifestyle festival showcasing Southeast Asian and global artists.',     7, 'festive',      'Electronic'),

    -- Middle East
    ('MDL Beast Soundstorm',           'Middle East',      'Riyadh''s massive electronic music festival — one of the largest in the world by attendance.',     12, 'energetic',    'Electronic'),
    ('Carthage International Festival','Middle East',      'Tunisia''s historic open-air festival at the ancient Carthage amphitheatre spanning all genres.',   7, 'festive',      'World Music')
) AS f(name, region_name, description, typical_month, mood, genre_name)
JOIN public.regions r ON r.name = f.region_name
LEFT JOIN public.genres g ON g.name = f.genre_name
ON CONFLICT DO NOTHING;
