const { Robot, Commande } = require("../models");
const { Sequelize } = require("sequelize");

exports.getKPI = async (req, res) => {
  try {

    const robots_total = await Robot.count();

    const robots_disponibles = await Robot.count({
      where: { statut: "DISPONIBLE" }
    });

    const robots_en_mission = await Robot.count({
      where: { statut: "EN_MISSION" }
    });

    const commandes_total = await Commande.count();

    const commandes_livrees = await Commande.count({
      where: { statut: "LIVREE" }
    });

    const batterie_moyenne = await Robot.findOne({
      attributes: [
        [Sequelize.fn("AVG", Sequelize.col("batterie")), "batterie_moyenne"]
      ],
      raw: true
    });

    res.json({
      robots_total,
      robots_disponibles,
      robots_en_mission,
      commandes_total,
      commandes_livrees,
      batterie_moyenne: parseFloat(batterie_moyenne.batterie_moyenne || 0)
    });

  } catch (error) {
    console.error("❌ Erreur KPI :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};