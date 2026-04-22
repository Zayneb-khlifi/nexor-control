// backend/src/controllers/badgeController.js
const badgeService = require("../services/badgeService");

// Récupérer les badges de l'utilisateur
exports.getUserBadges = async (req, res) => {
  try {
    const userId = req.user.id;
    const badges = await badgeService.getUserBadges(userId);
    res.json(badges);
  } catch (error) {
    console.error("Erreur getUserBadges:", error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer les badges disponibles
exports.getAvailableBadges = async (req, res) => {
  try {
    const userId = req.user.id;
    const badges = await badgeService.getAvailableBadges(userId);
    res.json(badges);
  } catch (error) {
    console.error("Erreur getAvailableBadges:", error);
    res.status(500).json({ error: error.message });
  }
};

// Vérifier et attribuer les badges (appelé après commande)
exports.checkBadges = async (req, res) => {
  try {
    const userId = req.user.id;
    const newBadges = await badgeService.checkAndAwardBadges(userId);
    res.json({ newBadges });
  } catch (error) {
    console.error("Erreur checkBadges:", error);
    res.status(500).json({ error: error.message });
  }
};