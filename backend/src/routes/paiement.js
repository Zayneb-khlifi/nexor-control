// src/routes/paiement.js
const express = require("express");
const router = express.Router();
const { Commande, Robot } = require("../models");
const Log = require("../models/Log");
const { client: mqttClient } = require("../mqtt/mqttClient");

// Middleware JWT
const { verifyToken } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Paiement
 *   description: Gestion des paiements des commandes
 */

/**
 * @swagger
 * /api/paiement/payer/{idCommande}:
 *   post:
 *     summary: Payer une commande et démarrer la mission du robot
 *     tags: [Paiement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCommande
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la commande à payer
 *     responses:
 *       200:
 *         description: Paiement accepté, mission démarrée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Paiement accepté, mission démarrée
 *                 commande:
 *                   $ref: '#/components/schemas/Commande'
 *                 robot:
 *                   $ref: '#/components/schemas/Robot'
 *       400:
 *         description: Commande invalide ou robot non disponible
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Commande déjà traitée ou robot non disponible
 *       404:
 *         description: Commande non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Commande non trouvée
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erreur serveur
 *                 error:
 *                   type: string
 */

router.post("/payer/:idCommande", verifyToken, async (req, res) => {
  const { idCommande } = req.params;
  const userId = req.user.id; // issu du token
  const ip = req.ip;

  try {
    const commande = await Commande.findByPk(idCommande);
    if (!commande) return res.status(404).json({ message: "Commande non trouvée" });

    if (commande.statut !== "VALIDEE") {
      return res.status(400).json({ message: "Commande déjà traitée ou invalide" });
    }

    const robot = await Robot.findByPk(commande.robot_id);
    if (!robot || robot.statut !== "DISPONIBLE") {
      return res.status(400).json({ message: "Robot non disponible pour cette commande" });
    }

    // Simuler paiement réussi
    commande.statut = "PAYEE";
    await commande.save();

    robot.statut = "EN_MISSION";
    await robot.save();

    mqttClient.publish("robot/commande", {
      robotId: robot.id,
      commandeId: commande.id_commande,
      action: "DEBUT_MISSION",
    });

    req.app.get("io")?.emit("robotUpdate", {
      type: "paiement",
      commandeId: commande.id_commande,
      robotId: robot.id,
      commandeStatut: commande.statut,
      robotStatut: robot.statut,
    });

    await Log.create({
      user_id: userId,
      action: `Paiement effectué pour commande ${commande.numero_commande}, robot ${robot.id} lancé`,
      adresse_ip: ip,
    });

    res.json({ message: "Paiement accepté, mission démarrée", commande, robot });

  } catch (err) {
    console.error("❌ Erreur paiement :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

module.exports = router;