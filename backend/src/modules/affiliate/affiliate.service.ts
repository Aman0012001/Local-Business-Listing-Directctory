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
import { BusinessCheckIn } from '../../entities/check-in.entity';
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
        @InjectRepository(BusinessCheckIn)
        private checkInRepository: Repository<BusinessCheckIn>,
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

        if (!affiliate) throw new NotFoundException('Affiliate not found');

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

        if (!affiliate) throw new NotFoundException('Affiliate not found');

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

    async processCheckInReward(userId: string, businessId: string, referralCode?: string) {
        // 1. Find the referral
        let referral: AffiliateReferral | undefined;

        if (referralCode) {
            const affiliate = await this.affiliateRepository.findOne({ where: { referralCode } });
            if (!affiliate) return null;

            // Check if this user was already referred by someone else
            referral = await this.referralRepository.findOne({
                where: { referredUserId: userId, status: ReferralStatus.PENDING }
            });

            if (!referral) {
                // Create a new referral for this check-in if one doesn't exist
                referral = this.referralRepository.create({
                    affiliateId: affiliate.id,
                    referredUserId: userId,
                    type: ReferralType.SIGNUP, // Defaulting to signup type or adding special check-in type
                    status: ReferralStatus.PENDING
                });
                referral = await this.referralRepository.save(referral);
            }
        } else {
            // Check if user has an existing pending referral
            referral = await this.referralRepository.findOne({
                where: { referredUserId: userId, status: ReferralStatus.PENDING }
            });
        }

        if (!referral) return null;

        // 2. Add the check-in record
        const checkIn = this.checkInRepository.create({
            userId,
            businessId,
            referralId: referral.id
        });
        await this.checkInRepository.save(checkIn);

        // 3. Process Reward
        const settings = await this.getSettings();
        
        // Validity Check
        const monthsPassed = (Date.now() - referral.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
        const validityMonths = parseFloat(settings.validityMonths) || 2;

        if (monthsPassed <= validityMonths) {
            let rewardAmount = parseFloat(settings.checkinReward) || 5;
            // Note: percent check-in reward usually doesn't make sense unless there's a base value, 
            // but we'll stick to 'fixed' for check-ins as per standard practice, or allow it as a flat amount.
            
            // Credit Affiliate
            const affiliate = await this.affiliateRepository.findOne({ where: { id: referral.affiliateId } });
            if (affiliate) {
                affiliate.balance = Number(affiliate.balance) + rewardAmount;
                affiliate.totalEarnings = Number(affiliate.totalEarnings) + rewardAmount;
                await this.affiliateRepository.save(affiliate);
            }
            
            return { success: true, rewardAmount };
        }

        return { success: false, reason: 'Validity expired' };
    }
}
