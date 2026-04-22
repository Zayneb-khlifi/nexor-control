const mqtt = require("mqtt");

const client = mqtt.connect("mqtt://localhost:1883");

client.on("connect", () => {
  console.log("🤖 Robot connecté");

  client.subscribe("robot/mission");
});

client.on("message", (topic, message) => {

  const mission = JSON.parse(message.toString());

  console.log("📦 Mission reçue :", mission);

  const robotId = mission.robotId;
  const commandeId = mission.commandeId;

  // robot en mission
  client.publish("robot/etat", JSON.stringify({
    robotId,
    statut: "EN_MISSION",
    batterie: 85
  }));

  setTimeout(() => {

    // mission terminée
    client.publish("robot/missionTerminee", JSON.stringify({
      robotId,
      commandeId
    }));

    console.log("🎯 Mission terminée envoyée");

  }, 5000);
});