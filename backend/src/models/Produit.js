// backend/src/models/Produit.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Produit = sequelize.define("Produit", {
  id_produit: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  prix_unitaire: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  }
}, {
  tableName: "produits",
  timestamps: false
});

module.exports = Produit;