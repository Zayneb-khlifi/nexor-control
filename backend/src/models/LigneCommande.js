const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const LigneCommande = sequelize.define("LigneCommande", {
  id_ligne: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  commande_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  produit_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  prix_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  }
}, {
  tableName: "ligne_commande",
  timestamps: false
});

module.exports = LigneCommande;