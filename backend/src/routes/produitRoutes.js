// backend/src/routes/produitRoutes.js
const express = require("express");
const router = express.Router();
const produitController = require("../controllers/produitController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { allowRoles } = require("../middlewares/roleMiddleware");

//const cacheMiddleware = require('../middleware/cacheMiddleware');
//const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');


/**
 * @swagger
 * tags:
 *   name: Produits
 *   description: Gestion des produits
 */

/**
 * @swagger
 * /api/produits:
 *   get:
 *     summary: Liste tous les produits
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des produits
 */
 router.get("/", verifyToken, produitController.getProduits);

/**
 * @swagger
 * /api/produits/{id}:
 *   get:
 *     summary: Récupère un produit par ID
 *     tags: [Produits]
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
 *         description: Détails du produit
 */
router.get("/:id", verifyToken, produitController.getProduitById);

/**
 * @swagger
 * /api/produits:
 *   post:
 *     summary: Crée un nouveau produit
 *     tags: [Produits]
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
 *               description:
 *                 type: string
 *               prix:
 *                 type: number
 *               stock:
 *                 type: integer
 *               seuil_minimum:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Produit créé
 */
router.post("/", verifyToken, allowRoles("ADMIN", "SUPERADMIN"), produitController.createProduit);

/**
 * @swagger
 * /api/produits/{id}:
 *   put:
 *     summary: Modifie un produit
 *     tags: [Produits]
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
 *               description:
 *                 type: string
 *               prix:
 *                 type: number
 *               stock:
 *                 type: integer
 *               seuil_minimum:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Produit modifié
 */
router.put("/:id", verifyToken, allowRoles("ADMIN", "SUPERADMIN"), produitController.updateProduit);

/**
 * @swagger
 * /api/produits/{id}:
 *   delete:
 *     summary: Supprime un produit
 *     tags: [Produits]
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
 *         description: Produit supprimé
 */
router.delete("/:id", verifyToken, allowRoles("ADMIN", "SUPERADMIN"), produitController.deleteProduit);

module.exports = router;