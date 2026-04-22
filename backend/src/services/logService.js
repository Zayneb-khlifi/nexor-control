const Log = require("../models/Log");

async function createLog(userId, action, ip) {
  try {

    await Log.create({
      user_id: userId || null,
      action: action,
      adresse_ip: ip || null
    });

    console.log("📝 Log enregistré :", action);

  } catch (error) {
    console.error("❌ Erreur création log :", error);
  }
}

module.exports = {
  createLog
};