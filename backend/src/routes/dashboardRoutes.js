const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const { verifyToken } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /dashboard/kpi:
 *   get:
 *     summary: Récupérer les statistiques du dashboard
 *     description: Retourne les KPI du système (robots, commandes, batterie moyenne)
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             example:
 *               robots_total: 10
 *               robots_disponibles: 4
 *               robots_en_mission: 3
 *               commandes_total: 120
 *               commandes_livrees: 95
 *               batterie_moyenne: 72
 */

router.get("/kpi", verifyToken, dashboardController.getKPI);

module.exports = router;