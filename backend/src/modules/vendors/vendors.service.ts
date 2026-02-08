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
import { Business } from '../../entities/business.entity';
import { Subscription } from '../../entities/subscription.entity';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';

@Injectable()
export class VendorsService {
    constructor(
        @InjectRepository(Vendor)
        private vendorRepository: Repository<Vendor>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Business)
        private businessRepository: Repository<Business>,
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
     * Update vendor profile
     */
    async updateProfile(userId: string, updateVendorDto: UpdateVendorDto): Promise<Vendor> {
        const vendor = await this.getProfile(userId);

        Object.assign(vendor, updateVendorDto);
        return this.vendorRepository.save(vendor);
    }

    /**
     * Get vendor statistics (Overview for dashboard)
     */
    async getDashboardStats(userId: string) {
        const vendor = await this.getProfile(userId);

        const businessCount = await this.businessRepository.count({
            where: { vendorId: vendor.id },
        });

        // We'll add lead/review counts later when we integrate those modules
        // but the query builder can handle it now
        const totalLeads = await this.businessRepository
            .createQueryBuilder('business')
            .select('SUM(business.total_leads)', 'total')
            .where('business.vendor_id = :vendorId', { vendorId: vendor.id })
            .getRawOne();

        const totalViews = await this.businessRepository
            .createQueryBuilder('business')
            .select('SUM(business.total_views)', 'total')
            .where('business.vendor_id = :vendorId', { vendorId: vendor.id })
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
