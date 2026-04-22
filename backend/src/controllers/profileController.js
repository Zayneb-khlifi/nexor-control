// backend/src/controllers/profileController.js
const { User, Points, Commande, Recompense, UserRecompense, LigneCommande, Produit } = require("../models");
const { createNotification } = require("./notificationController");

// 🔹 Récupérer le profil utilisateur
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("📡 Récupération profil pour user ID:", userId);
    
    // Récupérer l'utilisateur
    const user = await User.findByPk(userId, {
      attributes: ["id_user", "nom", "email", "role", "date_creation", "statut_compte"]
    });
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    // Récupérer les points
    let points = await Points.findOne({ where: { user_id: userId } });
    if (!points) {
      points = await Points.create({
        user_id: userId,
        total_points: 0,
        points_utilises: 0,
        niveau: "BRONZE"
      });
    }
    
    // Récupérer les commandes de l'utilisateur
    const commandes = await Commande.findAll({
      where: { client_id: userId },
      include: [
        { model: LigneCommande, include: [Produit] }
      ],
      order: [["date_creation", "DESC"]],
      limit: 10
    });
    
    // Calculer les statistiques
    let totalDepense = 0;
    for (const cmd of commandes) {
      if (cmd.LigneCommandes) {
        for (const ligne of cmd.LigneCommandes) {
          totalDepense += parseFloat(ligne.prix_total) || 0;
        }
      }
    }
    
    const pointsDisponibles = (points.total_points || 0) - (points.points_utilises || 0);
    
    const stats = {
      totalCommandes: commandes.length,
      totalDepense: totalDepense,
      points: pointsDisponibles,
      niveau: points.niveau || "BRONZE"
    };
    
    // Récupérer les récompenses obtenues
    const recompensesObtenues = await UserRecompense.findAll({
      where: { user_id: userId, utilise: false },
      include: [{ model: Recompense }]
    });
    
    console.log("✅ Profil chargé avec succès");
    
    res.json({
      user: {
        id: user.id_user,
        nom: user.nom,
        email: user.email,
        role: user.role,
        date_creation: user.date_creation,
        statut_compte: user.statut_compte
      },
      points: {
        total_points: points.total_points || 0,
        points_utilises: points.points_utilises || 0,
        niveau: points.niveau || "BRONZE"
      },
      commandes: commandes.map(cmd => ({
        id: cmd.id_commande,
        numero: cmd.numero_commande,
        statut: cmd.statut,
        date: cmd.date_creation,
        total: cmd.LigneCommandes?.reduce((sum, l) => sum + (l.prix_total || 0), 0) || 0
      })),
      recompenses: recompensesObtenues,
      stats
    });
    
  } catch (error) {
    console.error("❌ Erreur getProfile:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Récupérer toutes les récompenses disponibles
exports.getRecompenses = async (req, res) => {
  try {
    const recompenses = await Recompense.findAll({
      where: { actif: true },
      order: [["points_requis", "ASC"]]
    });
    res.json(recompenses || []);
  } catch (error) {
    console.error("❌ Erreur getRecompenses:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Échanger des points contre une récompense
exports.echangerPoints = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recompenseId } = req.body;
    
    console.log("🎁 Échange de points - Utilisateur:", userId, "Récompense:", recompenseId);
    
    const recompense = await Recompense.findByPk(recompenseId);
    if (!recompense) {
      return res.status(404).json({ message: "Récompense non trouvée" });
    }
    
    let points = await Points.findOne({ where: { user_id: userId } });
    if (!points) {
      points = await Points.create({
        user_id: userId,
        total_points: 0,
        points_utilises: 0,
        niveau: "BRONZE"
      });
    }
    
    const pointsDisponibles = (points.total_points || 0) - (points.points_utilises || 0);
    if (pointsDisponibles < recompense.points_requis) {
      return res.status(400).json({ 
        message: `Points insuffisants. Vous avez ${pointsDisponibles} points, besoin de ${recompense.points_requis} points.`
      });
    }
    
    points.points_utilises = (points.points_utilises || 0) + recompense.points_requis;
    await points.save();
    
    await UserRecompense.create({
      user_id: userId,
      recompense_id: recompenseId,
      date_obtention: new Date()
    });
    
    // 🔔 NOTIFICATION POUR L'UTILISATEUR
    await createNotification(
      userId,
      "🎁 Récompense obtenue",
      `Vous avez obtenu "${recompense.nom}" avec ${recompense.points_requis} points !`,
      "fidelite",
      "/profile"
    );
    
    const nouveauSolde = pointsDisponibles - recompense.points_requis;
    
    res.json({ 
      message: `Récompense "${recompense.nom}" obtenue !`,
      pointsRestants: nouveauSolde,
      recompense: {
        id: recompense.id_recompense,
        nom: recompense.nom,
        description: recompense.description
      }
    });
    
  } catch (error) {
    console.error("❌ Erreur echangerPoints:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Ajouter des points après une commande (appelé depuis commandeController)
exports.ajouterPoints = async (userId, montant, commandeId) => {
  try {
    let points = await Points.findOne({ where: { user_id: userId } });
    
    if (!points) {
      points = await Points.create({
        user_id: userId,
        total_points: 0,
        points_utilises: 0,
        niveau: "BRONZE"
      });
    }
    
    // 1€ = 1 point
    const pointsAjoutes = Math.floor(montant);
    const ancienNiveau = points.niveau;
    
    points.total_points += pointsAjoutes;
    
    // Mise à jour du niveau
    if (points.total_points >= 1000) {
      points.niveau = "PLATINE";
    } else if (points.total_points >= 500) {
      points.niveau = "OR";
    } else if (points.total_points >= 200) {
      points.niveau = "ARGENT";
    } else {
      points.niveau = "BRONZE";
    }
    
    await points.save();
    
    console.log(`✅ ${pointsAjoutes} points ajoutés à l'utilisateur ${userId}`);
    
    // 🔔 NOTIFICATION POUR L'UTILISATEUR (points gagnés)
    await createNotification(
      userId,
      "🎁 Points de fidélité",
      `Vous avez gagné ${pointsAjoutes} points ! Total: ${points.total_points} points.`,
      "fidelite",
      "/profile"
    );
    
    // 🔔 NOTIFICATION POUR CHANGEMENT DE NIVEAU
    if (ancienNiveau !== points.niveau) {
      await createNotification(
        userId,
        "🏆 Nouveau niveau atteint !",
        `Félicitations ! Vous êtes passé au niveau ${points.niveau}.`,
        "success",
        "/profile"
      );
    }
    
    return pointsAjoutes;
    
  } catch (error) {
    console.error("❌ Erreur ajouterPoints:", error);
    return 0;
  }
};

// 🔹 Mettre à jour le profil utilisateur
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nom, email } = req.body;
    
    console.log("📝 Mise à jour profil utilisateur:", userId);
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    if (nom) user.nom = nom;
    if (email) user.email = email;
    
    await user.save();
    
    // 🔔 NOTIFICATION
    await createNotification(
      userId,
      "✅ Profil mis à jour",
      "Vos informations personnelles ont été mises à jour avec succès.",
      "success",
      "/profile"
    );
    
    res.json({
      message: "Profil mis à jour avec succès",
      user: {
        id: user.id_user,
        nom: user.nom,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error("❌ Erreur updateProfile:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Consulter l'historique des points
exports.getPointsHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const points = await Points.findOne({ where: { user_id: userId } });
    const recompenses = await UserRecompense.findAll({
      where: { user_id: userId },
      include: [{ model: Recompense }],
      order: [["date_obtention", "DESC"]]
    });
    
    res.json({
      points: {
        total: points?.total_points || 0,
        utilises: points?.points_utilises || 0,
        disponibles: (points?.total_points || 0) - (points?.points_utilises || 0),
        niveau: points?.niveau || "BRONZE"
      },
      recompenses: recompenses.map(r => ({
        id: r.id,
        nom: r.Recompense?.nom,
        description: r.Recompense?.description,
        points: r.Recompense?.points_requis,
        date: r.date_obtention,
        utilise: r.utilise
      }))
    });
    
  } catch (error) {
    console.error("❌ Erreur getPointsHistory:", error);
    res.status(500).json({ error: error.message });
  }
};