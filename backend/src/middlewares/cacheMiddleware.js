// backend/src/middleware/cacheMiddleware.js
const { getRedis } = require('../config/redis');

const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const redis = getRedis();
    if (!redis) return next();
    
    const key = `cache:${req.originalUrl || req.url}`;
    
    try {
      const cachedData = await redis.get(key);
      if (cachedData) {
        console.log(`✅ Cache hit: ${key}`);
        return res.json(JSON.parse(cachedData));
      }
      
      // Stocker la réponse originale
      const originalJson = res.json;
      res.json = function(data) {
        redis.setex(key, duration, JSON.stringify(data));
        originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache error:', error);
      next();
    }
  };
};

module.exports = cacheMiddleware;