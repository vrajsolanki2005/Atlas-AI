const User = require('../models/User');

async function createOrFindUser(ctx) {
    console.log("Inside createOrFindUser");
    const telegram = ctx.from;
    let user = await User.findOne({ where: { telegramId: telegram.id.toString() } });
    if (!user) {
        console.log("Creating user...");
        user = await User.create({
            telegramId: telegram.id.toString(),
            username: telegram.username,
            firstName: telegram.first_name,
            lastName: telegram.last_name,
        });
        console.log("User Created", user.id);
    } else {
        console.log("User Found", user.id);
    }
    return user;
}

async function getUserByTelegramId(telegramId) {
    const user = await User.findOne({ where: { telegramId: telegramId.toString() } });
    return user;
}
module.exports = { createOrFindUser, getUserByTelegramId };