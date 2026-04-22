// backend/src/services/badgeService.js
const { Badge, UserBadge, Commande, LigneCommande, Produit, Points } = require("../models");
const { sequelize } = require("../config/database");

class BadgeService {
  
  async getUserStats(userId) {
    console.log(`📊 Calcul des statistiques pour l'utilisateur ${userId}`);
    
    // Nombre de commandes et dépense totale
    const commandes = await Commande.findAll({
      where: { client_id: userId, statut: ["VALIDEE", "TERMINEE", "EN_COURS"] }
    });
    
    let totalDepense = 0;
    let plusGrosseCommande = 0;
    let commandesMatin = 0;
    let commandesSoir = 0;
    let moisActifs = new Set();
    
    for (const cmd of commandes) {
      const lignes = await LigneCommande.findAll({
        where: { commande_id: cmd.id_commande }
      });
      
      let totalCmd = 0;
      for (const ligne of lignes) {
        totalCmd += parseFloat(ligne.prix_total) || 0;
      }
      
      totalDepense += totalCmd;
      if (totalCmd > plusGrosseCommande) plusGrosseCommande = totalCmd;
      
      const heure = new Date(cmd.date_creation).getHours();
      if (heure < 11) commandesMatin++;
      if (heure > 22) commandesSoir++;
      
      const mois = new Date(cmd.date_creation).toLocaleString('fr-FR', { month: 'year' });
      moisActifs.add(mois);
    }
    
    // Produits uniques commandés
    const produitsCommandes = await sequelize.query(
      `SELECT DISTINCT lc.produit_id FROM ligne_commande lc
       JOIN commandes c ON lc.commande_id = c.id_commande
       WHERE c.client_id = $1`,
      { bind: [userId], type: sequelize.QueryTypes.SELECT }
    );
    
    // Catégories visitées
    const categories = await sequelize.query(
      `SELECT DISTINCT 
        CASE 
          WHEN p.nom ILIKE '%café%' OR p.nom ILIKE '%thé%' OR p.nom ILIKE '%chocolat%' THEN 'boissons-chaudes'
          WHEN p.nom ILIKE '%jus%' OR p.nom ILIKE '%ice tea%' OR p.nom ILIKE '%limonade%' THEN 'boissons-froides'
          WHEN p.nom ILIKE '%tiramisu%' OR p.nom ILIKE '%fondant%' OR p.nom ILIKE '%crème%' THEN 'desserts'
          WHEN p.nom ILIKE '%croissant%' OR p.nom ILIKE '%pain%' THEN 'petit-dejeuner'
          ELSE 'plats'
        END as categorie
       FROM ligne_commande lc
       JOIN commandes c ON lc.commande_id = c.id_commande
       JOIN produits p ON lc.produit_id = p.id_produit
       WHERE c.client_id = $1`,
      { bind: [userId], type: sequelize.QueryTypes.SELECT }
    );
    
    const categoriesUniques = new Set(categories.map(c => c.categorie));
    
    // Points
    const points = await Points.findOne({ where: { user_id: userId } });
    
    const stats = {
      totalCommandes: commandes.length,
      totalDepense: totalDepense,
      plusGrosseCommande: plusGrosseCommande,
      produitsUniques: produitsCommandes.length,
      categoriesVisitees: categoriesUniques.size,
      commandesMatin: commandesMatin,
      commandesSoir: commandesSoir,
      moisActifs: moisActifs.size,
      totalPoints: points ? (points.total_points - (points.points_utilises || 0)) : 0
    };
    
    console.log("📊 Statistiques calculées:", stats);
    return stats;
  }
  
  async checkAndAwardBadgesAfterOrder(userId) {
    try {
      console.log(`🔍 Vérification des badges pour l'utilisateur ${userId}`);
      
      const stats = await this.getUserStats(userId);
      
      const badges = await Badge.findAll();
      console.log(`📋 ${badges.length} badges trouvés en base`);
      
      const obtainedBadges = await UserBadge.findAll({
        where: { user_id: userId },
        attributes: ["badge_id"]
      });
      const obtainedIds = new Set(obtainedBadges.map(b => b.badge_id));
      
      const newBadges = [];
      
      for (const badge of badges) {
        if (obtainedIds.has(badge.id_badge)) {
          console.log(`Badge "${badge.nom}" déjà obtenu`);
          continue;
        }
        
        let conditionMet = false;
        
        switch (badge.condition_type) {
          case 'commandes':
            conditionMet = stats.totalCommandes >= badge.condition_valeur;
            break;
          case 'depense':
            conditionMet = stats.totalDepense >= badge.condition_valeur;
            break;
          case 'points':
            conditionMet = stats.totalPoints >= badge.condition_valeur;
            break;
          case 'produits_uniques':
            conditionMet = stats.produitsUniques >= badge.condition_valeur;
            break;
          case 'commande_max':
            conditionMet = stats.plusGrosseCommande >= badge.condition_valeur;
            break;
          case 'categories_completes':
            conditionMet = stats.categoriesVisitees >= badge.condition_valeur;
            break;
          case 'matinal':
            conditionMet = stats.commandesMatin >= badge.condition_valeur;
            break;
          case 'nocturne':
            conditionMet = stats.commandesSoir >= badge.condition_valeur;
            break;
          case 'regularite':
            conditionMet = stats.moisActifs >= badge.condition_valeur;
            break;
          default:
            conditionMet = false;
        }
        
        console.log(`Badge "${badge.nom}" (${badge.condition_type}=${badge.condition_valeur}) : ${conditionMet ? '✅ DÉBLOQUÉ' : '❌ Non'}`);
        
        if (conditionMet) {
          await UserBadge.create({
            user_id: userId,
            badge_id: badge.id_badge,
            date_obtention: new Date()
          });
          
          if (badge.points_recompense > 0) {
            await this.addRewardPoints(userId, badge.points_recompense, badge.nom);
          }
          
          newBadges.push(badge);
          
          const { createNotification } = require("../controllers/notificationController");
          await createNotification(
            userId,
            `🏆 Nouveau badge : ${badge.nom}`,
            `Vous avez débloqué le badge "${badge.nom}" ! +${badge.points_recompense} points`,
            "success",
            "/profile"
          );
        }
      }
      
      console.log(`🎉 ${newBadges.length} nouveaux badges débloqués`);
      return newBadges;
    } catch (error) {
      console.error("Erreur vérification badges:", error);
      return [];
    }
  }
  
  async addRewardPoints(userId, points, badgeName) {
    let pointsObj = await Points.findOne({ where: { user_id: userId } });
    
    if (!pointsObj) {
      pointsObj = await Points.create({
        user_id: userId,
        total_points: 0,
        points_utilises: 0,
        niveau: "BRONZE"
      });
    }
    
    pointsObj.total_points += points;
    await pointsObj.save();
    
    console.log(`✅ +${points} points pour le badge "${badgeName}"`);
  }
  
  async getUserBadges(userId) {
    const userBadges = await UserBadge.findAll({
      where: { user_id: userId },
      include: [{ model: Badge }],
      order: [["date_obtention", "DESC"]]
    });
    
    return userBadges.map(ub => ({
      id: ub.Badge.id_badge,
      nom: ub.Badge.nom,
      description: ub.Badge.description,
      icone: ub.Badge.icone,
      points: ub.Badge.points_recompense,
      date: ub.date_obtention
    }));
  }
  
  async getAvailableBadges(userId) {
    const obtainedIds = await UserBadge.findAll({
      where: { user_id: userId },
      attributes: ["badge_id"]
    });
    const obtainedSet = new Set(obtainedIds.map(b => b.badge_id));
    
    const allBadges = await Badge.findAll();
    
    return allBadges.filter(b => !obtainedSet.has(b.id_badge));
  }
}

module.exports = new BadgeService();