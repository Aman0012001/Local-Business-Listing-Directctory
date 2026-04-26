import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';

export async function fixProductionSchema(dataSource: DataSource) {
    const logger = new Logger('SchemaFixer');
    try {
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();

        logger.log('🛠️ Checking and fixing production database schema...');

        // --- SUBSCRIPTION PLANS ---
        const tables = await queryRunner.getTable('subscription_plans');
        if (tables) {
            if (!tables.findColumnByName('stripe_price_id')) {
                logger.log('➕ Adding stripe_price_id to subscription_plans');
                await queryRunner.query('ALTER TABLE subscription_plans ADD COLUMN stripe_price_id VARCHAR(255)');
            }
            if (!tables.findColumnByName('dashboard_features')) {
                logger.log('➕ Adding dashboard_features to subscription_plans');
                await queryRunner.query('ALTER TABLE subscription_plans ADD COLUMN dashboard_features JSONB DEFAULT \'{}\'');
            }
        }

        // --- BUSINESSES (LISTINGS) ---
        const bizTable = await queryRunner.getTable('businesses');
        if (bizTable) {
            const missingColumns = [
                { name: 'total_views', type: 'integer', default: '0' },
                { name: 'total_leads', type: 'integer', default: '0' },
                { name: 'followers_count', type: 'integer', default: '0' },
                { name: 'is_verified', type: 'boolean', default: 'false' },
                { name: 'is_featured', type: 'boolean', default: 'false' },
                { name: 'is_sponsored', type: 'boolean', default: 'false' },
                { name: 'average_rating', type: 'decimal', precision: '3', scale: '2', default: '0' },
                { name: 'search_keywords', type: 'jsonb', default: '\'[]\'' },
                { name: 'faqs', type: 'jsonb', default: '\'[]\'' },
                { name: 'logo_url', type: 'text', nullable: true },
                { name: 'cover_image_url', type: 'text', nullable: true },
                { name: 'suggested_category_name', type: 'text', nullable: true },
            ];

            for (const col of missingColumns) {
                if (!bizTable.findColumnByName(col.name)) {
                    logger.log(`➕ Adding missing column ${col.name} to businesses`);
                    const type = col.precision ? `${col.type}(${col.precision},${col.scale})` : col.type;
                    const def = col.default !== undefined ? `DEFAULT ${col.default}` : '';
                    await queryRunner.query(`ALTER TABLE businesses ADD COLUMN ${col.name} ${type} ${def}`);
                }
            }
        }

        await queryRunner.release();
        logger.log('✅ Production schema check/fix completed.');
    } catch (err) {
        logger.error('❌ Failed to fix schema automatically:', err.stack);
    }
}
