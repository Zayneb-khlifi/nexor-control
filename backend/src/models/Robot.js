const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Robot = sequelize.define("Robot", {
  id_robot: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  statut: {
    type: DataTypes.STRING,
    defaultValue: "DISPONIBLE",
    validate: {
      isIn: [["DISPONIBLE", "EN_MISSION", "MAINTENANCE"]]
    }
  },
  batterie: {
    type: DataTypes.FLOAT,
    defaultValue: 100,
    validate: { min: 0, max: 100 }
  },
  localisation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date_ajout: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: "robots",
  timestamps: false
});

module.exports = Robot;