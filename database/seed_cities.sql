-- Seed 10+ Major Indian Cities
INSERT INTO cities (name, slug, description, hero_image_url, is_popular, display_order) VALUES
(
    'Delhi', 
    'delhi', 
    'Delhi, the vibrant capital city of India, is a melting pot of history, culture, and modern amenities. From iconic historical landmarks like India Gate to bustling markets like Chandni Chowk, Delhi offers an unparalleled urban experience.', 
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=1600', 
    true, 
    1
),
(
    'Mumbai', 
    'mumbai', 
    'Mumbai, the financial capital and city of dreams, is known for its fast-paced life, colonial architecture, and the mesmerizing Arabian Sea. Home to Bollywood and the iconic Gateway of India.', 
    'https://images.unsplash.com/photo-1570160897040-dc428a2a8844?auto=format&fit=crop&q=80&w=1600', 
    true, 
    2
),
(
    'Bangalore', 
    'bangalore', 
    'Known as the Silicon Valley of India, Bangalore is famous for its pleasant weather, lush green gardens, and a thriving startup ecosystem.', 
    'https://images.unsplash.com/photo-1596760410654-e9f0e8f000b9?auto=format&fit=crop&q=80&w=1600', 
    true, 
    3
),
(
    'Hyderabad', 
    'hyderabad', 
    'A city where history meets high-tech, Hyderabad is legendary for its Charminar, exquisite biryani, and the world-class IT hub of Cyberabad.', 
    'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&q=80&w=1600', 
    true, 
    4
),
(
    'Chennai', 
    'chennai', 
    'The gateway to South India, Chennai is known for its classical music heritage, beautiful beaches like Marina Beach, and robust automotive industry.', 
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=1600', 
    true, 
    5
),
(
    'Kolkata', 
    'kolkata', 
    'The City of Joy and cultural capital of India, Kolkata is famous for its grand colonial architecture, rich intellectual history, and iconic Howrah Bridge.', 
    'https://images.unsplash.com/photo-1558431382-bb7b38c49051?auto=format&fit=crop&q=80&w=1600', 
    true, 
    6
),
(
    'Pune', 
    'pune', 
    'Often hailed as the "Oxford of the East," Pune is a major educational and IT hub with a rich Maratha history and a pleasant climate.', 
    'https://images.unsplash.com/photo-1562208173-828038f6bca6?auto=format&fit=crop&q=80&w=1600', 
    true, 
    7
),
(
    'Jaipur', 
    'jaipur', 
    'The Pink City of India, Jaipur is a magnificent tapestry of royal forts, palaces, and vibrant heritage, forming part of the famous Golden Triangle.', 
    'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=1600', 
    false, 
    8
),
(
    'Ahmedabad', 
    'ahmedabad', 
    'A UNESCO World Heritage City, Ahmedabad is known for its textile heritage, Sabarmati Ashram, and vibrant entrepreneurial spirit.', 
    'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&q=80&w=1600', 
    false, 
    9
),
(
    'Chandigarh', 
    'chandigarh', 
    'India''s first planned city, Chandigarh is celebrated for its modern architecture, well-laid parks, and high quality of life.', 
    'https://images.unsplash.com/photo-1595658189125-0241e45da162?auto=format&fit=crop&q=80&w=1600', 
    false, 
    10
),
(
    'Gurgaon', 
    'gurgaon', 
    'The Millennium City, Gurgaon is a skyline of modern skyscrapers, luxury malls, and the headquarters of major multi-national corporations.', 
    'https://images.unsplash.com/photo-1595658189125-0241e45da162?auto=format&fit=crop&q=80&w=1600', 
    false, 
    11
),
(
    'Noida', 
    'noida', 
    'A planned city that is a major hub for IT and entertainment, Noida is known for its wide roads, lush parks, and modern infrastructure.', 
    'https://images.unsplash.com/photo-1585938389612-a552a28d6914?auto=format&fit=crop&q=80&w=1600', 
    false, 
    12
)
ON CONFLICT (slug) DO UPDATE SET 
    description = EXCLUDED.description,
    hero_image_url = EXCLUDED.hero_image_url,
    is_popular = EXCLUDED.is_popular,
    display_order = EXCLUDED.display_order;
