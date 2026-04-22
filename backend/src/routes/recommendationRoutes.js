// backend/src/routes/recommendationRoutes.js
const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/history/:userId", verifyToken, recommendationController.getUserOrderHistory);
router.get("/popular", verifyToken, recommendationController.getPopularProducts);

module.exports = router;