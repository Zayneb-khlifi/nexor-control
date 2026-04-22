// backend/src/controllers/commandeController.js
const { Commande, LigneCommande, Produit, User, Robot, Stock } = require("../models");
const { createLog } = require("../services/logService");

// Version simplifiée de createNotification pour éviter les erreurs
const createNotification = async (userId, title, message, type, link) => {
  console.log(`📧 [NOTIFICATION] User ${userId}: ${title} - ${message}`);
  // Ne pas bloquer l'exécution
  return true;
};

// 🔹 GET toutes les commandes
exports.getCommandes = async (req, res) => {
  try {
    const { user } = req;
    console.log("📡 Récupération des commandes pour:", user?.role, "ID:", user?.id);
    
    let commandes;
    
    if (user && user.role === "USER") {
      commandes = await Commande.findAll({
        where: { client_id: user.id },
        include: [
          { model: User, as: "user", attributes: ["id_user", "nom", "email"] },
          { model: Robot, as: "robot", attributes: ["id_robot", "nom", "statut"] }
        ],
        order: [["date_creation", "DESC"]]
      });
    } else {
      commandes = await Commande.findAll({
        include: [
          { model: User, as: "user", attributes: ["id_user", "nom", "email"] },
          { model: Robot, as: "robot", attributes: ["id_robot", "nom", "statut"] }
        ],
        order: [["date_creation", "DESC"]]
      });
    }
    
    const resultats = commandes.map(c => {
      const cJson = c.toJSON();
      return {
        id_commande: cJson.id_commande,
        id: cJson.id_commande,
        numero_commande: cJson.numero_commande,
        statut: cJson.statut,
        date_creation: cJson.date_creation,
        client_id: cJson.client_id,
        robot_id: cJson.robot_id,
        client: cJson.user,
        robot: cJson.robot ? {
          id: cJson.robot.id_robot,
          nom: cJson.robot.nom,
          statut: cJson.robot.statut
        } : null
      };
    });
    
    console.log(`✅ ${resultats.length} commandes trouvées`);
    res.json(resultats);
    
  } catch (error) {
    console.error("❌ Erreur getCommandes:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 CREATE commande
exports.createCommande = async (req, res) => {
  try {
    const { client_id, produits } = req.body;
    const userId = req.user?.id;
    
    console.log("📥 Création commande reçue:");
    console.log("- client_id:", client_id);
    console.log("- produits:", JSON.stringify(produits, null, 2));
    console.log("- utilisateur connecté ID:", userId);
    
    if (!client_id) {
      return res.status(400).json({ message: "client_id est requis" });
    }
    
    if (!produits || !Array.isArray(produits) || produits.length === 0) {
      return res.status(400).json({ message: "Au moins un produit est requis" });
    }
    
    const client = await User.findByPk(client_id);
    if (!client) {
      return res.status(404).json({ message: "Client non trouvé" });
    }
    
    let total = 0;
    const produitsDetails = [];
    
    for (const item of produits) {
      const produitId = item.produit_id || item.produitId;
      const quantite = item.quantite;
      
      if (!produitId || !quantite) {
        return res.status(400).json({ message: "Chaque produit doit avoir un ID et une quantité" });
      }
      
      const produit = await Produit.findByPk(produitId);
      if (!produit) {
        return res.status(404).json({ 
          message: `Produit avec ID ${produitId} non trouvé` 
        });
      }
      
      const stock = await Stock.findOne({ where: { produit_id: produitId } });
      if (!stock || stock.quantite_disponible < quantite) {
        return res.status(400).json({ 
          message: `Stock insuffisant pour le produit "${produit.nom}". Disponible: ${stock?.quantite_disponible || 0}, Demandé: ${quantite}`
        });
      }
      
      const prixTotal = parseFloat(produit.prix_unitaire) * quantite;
      total += prixTotal;
      
      produitsDetails.push({
        produit,
        quantite,
        prix_total: prixTotal,
        prix_unitaire: produit.prix_unitaire
      });
    }
    
    const date = new Date();
    const numero_commande = `CMD-${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}-${Date.now().toString().slice(-6)}`;
    
    const commande = await Commande.create({
      numero_commande,
      client_id,
      statut: "EN_ATTENTE",
      date_creation: new Date()
    });

    console.log("✅ Commande créée avec ID:", commande.id_commande);
    
    for (const item of produitsDetails) {
      await LigneCommande.create({
        commande_id: commande.id_commande,
        produit_id: item.produit.id_produit,
        quantite: item.quantite,
        prix_total: item.prix_total
      });
      
      const stock = await Stock.findOne({ where: { produit_id: item.produit.id_produit } });
      if (stock) {
        stock.quantite_disponible -= item.quantite;
        await stock.save();
        console.log(`✅ Stock mis à jour pour ${item.produit.nom}: ${stock.quantite_disponible} restants`);
      }
    }
    
    if (userId) {
      await createLog(userId, `Création commande #${commande.id_commande} par client #${client_id}`, req.ip);
    }
    
    // NOTIFICATION (simplifiée)
    await createNotification(
      client_id, 
      "✅ Commande confirmée", 
      `Votre commande #${commande.id_commande} a été créée avec succès. Montant total: ${total}€`, 
      "success", 
      "/commandes"
    );
    
    // Notification pour les admins (simplifiée)
    const admins = await User.findAll({ where: { role: ["ADMIN", "SUPERADMIN"] } });
    for (const admin of admins) {
      await createNotification(
        admin.id_user, 
        "📦 Nouvelle commande", 
        `Commande #${commande.id_commande} créée par ${client.nom || client.email} (${total}€)`, 
        "commande", 
        "/commandes"
      );
    }
    
    console.log(`✅ Commande ${commande.id_commande} créée pour client ${client_id}`);
    
    if (global.io) {
      global.io.emit("commandeUpdate", {
        id: commande.id_commande,
        statut: commande.statut,
        client_id: client_id,
        numero: numero_commande
      });
    }
    
    res.status(201).json({ 
      message: "Commande créée avec succès", 
      commande: {
        id: commande.id_commande,
        numero_commande: commande.numero_commande,
        statut: commande.statut,
        client_id: commande.client_id,
        date_creation: commande.date_creation,
        total: total
      }
    });
    
  } catch (error) {
    console.error("❌ Erreur création commande:", error);
    res.status(500).json({ 
      message: "Erreur lors de la création de la commande",
      error: error.message 
    });
  }
};

// 🔹 UPDATE commande (validation, assignation robot)
exports.updateCommande = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, robot_id } = req.body;
    const userId = req.user?.id;
    
    console.log("📥 Mise à jour commande:", { id, statut, robot_id });
    
    const commande = await Commande.findByPk(id);
    
    if (!commande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    
    const oldStatut = commande.statut;
    
    if (statut) {
      commande.statut = statut;
      if (statut === "VALIDEE") {
        commande.date_validation = new Date();
      }
    }
    if (robot_id !== undefined) commande.robot_id = robot_id;
    
    await commande.save();
    console.log("✅ Commande mise à jour");
    
    // NOTIFICATIONS (simplifiées)
    if (statut === "VALIDEE" && oldStatut !== "VALIDEE") {
      await createNotification(
        commande.client_id, 
        "✅ Commande validée", 
        `Votre commande #${commande.id_commande} a été validée par l'administrateur.`, 
        "success", 
        "/commandes"
      );
    }
    
    if (statut === "ANNULEE" && oldStatut !== "ANNULEE") {
      await createNotification(
        commande.client_id, 
        "❌ Commande annulée", 
        `Votre commande #${commande.id_commande} a été annulée.`, 
        "error", 
        "/commandes"
      );
    }
    
    if (robot_id !== undefined && statut === "EN_COURS") {
      const robot = await Robot.findByPk(robot_id);
      if (robot && robot.statut === "DISPONIBLE") {
        robot.statut = "EN_MISSION";
        await robot.save();
        console.log(`✅ Robot ${robot_id} mis en mission`);
        
        await createNotification(
          commande.client_id, 
          "🤖 Robot assigné", 
          `Un robot a été assigné à votre commande #${commande.id_commande}.`, 
          "robot", 
          "/commandes"
        );
        
        if (global.io) {
          global.io.emit("robotUpdate", {
            id: robot.id_robot,
            statut: robot.statut,
            batterie: robot.batterie
          });
        }
      }
    }
    
    if (userId) {
      await createLog(userId, `Mise à jour commande #${id}: ${statut || "modification"}`, req.ip);
    }
    
    if (global.io) {
      global.io.emit("commandeUpdate", {
        id: commande.id_commande,
        statut: commande.statut,
        robot_id: commande.robot_id
      });
    }
    
    res.json({ 
      message: "Commande mise à jour avec succès", 
      commande: {
        id: commande.id_commande,
        statut: commande.statut,
        robot_id: commande.robot_id
      }
    });
    
  } catch (error) {
    console.error("❌ Erreur update commande:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 DELETE commande
exports.deleteCommande = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    console.log("🗑️ Suppression commande ID:", id);
    
    const commande = await Commande.findByPk(id);
    
    if (!commande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    
    await LigneCommande.destroy({ where: { commande_id: id } });
    console.log("✅ Lignes de commande supprimées");
    
    await commande.destroy();
    console.log("✅ Commande supprimée");
    
    if (userId) {
      await createLog(userId, `Suppression commande #${id}`, req.ip);
    }
    
    res.json({ message: "Commande supprimée avec succès" });
    
  } catch (error) {
    console.error("❌ Erreur delete commande:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 ASSIGNER UN ROBOT À UNE COMMANDE
exports.assignRobotToCommande = async (req, res) => {
  try {
    const { commandeId, robotId } = req.body;
    const userId = req.user?.id;
    
    console.log("🤖 Assignation robot à commande:", { commandeId, robotId });
    
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
    
    await createNotification(
      commande.client_id, 
      "🤖 Robot assigné", 
      `Un robot (${robot.nom}) a été assigné à votre commande #${commande.id_commande}.`, 
      "robot", 
      "/commandes"
    );
    
    if (userId) {
      await createLog(userId, `Assignation robot ${robotId} à commande #${commandeId}`, req.ip);
    }
    
    if (global.io) {
      global.io.emit("robotUpdate", robot);
      global.io.emit("commandeUpdate", commande);
    }
    
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