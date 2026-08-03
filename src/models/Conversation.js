const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Conversation = sequelize.define(
  "Conversation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    role: {
      type: DataTypes.ENUM("system", "user", "assistant"),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT("long"),
      validate: { len: [1, 10000] },
      allowNull: false,
    },
    intent: {
      type: DataTypes.ENUM("onboarding", "chat", "finance", "settings"),
      defaultValue: "chat",
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // model:{
    //     type: DataTypes.STRING,
    //     // defaultValue: 'gpt-4.1-mini'
    //     allowNull: false,
    // },
    // tokens:{
    //     type: DataTypes.INTEGER,
    //     allowNull: true,
    // },
    // createdAt:{
    //     type: DataTypes.DATE,
    // },
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["intent"],
      },
    ],
  },
);

User.hasMany(Conversation, { foreignKey: "userId" });
Conversation.belongsTo(User, { foreignKey: "userId" });

module.exports = Conversation;
