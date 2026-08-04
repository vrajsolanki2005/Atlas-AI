const sequelize = require('../config/db');
require('./User');
require('./Preference');
require('./Conversation');
require('./BriefingLog');
require('./Watchlist');

async function syncDb() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        
        await sequelize.sync({ alter: false });
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Error synchronizing the database:', error);
    }
}

module.exports = {syncDb};