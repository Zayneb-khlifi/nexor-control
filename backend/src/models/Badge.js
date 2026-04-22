// backend/src/models/Badge.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Badge = sequelize.define("Badge", {
  id_badge: {
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
    allowNull: false,
  },
  icone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  condition_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  condition_valeur: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  points_recompense: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  tableName: "badges",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
});

module.exports = Badge;