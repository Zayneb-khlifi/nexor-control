const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { allowRoles } = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Stock
 *   description: Gestion du stock
 */

/**
 * @swagger
 * /api/stock:
 *   post:
 *     summary: Ajouter un stock pour un produit
 *     tags: [Stock]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               produit_id:
 *                 type: integer
 *                 example: 1
 *               quantite_disponible:
 *                 type: integer
 *                 example: 100
 *               seuil_minimum:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       201:
 *         description: Stock créé
 */
router.post("/alerte", verifyToken, allowRoles("ADMIN", "SUPERADMIN"), stockController.setStockAlerte);

/**
 * @swagger
 * /api/stock:
 *   get:
 *     summary: Lister tout le stock
 *     tags: [Stock]
 *     responses:
 *       200:
 *         description: Liste du stock
 */
router.get("/", verifyToken, stockController.getStocks);

/**
 * @swagger
 * /api/stock/{id}:
 *   put:
 *     summary: Modifier le stock d’un produit
 *     tags: [Stock]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du stock
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantite_disponible:
 *                 type: integer
 *               seuil_minimum:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Stock modifié
 */

router.get("/produit/:produitId", verifyToken, stockController.getStockByProduitId);

/**
 * @swagger
 * /api/stock/{id}:
 *   delete:
 *     summary: Supprimer un stock
 *     tags: [Stock]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du stock
 *     responses:
 *       200:
 *         description: Stock supprimé
 */
router.put("/:produitId", verifyToken, allowRoles("ADMIN", "SUPERADMIN"), stockController.updateStock);

module.exports = router;