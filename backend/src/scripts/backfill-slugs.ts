import { AppDataSource } from '../data-source';
import { Vendor } from '../entities/vendor.entity';
import { generateSlug } from '../common/utils/slug.util';

async function backfillSlugs() {
    try {
        console.log('Connecting to database...');
        await AppDataSource.initialize();
        
        console.log('Ensuring slug column exists...');
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.query('ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "slug" character varying');
        await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_VENDOR_SLUG" ON "vendors" ("slug")');
        
        const vendorRepo = AppDataSource.getRepository(Vendor);
        const vendors = await vendorRepo.find({ relations: ['user'] });

        console.log(`Found ${vendors.length} vendors to process.`);

        for (const vendor of vendors) {
            if (!vendor.slug) {
                const baseSlug = generateSlug(vendor.businessName || vendor.user?.fullName || 'vendor');
                let slug = baseSlug;
                let counter = 1;
                
                // Simple collision check
                let existing = await vendorRepo.findOne({ where: { slug } });
                while (existing && existing.id !== vendor.id) {
                    slug = `${baseSlug}-${counter++}`;
                    existing = await vendorRepo.findOne({ where: { slug } });
                }
                
                vendor.slug = slug;
                await vendorRepo.save(vendor);
                console.log(`Updated vendor ${vendor.id}: ${vendor.slug}`);
            } else {
                console.log(`Vendor ${vendor.id} already has slug: ${vendor.slug}`);
            }
        }

        console.log('Backfill complete.');
    } catch (error) {
        console.error('Error during backfill:', error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

backfillSlugs();
