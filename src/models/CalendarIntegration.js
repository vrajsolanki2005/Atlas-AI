const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const CalendarIntegration = sequelize.define("CalendarIntegration", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: { model: User, key: "id" },
    onDelete: "CASCADE",
  },
  googleEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  expiryDate: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  connectedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

User.hasOne(CalendarIntegration, { foreignKey: "userId" });
CalendarIntegration.belongsTo(User, { foreignKey: "userId" });

module.exports = CalendarIntegration;
