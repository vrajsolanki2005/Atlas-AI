const {DataTypes} = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    telegramId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    username: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    
});

module.exports = User;