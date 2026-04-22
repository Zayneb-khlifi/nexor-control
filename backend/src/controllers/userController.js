// backend/src/controllers/userController.js
const { User, Points } = require("../models");
const bcrypt = require("bcryptjs");

// Récupérer tous les utilisateurs (ADMIN+)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id_user", "nom", "email", "role", "statut_compte", "date_creation"],
      order: [["id_user", "ASC"]]
    });
    res.json(users);
  } catch (error) {
    console.error("Erreur getUsers:", error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id_user", "nom", "email", "role", "statut_compte", "date_creation"]
    });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);
  } catch (error) {
    console.error("Erreur getUserById:", error);
    res.status(500).json({ error: error.message });
  }
};

// Créer un utilisateur (ADMIN+)
exports.createUser = async (req, res) => {
  try {
    const { nom, email, mot_de_passe, role = "USER" } = req.body;
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }
    
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    const user = await User.create({
      nom,
      email,
      mot_de_passe: hashedPassword,
      role,
      statut_compte: "ACTIF"
    });
    
    // Créer un compte points pour le nouvel utilisateur
    await Points.create({
      user_id: user.id_user,
      total_points: 0,
      points_utilises: 0,
      niveau: "BRONZE"
    });
    
    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id_user: user.id_user,
        nom: user.nom,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Erreur createUser:", error);
    res.status(500).json({ error: error.message });
  }
};

// Modifier un utilisateur (SUPERADMIN uniquement)
exports.updateUser = async (req, res) => {
  try {
    const { nom, email, role, statut_compte } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    
    if (nom) user.nom = nom;
    if (email) user.email = email;
    if (role) user.role = role;
    if (statut_compte) user.statut_compte = statut_compte;
    
    await user.save();
    
    res.json({ 
      message: "Utilisateur modifié avec succès", 
      user: {
        id_user: user.id_user,
        nom: user.nom,
        email: user.email,
        role: user.role,
        statut_compte: user.statut_compte
      }
    });
  } catch (error) {
    console.error("Erreur updateUser:", error);
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un utilisateur (SUPERADMIN uniquement)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    
    // Supprimer les points associés
    await Points.destroy({ where: { user_id: user.id_user } });
    
    // Supprimer l'utilisateur
    await user.destroy();
    
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error("Erreur deleteUser:", error);
    res.status(500).json({ error: error.message });
  }
};