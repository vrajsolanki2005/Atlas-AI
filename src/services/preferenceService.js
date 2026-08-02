const Prefernce = require('../models/Preference');

async function createOrUpdatePreference(userId) {
    let preference = await Prefernce.findOne({ where: { UserId: userId } });
    if (!preference) {
        preference = await Prefernce.create({ UserId: userId });
    }
    return preference;
}

async function updatePreference(userId, updates) {
    let preference = await Prefernce.findOne({ where: { UserId: userId } });
    if (!preference) {
        preference = await Prefernce.create({ UserId: userId, ...updates });
    } else {
        await preference.update(updates);
    }
    return preference;
}
module.exports = { createOrUpdatePreference, updatePreference };