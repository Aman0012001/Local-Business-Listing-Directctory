-- Seed 10+ Major Pakistani Cities
INSERT INTO cities (name, slug, description, hero_image_url, is_popular, display_order) VALUES
(
    'Karachi', 
    'karachi', 
    'Karachi, the city of lights and Pakistan''s largest metropolis, is a bustling hub of commerce, culture, and coastal beauty. From the historic Quaid-e-Azam House to the vibrant Clifton Beach, it offers a diverse urban experience.', 
    'https://images.unsplash.com/photo-1563280044-dc6e5d62f86a?auto=format&fit=crop&q=80&w=1600', 
    true, 
    1
),
(
    'Lahore', 
    'lahore', 
    'Lahore, the cultural heart of Pakistan, is famous for its rich Mughal history, stunning architecture like Badshahi Mosque, and its legendary food street in the walled city.', 
    'https://images.unsplash.com/photo-1595180632314-1b4731336a5c?auto=format&fit=crop&q=80&w=1600', 
    true, 
    2
),
(
    'Islamabad', 
    'islamabad', 
    'The beautiful capital of Pakistan, Islamabad is known for its serene environment, lush greenery, and modern architecture, including the iconic Faisal Mosque.', 
    'https://images.unsplash.com/photo-1595180632314-1b4731336a5c?auto=format&fit=crop&q=80&w=1600', 
    true, 
    3
),
(
    'Faisalabad', 
    'faisalabad', 
    'The industrial hub of Pakistan, Faisalabad is known for its textile industry and its unique clock tower around which eight markets are designed.', 
    'https://images.unsplash.com/photo-1616854125134-9721752b0200?auto=format&fit=crop&q=80&w=1600', 
    true, 
    4
),
(
    'Rawalpindi', 
    'rawalpindi', 
    'The twin city of Islamabad, Rawalpindi is a historic city with a mix of colonial-era architecture and modern developments, serving as a gateway to the north.', 
    'https://images.unsplash.com/photo-1627993416954-5a396264906a?auto=format&fit=crop&q=80&w=1600', 
    true, 
    5
),
(
    'Multan', 
    'multan', 
    'The City of Saints, Multan is one of the oldest cities in the world, famous for its magnificent shrines, blue pottery, and sweet mangoes.', 
    'https://images.unsplash.com/photo-1627993416954-5a396264906a?auto=format&fit=crop&q=80&w=1600', 
    true, 
    6
),
(
    'Peshawar', 
    'peshawar', 
    'A historic city at the gateway to the Khyber Pass, Peshawar is known for its ancient bazaar culture, hospitality, and rich cultural heritage.', 
    'https://images.unsplash.com/photo-1627993416954-5a396264906a?auto=format&fit=crop&q=80&w=1600', 
    true, 
    7
),
(
    'Quetta', 
    'quetta', 
    'The Fruit Garden of Pakistan, Quetta is surrounded by majestic mountains and known for its pleasant climate, high-quality dried fruits, and unique cultural diversity.', 
    'https://images.unsplash.com/photo-1627993416954-5a396264906a?auto=format&fit=crop&q=80&w=1600', 
    false, 
    8
),
(
    'Sialkot', 
    'sialkot', 
    'Famous worldwide for its sports goods and surgical instruments, Sialkot is a major industrial and export hub with a rich entrepreneurial spirit.', 
    'https://images.unsplash.com/photo-1627993416954-5a396264906a?auto=format&fit=crop&q=80&w=1600', 
    false, 
    9
),
(
    'Gujranwala', 
    'gujranwala', 
    'Known as the City of Wrestlers, Gujranwala is a major industrial city famous for its vibrant food culture and heavy manufacturing industries.', 
    'https://images.unsplash.com/photo-1627993416954-5a396264906a?auto=format&fit=crop&q=80&w=1600', 
    false, 
    10
)
ON CONFLICT (slug) DO UPDATE SET 
    description = EXCLUDED.description,
    hero_image_url = EXCLUDED.hero_image_url,
    is_popular = EXCLUDED.is_popular,
    display_order = EXCLUDED.display_order;
