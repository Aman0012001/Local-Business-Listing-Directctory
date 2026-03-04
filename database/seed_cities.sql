INSERT INTO cities (name, slug, state, description, is_popular, display_order) VALUES
-- Major Cities with Province as State
('Lahore', 'lahore', 'Punjab', 'The cultural heart of Pakistan, famous for history and food.', true, 1),
('Karachi', 'karachi', 'Sindh', 'The largest city and economic hub of Pakistan.', true, 1),
('Islamabad', 'islamabad', 'Islamabad Capital Territory', 'The beautiful capital city of Pakistan.', true, 1),
('Peshawar', 'peshawar', 'Khyber Pakhtunkhwa', 'Historic gateway city with rich culture.', true, 1),
('Quetta', 'quetta', 'Balochistan', 'The provincial capital and fruit garden.', true, 1),
('Faisalabad', 'faisalabad', 'Punjab', 'The industrial hub of Pakistan.', true, 2),
('Rawalpindi', 'rawalpindi', 'Punjab', 'Twin city of Islamabad and military headquarters.', true, 3),
('Multan', 'multan', 'Punjab', 'The City of Saints, famous for shrines and mangoes.', true, 4),
('Hyderabad', 'hyderabad', 'Sindh', 'Known for history, bangles and literature.', true, 2),
('Gujranwala', 'gujranwala', 'Punjab', 'City of Wrestlers and industrial hub.', false, 5),
('Sialkot', 'sialkot', 'Punjab', 'Global hub for sports goods and surgical instruments.', false, 6),

-- Divisions as Regions (adding more entries to ensure they appear in the State list)
('Lahore City', 'lahore-city', 'Lahore Division', 'Central hub of Lahore Division.', false, 100),
('Karachi South', 'karachi-south', 'Karachi Division', 'Business center of Karachi Division.', false, 100),
('Faisalabad City', 'faisalabad-city', 'Faisalabad Division', 'Industrial center of Faisalabad Division.', false, 100),
('Rawalpindi City', 'rawalpindi-city', 'Rawalpindi Division', 'Center of Rawalpindi Division.', false, 100),
('Multan City', 'multan-city', 'Multan Division', 'Center of Multan Division.', false, 100),
('Gujranwala City', 'gujranwala-city', 'Gujranwala Division', 'Center of Gujranwala Division.', false, 100),
('Sargodha City', 'sargodha-city', 'Sargodha Division', 'Center of Sargodha Division.', false, 100),
('Bahawalpur City', 'bahawalpur-city', 'Bahawalpur Division', 'Center of Bahawalpur Division.', false, 100),
('Sahiwal City', 'sahiwal-city', 'Sahiwal Division', 'Center of Sahiwal Division.', false, 100),
('Dera Ghazi Khan City', 'dg-khan-city', 'Dera Ghazi Khan Division', 'Center of DG Khan Division.', false, 100),
('Sukkur City', 'sukkur-city', 'Sukkur Division', 'Center of Sukkur Division.', false, 100),
('Larkana City', 'larkana-city', 'Larkana Division', 'Center of Larkana Division.', false, 100),
('Mirpur Khas City', 'mirpur-khas-city', 'Mirpur Khas Division', 'Center of Mirpur Khas Division.', false, 100),
('Peshawar City', 'peshawar-city', 'Peshawar Division', 'Center of Peshawar Division.', false, 100),
('Mardan City', 'mardan-city', 'Mardan Division', 'Center of Mardan Division.', false, 100),
('Hazara City', 'hazara-city', 'Hazara Division', 'Center of Hazara Division.', false, 100),
('Malakand City', 'malakand-city', 'Malakand Division', 'Center of Malakand Division.', false, 100),
('Makran City', 'makran-city', 'Makran Division', 'Center of Makran Division.', false, 100),

-- Ensure all major provinces are represented
('Muzaffarabad', 'muzaffarabad', 'Azad Jammu & Kashmir', 'The capital of Azad Kashmir.', true, 1),
('Gilgit', 'gilgit', 'Gilgit-Baltistan', 'Major hub for mountaineering and trade.', true, 1)

ON CONFLICT (slug) DO UPDATE SET 
    state = EXCLUDED.state,
    description = EXCLUDED.description;
