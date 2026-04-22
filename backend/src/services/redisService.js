// backend/src/services/redisService.js
const { getRedis } = require('../config/redis');

class RedisService {
  // Stocker l'état d'un robot
  static async setRobotStatus(robotId, status) {
    const redis = getRedis();
    if (!redis) return;
    
    await redis.hset('robots:status', robotId.toString(), JSON.stringify({
      ...status,
      lastUpdate: new Date().toISOString()
    }));
  }
  
  // Récupérer l'état d'un robot
  static async getRobotStatus(robotId) {
    const redis = getRedis();
    if (!redis) return null;
    
    const data = await redis.hget('robots:status', robotId.toString());
    return data ? JSON.parse(data) : null;
  }
  
  // Récupérer tous les robots
  static async getAllRobotsStatus() {
    const redis = getRedis();
    if (!redis) return {};
    
    const data = await redis.hgetall('robots:status');
    const result = {};
    for (const [key, value] of Object.entries(data || {})) {
      result[key] = JSON.parse(value);
    }
    return result;
  }
  
  // Ajouter une mission à la queue
  static async addMissionToQueue(mission) {
    const redis = getRedis();
    if (!redis) return;
    
    await redis.lpush('missions:queue', JSON.stringify(mission));
  }
  
  // Récupérer la prochaine mission
  static async getNextMission() {
    const redis = getRedis();
    if (!redis) return null;
    
    const mission = await redis.rpop('missions:queue');
    return mission ? JSON.parse(mission) : null;
  }
  
  // Mettre en cache des données
  static async setCache(key, data, duration = 300) {
    const redis = getRedis();
    if (!redis) return;
    
    await redis.setex(`cache:${key}`, duration, JSON.stringify(data));
  }
  
  // Récupérer du cache
  static async getCache(key) {
    const redis = getRedis();
    if (!redis) return null;
    
    const data = await redis.get(`cache:${key}`);
    return data ? JSON.parse(data) : null;
  }
  
  // Invalider un cache
  static async invalidateCache(pattern) {
    const redis = getRedis();
    if (!redis) return;
    
    const keys = await redis.keys(`cache:${pattern}*`);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
  
  // Rate limiting
  static async rateLimit(key, limit = 100, window = 60) {
    const redis = getRedis();
    if (!redis) return { allowed: true };
    
    const current = await redis.incr(`rate:${key}`);
    if (current === 1) {
      await redis.expire(`rate:${key}`, window);
    }
    
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      reset: window
    };
  }
}

module.exports = RedisService;