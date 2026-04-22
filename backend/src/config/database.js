const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false, // mettre true si tu veux voir les requêtes SQL
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connexion PostgreSQL réussie !");
  } catch (error) {
    console.error("❌ Erreur connexion DB :", error);
  }
};

module.exports = { sequelize, connectDB };