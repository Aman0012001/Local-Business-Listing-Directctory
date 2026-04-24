import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTrustScoreFields1713960000000 implements MigrationInterface {
    name = 'AddTrustScoreFields1713960000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add User trust fields
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='trust_score') THEN
                    ALTER TABLE "users" ADD COLUMN "trust_score" INTEGER DEFAULT 50;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='review_count') THEN
                    ALTER TABLE "users" ADD COLUMN "review_count" INTEGER DEFAULT 0;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='helpful_votes_count') THEN
                    ALTER TABLE "users" ADD COLUMN "helpful_votes_count" INTEGER DEFAULT 0;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='spam_flags_count') THEN
                    ALTER TABLE "users" ADD COLUMN "spam_flags_count" INTEGER DEFAULT 0;
                END IF;
            END $$;
        `);

        // Add Review suspicion fields
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='is_suspicious') THEN
                    ALTER TABLE "reviews" ADD COLUMN "is_suspicious" BOOLEAN DEFAULT FALSE;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='suspicion_score') THEN
                    ALTER TABLE "reviews" ADD COLUMN "suspicion_score" DOUBLE PRECISION DEFAULT 0;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='suspicion_reason') THEN
                    ALTER TABLE "reviews" ADD COLUMN "suspicion_reason" TEXT;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "trust_score"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "review_count"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "helpful_votes_count"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "spam_flags_count"`);
        
        await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "is_suspicious"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "suspicion_score"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "suspicion_reason"`);
    }
}
