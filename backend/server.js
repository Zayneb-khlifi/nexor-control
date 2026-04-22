require("dotenv").config();
const app = require("./src/app");
const { connectDB, sequelize } = require("./src/config/database");
require("./src/models");
const { connectRedis } = require('./src/config/redis');


// MQTT
const { client: mqttClient } = require("./src/config/mqttClient");

// modèles
const { Robot, Commande } = require("./src/models");


const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {

    await connectDB();
    await connectRedis();
    await sequelize.sync({ alter: false });

    // 🔹 Création serveur HTTP
    const server = http.createServer(app);

    // 🔹 Initialisation Socket.io
    const io = new Server(server, {
       cors: {
        origin: ["http://localhost:5173", "http://localhost:3000"],
        credentials: true,
        methods: ["GET", "POST"]
      }
    });

    console.log("✅ Socket.io initialisé");

    // 🔹 rendre io accessible dans toute l'application
    app.set("io", io);

    global.io = io;

    // 🔹 connexion dashboard
    io.on("connection", (socket) => {

      console.log("🟢 Dashboard connecté :", socket.id);

      socket.on("disconnect", () => {
        console.log("🔴 Dashboard déconnecté");
      });

    });

    // ===============================
    // MQTT LISTENER
    // ===============================

    mqttClient.on("message", async (topic, message) => {

      try {

        const data = JSON.parse(message.toString());

        // ===== ROBOT ETAT =====
        if (topic === "robot/etat") {

          console.log("📡 Etat robot reçu :", data);

          const robot = await Robot.findByPk(data.robotId);

          if (robot) {

            robot.statut = data.statut;
            robot.batterie = data.batterie;

            await robot.save();

            console.log("✅ Robot mis à jour en base");

            io.emit("robotUpdate", {
              type: "etat",
              id: robot.id,
              nom: robot.nom,
              statut: robot.statut,
              batterie: robot.batterie,
              robotId: robot.id
            });

            io.emit("batteryUpdate", {
              robotId: robot.id,
              batterie: robot.batterie
            });

          }

        }

        // ===== MISSION TERMINEE =====
        if (topic === "robot/missionTerminee") {

          console.log("🎯 Mission terminée :", data);

          const commande = await Commande.findByPk(data.commandeId);
          const robot = await Robot.findByPk(data.robotId);

          if (commande) {

            commande.statut = "TERMINEE";
            await commande.save();

            console.log("✅ Commande marquée TERMINÉE");

            io.emit("commandeUpdate", {
              id: commande.id,
              statut: commande.statut
            });

          }

          if (robot) {

            robot.statut = "DISPONIBLE";
            await robot.save();

            console.log("🤖 Robot remis DISPONIBLE");

          }

          io.emit("robotUpdate", {
            type: "missionTerminee",
            commandeId: commande?.id,
            robotId: robot?.id,
            robotStatut: robot?.statut,
            commandeStatut: commande?.statut,
            batterie: robot.batterie,
            nom: robot.nom,

          });

        }

      } catch (error) {

        console.error("❌ Erreur traitement MQTT :", error);

      }

    });

    // ===============================

    server.listen(PORT, () => {

      console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
      console.log(`📄 Swagger : http://localhost:${PORT}/api-docs`);
      console.log(`🔌 Socket.io prêt à recevoir les connexions`);

    });

  } catch (error) {

    console.error("❌ Erreur au démarrage :", error);

  }
};

startServer();