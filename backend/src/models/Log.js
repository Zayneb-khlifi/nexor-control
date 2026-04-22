const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Log = sequelize.define("Log", {
  id_log: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  action: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  adresse_ip: {
    type: DataTypes.STRING,
  },

  date_action: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }

}, {
  tableName: "logs",
  timestamps: false
});

module.exports = Log;