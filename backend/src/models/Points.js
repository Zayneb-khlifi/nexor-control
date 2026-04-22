const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Points = sequelize.define("Points", {
  id_point: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  points_utilises: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  niveau: {
    type: DataTypes.STRING,
    defaultValue: "BRONZE",
  }
}, {
  tableName: "points",
  timestamps: false
});

module.exports = Points;