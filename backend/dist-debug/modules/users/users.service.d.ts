import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { SavedListing } from '../../entities/favorite.entity';
import { Notification } from '../../entities/notification.entity';
import { Listing } from '../../entities/business.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersService {
    private userRepository;
    private savedListingRepository;
    private notificationRepository;
    private businessRepository;
    constructor(userRepository: Repository<User>, savedListingRepository: Repository<SavedListing>, notificationRepository: Repository<Notification>, businessRepository: Repository<Listing>);
    getProfile(id: string): Promise<User>;
    updateProfile(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    updateAvatar(id: string, filename: string): Promise<User>;
    changePassword(id: string, dto: ChangePasswordDto): Promise<void>;
    addFavorite(userId: string, businessId: string): Promise<void>;
    removeFavorite(userId: string, businessId: string): Promise<void>;
    getFavorites(userId: string, page?: number, limit?: number): Promise<import("../../common").PaginatedResponse<Listing>>;
    getNotifications(userId: string, page?: number, limit?: number): Promise<import("../../common").PaginatedResponse<Notification>>;
    markNotificationRead(userId: string, notificationId: string): Promise<void>;
    findByEmail(email: string): Promise<User | null>;
}
