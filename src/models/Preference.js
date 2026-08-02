const {DataTypes} = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Preference = sequelize.define('Preference', {
    profession: DataTypes.STRING,
    interests: DataTypes.TEXT,
    companies: DataTypes.TEXT,
    briefingTime: DataTypes.STRING,
});

User.hasOne(Preference);
Preference.belongsTo(User);

module.exports = Preference;