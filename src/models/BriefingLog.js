const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const BriefingLog = sequelize.define('BriefingLog', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
});

User.hasMany(BriefingLog);
BriefingLog.belongsTo(User);

module.exports = BriefingLog;
