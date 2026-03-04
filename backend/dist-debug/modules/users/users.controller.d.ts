import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../../entities/user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: User): Promise<User>;
    updateProfile(user: User, updateUserDto: UpdateUserDto): Promise<User>;
    updateAvatar(user: User, avatarUrl: string): Promise<{
        success: boolean;
        message: string;
        user: User;
    }>;
    changePassword(user: User, changePasswordDto: ChangePasswordDto): Promise<void>;
    getFavorites(user: User, page?: number, limit?: number): Promise<import("../../common").PaginatedResponse<import("../../entities").Listing>>;
    addFavorite(user: User, businessId: string): Promise<void>;
    removeFavorite(user: User, businessId: string): Promise<void>;
    getNotifications(user: User, page?: number, limit?: number): Promise<import("../../common").PaginatedResponse<import("../../entities").Notification>>;
    markNotificationRead(user: User, id: string): Promise<void>;
}
