import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotificationSettingsToUser1713950000000 implements MigrationInterface {
    name = 'AddNotificationSettingsToUser1713950000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Safe check to prevent errors if column already partially exists or for re-runs
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='notification_settings') THEN
                    ALTER TABLE "users" ADD COLUMN "notification_settings" JSONB DEFAULT '{}';
                END IF;
            END $$;
        `);
        
        // Ensure all existing records have at least an empty object for safety
        await queryRunner.query(`UPDATE "users" SET "notification_settings" = '{}' WHERE "notification_settings" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "notification_settings"`);
    }
}
