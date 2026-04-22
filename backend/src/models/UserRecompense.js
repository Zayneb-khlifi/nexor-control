const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UserRecompense = sequelize.define("UserRecompense", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  recompense_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date_obtention: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  utilise: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  tableName: "user_recompenses",
  timestamps: false
});

module.exports = UserRecompense;