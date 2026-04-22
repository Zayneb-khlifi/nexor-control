const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Paiement = sequelize.define("Paiement", {
  id_paiement: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  montant: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
  },
  statut: {
    type: DataTypes.ENUM("EN_ATTENTE", "PAYE", "REFUSE"),
  },
}, {
  tableName: "paiements",
  timestamps: false
});

module.exports = Paiement;