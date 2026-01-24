// src/config/database.ts
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'postgres',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL queries
     dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // for self-signed certs, not for production
      }
    }
  }
);

export default sequelize;
