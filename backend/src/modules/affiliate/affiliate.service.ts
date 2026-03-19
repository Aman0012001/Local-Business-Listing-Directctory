import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Affiliate } from '../../entities/affiliate.entity';
import { AffiliateReferral, ReferralStatus, ReferralType } from '../../entities/referral.entity';
import { Payout, PayoutStatus } from '../../entities/payout.entity';
import { User } from '../../entities/user.entity';
import { SystemSetting } from '../../entities/system-setting.entity';
import { nanoid } from 'nanoid';

@Injectable()
export class AffiliateService {
    constructor(
        @InjectRepository(Affiliate)
        private affiliateRepository: Repository<Affiliate>,
        @InjectRepository(AffiliateReferral)
        private referralRepository: Repository<AffiliateReferral>,
        @InjectRepository(Payout)
        private payoutRepository: Repository<Payout>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(SystemSetting)
        private systemSettingRepository: Repository<SystemSetting>,
    ) { }

    async getStats(userId: string) {
        const affiliate = await this.affiliateRepository.findOne({
            where: { user: { id: userId } },
        });

        if (!affiliate) {
            return { isAffiliate: false };
        }

        const referrals = await this.referralRepository.count({
            where: { affiliateId: affiliate.id },
        });

        const conversions = await this.referralRepository.count({
            where: { affiliateId: affiliate.id, status: ReferralStatus.CONVERTED },
        });

        return {
            isAffiliate: true,
            referralCode: affiliate.referralCode,
            totalEarnings: affiliate.totalEarnings,
            balance: affiliate.balance,
            totalWithdrawals: affiliate.totalWithdrawals,
            stats: {
                referrals,
                conversions,
                conversionRate: referrals > 0 ? (conversions / referrals) * 100 : 0,
            },
        };
    }

    async join(userId: string) {
        const existing = await this.affiliateRepository.findOne({
            where: { user: { id: userId } },
        });

        if (existing) {
            throw new ConflictException('Already an affiliate');
        }

        const affiliate = this.affiliateRepository.create({
            user: { id: userId } as any,
            referralCode: nanoid(10), // Short unique code
        });

        return this.affiliateRepository.save(affiliate);
    }

    async getReferrals(userId: string) {
        const affiliate = await this.affiliateRepository.findOne({
            where: { user: { id: userId } },
        });

        if (!affiliate) return [];

        return this.referralRepository.find({
            where: { affiliateId: affiliate.id },
            relations: ['referredUser'],
            order: { createdAt: 'DESC' },
            take: 20,
        });
    }

    // --- Payout Logic ---

    async requestPayout(userId: string, amount: number, method: string, details: string) {
        const affiliate = await this.affiliateRepository.findOne({
            where: { user: { id: userId } },
        });

        if (!affiliate) throw new NotFoundException('Affiliate not found');

        if (amount < 500) {
            throw new BadRequestException('Minimum withdrawal amount is Rs. 500');
        }

        if (affiliate.balance < amount) {
            throw new BadRequestException('Insufficient balance');
        }

        const payout = this.payoutRepository.create({
            affiliateId: affiliate.id,
            amount,
            paymentMethod: method,
            paymentDetails: details,
            status: PayoutStatus.PENDING,
        });

        // Deduct balance immediately (or hold it)
        affiliate.balance = Number(affiliate.balance) - amount;
        await this.affiliateRepository.save(affiliate);

        return this.payoutRepository.save(payout);
    }

    async getPayoutHistory(userId: string) {
        const affiliate = await this.affiliateRepository.findOne({
            where: { user: { id: userId } },
        });

        if (!affiliate) return [];

        return this.payoutRepository.find({
            where: { affiliateId: affiliate.id },
            order: { createdAt: 'DESC' },
        });
    }

    // --- Admin Logic ---

    async adminGetAllStats() {
        const totalAffiliates = await this.affiliateRepository.count();
        const totalEarnings = await this.affiliateRepository.sum('totalEarnings');
        const pendingPayouts = await this.payoutRepository.count({ where: { status: PayoutStatus.PENDING } });

        return {
            totalAffiliates,
            totalEarnings: totalEarnings || 0,
            pendingPayouts,
        };
    }

    async adminGetAllPayouts() {
        return this.payoutRepository.find({
            relations: ['affiliate', 'affiliate.user'],
            order: { createdAt: 'DESC' },
        });
    }

    async adminUpdatePayout(payoutId: string, status: PayoutStatus, notes?: string) {
        const payout = await this.payoutRepository.findOne({
            where: { id: payoutId },
            relations: ['affiliate'],
        });

        if (!payout) throw new NotFoundException('Payout request not found');

        if (payout.status === PayoutStatus.PAID || payout.status === PayoutStatus.REJECTED) {
            throw new BadRequestException('Payout already processed');
        }

        payout.status = status;
        payout.adminNotes = notes;

        if (status === PayoutStatus.PAID) {
            payout.processedAt = new Date();
            payout.affiliate.totalWithdrawals = Number(payout.affiliate.totalWithdrawals) + Number(payout.amount);
        } else if (status === PayoutStatus.REJECTED) {
            // Refund balance
            payout.affiliate.balance = Number(payout.affiliate.balance) + Number(payout.amount);
        }

        await this.affiliateRepository.save(payout.affiliate);
        return this.payoutRepository.save(payout);
    }

    async adminGetAllAffiliates() {
        return this.affiliateRepository.find({
            relations: ['user'],
            order: { totalEarnings: 'DESC' },
        });
    }

    async adminUpdateSettings(settings: { 
        commissionRate: string; 
        commissionType: string;
        checkinReward: string; 
        checkinType: string;
        validityMonths: string;
        expiryDate: string 
    }) {
        const updates = [
            { key: 'affiliate_commission_rate', value: settings.commissionRate },
            { key: 'affiliate_commission_type', value: settings.commissionType },
            { key: 'affiliate_checkin_reward', value: settings.checkinReward },
            { key: 'affiliate_checkin_type', value: settings.checkinType },
            { key: 'affiliate_validity_months', value: settings.validityMonths },
            { key: 'affiliate_settings_expiry', value: settings.expiryDate },
        ];

        for (const update of updates) {
            await this.systemSettingRepository.update({ key: update.key }, { value: update.value });
        }

        return { success: true };
    }

    async getSettings() {
        const settings = await this.systemSettingRepository.find({
            where: { group: 'affiliate' }
        });

        const config: any = {};
        settings.forEach(s => {
            const field = s.key.split('affiliate_')[1];
            config[field] = s.value;
        });

        return {
            commissionRate: config.commission_rate || '10',
            commissionType: config.commission_type || 'percent',
            checkinReward: config.checkin_reward || '5',
            checkinType: config.checkin_type || 'fixed',
            validityMonths: config.validity_months || '2',
            expiryDate: config.settings_expiry || '',
        };
    }


}
