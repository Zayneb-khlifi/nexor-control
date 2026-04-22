// backend/test-redis.js
const { connectRedis, getRedis } = require('./src/config/redis');

async function testRedis() {
  console.log('🚀 Test Redis - Démarrage...');
  
  // 1. Connexion à Redis
  await connectRedis();
  const redis = getRedis();
  
  if (!redis) {
    console.log('❌ Redis non disponible');
    return;
  }
  
  console.log('✅ Redis connecté');
  
  // 2. Tester l'écriture (set)
  console.log('\n📝 Test écriture...');
  await redis.set('test:key', 'Hello NEXOR!');
  console.log('✅ Valeur écrite: test:key = Hello NEXOR!');
  
  // 3. Tester la lecture (get)
  console.log('\n📖 Test lecture...');
  const value = await redis.get('test:key');
  console.log(`✅ Valeur lue: ${value}`);
  
  // 4. Tester l'expiration (setEx au lieu de setex)
  console.log('\n⏰ Test expiration...');
  await redis.setEx('test:expire', 5, 'Ce message expire dans 5 secondes');
  console.log('✅ Valeur avec expiration créée (5 secondes)');
  
  setTimeout(async () => {
    const expired = await redis.get('test:expire');
    console.log(`Après 5 secondes: ${expired || 'Valeur expirée (Redis a supprimé)'}`);
  }, 6000);
  
  // 5. Tester le cache de produits simulé
  console.log('\n📦 Test cache produits...');
  const produits = [
    { id: 1, nom: 'Robot Test 1', prix: 299 },
    { id: 2, nom: 'Robot Test 2', prix: 399 }
  ];
  
  await redis.setEx('cache:produits:all', 60, JSON.stringify(produits));
  console.log('✅ Produits mis en cache pour 60 secondes');
  
  const cachedProduits = await redis.get('cache:produits:all');
  if (cachedProduits) {
    const produitsCaches = JSON.parse(cachedProduits);
    console.log(`✅ Produits récupérés du cache: ${produitsCaches.length} produits`);
  }
  
  // 6. Tester le rate limiting (incr)
  console.log('\n🚦 Test Rate Limiting...');
  const userId = 'user123';
  for (let i = 1; i <= 5; i++) {
    const count = await redis.incr(`rate:${userId}`);
    if (count === 1) await redis.expire(`rate:${userId}`, 10);
    console.log(`Requête ${i}: compteur = ${count}`);
  }
  
  // 7. Tester les Hash (hSet, hGet, hGetAll)
  console.log('\n🤖 Test Hash robots...');
  await redis.hSet('robots:status', '1', JSON.stringify({
    statut: 'DISPONIBLE',
    batterie: 95,
    position: 'Zone A'
  }));
  await redis.hSet('robots:status', '2', JSON.stringify({
    statut: 'EN_MISSION',
    batterie: 65,
    position: 'Zone B'
  }));
  
  const robot1 = await redis.hGet('robots:status', '1');
  const allRobots = await redis.hGetAll('robots:status');
  console.log(`✅ Robot 1: ${robot1}`);
  console.log(`✅ Tous les robots: ${Object.keys(allRobots).length}`);
  
  // 8. Tester le délai (delay)
  console.log('\n⏱️ Test délai...');
  const start = Date.now();
  await redis.set('test:delay', 'test');
  await redis.get('test:delay');
  const end = Date.now();
  console.log(`✅ Temps de réponse: ${end - start}ms`);
  
  // 9. Nettoyage
  console.log('\n🧹 Nettoyage...');
  await redis.del('test:key');
  await redis.del('test:expire');
  await redis.del('cache:produits:all');
  await redis.del(`rate:${userId}`);
  await redis.del('robots:status');
  await redis.del('test:delay');
  
  console.log('\n🎉 TOUS LES TESTS REDIS RÉUSSIS !');
  
  // 10. Quitter
  await redis.quit();
  process.exit(0);
}

testRedis().catch(console.error);