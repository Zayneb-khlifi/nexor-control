// backend/src/models/Stock.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Stock = sequelize.define("Stock", {
  id_stock: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  produit_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "produits",
      key: "id_produit"
    }
  },
  quantite_disponible: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  seuil_minimum: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
  }
}, {
  tableName: "stock",
  timestamps: false
});

module.exports = Stock;