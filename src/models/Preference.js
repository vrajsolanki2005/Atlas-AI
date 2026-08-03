const {DataTypes} = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

// const Preference = sequelize.define('Preference', {
//     profession: DataTypes.STRING,
//     interests: DataTypes.TEXT,
//     companies: DataTypes.TEXT,
//     briefingTime: DataTypes.STRING,
// });

const Preference = sequelize.define('Preference', {
    profile:{
        type: DataTypes.JSON,
        defaultValue:{}
    },
    onboardingCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

User.hasOne(Preference);
Preference.belongsTo(User);

module.exports = Preference;