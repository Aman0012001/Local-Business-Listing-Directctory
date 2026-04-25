import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AffiliateReferral } from '../entities';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const referralRepo = app.get(getRepositoryToken(AffiliateReferral));

    console.log('📋 Dumping referrals...');
    const referrals = await referralRepo.find({
        relations: ['affiliate', 'affiliate.user', 'referredUser']
    });

    console.log(`Found ${referrals.length} referrals.`);
    referrals.forEach(ref => {
        console.log(`- From: ${ref.affiliate?.user?.fullName} (${ref.affiliate?.referralCode}) -> To: ${ref.referredUser?.fullName} [${ref.status}]`);
    });

    await app.close();
}

bootstrap().catch(err => {
    console.error('❌ Dump failed:', err);
    process.exit(1);
});
