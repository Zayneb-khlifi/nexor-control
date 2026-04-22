const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Recompense = sequelize.define("Recompense", {
  id_recompense: {
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
  },
  points_requis: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: "REDUCTION",
  },
  valeur: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: "recompenses",
  timestamps: false
});

module.exports = Recompense;