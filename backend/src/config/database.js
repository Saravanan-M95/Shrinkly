import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    ssl: (process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('sslmode=require') || process.env.NODE_ENV === 'production'))
      ? {
          require: true,
          rejectUnauthorized: false,
        }
      : false
  },
});

export default sequelize;
