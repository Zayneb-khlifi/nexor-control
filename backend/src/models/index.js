// backend/src/models/index.js
const User = require("./User");
const Robot = require("./Robot");
const Commande = require("./Commande");
const Paiement = require("./Paiement");
const Log = require("./Log");
const LigneCommande = require("./LigneCommande");
const Produit = require("./Produit");
const Stock = require("./Stock");
const Points = require("./Points");
const Recompense = require("./Recompense");
const UserRecompense = require("./UserRecompense");
const UserPreference = require("./UserPreference");
const UserAllergie = require("./UserAllergie");
const Badge = require("./Badge");
const UserBadge = require("./UserBadge");

// Relations
User.hasMany(Commande, { foreignKey: "client_id", sourceKey: "id_user" });
Commande.belongsTo(User, { foreignKey: "client_id", targetKey: "id_user", as: "user" });

Robot.hasMany(Commande, { foreignKey: "robot_id", sourceKey: "id_robot" });
Commande.belongsTo(Robot, { foreignKey: "robot_id", targetKey: "id_robot", as: "robot" });

Commande.hasMany(LigneCommande, { foreignKey: "commande_id", sourceKey: "id_commande" });
LigneCommande.belongsTo(Commande, { foreignKey: "commande_id", targetKey: "id_commande" });

Produit.hasMany(LigneCommande, { foreignKey: "produit_id", sourceKey: "id_produit" });
LigneCommande.belongsTo(Produit, { foreignKey: "produit_id", targetKey: "id_produit" });

Produit.hasOne(Stock, { foreignKey: "produit_id", sourceKey: "id_produit" });
Stock.belongsTo(Produit, { foreignKey: "produit_id", targetKey: "id_produit" });

User.hasOne(Points, { foreignKey: "user_id", sourceKey: "id_user" });
Points.belongsTo(User, { foreignKey: "user_id", targetKey: "id_user" });

User.hasMany(UserRecompense, { foreignKey: "user_id", sourceKey: "id_user" });
UserRecompense.belongsTo(User, { foreignKey: "user_id", targetKey: "id_user" });

Recompense.hasMany(UserRecompense, { foreignKey: "recompense_id", sourceKey: "id_recompense" });
UserRecompense.belongsTo(Recompense, { foreignKey: "recompense_id", targetKey: "id_recompense" });

User.hasOne(UserPreference, { foreignKey: "user_id", sourceKey: "id_user" });
UserPreference.belongsTo(User, { foreignKey: "user_id", targetKey: "id_user" });

User.hasMany(UserAllergie, { foreignKey: "user_id", sourceKey: "id_user" });
UserAllergie.belongsTo(User, { foreignKey: "user_id", targetKey: "id_user" });

User.hasMany(UserBadge, { foreignKey: "user_id", sourceKey: "id_user" });
UserBadge.belongsTo(User, { foreignKey: "user_id", targetKey: "id_user" });

Badge.hasMany(UserBadge, { foreignKey: "badge_id", sourceKey: "id_badge" });
UserBadge.belongsTo(Badge, { foreignKey: "badge_id", targetKey: "id_badge" });


Log.belongsTo(User, { foreignKey: "user_id", targetKey: "id_user" });

module.exports = {
  User,
  Robot,
  Commande,
  Paiement,
  Log,
  LigneCommande,
  Produit,
  Stock,
  Points,
  Recompense,
  UserRecompense,
  UserPreference,
  UserAllergie,
  Badge,
  UserBadge,
};