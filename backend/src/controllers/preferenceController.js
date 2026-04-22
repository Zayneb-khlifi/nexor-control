// backend/src/controllers/preferenceController.js
const { UserPreference, UserAllergie } = require("../models");

// Récupérer les préférences d'un utilisateur
exports.getPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const preferences = await UserPreference.findOne({ 
      where: { user_id: userId } 
    });
    
    const allergies = await UserAllergie.findAll({ 
      where: { user_id: userId },
      attributes: ["ingredient"]
    });
    
    res.json({
      preferences: preferences || {
        categorie_aimee: null,
        categorie_detestee: null,
        prix_max: 100
      },
      allergies: allergies.map(a => a.ingredient)
    });
  } catch (error) {
    console.error("Erreur getPreferences:", error);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour les préférences
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { categorie_aimee, categorie_detestee, prix_max } = req.body;
    
    let preferences = await UserPreference.findOne({ where: { user_id: userId } });
    
    if (!preferences) {
      preferences = await UserPreference.create({
        user_id: userId,
        categorie_aimee,
        categorie_detestee,
        prix_max
      });
    } else {
      await preferences.update({
        categorie_aimee,
        categorie_detestee,
        prix_max
      });
    }
    
    res.json({ 
      message: "Préférences mises à jour",
      preferences
    });
  } catch (error) {
    console.error("Erreur updatePreferences:", error);
    res.status(500).json({ error: error.message });
  }
};

// Ajouter une allergie
exports.addAllergie = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ingredient } = req.body;
    
    const allergie = await UserAllergie.create({
      user_id: userId,
      ingredient: ingredient.toLowerCase()
    });
    
    res.json({ 
      message: `Allergie à "${ingredient}" ajoutée`,
      allergie
    });
  } catch (error) {
    console.error("Erreur addAllergie:", error);
    res.status(500).json({ error: error.message });
  }
};

// Supprimer une allergie
exports.removeAllergie = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ingredient } = req.params;
    
    await UserAllergie.destroy({
      where: { 
        user_id: userId, 
        ingredient: ingredient.toLowerCase() 
      }
    });
    
    res.json({ message: `Allergie à "${ingredient}" supprimée` });
  } catch (error) {
    console.error("Erreur removeAllergie:", error);
    res.status(500).json({ error: error.message });
  }
};