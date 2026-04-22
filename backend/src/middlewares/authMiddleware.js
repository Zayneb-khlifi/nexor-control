// backend/src/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  console.log("🔑 Auth header:", authHeader);
  
  if (!authHeader) {
    return res.status(401).json({ message: "Token manquant" });
  }
  
  const token = authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token décodé:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Token invalide:", error.message);
    return res.status(401).json({ message: "Token invalide" });
  }
};

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    
    const userRole = req.user.role?.toUpperCase();
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        message: "Accès refusé. Rôle insuffisant",
        required: roles,
        yourRole: userRole
      });
    }
    
    next();
  };
};

module.exports = { verifyToken, allowRoles };