const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { createLog } = require("../services/logService");

require("dotenv").config();

// REGISTER
exports.register = async (req, res) => {
  try {
    const { nom, email, mot_de_passe, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    const user = await User.create({
      nom,
      email,
      mot_de_passe: hashedPassword,
      role,
    });

    res.status(201).json({ message: "Utilisateur créé", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password, mot_de_passe } = req.body;
    const userPassword = password || mot_de_passe;
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }
    
    const validPassword = await bcrypt.compare(userPassword, user.mot_de_passe);
    
    if (!validPassword) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }
    
    const token = jwt.sign(
      { id: user.id_user, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    // 👈 IMPORTANT : Retourner le token et l'utilisateur
    res.json({
      message: "Connexion réussie",
      token: token,  // Le token
      user: {        // Les infos utilisateur
        id: user.id_user,
        nom: user.nom,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error("❌ Erreur login:", error);
    res.status(500).json({ error: error.message });
  }
};

// LISTER TOUS LES USERS
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id_user", "nom", "email", "role"], // ne pas exposer mot_de_passe
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET un user par ID → Admin / SuperAdmin seulement
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id_user", "nom", "email", "role"], // ne pas exposer mot_de_passe
    });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// SUPPRIMER UN USER
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    await user.destroy();
    await createLog(req.user.id, "Suppression utilisateur " + req.params.id, req.ip);

    res.json({ message: "Utilisateur supprimé" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};