// backend/src/controllers/robotController.js
const { Robot, Commande, User } = require("../models");
const { createNotification } = require("./notificationController");

// 🔹 LISTER TOUS LES ROBOTS
exports.getRobots = async (req, res) => {
  try {
    console.log("📡 Récupération des robots...");
    
    const robots = await Robot.findAll({
      order: [["id_robot", "ASC"]]
    });
    
    const resultats = robots.map(r => ({
      id: r.id_robot,
      nom: r.nom,
      statut: r.statut,
      batterie: r.batterie,
      localisation: r.localisation,
      date_ajout: r.date_ajout
    }));
    
    console.log(`✅ ${resultats.length} robots trouvés`);
    res.json(resultats);
    
  } catch (error) {
    console.error("❌ Erreur getRobots:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 RÉCUPÉRER UN ROBOT PAR ID
exports.getRobotById = async (req, res) => {
  try {
    const robot = await Robot.findByPk(req.params.id);
    
    if (!robot) {
      return res.status(404).json({ message: "Robot non trouvé" });
    }
    
    res.json({
      id: robot.id_robot,
      nom: robot.nom,
      statut: robot.statut,
      batterie: robot.batterie,
      localisation: robot.localisation,
      date_ajout: robot.date_ajout
    });
    
  } catch (error) {
    console.error("❌ Erreur getRobotById:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 CRÉER UN ROBOT
exports.createRobot = async (req, res) => {
  try {
    const { nom, statut = "DISPONIBLE", batterie = 100, localisation } = req.body;
    
    console.log("📥 Création robot:", { nom, statut, batterie, localisation });
    
    if (!nom) {
      return res.status(400).json({ message: "Le nom du robot est requis" });
    }
    
    const robot = await Robot.create({ 
      nom, 
      statut, 
      batterie,
      localisation
    });
    
    console.log("✅ Robot créé, ID:", robot.id_robot);
    
    // 🔔 NOTIFICATION POUR LES ADMINS
    const admins = await User.findAll({ where: { role: ["ADMIN", "SUPERADMIN"] } });
    for (const admin of admins) {
      await createNotification(
        admin.id_user, 
        "🤖 Nouveau robot", 
        `Un nouveau robot "${robot.nom}" a été ajouté à la flotte.`, 
        "robot", 
        `/robots`
      );
    }
    
    res.status(201).json({ 
      message: "Robot créé avec succès", 
      robot: {
        id: robot.id_robot,
        nom: robot.nom,
        statut: robot.statut,
        batterie: robot.batterie,
        localisation: robot.localisation
      }
    });
    
  } catch (error) {
    console.error("❌ Erreur createRobot:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 MODIFIER UN ROBOT
exports.updateRobot = async (req, res) => {
  try {
    const { nom, statut, batterie, localisation } = req.body;
    const robot = await Robot.findByPk(req.params.id);
    
    if (!robot) {
      return res.status(404).json({ message: "Robot non trouvé" });
    }
    
    const oldBatterie = robot.batterie;
    
    if (nom) robot.nom = nom;
    if (statut) robot.statut = statut;
    if (batterie !== undefined) robot.batterie = batterie;
    if (localisation !== undefined) robot.localisation = localisation;
    
    await robot.save();
    
    console.log("✅ Robot modifié, ID:", robot.id_robot);
    
    // 🔔 NOTIFICATION POUR BATTERIE FAIBLE
    if (batterie !== undefined && batterie < 20 && oldBatterie >= 20) {
      const admins = await User.findAll({ where: { role: ["ADMIN", "SUPERADMIN"] } });
      for (const admin of admins) {
        await createNotification(
          admin.id_user, 
          "🔋 Batterie faible", 
          `Le robot "${robot.nom}" a ${batterie}% de batterie. Veuillez le recharger.`, 
          "warning", 
          `/robots`
        );
      }
    }
    
    res.json({ 
      message: "Robot modifié avec succès", 
      robot: {
        id: robot.id_robot,
        nom: robot.nom,
        statut: robot.statut,
        batterie: robot.batterie,
        localisation: robot.localisation
      }
    });
    
  } catch (error) {
    console.error("❌ Erreur updateRobot:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 SUPPRIMER UN ROBOT
exports.deleteRobot = async (req, res) => {
  try {
    const robot = await Robot.findByPk(req.params.id);
    
    if (!robot) {
      return res.status(404).json({ message: "Robot non trouvé" });
    }
    
    const commandeActive = await Commande.findOne({ 
      where: { 
        robot_id: robot.id_robot,
        statut: ["EN_COURS", "EN_ATTENTE"]
      } 
    });
    
    if (commandeActive) {
      return res.status(400).json({ 
        message: "Impossible de supprimer un robot en cours d'utilisation" 
      });
    }
    
    await robot.destroy();
    
    console.log("🗑️ Robot supprimé, ID:", robot.id_robot);
    
    // 🔔 NOTIFICATION POUR LES ADMINS
    const admins = await User.findAll({ where: { role: ["ADMIN", "SUPERADMIN"] } });
    for (const admin of admins) {
      await createNotification(
        admin.id_user, 
        "🗑️ Robot supprimé", 
        `Le robot "${robot.nom}" a été supprimé de la flotte.`, 
        "warning", 
        `/robots`
      );
    }
    
    res.json({ message: "Robot supprimé avec succès" });
    
  } catch (error) {
    console.error("❌ Erreur deleteRobot:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 ASSIGNER UN ROBOT À UNE COMMANDE
exports.assignRobotToCommande = async (req, res) => {
  try {
    const { commandeId, robotId } = req.body;
    
    const commande = await Commande.findByPk(commandeId);
    if (!commande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    
    const robot = await Robot.findByPk(robotId);
    if (!robot) {
      return res.status(404).json({ message: "Robot non trouvé" });
    }
    
    if (robot.statut !== "DISPONIBLE") {
      return res.status(400).json({ 
        message: `Robot non disponible (statut: ${robot.statut})` 
      });
    }
    
    commande.robot_id = robotId;
    commande.statut = "EN_COURS";
    await commande.save();
    
    robot.statut = "EN_MISSION";
    await robot.save();
    
    // 🔔 NOTIFICATION POUR L'UTILISATEUR
    await createNotification(
      commande.client_id, 
      "🤖 Robot assigné", 
      `Un robot (${robot.nom}) a été assigné à votre commande #${commande.id_commande}.`, 
      "robot", 
      `/commandes`
    );
    
    res.json({ 
      message: "Robot assigné avec succès", 
      commande: {
        id: commande.id_commande,
        statut: commande.statut,
        robot_id: commande.robot_id
      },
      robot: {
        id: robot.id_robot,
        nom: robot.nom,
        statut: robot.statut
      }
    });
    
  } catch (error) {
    console.error("❌ Erreur assignRobotToCommande:", error);
    res.status(500).json({ error: error.message });
  }
};