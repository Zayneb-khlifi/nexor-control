exports.allowRoles = (...roles) => {
  const allowedRoles = roles.map(r => r.toLowerCase());
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role.toLowerCase())) {
      return res.status(403).json({ message: "Accès refusé : rôle insuffisant" });
    }
    next();
  };
};