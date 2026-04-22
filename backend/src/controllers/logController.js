// backend/src/controllers/logController.js
const { Log, User } = require("../models");

// Récupérer tous les logs
exports.getLogs = async (req, res) => {
  try {
    const logs = await Log.findAll({
      include: [
        { model: User, attributes: ["id_user", "nom", "email"] }
      ],
      order: [["date_action", "DESC"]],
      limit: 500
    });
    
    const formattedLogs = logs.map(log => ({
      id: log.id_log,
      type: getLogType(log.action),
      message: log.action,
      timestamp: log.date_action,
      user: log.User ? log.User.nom || log.User.email : "Système",
      ip: log.adresse_ip,
      details: null
    }));
    
    res.json(formattedLogs);
  } catch (error) {
    console.error("Erreur getLogs:", error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer les logs par type
exports.getLogsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const logs = await Log.findAll({
      include: [{ model: User, attributes: ["id_user", "nom", "email"] }],
      order: [["date_action", "DESC"]],
      limit: 500
    });
    
    const filteredLogs = logs.filter(log => getLogType(log.action) === type);
    const formattedLogs = filteredLogs.map(log => ({
      id: log.id_log,
      type: getLogType(log.action),
      message: log.action,
      timestamp: log.date_action,
      user: log.User ? log.User.nom || log.User.email : "Système",
      ip: log.adresse_ip
    }));
    
    res.json(formattedLogs);
  } catch (error) {
    console.error("Erreur getLogsByType:", error);
    res.status(500).json({ error: error.message });
  }
};

// Créer un log
exports.createLog = async (req, res) => {
  try {
    const { action, userId, ip } = req.body;
    
    const log = await Log.create({
      user_id: userId || null,
      action: action,
      adresse_ip: ip || req.ip
    });
    
    res.status(201).json({
      id: log.id_log,
      type: getLogType(log.action),
      message: log.action,
      timestamp: log.date_action,
      user: "Système",
      ip: log.adresse_ip
    });
  } catch (error) {
    console.error("Erreur createLog:", error);
    res.status(500).json({ error: error.message });
  }
};

// Fonction utilitaire pour déterminer le type de log
function getLogType(action) {
  const actionLower = action.toLowerCase();
  if (actionLower.includes("connexion") || actionLower.includes("login")) return "success";
  if (actionLower.includes("erreur") || actionLower.includes("error") || actionLower.includes("echec")) return "error";
  if (actionLower.includes("suppression") || actionLower.includes("delete")) return "warning";
  if (actionLower.includes("robot")) return "robot";
  if (actionLower.includes("commande")) return "commande";
  if (actionLower.includes("création") || actionLower.includes("creation")) return "info";
  if (actionLower.includes("modification") || actionLower.includes("update")) return "info";
  return "system";
}