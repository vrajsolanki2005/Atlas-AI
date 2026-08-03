const { Telegraf, session, Scenes } = require("telegraf");
const registerHandlers = require("./handlers");
const onboardingScene = require("../scenes/onboarding.scene");
const Conversation = require("../models/Conversation");
const bot = new Telegraf(process.env.BOT_TOKEN);
const stage = new Scenes.Stage([onboardingScene]);

bot.use(session());

bot.use(stage.middleware());

function startBot() {
    registerHandlers(bot);

    bot.launch();

    console.log("Atlas Bot Started");
}


module.exports = { bot, startBot };
