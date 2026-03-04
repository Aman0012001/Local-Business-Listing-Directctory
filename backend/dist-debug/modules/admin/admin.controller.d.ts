import { AdminService } from './admin.service';
import { ModerateBusinessDto, ModerateReviewDto } from './dto/moderate.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getStats(): Promise<{
        totalUsers: number;
        totalVendors: number;
        totalBusinesses: number;
        pendingBusinesses: number;
        totalReviews: number;
        totalRevenue: number;
    }>;
    moderateBusiness(id: string, dto: ModerateBusinessDto): Promise<import("../../entities").Listing>;
    moderateReview(id: string, dto: ModerateReviewDto): Promise<import("../../entities").Review>;
    verifyVendor(id: string, status: string): Promise<import("../../entities").Vendor>;
    getUsers(page?: number, limit?: number): Promise<import("../../common").PaginatedResponse<import("../../entities/user.entity").User>>;
}
