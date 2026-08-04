const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Agenda = sequelize.define("Agenda", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: "id" },
    onDelete: "CASCADE",
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING, // "HH:MM"
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
});

User.hasMany(Agenda, { foreignKey: "userId" });
Agenda.belongsTo(User, { foreignKey: "userId" });

module.exports = Agenda;
