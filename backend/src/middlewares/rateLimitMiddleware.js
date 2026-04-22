// backend/src/middleware/rateLimitMiddleware.js
const { getRedis } = require('../config/redis');

const rateLimitMiddleware = (limit = 100, window = 60) => {
  return async (req, res, next) => {
    const redis = getRedis();
    if (!redis) return next();
    
    const userId = req.user?.id || req.ip;
    const key = `rate:${userId}`;
    
    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, window);
      }
      
      const allowed = current <= limit;
      
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - current));
      
      if (!allowed) {
        return res.status(429).json({
          message: `Trop de requêtes. Limite: ${limit} par ${window} secondes.`
        });
      }
      
      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      next();
    }
  };
};

module.exports = rateLimitMiddleware;