// backend/src/models/UserPreference.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UserPreference = sequelize.define("UserPreference", {
  id_preference: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  categorie_aimee: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  categorie_detestee: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  prix_max: {
    type: DataTypes.DECIMAL(10,2),
    defaultValue: 100,
  }
}, {
  tableName: "user_preferences",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
});

module.exports = UserPreference;