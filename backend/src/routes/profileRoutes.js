const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/", verifyToken, profileController.getProfile);
router.get("/recompenses", verifyToken, profileController.getRecompenses);
router.post("/echanger", verifyToken, profileController.echangerPoints);

module.exports = router;