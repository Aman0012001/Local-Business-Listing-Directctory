import { VendorsService } from './vendors.service';
import { BusinessesService } from '../businesses/businesses.service';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';
import { User } from '../../entities/user.entity';
export declare class VendorsController {
    private readonly vendorsService;
    private readonly businessesService;
    constructor(vendorsService: VendorsService, businessesService: BusinessesService);
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
    becomeVendor(user: User, createVendorDto: CreateVendorDto): Promise<import("../../entities").Vendor>;
    getMyListings(user: User): Promise<import("../../common").PaginatedResponse<import("../../entities").Listing>>;
    getProfile(user: User): Promise<import("../../entities").Vendor>;
    updateProfile(user: User, updateVendorDto: UpdateVendorDto): Promise<import("../../entities").Vendor>;
    getStats(user: User): Promise<{
        businessCount: number;
        activeSubscription: import("../../entities").Subscription;
        totalLeads: number;
        totalViews: number;
        isVerified: boolean;
    }>;
    submitVerification(user: User, documents: any): Promise<import("../../entities").Vendor>;
}
