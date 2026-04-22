// backend/src/routes/commandeRoutes.js
const express = require("express");
const router = express.Router();
const commandeController = require("../controllers/commandeController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { allowRoles } = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Commandes
 *   description: Gestion des commandes
 */

/**
 * @swagger
 * /api/commandes:
 *   get:
 *     summary: Liste toutes les commandes
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des commandes
 */
router.get("/", verifyToken, commandeController.getCommandes);

/**
 * @swagger
 * /api/commandes:
 *   post:
 *     summary: Crée une nouvelle commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               client_id:
 *                 type: integer
 *               produits:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     produit_id:
 *                       type: integer
 *                     quantite:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Commande créée
 */
router.post("/", verifyToken, commandeController.createCommande);

/**
 * @swagger
 * /api/commandes/{id}:
 *   put:
 *     summary: Met à jour une commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statut:
 *                 type: string
 *               robot_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Commande mise à jour
 */
router.put("/:id", verifyToken, commandeController.updateCommande);

/**
 * @swagger
 * /api/commandes/{id}:
 *   delete:
 *     summary: Supprime une commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Commande supprimée
 */
router.delete("/:id", verifyToken, commandeController.deleteCommande);

/**
 * @swagger
 * /api/commandes/assign-robot:
 *   post:
 *     summary: Assigne un robot à une commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commandeId:
 *                 type: integer
 *               robotId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Robot assigné
 */
router.post("/assign-robot", verifyToken, commandeController.assignRobotToCommande);



module.exports = router;