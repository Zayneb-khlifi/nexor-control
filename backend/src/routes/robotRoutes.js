const express = require("express");
const router = express.Router();
const robotController = require("../controllers/robotController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { allowRoles } = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Robots
 *   description: Gestion des robots
 */

/**
 * @swagger
 * /api/robots:
 *   get:
 *     summary: Lister tous les robots
 *     tags: [Robots]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des robots
 */
router.get("/", verifyToken, robotController.getRobots);

/**
 * @swagger
 * /api/robots/{id}:
 *   get:
 *     summary: Récupérer un robot par ID
 *     tags: [Robots]
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
 *         description: Détails du robot
 */
router.get("/:id", verifyToken, robotController.getRobotById);

/**
 * @swagger
 * /api/robots:
 *   post:
 *     summary: Ajouter un robot
 *     tags: [Robots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               statut:
 *                 type: string
 *                 enum: [DISPONIBLE, EN_MISSION, MAINTENANCE]
 *               batterie:
 *                 type: integer
 *               localisation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Robot créé
 */
router.post("/", verifyToken, allowRoles("ADMIN", "SUPERADMIN"), robotController.createRobot);

/**
 * @swagger
 * /api/robots/{id}:
 *   put:
 *     summary: Modifier un robot
 *     tags: [Robots]
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
 *               nom:
 *                 type: string
 *               statut:
 *                 type: string
 *               batterie:
 *                 type: integer
 *               localisation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Robot modifié
 */
router.put("/:id", verifyToken, allowRoles("ADMIN", "SUPERADMIN"), robotController.updateRobot);

/**
 * @swagger
 * /api/robots/{id}:
 *   delete:
 *     summary: Supprimer un robot
 *     tags: [Robots]
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
 *         description: Robot supprimé
 */
router.delete("/:id", verifyToken, allowRoles("ADMIN", "SUPERADMIN"), robotController.deleteRobot);

/**
 * @swagger
 * /api/robots/assign:
 *   post:
 *     summary: Assigner un robot à une commande
 *     tags: [Robots]
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
router.post("/assign", verifyToken, allowRoles("ADMIN", "SUPERADMIN"), robotController.assignRobotToCommande);

module.exports = router;