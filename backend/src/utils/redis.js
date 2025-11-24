// src/utils/redis.js
// Redis client (node-redis v4)
const { createClient } = require('redis');
require('dotenv').config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('✅ Connected to Redis:', REDIS_URL);
  }
}

connectRedis().catch((err) => {
  console.error('Failed to connect Redis:', err);
});

module.exports = redisClient;
