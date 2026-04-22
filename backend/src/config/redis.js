// backend/src/config/redis.js
const Redis = require('redis');

let redisClient = null;
let connectionAttempted = false;

const connectRedis = async () => {
  if (connectionAttempted) return redisClient;
  connectionAttempted = true;
  
  try {
    redisClient = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => {
      console.log('⚠️ Redis non disponible, le cache sera désactivé');
    });
    
    redisClient.on('connect', () => console.log('✅ Redis connecté'));
    redisClient.on('ready', () => console.log('✅ Redis prêt'));

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.log('⚠️ Redis non disponible, continuation sans cache...');
    redisClient = null;
    return null;
  }
};

const getRedis = () => redisClient;

module.exports = { connectRedis, getRedis };