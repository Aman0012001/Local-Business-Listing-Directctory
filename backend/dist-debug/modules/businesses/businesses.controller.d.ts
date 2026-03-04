import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { SearchBusinessDto } from './dto/search-business.dto';
import { Listing } from '../../entities/business.entity';
import { User } from '../../entities/user.entity';
export declare class BusinessesController {
    private readonly businessesService;
    constructor(businessesService: BusinessesService);
    create(createBusinessDto: CreateBusinessDto, user: User): Promise<Listing>;
    updateImageUrl(id: string, imageUrl: string, user: User): Promise<Listing>;
    search(searchDto: SearchBusinessDto): Promise<import("../../common").PaginatedResponse<any>>;
    findBySlug(slug: string, user?: User): Promise<Listing>;
    findOne(id: string, user?: User): Promise<Listing>;
    update(id: string, updateBusinessDto: UpdateBusinessDto, user: User): Promise<Listing>;
    remove(id: string, user: User): Promise<void>;
    getMyBusinesses(user: User, page?: number, limit?: number): Promise<import("../../common").PaginatedResponse<Listing>>;
    getSimilar(idOrSlug: string, limit?: number): Promise<Listing[]>;
    getAllAmenities(): Promise<import("../../entities").Amenity[]>;
    createAmenity(data: {
        name: string;
        icon?: string;
    }): Promise<import("../../entities").Amenity>;
}
