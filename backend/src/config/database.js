import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Clean the DATABASE_URL to remove conflicting SSL parameters if they exist
let dbUrl = process.env.DATABASE_URL;
if (dbUrl && dbUrl.includes('?')) {
  dbUrl = dbUrl.split('?')[0];
}

const isLocal = !dbUrl || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

if (!isLocal) {
  console.log('🌐 External database detected. Applying SSL bypass for Aiven/Render...');
}

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    ssl: isLocal ? false : {
      require: true,
      rejectUnauthorized: false,
    }
  },
});

export default sequelize;
