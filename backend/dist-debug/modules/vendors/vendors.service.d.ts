import { Repository } from 'typeorm';
import { Vendor } from '../../entities/vendor.entity';
import { User } from '../../entities/user.entity';
import { Listing } from '../../entities/business.entity';
import { Subscription } from '../../entities/subscription.entity';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';
export declare class VendorsService {
    private vendorRepository;
    private userRepository;
    private listingRepository;
    constructor(vendorRepository: Repository<Vendor>, userRepository: Repository<User>, listingRepository: Repository<Listing>);
    becomeVendor(userId: string, createVendorDto: CreateVendorDto): Promise<Vendor>;
    getProfile(userId: string): Promise<Vendor>;
    updateProfile(userId: string, updateVendorDto: UpdateVendorDto): Promise<Vendor>;
    getDashboardStats(userId: string): Promise<{
        businessCount: number;
        activeSubscription: Subscription;
        totalLeads: number;
        totalViews: number;
        isVerified: boolean;
    }>;
    submitVerification(userId: string, documents: any): Promise<Vendor>;
    getByCity(city: string): Promise<{
        id: string;
        businessName: string;
        vendorName: string;
        businessEmail: string;
        businessPhone: string;
        businessAddress: string;
        isVerified: boolean;
        socialLinks: {
            platform: string;
            url: string;
        }[];
        avatarUrl: string;
        coverImage: string;
        listingCount: number;
        avgRating: number;
        totalViews: number;
        categories: string[];
        sampleListings: {
            id: string;
            title: string;
            slug: string;
            images: string[];
        }[];
    }[]>;
}
