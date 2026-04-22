// backend/src/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const { swaggerUi, swaggerSpec } = require("./config/swagger");
const commandeRoutes = require("./routes/commandeRoutes");
const produitRoutes = require("./routes/produitRoutes");
const robotRoutes = require("./routes/robotRoutes");
const stockRoutes = require("./routes/stockRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const errorHandler = require("./middlewares/errorHandler");

// 👈 Supprimez cette ligne si elle existe en double
// const { verifyToken } = require("./middlewares/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================
// 🔹 Routes
// ========================
app.use("/api/auth", authRoutes);
app.use("/api/commandes", commandeRoutes);
app.use("/api/produits", produitRoutes);
app.use("/api/robots", robotRoutes);
app.use("/api/stock", stockRoutes);
app.use("/dashboard", dashboardRoutes);
// backend/src/app.js
app.use("/api/produits", require("./routes/produitRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/logs", require("./routes/logRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/recommendations", require("./routes/recommendationRoutes"));
app.use("/api/preferences", require("./routes/preferenceRoutes"));
app.use("/api/recommendations/tracking", require("./routes/recommendationTrackingRoutes"));
app.use("/api/badges", require("./routes/badgeRoutes"));

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route de test (sans le double import)
app.get("/", (req, res) => {
  res.json({ message: "Backend Robot avec Swagger OK 🚀" });
});

// ========================
// 🔹 Middleware global d'erreurs
// ========================
app.use(errorHandler);

module.exports = app;