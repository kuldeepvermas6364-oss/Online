const path = require('path');

const env = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'online-social-media-secret',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://online_user:online_pass@localhost:5432/online_db',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379'
};

module.exports = { env };
