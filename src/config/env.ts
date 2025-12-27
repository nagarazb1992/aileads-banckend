import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET!,
  DB: {
    host: process.env.DB_HOST!,
    name: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    pass: process.env.DB_PASS!,
  },
  REDIS_URL: process.env.REDIS_URL!,
};
