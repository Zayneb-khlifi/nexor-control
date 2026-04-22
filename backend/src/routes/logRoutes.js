// backend/src/routes/logRoutes.js
const express = require("express");
const router = express.Router();
const logController = require("../controllers/logController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { allowRoles } = require("../middlewares/roleMiddleware");

// Routes accessibles aux ADMIN et SUPERADMIN
router.get("/", verifyToken, allowRoles("ADMIN", "SUPERADMIN"), logController.getLogs);
router.get("/type/:type", verifyToken, allowRoles("ADMIN", "SUPERADMIN"), logController.getLogsByType);
router.post("/", verifyToken, allowRoles("ADMIN", "SUPERADMIN"), logController.createLog);

module.exports = router;