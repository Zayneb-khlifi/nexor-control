// middlewares/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error("❌ ERREUR GLOBAL:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Erreur serveur interne",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};