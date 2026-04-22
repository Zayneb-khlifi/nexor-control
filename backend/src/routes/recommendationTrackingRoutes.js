// backend/src/routes/recommendationTrackingRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const db = require("../models");

// Enregistrer un clic sur recommandation
router.post("/click", verifyToken, async (req, res) => {
  try {
    const { product_id, score, reason, test_group } = req.body;
    const user_id = req.user.id;
    
    await db.sequelize.query(
      `INSERT INTO recommendation_clicks (user_id, product_id, score, reason, clicked_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      {
        bind: [user_id, product_id, score, reason],
        type: db.sequelize.QueryTypes.INSERT
      }
    );
    
    // Enregistrer aussi dans A/B test
    if (test_group) {
      await db.sequelize.query(
        `INSERT INTO ab_test_events (user_id, test_group, event_type, product_id, created_at)
         VALUES ($1, $2, 'CLICK', $3, NOW())`,
        {
          bind: [user_id, test_group, product_id],
          type: db.sequelize.QueryTypes.INSERT
        }
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur enregistrement clic:", error);
    res.status(500).json({ error: error.message });
  }
});

// Enregistrer une conversion (achat après recommandation)
router.post("/convert", verifyToken, async (req, res) => {
  try {
    const { product_id, order_id } = req.body;
    const user_id = req.user.id;
    
    await db.sequelize.query(
      `UPDATE recommendation_clicks 
       SET converted = true, converted_at = NOW()
       WHERE user_id = $1 AND product_id = $2 AND converted = false
       ORDER BY clicked_at DESC LIMIT 1`,
      {
        bind: [user_id, product_id],
        type: db.sequelize.QueryTypes.UPDATE
      }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur enregistrement conversion:", error);
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les statistiques des recommandations
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const isAdmin = req.user.role === "ADMIN" || req.user.role === "SUPERADMIN";
    
    if (!isAdmin) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }
    
    const stats = await db.sequelize.query(
      `SELECT 
        COUNT(*) as total_clicks,
        COUNT(CASE WHEN converted = true THEN 1 END) as total_conversions,
        ROUND(COUNT(CASE WHEN converted = true THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as conversion_rate
       FROM recommendation_clicks`,
      {
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    // Stats A/B Testing
    const abStats = await db.sequelize.query(
      `SELECT 
        test_group,
        COUNT(CASE WHEN event_type = 'VIEW' THEN 1 END) as views,
        COUNT(CASE WHEN event_type = 'CLICK' THEN 1 END) as clicks,
        COUNT(CASE WHEN event_type = 'CONVERT' THEN 1 END) as conversions,
        ROUND(COUNT(CASE WHEN event_type = 'CLICK' THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN event_type = 'VIEW' THEN 1 END), 0), 2) as ctr,
        ROUND(COUNT(CASE WHEN event_type = 'CONVERT' THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN event_type = 'CLICK' THEN 1 END), 0), 2) as conversion_rate
       FROM ab_test_events
       GROUP BY test_group`,
      {
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    res.json({
      stats: stats[0],
      ab_test: abStats
    });
  } catch (error) {
    console.error("Erreur stats:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;