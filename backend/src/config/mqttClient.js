// backend/src/config/mqttClient.js
const mqtt = require("mqtt");
const { Robot, Commande } = require("../models");
const { createLog } = require("../services/logService");

// 🔹 MQTT connect (avec gestion d'erreur)
let client = null;
let io = null;

// 🔹 Permet d’injecter Socket.io depuis server.js
function setSocketIO(socketIoInstance) {
  io = socketIoInstance;
}

// 🔹 Tentative de connexion MQTT (optionnelle, ne bloque pas le démarrage)
try {
  client = mqtt.connect("mqtt://localhost:1883", {
    reconnectPeriod: 0, // Pas de reconnexion automatique
    connectTimeout: 3000 // Timeout après 3 secondes
  });
  
  // 🔥 Connexion au broker
  client.on("connect", () => {
    console.log("✅ Connecté au broker MQTT");

    // Abonnements
    client.subscribe("robot/etat", (err) => {
      if (!err) console.log("📡 Abonné à robot/etat");
      else console.log("⚠️ Impossible de s'abonner à robot/etat");
    });

    client.subscribe("robot/missionTerminee", (err) => {
      if (!err) console.log("📡 Abonné à robot/missionTerminee");
      else console.log("⚠️ Impossible de s'abonner à robot/missionTerminee");
    });
  });

  // ❌ Gestion erreur connexion
  client.on("error", (err) => {
    console.log("⚠️ MQTT non disponible, mode démo (broker non trouvé)");
  });
  
  client.on("close", () => {
    console.log("⚠️ Connexion MQTT fermée");
  });

} catch (error) {
  console.log("⚠️ MQTT non configuré, mode démo");
  client = null;
}

// 🔹 Réception des messages
client?.on("message", async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log("🔹 Message reçu MQTT :", topic, data);

    // ==========================
    // 🟢 ETAT ROBOT
    // ==========================
    if (topic === "robot/etat") {
      console.log("📡 Etat robot reçu :", topic, data);

      const robot = await Robot.findByPk(data.robotId);
      if (robot) {
        robot.statut = data.statut;
        robot.batterie = data.batterie;
        await robot.save();
        console.log("✅ Robot mis à jour en base");

        // 🔔 Notification dashboard live
        if (io) {
          io.emit("robotUpdate", {
            robotId: robot.id_robot,
            statut: robot.statut,
            batterie: robot.batterie
          });
        }

        // 📝 LOG robot MQTT
        await createLog(
          null,
          `Mise à jour robot ${data.robotId} statut ${data.statut}`,
          null
        );
      }
    }

    // ==========================
    // 🟢 MISSION TERMINEE
    // ==========================
    if (topic === "robot/missionTerminee") {
      console.log("🎯 Mission terminée :", data);

      const commande = await Commande.findByPk(data.commandeId);
      const robot = await Robot.findByPk(data.robotId);

      if (commande) {
        commande.statut = "LIVREE";
        await commande.save();
        console.log("✅ Commande marquée LIVREE");
      }

      if (robot) {
        robot.statut = "DISPONIBLE";
        await robot.save();
        console.log("🤖 Robot remis DISPONIBLE");
      }

      // 🔔 Notification dashboard live
      if (io) {
        io.emit("robotUpdate", {
          type: "missionTerminee",
          commandeId: commande?.id_commande,
          robotId: robot?.id_robot,
          robotStatut: robot?.statut,
          commandeStatut: commande?.statut,
        });
      }

      // 📝 LOG mission terminée
      await createLog(
        null,
        `Mission terminée pour commande ${commande?.id_commande}, robot ${robot?.id_robot}`,
        null
      );
    }
  } catch (error) {
    console.error("❌ Erreur lecture MQTT :", error);
  }
});

// 🔵 Fonction publish MQTT
function publish(topic, data) {
  if (client && client.connected) {
    client.publish(topic, JSON.stringify(data), { qos: 1 }, (err) => {
      if (err) console.error("❌ Erreur publication MQTT :", err);
      else console.log("📤 Message publié sur", topic);
    });
  } else {
    console.log("⚠️ MQTT non disponible, message non publié (mode démo)");
  }
}

// 🔹 Exporter MQTT client + publish + setter Socket.io
module.exports = { client, publish, setSocketIO };