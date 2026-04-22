const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { allowRoles } = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Créer un utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 example: Ahmed
 *               email:
 *                 type: string
 *                 example: ahmed@gmail.com
 *               mot_de_passe:
 *                 type: string
 *                 example: 123456
 *               role:
 *                 type: string
 *                 example: USER
 *                 description: Rôle de l'utilisateur (USER, ADMIN, SUPERADMIN)
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: ahmed@gmail.com
 *               mot_de_passe:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Connexion réussie
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs (Admin/SuperAdmin)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */

// GET tous les users → Admin / SuperAdmin seulement
router.get(
  "/users",
  verifyToken,
  allowRoles("Admin", "SuperAdmin"),
  authController.getUsers
);
/**
 * @swagger
 * /api/auth/users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID (Admin/SuperAdmin)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 *       404:
 *         description: Utilisateur non trouvé
 *       403:
 *         description: "Accès refusé : rôle insuffisant"
 */
// GET user par ID → Admin / SuperAdmin seulement
router.get(
  "/users/:id",
  verifyToken,
  allowRoles("Admin", "SuperAdmin"),
  authController.getUserById
);
/**
 * @swagger
 * /api/auth/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur (Admin/SuperAdmin)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 */
// DELETE un user → Admin / SuperAdmin seulement
router.delete(
  "/users/:id",
  verifyToken,
  allowRoles("Admin", "SuperAdmin"),
  authController.deleteUser
);
module.exports = router;