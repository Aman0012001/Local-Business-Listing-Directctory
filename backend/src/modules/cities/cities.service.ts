import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../../entities/city.entity';

// Comprehensive city dataset organized by country
const CITY_DATASETS: Record<string, { name: string; state: string; country: string; isPopular: boolean; displayOrder: number }[]> = {
    'Pakistan': [
        // Punjab
        { name: 'Lahore', state: 'Punjab', country: 'Pakistan', isPopular: true, displayOrder: 1 },
        { name: 'Faisalabad', state: 'Punjab', country: 'Pakistan', isPopular: true, displayOrder: 2 },
        { name: 'Rawalpindi', state: 'Punjab', country: 'Pakistan', isPopular: true, displayOrder: 3 },
        { name: 'Gujranwala', state: 'Punjab', country: 'Pakistan', isPopular: true, displayOrder: 4 },
        { name: 'Multan', state: 'Punjab', country: 'Pakistan', isPopular: true, displayOrder: 5 },
        { name: 'Bahawalpur', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 6 },
        { name: 'Sargodha', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 7 },
        { name: 'Sialkot', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 8 },
        { name: 'Sheikhupura', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 9 },
        { name: 'Jhang', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 10 },
        { name: 'Rahim Yar Khan', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 11 },
        { name: 'Gujrat', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 12 },
        { name: 'Sahiwal', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 13 },
        { name: 'Wah Cantt', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 14 },
        { name: 'Okara', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 15 },
        { name: 'Kasur', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 16 },
        { name: 'Dera Ghazi Khan', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 17 },
        { name: 'Khushab', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 18 },
        { name: 'Attock', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 19 },
        { name: 'Chiniot', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 20 },
        { name: 'Hafizabad', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 21 },
        { name: 'Muzaffargarh', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 22 },
        { name: 'Mandi Bahauddin', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 23 },
        { name: 'Narowal', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 24 },
        { name: 'Vihari', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 25 },
        { name: 'Pakpattan', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 26 },
        { name: 'Khanewal', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 27 },
        { name: 'Toba Tek Singh', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 28 },
        { name: 'Bahawalnagar', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 29 },
        { name: 'Nankana Sahib', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 30 },
        { name: 'Layyah', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 31 },
        { name: 'Lodhran', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 32 },
        { name: 'Chakwal', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 33 },
        { name: 'Jhelum', state: 'Punjab', country: 'Pakistan', isPopular: false, displayOrder: 34 },
        // Sindh
        { name: 'Karachi', state: 'Sindh', country: 'Pakistan', isPopular: true, displayOrder: 35 },
        { name: 'Hyderabad', state: 'Sindh', country: 'Pakistan', isPopular: true, displayOrder: 36 },
        { name: 'Sukkur', state: 'Sindh', country: 'Pakistan', isPopular: false, displayOrder: 37 },
        { name: 'Larkana', state: 'Sindh', country: 'Pakistan', isPopular: false, displayOrder: 38 },
        { name: 'Nawabshah', state: 'Sindh', country: 'Pakistan', isPopular: false, displayOrder: 39 },
        { name: 'Mirpur Khas', state: 'Sindh', country: 'Pakistan', isPopular: false, displayOrder: 40 },
        { name: 'Khairpur', state: 'Sindh', country: 'Pakistan', isPopular: false, displayOrder: 41 },
        { name: 'Jacobabad', state: 'Sindh', country: 'Pakistan', isPopular: false, displayOrder: 42 },
        { name: 'Thatta', state: 'Sindh', country: 'Pakistan', isPopular: false, displayOrder: 43 },
        { name: 'Badin', state: 'Sindh', country: 'Pakistan', isPopular: false, displayOrder: 44 },
        { name: 'Shikarpur', state: 'Sindh', country: 'Pakistan', isPopular: false, displayOrder: 45 },
        { name: 'Dadu', state: 'Sindh', country: 'Pakistan', isPopular: false, displayOrder: 46 },
        { name: 'Sanghar', state: 'Sindh', country: 'Pakistan', isPopular: false, displayOrder: 47 },
        { name: 'Tando Adam', state: 'Sindh', country: 'Pakistan', isPopular: false, displayOrder: 48 },
        { name: 'Tando Allahyar', state: 'Sindh', country: 'Pakistan', isPopular: false, displayOrder: 49 },
        { name: 'Ghotki', state: 'Sindh', country: 'Pakistan', isPopular: false, displayOrder: 50 },
        // KPK
        { name: 'Peshawar', state: 'KPK', country: 'Pakistan', isPopular: true, displayOrder: 51 },
        { name: 'Mardan', state: 'KPK', country: 'Pakistan', isPopular: false, displayOrder: 52 },
        { name: 'Mingora', state: 'KPK', country: 'Pakistan', isPopular: false, displayOrder: 53 },
        { name: 'Abbottabad', state: 'KPK', country: 'Pakistan', isPopular: false, displayOrder: 54 },
        { name: 'Kohat', state: 'KPK', country: 'Pakistan', isPopular: false, displayOrder: 55 },
        { name: 'Mansehra', state: 'KPK', country: 'Pakistan', isPopular: false, displayOrder: 56 },
        { name: 'Dera Ismail Khan', state: 'KPK', country: 'Pakistan', isPopular: false, displayOrder: 57 },
        { name: 'Swabi', state: 'KPK', country: 'Pakistan', isPopular: false, displayOrder: 58 },
        { name: 'Nowshera', state: 'KPK', country: 'Pakistan', isPopular: false, displayOrder: 59 },
        { name: 'Charsadda', state: 'KPK', country: 'Pakistan', isPopular: false, displayOrder: 60 },
        { name: 'Haripur', state: 'KPK', country: 'Pakistan', isPopular: false, displayOrder: 61 },
        { name: 'Karak', state: 'KPK', country: 'Pakistan', isPopular: false, displayOrder: 62 },
        { name: 'Bannu', state: 'KPK', country: 'Pakistan', isPopular: false, displayOrder: 63 },
        // Balochistan
        { name: 'Quetta', state: 'Balochistan', country: 'Pakistan', isPopular: true, displayOrder: 64 },
        { name: 'Turbat', state: 'Balochistan', country: 'Pakistan', isPopular: false, displayOrder: 65 },
        { name: 'Khuzdar', state: 'Balochistan', country: 'Pakistan', isPopular: false, displayOrder: 66 },
        { name: 'Hub', state: 'Balochistan', country: 'Pakistan', isPopular: false, displayOrder: 67 },
        { name: 'Gwadar', state: 'Balochistan', country: 'Pakistan', isPopular: false, displayOrder: 68 },
        { name: 'Chaman', state: 'Balochistan', country: 'Pakistan', isPopular: false, displayOrder: 69 },
        { name: 'Sibi', state: 'Balochistan', country: 'Pakistan', isPopular: false, displayOrder: 70 },
        { name: 'Zhob', state: 'Balochistan', country: 'Pakistan', isPopular: false, displayOrder: 71 },
        { name: 'Dera Bugti', state: 'Balochistan', country: 'Pakistan', isPopular: false, displayOrder: 72 },
        { name: 'Panjgur', state: 'Balochistan', country: 'Pakistan', isPopular: false, displayOrder: 73 },
        // ICT
        { name: 'Islamabad', state: 'ICT', country: 'Pakistan', isPopular: true, displayOrder: 74 },
        // AJK
        { name: 'Muzaffarabad', state: 'AJK', country: 'Pakistan', isPopular: false, displayOrder: 75 },
        { name: 'Mirpur', state: 'AJK', country: 'Pakistan', isPopular: false, displayOrder: 76 },
        { name: 'Rawalakot', state: 'AJK', country: 'Pakistan', isPopular: false, displayOrder: 77 },
        { name: 'Bagh', state: 'AJK', country: 'Pakistan', isPopular: false, displayOrder: 78 },
        // Gilgit-Baltistan
        { name: 'Gilgit', state: 'Gilgit-Baltistan', country: 'Pakistan', isPopular: false, displayOrder: 79 },
        { name: 'Skardu', state: 'Gilgit-Baltistan', country: 'Pakistan', isPopular: false, displayOrder: 80 },
        { name: 'Hunza', state: 'Gilgit-Baltistan', country: 'Pakistan', isPopular: false, displayOrder: 81 },
        { name: 'Chilas', state: 'Gilgit-Baltistan', country: 'Pakistan', isPopular: false, displayOrder: 82 },
    ],
    'India': [
        { name: 'Mumbai', state: 'Maharashtra', country: 'India', isPopular: true, displayOrder: 1 },
        { name: 'Delhi', state: 'Delhi', country: 'India', isPopular: true, displayOrder: 2 },
        { name: 'Bangalore', state: 'Karnataka', country: 'India', isPopular: true, displayOrder: 3 },
        { name: 'Hyderabad', state: 'Telangana', country: 'India', isPopular: true, displayOrder: 4 },
        { name: 'Chennai', state: 'Tamil Nadu', country: 'India', isPopular: true, displayOrder: 5 },
        { name: 'Kolkata', state: 'West Bengal', country: 'India', isPopular: true, displayOrder: 6 },
        { name: 'Pune', state: 'Maharashtra', country: 'India', isPopular: true, displayOrder: 7 },
        { name: 'Ahmedabad', state: 'Gujarat', country: 'India', isPopular: true, displayOrder: 8 },
        { name: 'Jaipur', state: 'Rajasthan', country: 'India', isPopular: false, displayOrder: 9 },
        { name: 'Surat', state: 'Gujarat', country: 'India', isPopular: false, displayOrder: 10 },
        { name: 'Lucknow', state: 'Uttar Pradesh', country: 'India', isPopular: false, displayOrder: 11 },
        { name: 'Kanpur', state: 'Uttar Pradesh', country: 'India', isPopular: false, displayOrder: 12 },
        { name: 'Nagpur', state: 'Maharashtra', country: 'India', isPopular: false, displayOrder: 13 },
        { name: 'Indore', state: 'Madhya Pradesh', country: 'India', isPopular: false, displayOrder: 14 },
        { name: 'Bhopal', state: 'Madhya Pradesh', country: 'India', isPopular: false, displayOrder: 15 },
        { name: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', isPopular: false, displayOrder: 16 },
        { name: 'Patna', state: 'Bihar', country: 'India', isPopular: false, displayOrder: 17 },
        { name: 'Vadodara', state: 'Gujarat', country: 'India', isPopular: false, displayOrder: 18 },
        { name: 'Goa', state: 'Goa', country: 'India', isPopular: false, displayOrder: 19 },
        { name: 'Jodhpur', state: 'Rajasthan', country: 'India', isPopular: false, displayOrder: 20 },
        { name: 'Coimbatore', state: 'Tamil Nadu', country: 'India', isPopular: false, displayOrder: 21 },
        { name: 'Chandigarh', state: 'Punjab', country: 'India', isPopular: false, displayOrder: 22 },
        { name: 'Amritsar', state: 'Punjab', country: 'India', isPopular: false, displayOrder: 23 },
        { name: 'Noida', state: 'Uttar Pradesh', country: 'India', isPopular: false, displayOrder: 24 },
        { name: 'Agra', state: 'Uttar Pradesh', country: 'India', isPopular: false, displayOrder: 25 },
        { name: 'Kochi', state: 'Kerala', country: 'India', isPopular: false, displayOrder: 26 },
    ],
    'UAE': [
        { name: 'Dubai', state: 'Dubai', country: 'UAE', isPopular: true, displayOrder: 1 },
        { name: 'Abu Dhabi', state: 'Abu Dhabi', country: 'UAE', isPopular: true, displayOrder: 2 },
        { name: 'Sharjah', state: 'Sharjah', country: 'UAE', isPopular: true, displayOrder: 3 },
        { name: 'Ajman', state: 'Ajman', country: 'UAE', isPopular: false, displayOrder: 4 },
        { name: 'Al Ain', state: 'Abu Dhabi', country: 'UAE', isPopular: false, displayOrder: 5 },
        { name: 'Ras Al Khaimah', state: 'Ras Al Khaimah', country: 'UAE', isPopular: false, displayOrder: 6 },
        { name: 'Fujairah', state: 'Fujairah', country: 'UAE', isPopular: false, displayOrder: 7 },
        { name: 'Umm Al Quwain', state: 'Umm Al Quwain', country: 'UAE', isPopular: false, displayOrder: 8 },
    ],
    'Saudi Arabia': [
        { name: 'Riyadh', state: 'Riyadh', country: 'Saudi Arabia', isPopular: true, displayOrder: 1 },
        { name: 'Jeddah', state: 'Makkah', country: 'Saudi Arabia', isPopular: true, displayOrder: 2 },
        { name: 'Mecca', state: 'Makkah', country: 'Saudi Arabia', isPopular: true, displayOrder: 3 },
        { name: 'Medina', state: 'Medina', country: 'Saudi Arabia', isPopular: true, displayOrder: 4 },
        { name: 'Dammam', state: 'Eastern Province', country: 'Saudi Arabia', isPopular: false, displayOrder: 5 },
        { name: 'Khobar', state: 'Eastern Province', country: 'Saudi Arabia', isPopular: false, displayOrder: 6 },
        { name: 'Tabuk', state: 'Tabuk', country: 'Saudi Arabia', isPopular: false, displayOrder: 7 },
        { name: 'Abha', state: 'Asir', country: 'Saudi Arabia', isPopular: false, displayOrder: 8 },
        { name: 'Taif', state: 'Makkah', country: 'Saudi Arabia', isPopular: false, displayOrder: 9 },
        { name: 'Buraidah', state: 'Qassim', country: 'Saudi Arabia', isPopular: false, displayOrder: 10 },
        { name: 'Najran', state: 'Najran', country: 'Saudi Arabia', isPopular: false, displayOrder: 11 },
        { name: 'Hail', state: 'Hail', country: 'Saudi Arabia', isPopular: false, displayOrder: 12 },
    ],
    'UK': [
        { name: 'London', state: 'England', country: 'UK', isPopular: true, displayOrder: 1 },
        { name: 'Birmingham', state: 'England', country: 'UK', isPopular: true, displayOrder: 2 },
        { name: 'Manchester', state: 'England', country: 'UK', isPopular: true, displayOrder: 3 },
        { name: 'Glasgow', state: 'Scotland', country: 'UK', isPopular: true, displayOrder: 4 },
        { name: 'Leeds', state: 'England', country: 'UK', isPopular: false, displayOrder: 5 },
        { name: 'Liverpool', state: 'England', country: 'UK', isPopular: false, displayOrder: 6 },
        { name: 'Bristol', state: 'England', country: 'UK', isPopular: false, displayOrder: 7 },
        { name: 'Edinburgh', state: 'Scotland', country: 'UK', isPopular: false, displayOrder: 8 },
        { name: 'Sheffield', state: 'England', country: 'UK', isPopular: false, displayOrder: 9 },
        { name: 'Bradford', state: 'England', country: 'UK', isPopular: false, displayOrder: 10 },
        { name: 'Leicester', state: 'England', country: 'UK', isPopular: false, displayOrder: 11 },
        { name: 'Coventry', state: 'England', country: 'UK', isPopular: false, displayOrder: 12 },
        { name: 'Cardiff', state: 'Wales', country: 'UK', isPopular: false, displayOrder: 13 },
        { name: 'Belfast', state: 'Northern Ireland', country: 'UK', isPopular: false, displayOrder: 14 },
        { name: 'Nottingham', state: 'England', country: 'UK', isPopular: false, displayOrder: 15 },
        { name: 'Newcastle', state: 'England', country: 'UK', isPopular: false, displayOrder: 16 },
        { name: 'Southampton', state: 'England', country: 'UK', isPopular: false, displayOrder: 17 },
    ],
    'USA': [
        { name: 'New York', state: 'New York', country: 'USA', isPopular: true, displayOrder: 1 },
        { name: 'Los Angeles', state: 'California', country: 'USA', isPopular: true, displayOrder: 2 },
        { name: 'Chicago', state: 'Illinois', country: 'USA', isPopular: true, displayOrder: 3 },
        { name: 'Houston', state: 'Texas', country: 'USA', isPopular: true, displayOrder: 4 },
        { name: 'Phoenix', state: 'Arizona', country: 'USA', isPopular: false, displayOrder: 5 },
        { name: 'Philadelphia', state: 'Pennsylvania', country: 'USA', isPopular: false, displayOrder: 6 },
        { name: 'San Antonio', state: 'Texas', country: 'USA', isPopular: false, displayOrder: 7 },
        { name: 'San Diego', state: 'California', country: 'USA', isPopular: false, displayOrder: 8 },
        { name: 'Dallas', state: 'Texas', country: 'USA', isPopular: false, displayOrder: 9 },
        { name: 'San Jose', state: 'California', country: 'USA', isPopular: false, displayOrder: 10 },
        { name: 'Austin', state: 'Texas', country: 'USA', isPopular: false, displayOrder: 11 },
        { name: 'Jacksonville', state: 'Florida', country: 'USA', isPopular: false, displayOrder: 12 },
        { name: 'San Francisco', state: 'California', country: 'USA', isPopular: false, displayOrder: 13 },
        { name: 'Seattle', state: 'Washington', country: 'USA', isPopular: false, displayOrder: 14 },
        { name: 'Denver', state: 'Colorado', country: 'USA', isPopular: false, displayOrder: 15 },
        { name: 'Boston', state: 'Massachusetts', country: 'USA', isPopular: false, displayOrder: 16 },
        { name: 'Miami', state: 'Florida', country: 'USA', isPopular: false, displayOrder: 17 },
        { name: 'Las Vegas', state: 'Nevada', country: 'USA', isPopular: false, displayOrder: 18 },
        { name: 'Atlanta', state: 'Georgia', country: 'USA', isPopular: false, displayOrder: 19 },
        { name: 'Washington DC', state: 'DC', country: 'USA', isPopular: false, displayOrder: 20 },
    ],
    'Canada': [
        { name: 'Toronto', state: 'Ontario', country: 'Canada', isPopular: true, displayOrder: 1 },
        { name: 'Vancouver', state: 'British Columbia', country: 'Canada', isPopular: true, displayOrder: 2 },
        { name: 'Montreal', state: 'Quebec', country: 'Canada', isPopular: true, displayOrder: 3 },
        { name: 'Calgary', state: 'Alberta', country: 'Canada', isPopular: false, displayOrder: 4 },
        { name: 'Edmonton', state: 'Alberta', country: 'Canada', isPopular: false, displayOrder: 5 },
        { name: 'Ottawa', state: 'Ontario', country: 'Canada', isPopular: false, displayOrder: 6 },
        { name: 'Winnipeg', state: 'Manitoba', country: 'Canada', isPopular: false, displayOrder: 7 },
        { name: 'Quebec City', state: 'Quebec', country: 'Canada', isPopular: false, displayOrder: 8 },
        { name: 'Hamilton', state: 'Ontario', country: 'Canada', isPopular: false, displayOrder: 9 },
        { name: 'Kitchener', state: 'Ontario', country: 'Canada', isPopular: false, displayOrder: 10 },
        { name: 'London', state: 'Ontario', country: 'Canada', isPopular: false, displayOrder: 11 },
        { name: 'Victoria', state: 'British Columbia', country: 'Canada', isPopular: false, displayOrder: 12 },
        { name: 'Halifax', state: 'Nova Scotia', country: 'Canada', isPopular: false, displayOrder: 13 },
        { name: 'Saskatoon', state: 'Saskatchewan', country: 'Canada', isPopular: false, displayOrder: 14 },
    ],
    'Australia': [
        { name: 'Sydney', state: 'New South Wales', country: 'Australia', isPopular: true, displayOrder: 1 },
        { name: 'Melbourne', state: 'Victoria', country: 'Australia', isPopular: true, displayOrder: 2 },
        { name: 'Brisbane', state: 'Queensland', country: 'Australia', isPopular: true, displayOrder: 3 },
        { name: 'Perth', state: 'Western Australia', country: 'Australia', isPopular: true, displayOrder: 4 },
        { name: 'Adelaide', state: 'South Australia', country: 'Australia', isPopular: false, displayOrder: 5 },
        { name: 'Gold Coast', state: 'Queensland', country: 'Australia', isPopular: false, displayOrder: 6 },
        { name: 'Newcastle', state: 'New South Wales', country: 'Australia', isPopular: false, displayOrder: 7 },
        { name: 'Canberra', state: 'ACT', country: 'Australia', isPopular: false, displayOrder: 8 },
        { name: 'Sunshine Coast', state: 'Queensland', country: 'Australia', isPopular: false, displayOrder: 9 },
        { name: 'Wollongong', state: 'New South Wales', country: 'Australia', isPopular: false, displayOrder: 10 },
        { name: 'Hobart', state: 'Tasmania', country: 'Australia', isPopular: false, displayOrder: 11 },
        { name: 'Geelong', state: 'Victoria', country: 'Australia', isPopular: false, displayOrder: 12 },
        { name: 'Townsville', state: 'Queensland', country: 'Australia', isPopular: false, displayOrder: 13 },
        { name: 'Darwin', state: 'Northern Territory', country: 'Australia', isPopular: false, displayOrder: 14 },
    ],
};

@Injectable()
export class CitiesService {
    constructor(
        @InjectRepository(City)
        private readonly cityRepository: Repository<City>,
    ) { }

    async findAll() {
        return this.cityRepository.find({
            order: { displayOrder: 'ASC', name: 'ASC' },
        });
    }

    async findPopular() {
        return this.cityRepository.find({
            where: { isPopular: true },
            order: { displayOrder: 'ASC' },
        });
    }

    async findBySlug(slug: string) {
        const city = await this.cityRepository.findOne({
            where: { slug },
        });

        if (!city) {
            throw new NotFoundException(`City with slug ${slug} not found`);
        }

        return city;
    }

    async create(data: Partial<City>) {
        if (!data.slug && data.name) {
            const { generateSlug } = await import('../../common/utils/slug.util');
            data.slug = generateSlug(data.name);
        }

        const existing = await this.cityRepository.findOne({
            where: { slug: data.slug },
        });

        if (existing) {
            return existing;
        }

        const city = this.cityRepository.create(data);
        return this.cityRepository.save(city);
    }

    async update(id: string, data: Partial<City>) {
        const city = await this.cityRepository.findOne({ where: { id } });
        if (!city) {
            throw new NotFoundException(`City with ID ${id} not found`);
        }

        // If name changed, regenerate slug
        if (data.name && data.name !== city.name && !data.slug) {
            const { generateSlug } = await import('../../common/utils/slug.util');
            data.slug = generateSlug(data.name);
        }

        Object.assign(city, data);
        return this.cityRepository.save(city);
    }

    async findAllAdmin(page = 1, limit = 10, search = '') {
        const queryBuilder = this.cityRepository.createQueryBuilder('city')
            .orderBy('city.displayOrder', 'ASC')
            .addOrderBy('city.name', 'ASC');

        if (search) {
            queryBuilder.where('city.name ILike :search OR city.slug ILike :search', { search: `%${search}%` });
        }

        const [data, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { data, total };
    }

    async remove(id: string) {
        const city = await this.cityRepository.findOne({ where: { id } });
        if (!city) {
            throw new NotFoundException(`City with ID ${id} not found`);
        }
        return this.cityRepository.remove(city);
    }

    /**
     * Returns the list of supported countries and their city counts.
     */
    getSupportedCountries() {
        return Object.entries(CITY_DATASETS).map(([country, cities]) => ({
            country,
            cityCount: cities.length,
        }));
    }

    /**
     * Bulk import all cities for a given country from the hardcoded dataset.
     */
    async bulkImportByCountry(country: string) {
        const dataset = CITY_DATASETS[country];
        if (!dataset) {
            throw new NotFoundException(`No city dataset found for country: ${country}. Supported: ${Object.keys(CITY_DATASETS).join(', ')}`);
        }

        const { generateSlug } = await import('../../common/utils/slug.util');
        let imported = 0;

        for (const cityData of dataset) {
            const slug = generateSlug(cityData.name + '-' + cityData.country);
            const existing = await this.cityRepository.findOne({ where: { slug } });
            if (!existing) {
                const city = this.cityRepository.create({ ...cityData, slug });
                await this.cityRepository.save(city);
                imported++;
            }
        }

        return { count: imported, total: dataset.length };
    }

    /**
     * @deprecated Use bulkImportByCountry('Pakistan') instead.
     * Kept for backward compatibility.
     */
    async bulkImportPakistaniCities() {
        return this.bulkImportByCountry('Pakistan');
    }
}
