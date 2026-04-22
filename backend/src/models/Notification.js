// backend/src/models/Notification.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Notification = sequelize.define("Notification", {
  id_notification: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("info", "success", "warning", "error", "commande", "robot", "fidelite"),
    defaultValue: "info",
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: "notifications",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
});

module.exports = Notification;