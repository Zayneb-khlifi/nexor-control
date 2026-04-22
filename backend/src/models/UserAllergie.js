// backend/src/models/UserAllergie.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UserAllergie = sequelize.define("UserAllergie", {
  id_allergie: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ingredient: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: "user_allergies",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
});

module.exports = UserAllergie;