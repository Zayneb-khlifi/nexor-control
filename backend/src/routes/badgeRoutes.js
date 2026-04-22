// backend/src/routes/badgeRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const { Badge, UserBadge } = require("../models");

// Récupérer tous les badges (sans condition)
router.get("/", verifyToken, async (req, res) => {
  try {
    console.log("📡 Appel API badges");
    
    // Récupérer tous les badges
    const allBadges = await Badge.findAll();
    
    // Pour l'instant, retourner des badges fictifs pour tester
    const mockBadges = [
      {
        id: 1,
        nom: "🌟 Première commande",
        description: "Avoir passé votre première commande",
        icone: "🎯",
        points: 50,
        date: new Date().toISOString()
      },
      {
        id: 2,
        nom: "⭐ Client fidèle",
        description: "Avoir passé 10 commandes",
        icone: "🏆",
        points: 200
      },
      {
        id: 3,
        nom: "🚀 Super client",
        description: "Avoir passé une commande de plus de 100€",
        icone: "🚀",
        points: 150
      }
    ];
    
    // Si des badges existent en base, les utiliser
    if (allBadges && allBadges.length > 0) {
      const userBadges = await UserBadge.findAll({
        where: { user_id: req.user.id }
      });
      const userBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
      
      const result = allBadges.filter(b => userBadgeIds.has(b.id_badge)).map(b => ({
        id: b.id_badge,
        nom: b.nom,
        description: b.description,
        icone: b.icone,
        points: b.points_recompense,
        date: new Date().toISOString()
      }));
      
      return res.json(result);
    }
    
    // Fallback: badges mockés
    res.json(mockBadges);
  } catch (error) {
    console.error("❌ Erreur badges:", error);
    // En cas d'erreur, retourner des badges mockés
    res.json([
      {
        id: 1,
        nom: "🌟 Première commande",
        description: "Avoir passé votre première commande",
        icone: "🎯",
        points: 50
      }
    ]);
  }
});

// Récupérer les badges disponibles
router.get("/available", verifyToken, async (req, res) => {
  try {
    const mockAvailable = [
      {
        id: 4,
        nom: "👑 Client VIP",
        description: "Avoir passé 50 commandes",
        icone: "👑",
        points: 500
      },
      {
        id: 5,
        nom: "💰 Gros dépensier",
        description: "Avoir dépensé plus de 500€",
        icone: "💰",
        points: 300
      }
    ];
    res.json(mockAvailable);
  } catch (error) {
    res.json([]);
  }
});

module.exports = router;