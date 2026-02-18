import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function testDatabaseConnection() {
    console.log('🔍 Testing PostgreSQL Database Connection...\n');

    try {
        // Create NestJS application
        const app = await NestFactory.create(AppModule, { logger: false });

        // Get DataSource from the app
        const dataSource = app.get(DataSource);

        if (dataSource.isInitialized) {
            console.log('✅ Database connection successful!');
            console.log(`📊 Database: ${dataSource.options.database}`);
            console.log(`🖥️  Host: ${(dataSource.options as any).host}`);
            console.log(`🔌 Port: ${(dataSource.options as any).port}`);

            // Test query
            const result = await dataSource.query('SELECT NOW()');
            console.log(`⏰ Server time: ${result[0].now}\n`);

            // Check if users table exists
            const tables = await dataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);

            console.log('📋 Available tables:');
            if (tables.length === 0) {
                console.log('   No tables yet (will be created on first app start)');
            } else {
                tables.forEach((table: any) => {
                    console.log(`   - ${table.table_name}`);
                });
            }

            console.log('\n✨ Everything looks good! You can now start your application.');
        } else {
            console.log('❌ Database connection failed - not initialized');
        }

        await app.close();
    } catch (error) {
        console.error('❌ Database connection failed!\n');
        console.error('Error details:', error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Check if PostgreSQL is running');
        console.error('   2. Verify database exists: CREATE DATABASE business_saas_db;');
        console.error('   3. Check credentials in .env file');
        console.error('   4. Verify host and port settings\n');
        process.exit(1);
    }
}

testDatabaseConnection();
