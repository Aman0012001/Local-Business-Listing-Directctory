const { DataSource } = require('typeorm');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  synchronize: true,
  logging: true,
  entities: [path.join(__dirname, 'src/entities/*.entity.ts')],
});

dataSource.initialize()
  .then(() => {
    console.log('✅ Connection initialized successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  });
