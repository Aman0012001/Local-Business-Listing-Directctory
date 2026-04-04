import {
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, MoreThan } from 'typeorm';
import { Affiliate } from '../../entities/affiliate.entity';
import { AffiliateReferral, ReferralStatus, ReferralType } from '../../entities/referral.entity';
import { Payout, PayoutStatus } from '../../entities/payout.entity';
import { User } from '../../entities/user.entity';
import { SystemSetting } from '../../entities/system-setting.entity';
import { Subscription, SubscriptionStatus } from '../../entities/subscription.entity';
import { ActivePlan, ActivePlanStatus } from '../../entities/active-plan.entity';
import { PricingPlan, PricingPlanType } from '../../entities/pricing-plan.entity';
import { Vendor } from '../../entities/vendor.entity';
import { generateReferralCode } from '../../common/utils/referral-code';



@Injectable()
export class AffiliateService {
    private readonly logger = new Logger(AffiliateService.name);
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
        @InjectRepository(Subscription)
        private subscriptionRepository: Repository<Subscription>,
        @InjectRepository(ActivePlan)
        private activePlanRepository: Repository<ActivePlan>,
        @InjectRepository(PricingPlan)
        private pricingPlanRepository: Repository<PricingPlan>,
        @InjectRepository(Vendor)
        private vendorRepo: Repository<Vendor>,
    ) { }



    async getStats(userId: string) {
        let affiliate = await this.affiliateRepository.findOne({
            where: { user: { id: userId } },
        });

        if (!affiliate) {
            // Check if user is a vendor, if so auto-create
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (user && user.role === 'vendor') {
                affiliate = this.affiliateRepository.create({
                    user: { id: userId } as any,
                    referralCode: generateReferralCode(),
                });
                affiliate = await this.affiliateRepository.save(affiliate);
            } else {
                return { isAffiliate: false };
            }
        }

        const referredBy = await this.referralRepository.findOne({
            where: { referredUserId: userId },
            relations: ['affiliate', 'affiliate.user']
        });

        const referrals = await this.referralRepository.count({
            where: { affiliateId: affiliate.id },
        });

        const conversions = await this.referralRepository.count({
            where: { affiliateId: affiliate.id, status: ReferralStatus.CONVERTED },
        });

        return {
            isAffiliate: true,
            referralCode: affiliate.referralCode,
            totalReferrals: referrals,
            convertedReferrals: conversions,
            totalEarnings: affiliate.totalEarnings,
            balance: affiliate.balance,
            totalWithdrawals: affiliate.totalWithdrawals,
            conversionRate: referrals > 0 ? (conversions / referrals) * 100 : 0,
            hasReferrer: !!referredBy,
            referrerName: referredBy?.affiliate?.user?.fullName,
        };
    }

    async join(userId: string) {
        const existing = await this.affiliateRepository.findOne({
            where: { user: { id: userId } },
        });

        if (existing) {
            throw new ConflictException('Already an affiliate');
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user || user.role !== 'vendor') {
            throw new BadRequestException('Only registered vendors can join the affiliate program');
        }

        const affiliate = this.affiliateRepository.create({
            user: { id: userId } as any,
            referralCode: generateReferralCode(), // Short unique code
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

    async applyReferralCode(userId: string, code: string) {
        // Check if user already has a referrer
        const existing = await this.referralRepository.findOne({
            where: { referredUserId: userId }
        });
        if (existing) {
            throw new BadRequestException('You have already been referred');
        }

        const normalizedCode = code.trim();
        this.logger.log(`Applying referral code: "${normalizedCode}" (length: ${normalizedCode.length})`);
        
        // Find the affiliate with this code
        const affiliate = await this.affiliateRepository.findOne({
            where: { referralCode: ILike(normalizedCode) },
            relations: ['user']
        });

        if (!affiliate || !affiliate.user || affiliate.user.role !== 'vendor') {
            const reason = !affiliate ? 'not found' : 'belongs to a non-vendor user';
            this.logger.warn(`Referral code "${normalizedCode}" ${reason}`);
            throw new NotFoundException('Invalid referral code');
        }

        if (affiliate.user.id === userId) {
            throw new BadRequestException('You cannot refer yourself');
        }

        // Create the referral record
        const referral = this.referralRepository.create({
            affiliateId: affiliate.id,
            referredUserId: userId,
            type: 'signup' as any,
            status: 'pending' as any,
        });

        await this.referralRepository.save(referral);

        return { success: true, message: 'Referral code applied successfully' };
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

    async getReferralStats() {
        return await this.referralRepository.find({
            relations: ['affiliate', 'affiliate.user', 'referredUser'],
            order: { createdAt: 'DESC' }
        });
    }

    async adminActivateReferral(referralId: string) {
        const referral = await this.referralRepository.findOne({
            where: { id: referralId },
            relations: ['affiliate', 'referredUser']
        });

        if (!referral) {
            throw new NotFoundException('Referral not found');
        }

        return this.processSuccessfulReferral(referral.referredUserId);
    }

    /**
     * Common logic to process a successful referral (signup -> purchase)
     * Automatically called after successful payment or by admin override.
     */
    async processSuccessfulReferral(referredUserId: string) {
        const referral = await this.referralRepository.findOne({
            where: [
                { referredUserId, status: ReferralStatus.PENDING, type: ReferralType.SIGNUP },
                { referredUserId, status: ReferralStatus.PENDING, type: ReferralType.SUBSCRIPTION }
            ],
            relations: ['affiliate', 'affiliate.user']
        });

        if (!referral) {
            this.logger.debug(`No pending referral found for user ${referredUserId}`);
            return { success: false, reason: 'No pending referral' };
        }

        const referrerId = referral.affiliate.user.id;
        let extensionGranted = false;

        // --- 1. NEW PRICING SYSTEM (ActivePlan) ---
        // Find most recent subscription-type plan (any status)
        const referrerPlans = await this.activePlanRepository.find({
            where: { 
                vendor: { userId: referrerId },
                plan: { type: PricingPlanType.SUBSCRIPTION } as any
            },
            relations: ['plan'],
            order: { endDate: 'DESC' }
        });

        const latestPlan = referrerPlans[0];

        if (latestPlan) {
            // Re-activate if expired/cancelled
            latestPlan.status = ActivePlanStatus.ACTIVE;
            
            const now = new Date();
            const currentEndDate = new Date(latestPlan.endDate);

            if (currentEndDate > now) {
                // Still active: Add 30 days to the end
                currentEndDate.setDate(currentEndDate.getDate() + 30);
                latestPlan.endDate = currentEndDate;
            } else {
                // Already expired: Reactivate from NOW + 30 days
                latestPlan.startDate = now;
                const newEndDate = new Date(now);
                newEndDate.setDate(newEndDate.getDate() + 30);
                latestPlan.endDate = newEndDate;
            }

            await this.activePlanRepository.save(latestPlan);
            this.logger.log(`Extended/Re-activated referrer ${referrerId} ActivePlan by 30 days`);
            extensionGranted = true;
        } else {
            // FALLBACK: Assign a new plan if they have NONE
            try {
                // Find a plan with price > 0 (Standard/Reward type)
                const defaultPlan = await this.pricingPlanRepository.findOne({
                    where: { 
                        type: PricingPlanType.SUBSCRIPTION, 
                        isActive: true,
                        price: MoreThan(0) // Prefer a paid plan for reward features
                    },
                    order: { price: 'ASC' }
                }) || await this.pricingPlanRepository.findOne({
                    where: { type: PricingPlanType.SUBSCRIPTION, isActive: true },
                    order: { price: 'ASC' }
                });

                if (defaultPlan) {
                    const vendor = await this.vendorRepo.findOne({ where: { userId: referrerId } });
                    if (vendor) {
                        const now = new Date();
                        const endDate = new Date(now);
                        endDate.setDate(endDate.getDate() + 30);

                        const newActivePlan = this.activePlanRepository.create({
                            vendorId: vendor.id,
                            planId: defaultPlan.id,
                            status: ActivePlanStatus.ACTIVE,
                            startDate: now,
                            endDate: endDate,
                            amountPaid: 0,
                            transactionId: 'REFERRAL_REWARD'
                        });
                        await this.activePlanRepository.save(newActivePlan);
                        this.logger.log(`Assigned NEW 30-day reward plan to referrer ${referrerId}`);
                        extensionGranted = true;
                    }
                }
            } catch (err) {
                this.logger.error(`Failed to assign fallback plan to referrer ${referrerId}: ${err.message}`);
            }
        }

        // --- 2. OLD LEGACY SYSTEM (Subscription) ---
        const referrerActiveSub = await this.subscriptionRepository.findOne({
            where: { 
                vendor: { userId: referrerId },
                // We keep it simple for legacy: only extend if active or recently expired
            },
            order: { endDate: 'DESC' }
        });

        if (referrerActiveSub) {
            referrerActiveSub.status = SubscriptionStatus.ACTIVE;
            const now = new Date();
            const currentEndDate = new Date(referrerActiveSub.endDate);

            if (currentEndDate > now) {
                currentEndDate.setDate(currentEndDate.getDate() + 30);
                referrerActiveSub.endDate = currentEndDate;
            } else {
                referrerActiveSub.startDate = now;
                const newEndDate = new Date(now);
                newEndDate.setDate(newEndDate.getDate() + 30);
                referrerActiveSub.endDate = newEndDate;
            }

            await this.subscriptionRepository.save(referrerActiveSub);
            this.logger.log(`Extended/Re-activated referrer ${referrerId} legacy subscription by 30 days`);
            extensionGranted = true;
        }

        // 3. Update Referral Status
        referral.status = ReferralStatus.CONVERTED;
        referral.type = ReferralType.SUBSCRIPTION; // Mark as converted via purchase
        await this.referralRepository.save(referral);

        this.logger.log(`✅ Referral ${referral.id} for user ${referredUserId} successfully converted. Extension granted: ${extensionGranted}`);

        return {
            success: true,
            message: extensionGranted 
                ? 'Referral activated and Referrer plan extended/re-activated by 30 days' 
                : 'Referral activated (Referrer has no valid account to reward)',
            extensionGranted
        };
    }

}

