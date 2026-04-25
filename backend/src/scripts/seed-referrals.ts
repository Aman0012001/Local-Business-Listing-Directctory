import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, Affiliate, AffiliateReferral, ReferralType, ReferralStatus } from '../entities';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userRepo = app.get(getRepositoryToken(User));
    const affiliateRepo = app.get(getRepositoryToken(Affiliate));
    const referralRepo = app.get(getRepositoryToken(AffiliateReferral));

    console.log('🤝 Seeding referrals...');

    // 1. Get or create an Affiliate
    let affiliateUser = await userRepo.findOne({ where: { email: 'affiliate@example.com' } });
    if (!affiliateUser) {
        affiliateUser = userRepo.create({
            email: 'affiliate@example.com',
            fullName: 'Aman Affiliate',
            password: 'hashed_password', // Not important for this seed
            role: 'vendor' as any
        });
        await userRepo.save(affiliateUser);
    }

    let affiliate = await affiliateRepo.findOne({ where: { userId: affiliateUser.id } });
    if (!affiliate) {
        affiliate = affiliateRepo.create({
            userId: affiliateUser.id,
            referralCode: 'AMAN123',
            balance: 1000,
            totalEarnings: 1500,
            status: 'active'
        });
        await affiliateRepo.save(affiliate);
    }

    // 2. Get or create referred users
    const referredData = [
        { email: 'ref1@example.com', name: 'John Doe', status: ReferralStatus.CONVERTED },
        { email: 'ref2@example.com', name: 'Jane Smith', status: ReferralStatus.PENDING },
        { email: 'ref3@example.com', name: 'Bob Wilson', status: ReferralStatus.CONVERTED },
        { email: 'ref4@example.com', name: 'Alice Brown', status: ReferralStatus.PENDING }
    ];

    for (const data of referredData) {
        let user = await userRepo.findOne({ where: { email: data.email } });
        if (!user) {
            user = userRepo.create({
                email: data.email,
                fullName: data.name,
                password: 'hashed_password',
                role: 'vendor' as any
            });
            await userRepo.save(user);
        }

        // Check if referral already exists
        const existingRef = await referralRepo.findOne({ 
            where: { referredUserId: user.id, affiliateId: affiliate.id } 
        });

        if (!existingRef) {
            const referral = referralRepo.create({
                affiliateId: affiliate.id,
                referredUserId: user.id,
                type: ReferralType.SUBSCRIPTION,
                status: data.status,
                commissionAmount: data.status === ReferralStatus.CONVERTED ? 50 : 0,
                createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000) // Random date in last 10 days
            });
            await referralRepo.save(referral);
            console.log(`✅ Created referral for ${data.name}`);
        }
    }

    console.log('🚀 Referral seeding completed!');
    await app.close();
}

bootstrap().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
