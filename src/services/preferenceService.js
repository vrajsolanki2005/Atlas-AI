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

async function updateProfile(userId, newProfile) {
  let pref = await createOrUpdatePreference(userId);

  const merge = require("../utils/profileMerge");

  const profile = merge(pref.profile || {}, newProfile);

  await pref.update({
    profile,
  });

  return profile;
}
module.exports = { createOrUpdatePreference, updatePreference, updateProfile };