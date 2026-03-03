import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from '../../entities/vendor.entity';
import { User, UserRole } from '../../entities/user.entity';
import { Listing } from '../../entities/business.entity';
import { Subscription } from '../../entities/subscription.entity';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';

@Injectable()
export class VendorsService {
    constructor(
        @InjectRepository(Vendor)
        private vendorRepository: Repository<Vendor>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Listing)
        private listingRepository: Repository<Listing>,
    ) { }

    /**
     * Register a user as a vendor
     */
    async becomeVendor(userId: string, createVendorDto: CreateVendorDto): Promise<Vendor> {
        // Check if user already has a vendor profile
        let vendor = await this.vendorRepository.findOne({ where: { userId } });
        if (vendor) {
            throw new ConflictException('You are already registered as a vendor');
        }

        // Create vendor profile
        vendor = this.vendorRepository.create({
            ...createVendorDto,
            userId,
            isVerified: false,
        });

        const savedVendor = await this.vendorRepository.save(vendor);

        // Update user role to VENDOR
        await this.userRepository.update(userId, { role: UserRole.VENDOR });

        return savedVendor;
    }

    /**
     * Get current vendor profile
     */
    async getProfile(userId: string): Promise<Vendor> {
        const vendor = await this.vendorRepository.findOne({
            where: { userId },
            relations: ['businesses', 'subscriptions'],
        });

        if (!vendor) {
            throw new NotFoundException('Vendor profile not found');
        }

        return vendor;
    }

    /**
     * Update vendor profile — creates a vendor record if one doesn't exist yet (upsert)
     */
    async updateProfile(userId: string, updateVendorDto: UpdateVendorDto): Promise<Vendor> {
        console.log(`[VendorsService] Updating profile for vendor (user ${userId}):`, JSON.stringify(updateVendorDto, null, 2));

        let vendor = await this.vendorRepository.findOne({
            where: { userId },
            relations: ['businesses', 'subscriptions'],
        });

        if (!vendor) {
            // Auto-create a vendor record for users who have the vendor role
            // but whose vendor profile row was never persisted (race condition / legacy data)
            console.log(`[VendorsService] No vendor record found for user ${userId} — creating one`);
            vendor = this.vendorRepository.create({
                userId,
                isVerified: false,
            });
        }

        Object.assign(vendor, updateVendorDto);
        await this.vendorRepository.save(vendor);
        console.log(`[VendorsService] Vendor profile saved successfully for user ${userId}`);

        return this.vendorRepository.findOne({
            where: { userId },
            relations: ['businesses', 'subscriptions'],
        });
    }

    /**
     * Get vendor statistics (Overview for dashboard)
     */
    async getDashboardStats(userId: string) {
        const vendor = await this.getProfile(userId);

        const businessCount = await this.listingRepository.count({
            where: { vendorId: vendor.id },
        });

        // We'll add lead/review counts later when we integrate those modules
        // but the query builder can handle it now
        const totalLeads = await this.listingRepository
            .createQueryBuilder('listing')
            .select('SUM(listing.totalLeads)', 'total')
            .where('listing.vendorId = :vendorId', { vendorId: vendor.id })
            .getRawOne();

        const totalViews = await this.listingRepository
            .createQueryBuilder('listing')
            .select('SUM(listing.totalViews)', 'total')
            .where('listing.vendorId = :vendorId', { vendorId: vendor.id })
            .getRawOne();

        return {
            businessCount,
            activeSubscription: vendor.subscriptions.find(s => s.status === 'active'),
            totalLeads: parseInt(totalLeads?.total || '0'),
            totalViews: parseInt(totalViews?.total || '0'),
            isVerified: vendor.isVerified,
        };
    }

    /**
     * Submit documents for verification
     */
    async submitVerification(userId: string, documents: any) {
        const vendor = await this.getProfile(userId);
        vendor.verificationDocuments = documents;
        // In a real app, this might trigger an admin notification
        return this.vendorRepository.save(vendor);
    }
}
