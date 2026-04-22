const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Commande = sequelize.define("Commande", {
  id_commande: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  numero_commande: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  statut: {
    type: DataTypes.ENUM("EN_ATTENTE", "VALIDEE", "EN_COURS", "LIVREE", "ANNULEE"),
    defaultValue: "EN_ATTENTE",
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  date_validation: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id_user"
    }
  },
  robot_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "robots",
      key: "id_robot"
    }
  }
}, {
  tableName: "commandes",
  timestamps: false
});

module.exports = Commande;