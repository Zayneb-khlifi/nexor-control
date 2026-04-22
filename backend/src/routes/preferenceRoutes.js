// backend/src/routes/preferenceRoutes.js
const express = require("express");
const router = express.Router();
const preferenceController = require("../controllers/preferenceController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/", verifyToken, preferenceController.getPreferences);
router.put("/", verifyToken, preferenceController.updatePreferences);
router.post("/allergies", verifyToken, preferenceController.addAllergie);
router.delete("/allergies/:ingredient", verifyToken, preferenceController.removeAllergie);

module.exports = router;